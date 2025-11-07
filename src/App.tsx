import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthGuard } from "./components/AuthGuard";
import { RootRedirect } from "./components/RootRedirect";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/theme-provider";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { createQueryClient } from "./lib/queryClient";
import Auth from "./pages/Auth";
import SetPassword from "./pages/SetPassword";
import SetupPassword from "./pages/SetupPassword";
import ChangePassword from "./pages/ChangePassword";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import SubmitOT from "./pages/SubmitOT";
import OTHistory from "./pages/OTHistory";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ApproveOT from "./pages/hr/ApproveOT";
import Employees from "./pages/hr/Employees";
import Departments from "./pages/hr/Departments";
import HRSettings from "./pages/hr/Settings";
import OTReports from "./pages/hr/OTReports";
import Settings from "./pages/Settings";
import HolidayCalendars from "./pages/hr/HolidayCalendars";
import NewHolidayCalendar from "./pages/hr/NewHolidayCalendar";
import EditHolidayCalendar from "./pages/hr/EditHolidayCalendar";

import Calendar from "./pages/Calendar";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import HRDashboard from "./pages/hr/HRDashboard";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import VerifyOT from "./pages/supervisor/VerifyOT";
import ManagementDashboard from "./pages/management/ManagementDashboard";
import ReviewOT from "./pages/management/ReviewOT";
import ManagementApproveOT from "./pages/management/ApproveOT";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = createQueryClient();

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="system" storageKey="ot-scribe-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AuthGuard>
              <PWAInstallBanner />
              <Routes>
                <Route path="/" element={<RootRedirect />} />
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
                <Route path="/management/dashboard" element={<ProtectedRoute requiredRole="management"><ManagementDashboard /></ProtectedRoute>} />
                
                {/* Fallback dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                
                {/* Shared routes - all authenticated users */}
                <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                
                {/* Employee routes */}
                <Route path="/ot/submit" element={<ProtectedRoute requiredRole="employee"><SubmitOT /></ProtectedRoute>} />
                <Route path="/ot/history" element={<ProtectedRoute requiredRole="employee"><OTHistory /></ProtectedRoute>} />
                
                {/* Supervisor routes */}
                <Route path="/supervisor/verify" element={<ProtectedRoute requiredRole="supervisor"><VerifyOT /></ProtectedRoute>} />
                
                {/* HR routes */}
                <Route path="/hr/approve" element={<ProtectedRoute requiredRole="hr"><ApproveOT /></ProtectedRoute>} />
                <Route path="/hr/employees" element={<ProtectedRoute requiredRole="hr"><Employees /></ProtectedRoute>} />
                <Route path="/hr/departments" element={<ProtectedRoute requiredRole="hr"><Departments /></ProtectedRoute>} />
                <Route path="/hr/calendar" element={<ProtectedRoute requiredRole="hr"><HolidayCalendars /></ProtectedRoute>} />
                <Route path="/hr/calendar/new" element={<ProtectedRoute requiredRole="hr"><NewHolidayCalendar /></ProtectedRoute>} />
                <Route path="/hr/calendar/:id/edit" element={<ProtectedRoute requiredRole="hr"><EditHolidayCalendar /></ProtectedRoute>} />
                <Route path="/hr/settings" element={<ProtectedRoute requiredRole="hr"><HRSettings /></ProtectedRoute>} />
                <Route path="/hr/ot-reports" element={<ProtectedRoute requiredRole="hr"><OTReports /></ProtectedRoute>} />
                
                {/* Management routes */}
                <Route path="/management/approve" element={<ProtectedRoute requiredRole="management"><ManagementApproveOT /></ProtectedRoute>} />
                <Route path="/management/report" element={<ProtectedRoute requiredRole="management"><ReviewOT /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <Sonner />
            </AuthGuard>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
