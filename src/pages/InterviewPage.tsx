import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, Play, Pause, Mic, MicOff, Camera, CameraOff } from 'lucide-react';
import ResumeUpload from '@/components/interview/ResumeUpload';
import InterviewChat from '@/components/interview/InterviewChat';
import QuestionTimer from '@/components/interview/QuestionTimer';
import WelcomeBackModal from '@/components/interview/WelcomeBackModal';
import { clearCurrentCandidate } from '@/store/slices/candidateSlice';
import { clearCurrentSession } from '@/store/slices/interviewSlice';
import { resumeParser } from '@/services/resumeParser';

const InterviewPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentCandidate } = useSelector((state: RootState) => state.candidates);
  const { currentSession } = useSelector((state: RootState) => state.interview);
  
  const [interviewStage, setInterviewStage] = useState<'upload' | 'profile' | 'interview' | 'completed'>('upload');
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    if (currentSession && currentSession.status === 'paused') {
      setShowWelcomeBack(true);
    } else if (currentSession && currentSession.status === 'in_progress') {
      setInterviewStage('interview');
    } else if (currentSession && currentSession.status === 'completed') {
      setInterviewStage('completed');
    } else if (currentCandidate) {
      setInterviewStage('profile');
    }
  }, [currentSession, currentCandidate]);

  const handleExitInterview = () => {
    dispatch(clearCurrentCandidate());
    dispatch(clearCurrentSession());
    navigate('/');
  };

  const getProgressValue = () => {
    if (!currentSession) return 0;
    const totalQuestions = currentSession.questions.length;
    const currentIndex = currentSession.currentQuestionIndex;
    return (currentIndex / totalQuestions) * 100;
  };

  const getCurrentDifficulty = () => {
    if (!currentSession || !currentSession.questions[currentSession.currentQuestionIndex]) {
      return 'Easy';
    }
    return currentSession.questions[currentSession.currentQuestionIndex].difficulty;
  };

  return (
    <div className="min-h-screen bg-gradient-chat">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleExitInterview}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit Interview
            </Button>
            
            {currentSession && interviewStage === 'interview' && (
              <div className="flex items-center gap-4">
                <Badge variant={getCurrentDifficulty() === 'Easy' ? 'default' : getCurrentDifficulty() === 'Medium' ? 'secondary' : 'destructive'}>
                  {getCurrentDifficulty()}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}
                </div>
              </div>
            )}
            
            {currentCandidate && (
              <div className="text-sm text-muted-foreground">
                Welcome, {currentCandidate.name}
              </div>
            )}
          </div>
          
          {currentSession && interviewStage === 'interview' && (
            <div className="mt-4">
              <Progress value={getProgressValue()} className="h-2" />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {interviewStage === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Upload className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
                <Alert>
                  <AlertDescription>
                    Please upload your resume in PDF or DOCX format. Our AI will extract your contact information and start the interview automatically.
                  </AlertDescription>
                </Alert>
              </CardHeader>
              <CardContent>
                <ResumeUpload onComplete={() => {
                  if (currentCandidate) {
                    const validation = resumeParser.validateRequiredFields({
                      name: currentCandidate.name,
                      email: currentCandidate.email,
                      phone: currentCandidate.phone,
                      content: ''
                    });
                    
                    if (validation.isValid) {
                      setInterviewStage('interview');
                    } else {
                      setInterviewStage('profile');
                    }
                  } else {
                    setInterviewStage('profile');
                  }
                }} />
              </CardContent>
            </Card>
          </div>
        )}

        {interviewStage === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <InterviewChat 
              stage="profile_collection"
              onStartInterview={() => setInterviewStage('interview')}
            />
          </div>
        )}

        {interviewStage === 'interview' && currentSession && (
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Timer and Question Info */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Current Question</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <QuestionTimer />
                    
                    <div className="text-sm text-muted-foreground">
                      <div>Difficulty: <Badge variant="outline">{getCurrentDifficulty()}</Badge></div>
                      <div className="mt-2">
                        Time Limit: {currentSession.questions[currentSession.currentQuestionIndex]?.timeLimit}s
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-3">
                <InterviewChat 
                  stage="interview"
                  onCompleteInterview={() => setInterviewStage('completed')}
                />
              </div>
            </div>
          </div>
        )}

        {interviewStage === 'completed' && (
          <div className="max-w-2xl mx-auto text-center">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-success">Interview Completed!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Thank you for completing the interview. Your responses have been evaluated and the results are now available.
                  </AlertDescription>
                </Alert>
                
                {currentSession && (
                  <div className="text-center space-y-2">
                    <div className="text-lg font-semibold">
                      Final Score: {currentSession.totalScore}/600
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on {currentSession.questions.length} questions
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate('/results')}>
                    View Detailed Results
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Return Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Welcome Back Modal */}
      {showWelcomeBack && (
        <WelcomeBackModal 
          onResume={() => {
            setShowWelcomeBack(false);
            setInterviewStage('interview');
          }}
          onRestart={() => {
            setShowWelcomeBack(false);
            dispatch(clearCurrentSession());
            setInterviewStage('upload');
          }}
        />
      )}
    </div>
  );
};

export default InterviewPage;