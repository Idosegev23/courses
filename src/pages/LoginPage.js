import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    direction: rtl;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
  }
`;

const PageContainer = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const FormContainer = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: #62238C;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ddd;
  width: 100%;
`;

const ActionButton = styled.button`
  background-color: #62238C;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background-color: #6DBFF2;
  }
`;

const OAuthButton = styled.button`
  background-color: #DB4437;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-size: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 0.5rem;

  &:hover {
    background-color: #C33D2E;
  }
`;

const LinkText = styled.p`
  font-size: 1rem;
  color: #666;
`;

const Message = styled.p`
  margin-top: 1rem;
  color: #333;
`;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        console.error('Login error:', error);
        setError('ההתחברות נכשלה, אנא בדוק את המייל והסיסמה ונסה שוב.');
      } else if (data?.user) {
        console.log('User logged in successfully:', data.user);
        setUser(data.user);
        navigate('/personal-area');
      } else {
        setError('אירעה שגיאה בלתי צפויה בתהליך ההתחברות.');
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
      setError('אירעה שגיאה בלתי צפויה.');
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });

      if (error) {
        console.error(`Error signing in with ${provider}:`, error);
        setError(`שגיאה בהתחברות עם ${provider}: ${error.message}`);
      } else {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
        navigate('/personal-area');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('אירעה שגיאה בלתי צפויה.');
    }
  };
  const handlePasswordReset = async () => {
    if (!email) {
      setError('אנא הזן את כתובת האימייל שלך.');
      return;
    }
  
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setError('שגיאה בשליחת קישור לאיפוס סיסמא: ' + error.message);
      } else {
        setMessage('קישור לאיפוס סיסמא נשלח לאימייל שלך.');
      }
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      setError('אירעה שגיאה בלתי צפויה בתהליך איפוס הסיסמא.');
    }
  };
  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <FormContainer>
          <Title>התחברות</Title>
          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && <Message style={{ color: 'red' }}>{error}</Message>}
            <ActionButton type="submit">התחבר</ActionButton>
          </form>
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <OAuthButton onClick={() => handleOAuthSignIn('google')}>
              <FaGoogle /> התחברות עם גוגל
            </OAuthButton>
          </div>
          <ActionButton onClick={handlePasswordReset}>שכחתי סיסמא</ActionButton>
          <LinkText>אין לך חשבון? <a href="/register">הרשם כאן</a></LinkText>
          {message && <Message>{message}</Message>}
        </FormContainer>
      </PageContainer>
    </>
  );
};

export default LoginPage;
