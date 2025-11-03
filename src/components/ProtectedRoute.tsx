import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { AppRole } from '@/types/otms';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole | AppRole[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, roles, profileStatus, isLoadingRoles, isLoadingProfile } = useAuth();

  // Wait for server state (roles, profile) to load
  const isLoading = isLoadingRoles || isLoadingProfile;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect users with pending setup to password setup page
  if (profileStatus === 'pending_password') {
    return <Navigate to="/setup-password" replace />;
  }

  // Check role-based access if required
  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and authorized - render protected content
  return <>{children}</>;
}