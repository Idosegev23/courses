import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';

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

const OAuthButton = styled(ActionButton)`
  background-color: #DB4437;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: #C33D2E;
  }
`;

const Message = styled.p`
  margin-top: 1rem;
  color: ${props => props.$error ? 'red' : 'green'};
`;

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { signUp, signInWithOAuth } = useAuth();


  const handleNext = () => {
    if (step === 1 && (!firstName || !lastName)) {
      setMessage('אנא מלא את כל השדות הנדרשים.');
      return;
    }
    if (step === 2 && (!email || !password || !confirmPassword)) {
      setMessage('אנא מלא את כל השדות הנדרשים.');
      return;
    }
    if (step === 2 && password !== confirmPassword) {
      setMessage('הסיסמאות לא תואמות.');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleRegister = async () => {
    try {
      console.log('Starting registration process');
      console.log('Registration data:', { email, password, firstName, lastName, phone });
      
      const { data: newUserData, error: registrationError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (registrationError) throw registrationError;

      console.log('User registered successfully:', newUserData);

      if (newUserData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({ 
            id: newUserData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            phone_num: phone,
          });

        if (userError) throw userError;

        console.log('User data inserted successfully');

        setMessage('ההרשמה הושלמה בהצלחה! נא לאמת את כתובת האימייל שלך.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error('User data not received from registration');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setMessage(`שגיאה בהרשמה: ${error.message}`);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
  
      if (error) throw error;
    } catch (error) {
      console.error('Error during OAuth sign in:', error);
      setMessage('אירעה שגיאה בהתחברות. אנא נסה שוב.');
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <FormContainer>
          <Title>הרשמה</Title>
          <form>
            {step === 1 && (
              <>
                <Input
                  type="text"
                  placeholder="שם פרטי"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="שם משפחה"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <ActionButton type="button" onClick={handleNext}>הבא</ActionButton>
              </>
            )}
            {step === 2 && (
              <>
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
                  autoComplete="new-password"
                />
                <Input
                  type="password"
                  placeholder="וידוא סיסמה"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <ActionButton type="button" onClick={handleBack}>חזור</ActionButton>
                <ActionButton type="button" onClick={handleNext}>הבא</ActionButton>
              </>
            )}
            {step === 3 && (
              <>
                <Input
                  type="tel"
                  placeholder="נייד"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <ActionButton type="button" onClick={handleBack}>חזור</ActionButton>
                <ActionButton type="button" onClick={handleRegister}>הרשמה</ActionButton>
              </>
            )}
            {message && <Message $error={message.includes('שגיאה')}>{message}</Message>}
          </form>
          {step === 1 && (
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <OAuthButton onClick={() => handleOAuthSignIn('google')}>
                <FaGoogle /> הרשמה עם גוגל
              </OAuthButton>
            </div>
          )}
        </FormContainer>
      </PageContainer>
    </>
  );
};

export default RegisterPage;