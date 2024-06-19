import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

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
  color: #F25C78;
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
  background-color: #F25C78;
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
    background-color: #BF4B81;
  }
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
  gap: 2rem;

  &:hover {
    background-color: ${(props) => (props.hoverBgColor || '#e0e0e0')};
  }
`;

const Message = styled.p`
  margin-top: 1rem;
  color: #333;
`;

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      // יצירת משתמש חדש ב-Supabase Auth
      const { data: newUser, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Error creating user in Supabase Auth:', authError);
        setMessage(`שגיאה בהרשמה: ${authError.message}`);
        return;
      }

      // הוספת המשתמש לטבלת ה-users עם הנחה קבועה של 0%
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: newUser.user.id,
          email,
          username,
          discount: 0, // הנחה קבועה של 0%
        });

      if (dbError) {
        console.error('Error saving user to database:', dbError);
        setMessage(`שגיאה בהוספת המשתמש לבסיס הנתונים: ${dbError.message}`);
        return;
      }

      // הודעת הצלחה והפניה לדף הבית או לאזור האישי
      setMessage('נשלח אליך מייל לאימות. אנא בדוק את תיבת הדואר הנכנס שלך.');
      setTimeout(() => {
        navigate('/login');
      }, 3000); // מעבר אחרי 3 שניות לדף התחברות
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage('אירעה שגיאה בלתי צפויה.');
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });

      if (error) {
        console.error(`Error signing in with ${provider}:`, error);
        setMessage(`שגיאה בהרשמה עם ${provider}: ${error.message}`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage('אירעה שגיאה בלתי צפויה.');
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <FormContainer>
          <Title>טופס הרשמה</Title>
          <Input
            type="text"
            placeholder="שם משתמש"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ActionButton onClick={handleRegister}>הרשמה</ActionButton>
          {message && <Message>{message}</Message>}
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <OAuthButton
              onClick={() => handleOAuthSignIn('google')}
              bgColor="#DB4437"
              color="#fff"
              hoverBgColor="#C33D2E"
            >
              <FaGoogle /> הרשמה עם גוגל
            </OAuthButton>
            
            </OAuthButton>
          </div>
        </FormContainer>
      </PageContainer>
    </>
  );
};

export default RegisterPage;
