import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Officer pages
import OfficerLayout from "./components/layout/OfficerLayout";
import OfficerDashboard from "./pages/officer/Dashboard";
import OfficerEvaluations from "./pages/officer/Evaluations";
import EvaluationForm from "./pages/officer/EvaluationForm";
import OfficerResults from "./pages/officer/Results";
import OfficerAccomplishments from "./pages/officer/Accomplishments";
import OfficerProfile from "./pages/officer/Profile";

// Admin pages
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrganization from "./pages/admin/Organization";
import AdminFormBuilder from "./pages/admin/FormBuilder";
import AdminAssignments from "./pages/admin/Assignments";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminAccomplishments from "./pages/admin/AdminAccomplishments";
import AdminUsers from "./pages/admin/Users";
import AdminAuditLog from "./pages/admin/AuditLog";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          {/* Officer routes */}
          <Route path="/officer" element={<OfficerLayout />}>
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="evaluations" element={<OfficerEvaluations />} />
            <Route path="evaluations/:id" element={<EvaluationForm />} />
            <Route path="results" element={<OfficerResults />} />
            <Route path="accomplishments" element={<OfficerAccomplishments />} />
            <Route path="profile" element={<OfficerProfile />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="organization" element={<AdminOrganization />} />
            <Route path="forms" element={<AdminFormBuilder />} />
            <Route path="assignments" element={<AdminAssignments />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="accomplishments" element={<AdminAccomplishments />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="audit-log" element={<AdminAuditLog />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
