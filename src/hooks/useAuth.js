// src/hooks/useAuth.js

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // מאזין לשינויים במצב ההתחברות של המשתמש
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    // החזרת הפונקציה לביטול המאזין
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      setUser(null); // שינוי המצב המקומי
    }
  };

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
