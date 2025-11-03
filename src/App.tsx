import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthGuard } from "./components/AuthGuard";
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
import RecertifyOT from "./pages/hr/RecertifyOT";
import Calendar from "./pages/Calendar";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import HRDashboard from "./pages/hr/HRDashboard";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard";
import VerifyOT from "./pages/supervisor/VerifyOT";
import BODDashboard from "./pages/bod/BODDashboard";
import ReviewOT from "./pages/bod/ReviewOT";
import BODApproveOT from "./pages/bod/ApproveOT";
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
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                
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
                
                {/* BOD routes */}
                <Route path="/bod/approve" element={<ProtectedRoute requiredRole="bod"><BODApproveOT /></ProtectedRoute>} />
                <Route path="/bod/review" element={<ProtectedRoute requiredRole="bod"><ReviewOT /></ProtectedRoute>} />
                
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
