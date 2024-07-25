import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import { usePopup } from '../PopupContext';
import { FaGoogle, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
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
  ButtonContainer,
  PopupContent,
  TopLeftCircle,
  BottomRightCircle
} from './PopupStyles';

const RegisterPopup = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const { showRegisterPopup, closeAllPopups, openLoginPopup, isFromCourseDetails, navigateBack } = usePopup();

  const handleNextStep = () => {
    if (!firstName || !lastName || !email) {
      setError('כל השדות חייבים להיות מלאים');
      return;
    }
    setStep(2);
    setError('');
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        console.log('Registration successful:', data);
        
        Swal.fire({
          title: 'הרשמה הושלמה בהצלחה!',
          text: 'נשלח אליך מייל לאימות. אנא בדוק את תיבת הדואר שלך.',
          icon: 'success',
          confirmButtonText: 'פתח את תיבת הדואר',
          showCancelButton: true,
          cancelButtonText: 'סגור'
        }).then((result) => {
          if (result.isConfirmed) {
            openEmailClient(email);
          }
          closeAllPopups();
          navigateBack();
        });
      } else {
        setError('הרשמה נכשלה. אנא נסה שנית.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'שגיאה ברישום, נסה שוב');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;

      if (data.session) {
        const user = data.session.user;
        await handleUserMetadataUpdate(user);
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('שגיאה בהתחברות עם גוגל');
    }
  };

  const handleUserMetadataUpdate = async (user) => {
    if (!user.user_metadata || !user.user_metadata.first_name || !user.user_metadata.last_name) {
      const { value: formValues } = await Swal.fire({
        title: 'השלמת פרטים',
        html:
          '<input id="swal-input1" class="swal2-input" placeholder="שם פרטי">' +
          '<input id="swal-input2" class="swal2-input" placeholder="שם משפחה">',
        focusConfirm: false,
        preConfirm: () => {
          return [
            document.getElementById('swal-input1').value,
            document.getElementById('swal-input2').value
          ]
        }
      });

      if (formValues) {
        const [firstName, lastName] = formValues;
        await supabase.auth.updateUser({
          data: {
            first_name: firstName,
            last_name: lastName
          }
        });
      }
    }
  };

  const openEmailClient = (email) => {
    let emailProvider = email.split('@')[1];
    let url;

    switch(emailProvider) {
      case 'gmail.com':
        url = 'https://mail.google.com/';
        break;
      case 'outlook.com':
      case 'hotmail.com':
        url = 'https://outlook.live.com/';
        break;
      case 'yahoo.com':
        url = 'https://mail.yahoo.com/';
        break;
      default:
        url = `https://${emailProvider}`;
    }

    window.open(url, '_blank');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeAllPopups();
      }
    };

    if (showRegisterPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRegisterPopup, closeAllPopups]);

  if (!showRegisterPopup) return null;

  return (
    <Overlay>
      <Container ref={containerRef}>
        <TopLeftCircle color="#62238C" />
        <BottomRightCircle color="#9D4EDD" />
        <PopupContent>
          <CloseButton onClick={closeAllPopups}>✕</CloseButton>
          <BrandTitle>הרשמה</BrandTitle>
          {isFromCourseDetails && (
            <div style={{marginBottom: '10px', color: '#62238C'}}>יש להרשם על מנת להשלים את הרכישה</div>
          )}
          <Inputs>
            {step === 1 && (
              <>
                <InputWrapper delay="0.1s">
                  <Label htmlFor="firstName">שם פרטי</Label>
                  <Input 
                    id="firstName"
                    type="text" 
                    placeholder="לדוגמה: יוסי" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                  />
                  <Icon><FaUser /></Icon>
                </InputWrapper>
                <InputWrapper delay="0.2s">
                  <Label htmlFor="lastName">שם משפחה</Label>
                  <Input 
                    id="lastName"
                    type="text" 
                    placeholder="לדוגמה: כהן" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                  />
                  <Icon><FaUser /></Icon>
                </InputWrapper>
                <InputWrapper delay="0.3s">
                  <Label htmlFor="email">אימייל</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="example@test.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                  <Icon><FaEnvelope /></Icon>
                </InputWrapper>
                <ButtonContainer>
                  <Button onClick={handleNextStep}>הבא</Button>
                  <GoogleButton onClick={handleGoogleLogin}>
                    <FaGoogle />
                    הירשם עם גוגל
                  </GoogleButton>
                  <Button onClick={openLoginPopup}>כבר רשומים אצלנו? התחברו כאן</Button>
                </ButtonContainer>
              </>
            )}
            {step === 2 && (
              <>
                <InputWrapper delay="0.1s">
                  <Label htmlFor="password">סיסמה</Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="מינימום 6 תווים" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <Icon><FaLock /></Icon>
                </InputWrapper>
                <InputWrapper delay="0.2s">
                  <Label htmlFor="confirmPassword">אימות סיסמה</Label>
                  <Input 
                    id="confirmPassword"
                    type="password" 
                    placeholder="הקלד שוב את הסיסמה" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                  <Icon><FaLock /></Icon>
                </InputWrapper>
                <ButtonContainer>
                  <Button onClick={handleRegister}>הירשם</Button>
                  <Button onClick={handlePreviousStep}>הקודם</Button>
                </ButtonContainer>
              </>
            )}
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </Inputs>
        </PopupContent>
      </Container>
    </Overlay>
  );
};

export default RegisterPopup;