import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, RotateCcw, Play, User, AlertTriangle } from 'lucide-react';

interface WelcomeBackModalProps {
  onResume: () => void;
  onRestart: () => void;
}

const WelcomeBackModal = ({ onResume, onRestart }: WelcomeBackModalProps) => {
  const { currentSession } = useSelector((state: RootState) => state.interview);
  const { currentCandidate } = useSelector((state: RootState) => state.candidates);

  if (!currentSession || !currentCandidate) return null;

  const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
  const questionsCompleted = currentSession.currentQuestionIndex;
  const totalQuestions = currentSession.questions.length;
  const progressPercentage = Math.round((questionsCompleted / totalQuestions) * 100);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeSinceLastActivity = () => {
    if (!currentSession.startTime) return 'Unknown';
    
    const timeDiff = Date.now() - currentSession.startTime;
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-6 w-6 text-primary" />
            Welcome Back!
          </DialogTitle>
          <DialogDescription>
            We found an unfinished interview session. You can continue where you left off or start fresh.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Candidate Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Name:</span>
                <p className="text-sm text-muted-foreground">{currentCandidate.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Email:</span>
                <p className="text-sm text-muted-foreground">{currentCandidate.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Phone:</span>
                <p className="text-sm text-muted-foreground">{currentCandidate.phone}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Session Started:</span>
                <p className="text-sm text-muted-foreground">
                  {currentSession.startTime ? formatTime(currentSession.startTime) : 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Interview Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interview Progress</CardTitle>
              <CardDescription>
                Your current position in the interview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Questions Completed:</span>
                <Badge variant="outline">
                  {questionsCompleted} of {totalQuestions}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {currentQuestion && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Next Question:</span>
                    <Badge variant={
                      currentQuestion.difficulty === 'Easy' ? 'default' :
                      currentQuestion.difficulty === 'Medium' ? 'secondary' : 'destructive'
                    }>
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Question {currentSession.currentQuestionIndex + 1}: {currentQuestion.question}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Time limit: {currentQuestion.timeLimit} seconds
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Info */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Last activity: {getTimeSinceLastActivity()}. 
              {questionsCompleted > 0 && ' Your previous answers have been saved.'}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={onResume}
              className="flex-1 bg-gradient-primary text-primary-foreground"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume Interview
            </Button>
            
            <Button 
              onClick={onRestart}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            If you restart, all previous progress will be lost and you'll begin with new questions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeBackModal;