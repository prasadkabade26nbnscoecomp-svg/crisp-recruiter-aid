import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, Users, Clock, Shield } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-chat">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Crisp AI Interview
            </h1>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/login')}
          >
            Admin Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            AI-Powered Interview Assistant
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the future of technical interviews with our intelligent system that evaluates 
            candidates fairly and efficiently using advanced AI technology.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/interview')}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              Start Interview
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/results')}
            >
              View My Results
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Crisp AI?</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BrainCircuit className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>AI-Powered Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced AI analyzes responses for technical accuracy, communication skills, and problem-solving approach.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Timed Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Progressive difficulty with optimized time limits to fairly evaluate candidate performance under pressure.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Dual Interface</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Seamless experience for both candidates and interviewers with synchronized real-time data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All data is stored locally with enterprise-grade security measures to protect candidate information.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          
          <Tabs defaultValue="candidate" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="candidate">For Candidates</TabsTrigger>
              <TabsTrigger value="interviewer">For Interviewers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="candidate" className="mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">1. Upload Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Upload your PDF or DOCX resume. Our AI extracts your contact information automatically.
                    </CardDescription>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">2. Complete Interview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Answer 6 progressive questions (Easy → Medium → Hard) with voice or text responses.
                    </CardDescription>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">3. Get Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Receive instant AI evaluation with detailed feedback and performance insights.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="interviewer" className="mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">1. Monitor Live</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Watch candidates progress through interviews in real-time with live updates.
                    </CardDescription>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">2. Review Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Access comprehensive dashboards with candidate rankings, scores, and AI summaries.
                    </CardDescription>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">3. Make Decisions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Export detailed reports and make data-driven hiring decisions with confidence.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Crisp AI Interview Assistant. Powered by advanced AI technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;