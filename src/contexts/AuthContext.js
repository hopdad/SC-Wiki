import React, {createContext, useContext, useState, useEffect} from 'react';
import {getSupabase} from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    getSupabase().auth.getSession().then(({data: {session}}) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {data: {subscription}} = getSupabase().auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const {data, error} = await getSupabase()
      .from('user_profiles')
      .select('*, manager:manager_id(id, email, display_name)')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    setLoading(false);
  }

  // Sign in with Azure AD via Supabase
  async function signIn() {
    const {error} = await getSupabase().auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email profile',
      },
    });
    if (error) console.error('Sign in error:', error.message);
  }

  async function signOut() {
    await getSupabase().auth.signOut();
    setUser(null);
    setProfile(null);
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    // Convenience role checks
    isAuthenticated: !!user,
    isViewer: !!profile,
    isEditor: profile?.role === 'editor' || profile?.role === 'reviewer' || profile?.role === 'admin',
    isReviewer: profile?.role === 'reviewer' || profile?.role === 'admin',
    isAdmin: profile?.role === 'admin',
    role: profile?.role || 'viewer',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
