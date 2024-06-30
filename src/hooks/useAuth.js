import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, name, phone) => {
    const { user, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Error signing up:', error);
      return { error };
    }

    const { data, error: updateUserError } = await supabase
      .from('users')
      .update({ name, phone })
      .eq('id', user.id);

    if (updateUserError) {
      console.error('Error updating user:', updateUserError);
      return { error: updateUserError };
    }

    await fetch('/api/sendMail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, phone })
    });

    setUser(user);
    return { user };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
