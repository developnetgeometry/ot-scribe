import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, Profile } from '@/types/otms';
import { toast } from 'sonner';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: (userId?: string) => [...authKeys.user(), 'profile', userId] as const,
  roles: (userId?: string) => [...authKeys.user(), 'roles', userId] as const,
} as const;

// Types
interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  profileStatus: 'active' | 'pending_password' | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<void>;
  isLoadingSession: boolean;
  isLoadingProfile: boolean;
  isLoadingRoles: boolean;
  getDefaultRoute: () => string;
  hasRole: (role: AppRole) => boolean;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    roles: [],
    profileStatus: null,
  });

  // Session Query
  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError,
  } = useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Profile Query (depends on session)
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useQuery({
    queryKey: authKeys.profile(session?.user?.id),
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          department:departments(id, name, code),
          position_obj:positions(*)
        `)
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Roles Query (depends on session)
  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useQuery({
    queryKey: authKeys.roles(session?.user?.id),
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      return (data || []).map(item => item.role as AppRole);
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sign In Mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        // Transform Supabase errors to user-friendly messages
        let message = 'Unable to sign in. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Please check your email to confirm your account.';
        } else if (error.message.includes('Too many requests')) {
          message = 'Too many login attempts. Please try again later.';
        }
        
        throw new Error(message);
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate auth queries to refresh data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });

  // Sign Out Mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Clear all queries and reset auth state
      queryClient.clear();
      setAuthState({
        user: null,
        session: null,
        profile: null,
        roles: [],
        profileStatus: null,
      });
    },
  });

  // Auth state change listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`, { session: !!session });
      
      if (event === 'SIGNED_OUT' || !session) {
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Update auth state when queries resolve
  useEffect(() => {
    const user = session?.user || null;
    const profileStatus = profile?.status === 'pending_password' ? 'pending_password' : 'active';
    
    setAuthState({
      user,
      session,
      profile,
      roles,
      profileStatus,
    });
  }, [session, profile, roles]);

  // Get default route based on user roles
  const getDefaultRoute = () => {
    if (!roles.length) return '/dashboard';
    
    // Priority order for role-based routing
    if (roles.includes('admin')) return '/admin/dashboard';
    if (roles.includes('hr')) return '/hr/dashboard';
    if (roles.includes('bod')) return '/bod/dashboard';
    if (roles.includes('supervisor')) return '/supervisor/dashboard';
    if (roles.includes('employee')) return '/employee/dashboard';
    
    return '/dashboard';
  };

  // Check if user has a specific role
  const hasRole = (role: AppRole) => {
    return roles.includes(role);
  };

  // Sign in wrapper
  const signIn = async (email: string, password: string) => {
    try {
      await signInMutation.mutateAsync({ email, password });
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out wrapper
  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    isLoadingSession,
    isLoadingProfile,
    isLoadingRoles,
    getDefaultRoute,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}