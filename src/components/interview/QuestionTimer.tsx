import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { submitAnswer, nextQuestion } from '@/store/slices/interviewSlice';

const QuestionTimer = () => {
  const dispatch = useDispatch();
  const { currentSession, isTimerRunning, currentAnswer } = useSelector((state: RootState) => state.interview);
  
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (currentSession && isTimerRunning) {
      const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
      if (currentQuestion) {
        setTimeRemaining(currentQuestion.timeLimit);
        setStartTime(Date.now());
        setIsWarning(false);
      }
    }
  }, [currentSession?.currentQuestionIndex, isTimerRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          // Set warning when 25% or less time remaining (minimum 5 seconds)
          const currentQuestion = currentSession?.questions[currentSession.currentQuestionIndex];
          if (currentQuestion) {
            const warningThreshold = Math.max(5, Math.floor(currentQuestion.timeLimit * 0.25));
            setIsWarning(newTime <= warningThreshold);
          }
          
          // Auto-submit when time runs out
          if (newTime <= 0) {
            handleTimeUp();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeRemaining, currentSession, currentAnswer]);

  const handleTimeUp = () => {
    if (!currentSession) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
    
    // Submit current answer (even if empty) with time penalty
    dispatch(submitAnswer({
      answer: currentAnswer || 'No answer provided (time expired)',
      timeSpent: timeSpent,
      score: 0, // No score for timeout
    }));

    // Move to next question or complete
    if (currentSession.currentQuestionIndex + 1 >= currentSession.questions.length) {
      // Interview completed
    } else {
      dispatch(nextQuestion());
    }
  };

  if (!currentSession || !isTimerRunning) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Timer inactive</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
  if (!currentQuestion) return null;

  const progressValue = (timeRemaining / currentQuestion.timeLimit) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const getTimerColor = () => {
    if (timeRemaining <= 0) return 'text-error';
    if (isWarning) return 'text-warning';
    return 'text-foreground';
  };

  const getProgressColor = () => {
    if (timeRemaining <= 0) return 'bg-error';
    if (isWarning) return 'bg-warning';
    return '';
  };

  return (
    <Card className={`transition-all duration-300 ${isWarning ? 'ring-2 ring-warning' : ''}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className={`h-5 w-5 ${getTimerColor()}`} />
          Question Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Display */}
        <div className="text-center">
          <div className={`text-3xl font-mono font-bold ${getTimerColor()}`}>
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Time Remaining
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progressValue} 
            className={`h-3 ${getProgressColor()}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0:00</span>
            <span>{Math.floor(currentQuestion.timeLimit / 60)}:{(currentQuestion.timeLimit % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Status Alerts */}
        {timeRemaining <= 0 ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Time's up! Your answer has been submitted automatically.
            </AlertDescription>
          </Alert>
        ) : isWarning ? (
          <Alert className="border-warning text-warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: Less than {Math.max(5, Math.floor(currentQuestion.timeLimit * 0.25))} seconds remaining!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Take your time to provide a thoughtful answer.
            </AlertDescription>
          </Alert>
        )}

        {/* Question Info */}
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-sm">
            {currentQuestion.difficulty}
          </Badge>
          <p className="text-xs text-muted-foreground">
            Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionTimer;