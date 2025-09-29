import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Mic, MicOff, Camera, CameraOff, Play, Pause, Clock, CircleCheck as CheckCircle } from 'lucide-react';
import { 
  updateCurrentAnswer, 
  setRecordingMode, 
  setIsRecording,
  submitAnswer,
  nextQuestion,
  startInterview,
  completeInterview
} from '@/store/slices/interviewSlice';
import { updateCandidateProfile, addCompletedInterview } from '@/store/slices/candidateSlice';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: number;
}

interface InterviewChatProps {
  stage: 'profile_collection' | 'interview';
  onStartInterview?: () => void;
  onCompleteInterview?: () => void;
}

const InterviewChat = ({ stage, onStartInterview, onCompleteInterview }: InterviewChatProps) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { currentCandidate } = useSelector((state: RootState) => state.candidates);
  const { currentSession, currentAnswer, recordingMode, isRecording } = useSelector((state: RootState) => state.interview);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState<number>(0);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isAnswerStarted, setIsAnswerStarted] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stage === 'profile_collection' && currentCandidate) {
      initializeProfileCollection();
    } else if (stage === 'interview' && currentSession) {
      initializeInterview();
    }
  }, [stage, currentCandidate, currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type: 'ai' | 'user', content: string) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      type,
      content,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const initializeProfileCollection = () => {
    if (!currentCandidate) return;
    
    const missing = [];
    if (!currentCandidate.name) missing.push('name');
    if (!currentCandidate.email) missing.push('email');
    if (!currentCandidate.phone) missing.push('phone');
    
    setMissingFields(missing);
    
    if (missing.length > 0) {
      addMessage('ai', `Hello! I've processed your resume, but I need to collect some missing information before we begin the interview. I need your ${missing.join(', ')}. Let's start with your ${missing[0]}:`);
    } else {
      addMessage('ai', `Hello ${currentCandidate.name}! I have all your information. Are you ready to begin the technical interview? This will consist of 6 questions with increasing difficulty. Type "ready" when you're prepared to start.`);
    }
  };

  const initializeInterview = () => {
    if (!currentSession) return;
    
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
    if (currentQuestion) {
      setCurrentQuestionStartTime(Date.now());
      addMessage('ai', `Question ${currentSession.currentQuestionIndex + 1} (${currentQuestion.difficulty}): ${currentQuestion.question}`);
      addMessage('ai', `You have ${currentQuestion.timeLimit} seconds to answer. You can respond by typing or using voice/video. Click "Start Answer" when ready.`);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    addMessage('user', message);
    setIsLoading(true);

    try {
      if (stage === 'profile_collection') {
        await handleProfileCollection(message);
      } else if (stage === 'interview') {
        await handleInterviewAnswer(message);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      toast({
        title: "Error",
        description: "Sorry, there was an error processing your response.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileCollection = async (message: string) => {
    if (!currentCandidate) return;

    if (missingFields.length > 0) {
      const currentField = missingFields[0];
      
      // Update the candidate profile
      const updates: any = { id: currentCandidate.id };
      updates[currentField] = message;
      
      dispatch(updateCandidateProfile(updates));
      
      const remaining = missingFields.slice(1);
      setMissingFields(remaining);
      
      if (remaining.length > 0) {
        addMessage('ai', `Thank you! Now I need your ${remaining[0]}:`);
      } else {
        addMessage('ai', `Perfect! I now have all your information. Are you ready to begin the technical interview? This will consist of 6 questions with increasing difficulty. Type "ready" when you're prepared to start.`);
      }
    } else if (message.toLowerCase().includes('ready')) {
      // Generate questions and start interview
      addMessage('ai', 'Excellent! Generating your personalized interview questions...');
      
      try {
        const questions = await geminiService.generateQuestions({
          name: currentCandidate.name,
          email: currentCandidate.email,
        });
        
        dispatch(startInterview({
          candidateId: currentCandidate.id,
          questions,
        }));
        
        addMessage('ai', 'Questions generated successfully! Starting your interview now...');
        
        setTimeout(() => {
          onStartInterview?.();
        }, 1000);
        
      } catch (error) {
        addMessage('ai', 'There was an issue generating questions. Using standard questions instead.');
        
        // Use fallback questions
        const fallbackQuestions = [
          { id: 'q1', question: 'What is the difference between useState and useEffect hooks in React?', difficulty: 'Easy' as const, timeLimit: 20 },
          { id: 'q2', question: 'How do you handle asynchronous operations in JavaScript?', difficulty: 'Easy' as const, timeLimit: 20 },
          { id: 'q3', question: 'Explain the concept of middleware in Express.js and provide an example.', difficulty: 'Medium' as const, timeLimit: 60 },
          { id: 'q4', question: 'How would you implement authentication in a React application?', difficulty: 'Medium' as const, timeLimit: 60 },
          { id: 'q5', question: 'Design a REST API for a blog application.', difficulty: 'Hard' as const, timeLimit: 120 },
          { id: 'q6', question: 'How would you optimize the performance of a React application?', difficulty: 'Hard' as const, timeLimit: 120 }
        ];
        
        dispatch(startInterview({
          candidateId: currentCandidate.id,
          questions: fallbackQuestions,
        }));
        
        setTimeout(() => {
          onStartInterview?.();
        }, 1000);
      }
    } else {
      addMessage('ai', 'Please type "ready" when you\'re prepared to begin the interview.');
    }
  };

  const handleInterviewAnswer = async (answer: string) => {
    if (!currentSession) return;
    
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
    if (!currentQuestion) return;
    
    const timeSpent = Math.floor((Date.now() - currentQuestionStartTime) / 1000);
    
    // Evaluate the answer
    try {
      const evaluation = await geminiService.evaluateAnswer(
        currentQuestion.question,
        answer,
        timeSpent,
        currentQuestion.timeLimit
      );
      
      dispatch(submitAnswer({
        answer,
        timeSpent,
        score: evaluation.score,
      }));
      
      addMessage('ai', `Thank you for your answer! ${evaluation.feedback}`);
      
      // Move to next question or complete interview
      if (currentSession.currentQuestionIndex + 1 >= currentSession.questions.length) {
        await completeInterviewProcess();
      } else {
        dispatch(nextQuestion());
        setTimeout(() => {
          const nextQ = currentSession.questions[currentSession.currentQuestionIndex + 1];
          setCurrentQuestionStartTime(Date.now());
          addMessage('ai', `Question ${currentSession.currentQuestionIndex + 2} (${nextQ.difficulty}): ${nextQ.question}`);
          addMessage('ai', `You have ${nextQ.timeLimit} seconds to answer.`);
        }, 1000);
      }
      
    } catch (error) {
      addMessage('ai', 'Answer recorded. Moving to the next question...');
      
      dispatch(submitAnswer({
        answer,
        timeSpent,
        score: 50, // Default score if evaluation fails
      }));
      
      if (currentSession.currentQuestionIndex + 1 >= currentSession.questions.length) {
        await completeInterviewProcess();
      } else {
        dispatch(nextQuestion());
      }
    }
  };

  const completeInterviewProcess = async () => {
    if (!currentSession) return;
    
    const totalScore = currentSession.questions.reduce((sum, q) => sum + (q.score || 0), 0);
    
    try {
      const summary = await geminiService.generateInterviewSummary(
        currentSession.questions,
        currentSession.questions,
        totalScore
      );
      
      dispatch(completeInterview({ totalScore, summary }));
      dispatch(addCompletedInterview({
        ...currentSession,
        status: 'completed',
        totalScore,
        summary,
        endTime: Date.now(),
      }));
      
      addMessage('ai', `Interview completed! Your final score is ${totalScore}/600. Thank you for participating.`);
      
      setTimeout(() => {
        onCompleteInterview?.();
      }, 2000);
      
    } catch (error) {
      const summary = `Interview completed with a total score of ${totalScore}/600.`;
      
      dispatch(completeInterview({ totalScore, summary }));
      addMessage('ai', summary);
      
      setTimeout(() => {
        onCompleteInterview?.();
      }, 2000);
    }
  };

  const toggleCamera = async () => {
    try {
      if (isCameraOn && videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
        setIsCameraOn(false);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setVideoStream(stream);
        setIsCameraOn(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. You can still continue with text answers.",
        variant: "destructive",
      });
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startVoiceRecording();
    } else {
      stopVoiceRecording();
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        // Convert audio to text (simplified - in real app you'd use speech-to-text API)
        setInputValue("Voice answer recorded - processing...");
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      dispatch(setIsRecording(true));
      
      toast({
        title: "Recording Started",
        description: "Speak your answer clearly. Click the mic again to stop.",
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please use text input.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      dispatch(setIsRecording(false));
      toast({
        title: "Recording Stopped",
        description: "Processing your voice answer...",
      });
    }
  };

  const handleStartAnswer = () => {
    setIsAnswerStarted(true);
    if (recordingMode === 'voice') {
      startVoiceRecording();
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Feed */}
      {isCameraOn && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-48 object-cover"
            />
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="h-96">
        <CardContent className="p-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-chat-user text-white'
                        : 'bg-chat-ai text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-chat-ai text-foreground rounded-lg px-4 py-2">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Recording Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={recordingMode === 'voice' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch(setRecordingMode('voice'))}
                >
                  <Mic className="h-4 w-4 mr-1" />
                  Voice
                </Button>
                <Button
                  variant={recordingMode === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch(setRecordingMode('text'))}
                >
                  Text
                </Button>
              </div>
              
              {stage === 'interview' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleCamera}
                >
                  {isCameraOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                </Button>
              )}
            </div>

            {/* Input Controls */}
            <div className="flex gap-2">
              {!isAnswerStarted ? (
                <Button 
                  onClick={handleStartAnswer}
                  className="flex-1 bg-gradient-primary text-primary-foreground"
                  disabled={isLoading}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Answer
                </Button>
              ) : recordingMode === 'text' ? (
                <>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your answer..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={isLoading}
                    className="min-h-[100px]"
                    as="textarea"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <Button
                    variant={isRecording ? 'destructive' : 'default'}
                    size="lg"
                    onClick={toggleRecording}
                    className="w-full"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="h-5 w-5 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {isAnswerStarted && (
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => setIsAnswerStarted(false)}>
                  Reset Answer
                </Button>
              </div>
            )}

            {stage === 'interview' && currentSession && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length} • 
                  Difficulty: {currentSession.questions[currentSession.currentQuestionIndex]?.difficulty}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewChat;