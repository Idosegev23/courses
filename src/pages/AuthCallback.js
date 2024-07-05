import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error during auth callback:', error);
        navigate('/login');
        return;
      }

      if (user) {
        setUser(user);
        
        // בדוק אם המשתמש כבר קיים בטבלת users
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching user:', fetchError);
        }

        if (!existingUser) {
          // אם המשתמש לא קיים, נוסיף אותו לטבלת users
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email,
              username: user.email.split('@')[0], // או להשאיר null אם לא נדרש
              created_at: new Date().toISOString(),
              // שאר השדות יהיו null או default values
            });

          if (insertError) {
            console.error('Error inserting user:', insertError);
          }
        }

        // מפנה את המשתמש לאזור האישי
        navigate('/personal-area');
      } else {
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, setUser]);

  return <div>מאמת...</div>;
};

export default AuthCallback;