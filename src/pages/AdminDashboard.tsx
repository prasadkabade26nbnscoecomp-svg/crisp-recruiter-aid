import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Award, 
  Search, 
  Filter,
  LogOut,
  Eye,
  Download,
  BarChart3
} from 'lucide-react';
import { logout } from '@/store/slices/authSlice';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const { completedInterviews } = useSelector((state: RootState) => state.candidates);
  const { allCandidates } = useSelector((state: RootState) => state.candidates);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const handleLogout = () => {
    dispatch(logout());
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const filteredAndSortedInterviews = completedInterviews
    .filter(interview => {
      const candidate = allCandidates.find(c => c.id === interview.candidateId);
      const matchesSearch = candidate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           candidate?.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      if (filterDifficulty !== 'all') {
        const scorePercentage = (interview.totalScore / 600) * 100;
        if (filterDifficulty === 'high' && scorePercentage < 80) matchesFilter = false;
        if (filterDifficulty === 'medium' && (scorePercentage < 60 || scorePercentage >= 80)) matchesFilter = false;
        if (filterDifficulty === 'low' && scorePercentage >= 60) matchesFilter = false;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.totalScore - a.totalScore;
        case 'date':
          return b.endTime - a.endTime;
        case 'name':
          const nameA = allCandidates.find(c => c.id === a.candidateId)?.name || '';
          const nameB = allCandidates.find(c => c.id === b.candidateId)?.name || '';
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

  const averageScore = completedInterviews.length > 0 
    ? completedInterviews.reduce((sum, interview) => sum + interview.totalScore, 0) / completedInterviews.length 
    : 0;

  const passedCandidates = completedInterviews.filter(interview => interview.totalScore >= 360).length; // 60% pass rate

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <header className="border-b bg-dashboard-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allCandidates.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedInterviews.length} completed interviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageScore)}/600</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((averageScore / 600) * 100)}% average performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{passedCandidates}/{completedInterviews.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedInterviews.length > 0 ? Math.round((passedCandidates / completedInterviews.length) * 100) : 0}% passed (60%+ score)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Interviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <CardTitle>Candidate Management</CardTitle>
                <CardDescription>
                  View and manage all interview candidates and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Sort by Score</SelectItem>
                      <SelectItem value="date">Sort by Date</SelectItem>
                      <SelectItem value="name">Sort by Name</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterDifficulty} onValueChange={(value: any) => setFilterDifficulty(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by performance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Candidates</SelectItem>
                      <SelectItem value="high">High Performers (80%+)</SelectItem>
                      <SelectItem value="medium">Medium Performers (60-79%)</SelectItem>
                      <SelectItem value="low">Low Performers (&lt;60%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Candidates Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedInterviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No candidates found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAndSortedInterviews.map((interview) => {
                          const candidate = allCandidates.find(c => c.id === interview.candidateId);
                          const scorePercentage = Math.round((interview.totalScore / 600) * 100);
                          
                          return (
                            <TableRow key={interview.candidateId}>
                              <TableCell className="font-medium">
                                {candidate?.name || 'Unknown'}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{candidate?.email}</div>
                                  <div className="text-muted-foreground">{candidate?.phone}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={`font-semibold ${getScoreColor(scorePercentage)}`}>
                                  {interview.totalScore}/600
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getScoreVariant(scorePercentage)}>
                                  {scorePercentage}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(interview.endTime).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setSelectedCandidate({ interview, candidate })}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh]">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Interview Details - {candidate?.name}
                                      </DialogTitle>
                                    </DialogHeader>
                                    {selectedCandidate && (
                                      <ScrollArea className="max-h-[60vh]">
                                        <div className="space-y-4">
                                          {/* Candidate Info */}
                                          <Card>
                                            <CardHeader>
                                              <CardTitle>Candidate Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid md:grid-cols-2 gap-4">
                                              <div>
                                                <strong>Name:</strong> {selectedCandidate.candidate?.name}
                                              </div>
                                              <div>
                                                <strong>Email:</strong> {selectedCandidate.candidate?.email}
                                              </div>
                                              <div>
                                                <strong>Phone:</strong> {selectedCandidate.candidate?.phone}
                                              </div>
                                              <div>
                                                <strong>Interview Date:</strong> {new Date(selectedCandidate.interview.endTime).toLocaleString()}
                                              </div>
                                            </CardContent>
                                          </Card>

                                          {/* Questions and Answers */}
                                          <Card>
                                            <CardHeader>
                                              <CardTitle>Interview Responses</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                              {selectedCandidate.interview.questions.map((q: any, index: number) => (
                                                <div key={q.id} className="border rounded-lg p-4">
                                                  <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-semibold">Question {index + 1}</h4>
                                                    <div className="flex gap-2">
                                                      <Badge variant="outline">{q.difficulty}</Badge>
                                                      <Badge variant={getScoreVariant((q.score || 0))}>
                                                        {q.score || 0}/100
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                  <p className="text-sm mb-2">{q.question}</p>
                                                  <div className="bg-muted p-3 rounded text-sm">
                                                    <strong>Answer:</strong> {q.answer || 'No answer provided'}
                                                  </div>
                                                  <div className="text-xs text-muted-foreground mt-2">
                                                    Time spent: {q.timeSpent || 0}s / {q.timeLimit}s
                                                  </div>
                                                </div>
                                              ))}
                                            </CardContent>
                                          </Card>

                                          {/* AI Summary */}
                                          {selectedCandidate.interview.summary && (
                                            <Card>
                                              <CardHeader>
                                                <CardTitle>AI Summary</CardTitle>
                                              </CardHeader>
                                              <CardContent>
                                                <p className="text-sm whitespace-pre-wrap">
                                                  {selectedCandidate.interview.summary}
                                                </p>
                                              </CardContent>
                                            </Card>
                                          )}
                                        </div>
                                      </ScrollArea>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Interview Analytics
                </CardTitle>
                <CardDescription>
                  Comprehensive insights and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics dashboard coming soon...</p>
                  <p className="text-sm">Advanced charts and insights will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;