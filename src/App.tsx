import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Calendar from "./pages/calendar";
import Chatbot from "./pages/chatbot";
import Navbar from "@/components/Navbar"; // Import your Navbar
import Index from "./pages/index";
import NotFound from "./pages/NotFound";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar /> {/* Add navbar here - shows on all pages */}
        <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
          <Routes>
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  <Route 
    path="/dashboard" 
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } 
  />
  <Route 
    path="/calendar" 
    element={
      <ProtectedRoute>
        <Calendar />
      </ProtectedRoute>
    } 
  />
  <Route 
    path="/chatbot" 
    element={
      <ProtectedRoute>
        <Chatbot />
      </ProtectedRoute>
    } 
  />
  <Route path="*" element={<NotFound />} />
</Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;