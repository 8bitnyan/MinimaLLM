import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isOffline: boolean;
}

// Demo users for development/offline mode
const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  app_metadata: {},
  user_metadata: { name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const isAuthenticated = !!user;

  // Check for network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        // If we're offline, use demo/local user
        if (!navigator.onLine) {
          console.log('Device is offline, using demo user');
          setIsOffline(true);
          
          // Check if we have previously stored a user in localStorage
          const storedUser = localStorage.getItem('demo_user');
          if (storedUser && storedUser === 'demo@example.com') {
            console.log('Using stored demo user');
            setUser(DEMO_USER as unknown as User);
          }
          
          setLoading(false);
          return;
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth provider error:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Skip subscription if offline
    if (navigator.onLine) {
      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      // Check if offline
      if (!navigator.onLine) {
        setIsOffline(true);
        return { error: new Error('Cannot sign up while offline') };
      }
      
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      // If offline and using demo credentials, allow demo mode login
      if (!navigator.onLine) {
        setIsOffline(true);
        
        if (email === 'demo@example.com' && password === 'password') {
          console.log('Offline mode: logging in with demo account');
          setUser(DEMO_USER as unknown as User);
          localStorage.setItem('demo_user', email);
          return { error: null };
        }
        
        return { error: new Error('Cannot sign in while offline') };
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      // If successful, clear any demo user
      if (!error) {
        localStorage.removeItem('demo_user');
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      
      // If fetch failed, could be an offline issue
      if ((error as Error).message?.includes('Failed to fetch')) {
        setIsOffline(true);
        
        // Allow demo login if using demo credentials
        if (email === 'demo@example.com' && password === 'password') {
          console.log('Network error but using demo credentials');
          setUser(DEMO_USER as unknown as User);
          localStorage.setItem('demo_user', email);
          return { error: null };
        }
        
        return { error: new Error('Cannot connect to authentication server. Check your internet connection.') };
      }
      
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    // If demo user or offline, just clear local state
    if (isOffline || localStorage.getItem('demo_user')) {
      setUser(null);
      localStorage.removeItem('demo_user');
      return;
    }
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear the user on the client side even if the API call fails
      setUser(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated,
    isOffline,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 