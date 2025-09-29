import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';

// Pages
import LandingPage from "./pages/LandingPage";
import InterviewPage from "./pages/InterviewPage";
import AdminDashboard from "./pages/AdminDashboard";
import CandidateResults from "./pages/CandidateResults";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredAuth }: { children: React.ReactNode; requiredAuth: 'admin' | 'candidate' }) => {
  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated || userType !== requiredAuth) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/admin" element={
        <ProtectedRoute requiredAuth="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/results" element={
        <ProtectedRoute requiredAuth="candidate">
          <CandidateResults />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <Provider store={store}>
    <PersistGate loading={<div className="flex items-center justify-center min-h-screen">Loading...</div>} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;
