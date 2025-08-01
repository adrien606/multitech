import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ControlsPage from "./pages/ControlsPage";
import BuildingsControlPage from "./pages/BuildingsControlPage";
import ProvidersControlPage from "./pages/ProvidersControlPage";
import DocumentsControlPage from "./pages/DocumentsControlPage";
import BuildingsPage from "./pages/BuildingsPage";
import UsersPage from "./pages/UsersPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/regulatory-controls" element={<ControlsPage />} />
            <Route path="/regulatory-controls/buildings" element={<BuildingsControlPage />} />
            <Route path="/regulatory-controls/providers" element={<ProvidersControlPage />} />
            <Route path="/regulatory-controls/documents" element={<DocumentsControlPage />} />
            <Route path="/buildings" element={
              <ProtectedRoute>
                <BuildingsPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
