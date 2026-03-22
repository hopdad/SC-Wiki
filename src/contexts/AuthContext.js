import React, {createContext, useContext, useState, useEffect, useCallback, useMemo} from 'react';
import {getSupabase} from '../lib/supabase';
import {hasMinRole} from '../lib/roles';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    sb.auth.getSession().then(({data: {session}, error: sessionError}) => {
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {data: {subscription}} = sb.auth.onAuthStateChange(
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
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    const {data, error: profileError} = await sb
      .from('user_profiles')
      .select('*, manager:manager_id(id, email, display_name)')
      .eq('id', userId)
      .single();

    if (profileError) {
      setError(profileError.message);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  }

  const signIn = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const {error: signInError} = await sb.auth.signInWithOAuth({
      provider: 'azure',
      options: {scopes: 'email profile'},
    });
    if (signInError) setError(signInError.message);
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    setUser(null);
    setProfile(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(() => {
    const role = profile?.role || 'viewer';
    return {
      user,
      profile,
      loading,
      error,
      clearError,
      signIn,
      signOut,
      isAuthenticated: !!user,
      isViewer: !!profile,
      isEditor: hasMinRole(role, 'editor'),
      isReviewer: hasMinRole(role, 'reviewer'),
      isAdmin: hasMinRole(role, 'admin'),
      role,
    };
  }, [user, profile, loading, error, clearError, signIn, signOut]);

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
