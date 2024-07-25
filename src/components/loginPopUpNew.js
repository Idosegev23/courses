import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { usePopup } from '../PopupContext';
import { FaGoogle, FaUser, FaLock } from 'react-icons/fa';
import {
  Overlay,
  Container,
  CloseButton,
  BrandTitle,
  Inputs,
  InputWrapper,
  Label,
  Input,
  Icon,
  Button,
  GoogleButton,
  ErrorMessage,
  PopupContent,
  TopLeftCircle,
  BottomRightCircle,
  ButtonContainer,
  Form
} from './PopupStyles';

const LoginPopup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const { showLoginPopup, closeAllPopups, openRegisterPopup, navigateBack } = usePopup();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        closeAllPopups();
        navigateBack();
      } else {
        setError('התחברות נכשלה. אנא נסה שנית.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      setError('שגיאה בהתחברות עם גוגל');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeAllPopups();
      }
    };

    if (showLoginPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLoginPopup, closeAllPopups]);

  if (!showLoginPopup) return null;

  return (
    <Overlay>
      <Container ref={containerRef}>
        <TopLeftCircle color="#62238C" />
        <BottomRightCircle color="#9D4EDD" />
        <PopupContent>
          <CloseButton onClick={closeAllPopups}>✕</CloseButton>
          <BrandTitle>התחברות</BrandTitle>
          <Inputs>
            <Form onSubmit={handleLogin}>
              <InputWrapper delay="0.1s">
                <Label htmlFor="email">אימייל</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="example@test.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
                <Icon><FaUser /></Icon>
              </InputWrapper>
              <InputWrapper delay="0.2s">
                <Label htmlFor="password">סיסמה</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="הכנס סיסמה" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
                <Icon><FaLock /></Icon>
              </InputWrapper>
              <ButtonContainer>
                <Button type="submit">התחבר</Button>
              </ButtonContainer>
            </Form>
            <ButtonContainer>
              <GoogleButton onClick={handleGoogleLogin}>
                <FaGoogle />  
                התחבר עם Google
              </GoogleButton>
              <Button onClick={openRegisterPopup}>לא רשומים? הירשמו כאן</Button>
            </ButtonContainer>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Inputs>
        </PopupContent>
      </Container>
    </Overlay>
  );
};

export default LoginPopup;