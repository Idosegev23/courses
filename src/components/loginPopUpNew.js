import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { usePopup } from '../PopupContext'
import { FaGoogle } from 'react-icons/fa';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #62238C;
  &:hover {
    color: #4a1b6d;
  }
`;

const Container = styled.div`
  position: relative;
  width: 300px;
  height: 600px;
  border-radius: 20px;
  padding: 30px;
  background: #ecf0f3;
  box-shadow: 14px 14px 20px #cbced1, -14px -14px 20px white;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Heebo', sans-serif;
`;

const BrandLogo = styled.div`
  height: 150px;
  width: 150px;
  background: url("https://courses.triroars.co.il/static/media/NewLogo_BLANK.331a9671220d7891575e.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin: 0 auto 10px;
`;

const BrandTitle = styled.div`
  margin: 10px 0 20px;
  font-weight: 900;
  font-size: 1.6rem;
  color: #62238C;
  letter-spacing: 1px;
`;

const Inputs = styled.div`
  text-align: right;
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Label = styled.label`
  margin-bottom: 4px;
  display: block;
  text-align: right;
`;

const Input = styled.input`
  background: #ecf0f3;
  padding: 5px 10px;
  height: 40px;
  font-size: 14px;
  border-radius: 50px;
  box-shadow: inset 6px 6px 6px #cbced1, inset -6px -6px 6px white;
  margin-bottom: 15px;
  width: 90%;
`;

const BaseButton = styled.button`
  display: inline-block;
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  text-decoration: none;
  color: #fff;
  background: linear-gradient(45deg, #000080, #62238C, #9D4EDD, #62238C, #000080);
  background-size: 300% 300%;
  transition: all 0.3s;
  border: none;
  box-shadow: 0 3px 5px 2px rgba(0, 0, 0, .3);
  cursor: pointer;
  font-weight: 900;
  width: 90%;

  &:hover {
    animation: wave 3s ease infinite;
    box-shadow: 0 0 15px rgba(157, 78, 221, 0.6);
  }

  @keyframes wave {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const Button = styled(BaseButton)`
  margin-top: 15px;
`;

const GoogleButton = styled(BaseButton)`
  background: #DB4437;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 25px;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
`;

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
        <CloseButton onClick={closeAllPopups}>✕</CloseButton>
          <BrandLogo />
          <BrandTitle>התחברות</BrandTitle>
          <Inputs>
            <form onSubmit={handleLogin}>
              <Label>אימייל</Label>
              <Input 
                type="email" 
                placeholder="example@test.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
              <Label>סיסמה</Label>
              <Input 
                type="password" 
                placeholder="הכנס סיסמה" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
              <Button type="submit">התחבר</Button>
            </form>
            <GoogleButton onClick={handleGoogleLogin}>
              <FaGoogle />  
              התחבר עם Google
            </GoogleButton>
            <Button onClick={openRegisterPopup}>לא רשומים? הירשמו כאן</Button>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Inputs>
        </Container>
      </Overlay>
    );
  };
  
  export default LoginPopup;