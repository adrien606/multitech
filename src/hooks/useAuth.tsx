import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  pin_code: string;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role: 'admin' | 'supervisor' | 'agent';
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: 'admin' | 'supervisor' | 'agent' | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, pinCode: string) => Promise<{ error: any }>;
  signUp: (email: string, fullName: string, pinCode: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  logActivity: (action: string, entityType: string, entityId?: string, details?: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<'admin' | 'supervisor' | 'agent' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and role
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
            await fetchUserRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      setRole(data.role);
    } catch (error) {
      console.error('Error fetching role:', error);
    }
  };

  const signIn = async (email: string, pinCode: string) => {
    try {
      // Convert 4-digit PIN to 6-character password by adding prefix
      const password = `pin_${pinCode}`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, fullName: string, pinCode: string) => {
    try {
      // Convert 4-digit PIN to 6-character password by adding prefix
      const password = `pin_${pinCode}`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            pin_code: pinCode,
          },
          
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const logActivity = async (action: string, entityType: string, entityId?: string, details?: any) => {
    if (!user) return;
    
    try {
      await supabase.rpc('log_activity', {
        p_user_id: user.id,
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_details: details ? JSON.stringify(details) : null
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const value = {
    user,
    profile,
    role,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    logActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};