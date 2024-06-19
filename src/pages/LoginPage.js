import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #ffffff;
    direction: rtl;
    margin: 0;
    padding: 0;
  }
`;

const PageContainer = styled.div`
  padding: 2rem;
  background: #ffffff;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #F25C78;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #ddd;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem;
  border-radius: 1rem;
  border: none;
  background-color: #F25C78;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;

  &:hover {
    background-color: #BF4B81;
  }
`;

const LinkText = styled.p`
  font-size: 1rem;
  color: #666;
`;

const OAuthButton = styled.button`
  background-color: ${(props) => (props.bgColor || '#fff')};
  color: ${(props) => (props.color || '#000')};
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
    background-color: ${(props) => (props.hoverBgColor || '#e0e0e0')};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const AdminChoiceButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem;
  border: none;
  border-radius: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const UserChoiceButton = styled(AdminChoiceButton)`
  background-color: #F25C78;

  &:hover {
    background-color: #BF4B81;
  }
`;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminChoice, setShowAdminChoice] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('ההתחברות נכשלה, אנא בדוק את המייל והסיסמה ונסה שוב.');
    } else {
      if (email === 'Triroars@gmail.com') {
        setShowAdminChoice(true);
      } else {
        navigate('/personal-area');
      }
    }
  };

  const handleAdminChoice = () => {
    navigate('/admin-dashboard');
  };

  const handleUserChoice = () => {
    navigate('/personal-area');
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });

      if (error) {
        console.error(`Error signing in with ${provider}:`, error);
        setError(`שגיאה בהתחברות עם ${provider}: ${error.message}`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('אירעה שגיאה בלתי צפויה.');
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>התחברות</PageTitle>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Button type="submit">התחבר</Button>
        </Form>
        <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <OAuthButton
            onClick={() => handleOAuthSignIn('google')}
            bgColor="#DB4437"
            color="#fff"
            hoverBgColor="#C33D2E"
          >
            <FaGoogle /> התחברות עם גוגל
          </OAuthButton>
        
        </div>
        <LinkText>אין לך חשבון? <a href="/register">הרשם כאן</a></LinkText>
      </PageContainer>

      {showAdminChoice && (
        <ModalOverlay>
          <ModalContent>
            <h2>בחר את אופן הכניסה</h2>
            <AdminChoiceButton onClick={handleAdminChoice}>כניסה כאדמין</AdminChoiceButton>
            <UserChoiceButton onClick={handleUserChoice}>כניסה כמשתמש רגיל</UserChoiceButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default LoginPage;
