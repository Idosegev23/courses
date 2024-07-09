import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getSession } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const savedSession = getSession();
    if (savedSession) {
      setSession(savedSession);
      setUser(savedSession.user);
    }

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
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
        localStorage.removeItem('supabaseSession');
      }
      return { error };
    },
    user,
    session
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);