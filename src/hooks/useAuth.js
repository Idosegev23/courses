import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getSession, getCurrentUser } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserSession = async () => {
      setLoading(true);
      const session = await getSession();
      const user = await getCurrentUser();
      setSession(session);
      setUser(user);
      setLoading(false);
    };

    loadUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const user = await getCurrentUser();
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    signUp: async ({ email, password, options }) => {
      const { data, error } = await supabase.auth.signUp({ email, password, options });
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }
      return { data, error };
    },
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }
      return { data, error };
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setSession(null);
      }
      return { error };
    },
    user,
    session,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);