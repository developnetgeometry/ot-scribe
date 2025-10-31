import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import SetPassword from "./pages/SetPassword";
import SetupPassword from "./pages/SetupPassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import SubmitOT from "./pages/SubmitOT";
import OTHistory from "./pages/OTHistory";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ApproveOT from "./pages/hr/ApproveOT";
import Employees from "./pages/hr/Employees";
import Settings from "./pages/hr/Settings";
import OTReports from "./pages/hr/OTReports";
import HolidayCalendars from "./pages/hr/HolidayCalendars";
import NewHolidayCalendar from "./pages/hr/NewHolidayCalendar";
import EditHolidayCalendar from "./pages/hr/EditHolidayCalendar";
import Calendar from "./pages/Calendar";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import HRDashboard from "./pages/hr/HRDashboard";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import VerifyOT from "./pages/supervisor/VerifyOT";
import BODDashboard from "./pages/bod/BODDashboard";
import ReviewOT from "./pages/bod/ReviewOT";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/setup-password" element={<SetupPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Role-specific dashboards */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/hr/dashboard" element={<ProtectedRoute requiredRole="hr"><HRDashboard /></ProtectedRoute>} />
            <Route path="/supervisor/dashboard" element={<ProtectedRoute requiredRole="supervisor"><SupervisorDashboard /></ProtectedRoute>} />
            <Route path="/employee/dashboard" element={<ProtectedRoute requiredRole="employee"><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/bod/dashboard" element={<ProtectedRoute requiredRole="bod"><BODDashboard /></ProtectedRoute>} />
            
            {/* Fallback dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Shared routes - all authenticated users */}
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            
            {/* Employee routes */}
            <Route path="/ot/submit" element={<ProtectedRoute requiredRole="employee"><SubmitOT /></ProtectedRoute>} />
            <Route path="/ot/history" element={<ProtectedRoute requiredRole="employee"><OTHistory /></ProtectedRoute>} />
            
            {/* Supervisor routes */}
            <Route path="/supervisor/verify" element={<ProtectedRoute requiredRole="supervisor"><VerifyOT /></ProtectedRoute>} />
            
            {/* HR routes */}
            <Route path="/hr/approve" element={<ProtectedRoute requiredRole="hr"><ApproveOT /></ProtectedRoute>} />
            <Route path="/hr/employees" element={<ProtectedRoute requiredRole="hr"><Employees /></ProtectedRoute>} />
            <Route path="/hr/calendar" element={<ProtectedRoute requiredRole="hr"><HolidayCalendars /></ProtectedRoute>} />
            <Route path="/hr/calendar/new" element={<ProtectedRoute requiredRole="hr"><NewHolidayCalendar /></ProtectedRoute>} />
            <Route path="/hr/calendar/:id/edit" element={<ProtectedRoute requiredRole="hr"><EditHolidayCalendar /></ProtectedRoute>} />
            <Route path="/hr/settings" element={<ProtectedRoute requiredRole="hr"><Settings /></ProtectedRoute>} />
            <Route path="/hr/ot-reports" element={<ProtectedRoute requiredRole="hr"><OTReports /></ProtectedRoute>} />
            
            {/* BOD routes */}
            <Route path="/bod/review" element={<ProtectedRoute requiredRole="bod"><ReviewOT /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
