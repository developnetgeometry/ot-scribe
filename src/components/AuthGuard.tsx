import { useAuth } from '@/hooks/useAuth';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoadingSession } = useAuth();
  const location = useLocation();

  // Show loading skeleton while checking authentication
  if (isLoadingSession) {
    return <LoadingSkeleton />;
  }

  // If user is not authenticated and not on auth-related pages, redirect to auth
  const isAuthPage = ['/auth', '/set-password', '/setup-password', '/change-password'].includes(location.pathname);
  
  if (!user && !isAuthPage) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated and on auth page, redirect to dashboard
  if (user && location.pathname === '/auth') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}