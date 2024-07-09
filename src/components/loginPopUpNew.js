import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

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

const Container = styled.div`
  width: 350px;
  height: auto;
  border-radius: 20px;
  padding: 40px;
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
  background-size: cover;
  margin: auto;
  border-radius: 50%;
  box-shadow: 7px 7px 10px #cbced1, -7px -7px 10px white;
`;

const BrandTitle = styled.div`
  margin-top: 10px;
  font-weight: 900;
  font-size: 1.8rem;
  color: #62238C;
  letter-spacing: 1px;
`;

const Inputs = styled.div`
  text-align: right;
  margin-top: 30px;
  width: 100%;
`;

const Label = styled.label`
  margin-bottom: 4px;
  display: block;
  text-align: right;
`;

const Input = styled.input`
  background: #ecf0f3;
  padding: 10px;
  padding-left: 20px;
  height: 50px;
  font-size: 14px;
  border-radius: 50px;
  box-shadow: inset 6px 6px 6px #cbced1, inset -6px -6px 6px white;
  margin-bottom: 12px;
  width: 100%;
`;

const Button = styled.button`
  color: white;
  margin-top: 20px;
  background: #62238C;
  height: 40px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 900;
  box-shadow: 6px 6px 6px #cbced1, -6px -6px 6px white;
  transition: 0.5s;
  width: 100%;
  
  &:hover {
    box-shadow: none;
  }
`;

const GoogleButton = styled(Button)`
  background: #DB4437;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
`;

const LoginPopupNew = ({ onLoginSuccess, onShowRegister, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('שם משתמש או סיסמה שגויים');
    } else {
      setError('');
      onLoginSuccess();
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      setError('שגיאה בהתחברות עם גוגל');
    }
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Overlay>
      <Container ref={containerRef}>
        <BrandLogo />
        <BrandTitle>התחברות</BrandTitle>
        <Inputs>
          <Label>אימייל</Label>
          <Input 
            type="email" 
            placeholder="example@test.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <Label>סיסמה</Label>
          <Input 
            type="password" 
            placeholder="מינימום 8 תווים" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <Button type="submit" onClick={handleLogin}>התחבר</Button>
          <GoogleButton onClick={handleGoogleLogin}>התחבר עם גוגל</GoogleButton>
          <Button onClick={onShowRegister}>לא רשומים? לחצו כאן להרשמה</Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Inputs>
      </Container>
    </Overlay>
  );
};

export default LoginPopupNew;
