import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { FaGoogle } from 'react-icons/fa';

const FormInput = styled.input`
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
  font-family: montserrat;
  color: #2C3E50;
  font-size: 13px;
`;

const FormButton = styled.button`
  width: 100%;
  background: #62238C;
  font-weight: bold;
  color: white;
  border: 0 none;
  border-radius: 1px;
  cursor: pointer;
  padding: 10px;
  margin: 10px 0;
  text-decoration: none;
  font-size: 14px;

  &:hover, &:focus {
    box-shadow: 0 0 0 2px white, 0 0 0 3px #62238C;
  }
`;

const GoogleButton = styled(FormButton)`
  background-color: #DB4437;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: #C33D2E;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
`;

const LoginPopup = ({ open, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      onLoginSuccess(data.user);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;

      // הצלחת התחברות דרך גוגל מטופלת בדרך כלל על ידי מנגנון ה-redirect של supabase
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>התחברות</DialogTitle>
      <DialogContent>
        <form onSubmit={handleLogin}>
          <FormInput
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FormInput
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <FormButton type="submit">התחבר</FormButton>
        </form>
        <GoogleButton onClick={handleGoogleLogin}>
          <FaGoogle /> התחבר עם גוגל
        </GoogleButton>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPopup;