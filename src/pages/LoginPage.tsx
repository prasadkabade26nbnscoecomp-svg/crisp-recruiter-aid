import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrainCircuit, ArrowLeft } from 'lucide-react';
import { loginAdmin, loginCandidate } from '@/store/slices/authSlice';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [candidatePhone, setCandidatePhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Check admin credentials
    if (adminCredentials.email === 'Interviewer@admin.com' && adminCredentials.password === 'Pass@123') {
      dispatch(loginAdmin());
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
      });
      navigate('/admin');
    } else {
      toast({
        title: "Login Failed", 
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleCandidateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(candidatePhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    dispatch(loginCandidate(candidatePhone));
    toast({
      title: "Access Granted",
      description: "Redirecting to your results...",
    });
    navigate('/results');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-chat flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Crisp AI Interview
            </h1>
          </div>
          <p className="text-muted-foreground">
            Access your account to continue
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Choose your account type to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="candidate">Candidate</TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>Demo Credentials:</strong><br />
                    Email: Interviewer@admin.com<br />
                    Password: Pass@123
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter admin email"
                      value={adminCredentials.email}
                      onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter password"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login as Admin'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="candidate" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Enter the phone number from your resume to access your interview results.
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleCandidateLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidate-phone">Phone Number</Label>
                    <Input
                      id="candidate-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Access Results'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;