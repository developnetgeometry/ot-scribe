import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export function RootRedirect() {
  const { user, isLoadingSession, isLoadingRoles, isLoadingProfile, getDefaultRoute } = useAuth();

  // Show loading while checking auth state
  if (isLoadingSession || (user && (isLoadingRoles || isLoadingProfile))) {
    return <LoadingSkeleton />;
  }

  // If not authenticated, go to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, redirect to role-based dashboard
  const targetRoute = getDefaultRoute();
  return <Navigate to={targetRoute} replace />;
}