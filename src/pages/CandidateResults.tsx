import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Award, 
  Clock, 
  TrendingUp, 
  User,
  Download,
  Share2
} from 'lucide-react';
import { logout } from '@/store/slices/authSlice';

const CandidateResults = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { candidatePhone } = useSelector((state: RootState) => state.auth);
  const { completedInterviews, allCandidates } = useSelector((state: RootState) => state.candidates);

  // Find candidate's interview based on phone number
  const candidateProfile = allCandidates.find(c => c.phone === candidatePhone);
  const candidateInterview = completedInterviews.find(i => i.candidateId === candidateProfile?.id);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!candidateProfile || !candidateInterview) {
    return (
      <div className="min-h-screen bg-gradient-chat flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                No interview results found for the provided phone number. Please ensure you have completed an interview first.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/interview')} className="flex-1">
                Take Interview
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex-1">
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scorePercentage = Math.round((candidateInterview.totalScore / 600) * 100);
  const isPassed = scorePercentage >= 60;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const getPerformanceBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="min-h-screen bg-gradient-chat">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Interview Results</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Award className={`h-16 w-16 ${isPassed ? 'text-success' : 'text-error'}`} />
            </div>
            <CardTitle className="text-2xl">
              Hello, {candidateProfile.name}!
            </CardTitle>
            <CardDescription>
              Here are your interview results from {new Date(candidateInterview.endTime).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={`text-4xl font-bold ${getScoreColor(scorePercentage)}`}>
                {candidateInterview.totalScore}/600
              </div>
              <div className="text-lg text-muted-foreground">
                {scorePercentage}% Overall Score
              </div>
              <Badge 
                variant={getPerformanceBadgeVariant(scorePercentage)}
                className="text-lg px-4 py-2"
              >
                {getPerformanceLevel(scorePercentage)}
              </Badge>
              
              {isPassed ? (
                <Alert className="border-success text-success">
                  <Award className="h-4 w-4" />
                  <AlertDescription>
                    Congratulations! You passed the interview with a strong performance.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-error text-error">
                  <AlertDescription>
                    You scored below the passing threshold (60%). Consider improving your skills and trying again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Question Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidateInterview.questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Q{index + 1} ({question.difficulty})
                    </span>
                    <span className={`text-sm font-semibold ${getScoreColor(question.score || 0)}`}>
                      {question.score || 0}/100
                    </span>
                  </div>
                  <Progress value={question.score || 0} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidateInterview.questions.map((question, index) => (
                <div key={`time-${question.id}`} className="flex justify-between items-center">
                  <span className="text-sm">Q{index + 1} ({question.difficulty})</span>
                  <div className="text-sm">
                    <span className={question.timeSpent! > question.timeLimit ? 'text-error' : 'text-success'}>
                      {question.timeSpent || 0}s
                    </span>
                    <span className="text-muted-foreground">
                      /{question.timeLimit}s
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Questions and Answers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Responses</CardTitle>
            <CardDescription>
              Review your answers to each interview question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {candidateInterview.questions.map((question, index) => (
              <div key={`detail-${question.id}`} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-lg">Question {index + 1}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">{question.difficulty}</Badge>
                    <Badge variant={getPerformanceBadgeVariant(question.score || 0)}>
                      {question.score || 0}/100
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-muted rounded">
                  <p className="text-sm">{question.question}</p>
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium mb-2">Your Answer:</h5>
                  <div className="p-3 bg-background border rounded text-sm">
                    {question.answer || 'No answer provided'}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Time used: {question.timeSpent || 0} seconds (Limit: {question.timeLimit} seconds)
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Summary */}
        {candidateInterview.summary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI Performance Summary</CardTitle>
              <CardDescription>
                Detailed evaluation and recommendations from our AI system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap text-sm">
                  {candidateInterview.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => navigate('/interview')}>
                Take Another Interview
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Results
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateResults;