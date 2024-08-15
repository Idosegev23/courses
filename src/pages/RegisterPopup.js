import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { FaGoogle, FaUser, FaEnvelope, FaLock, FaTicketAlt } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import { usePopup } from '../PopupContext';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${fadeIn} 0.3s ease-out;
  z-index: 1000;
`;

const Container = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  animation: ${slideIn} 0.3s ease-out;
  position: relative;
  overflow: hidden;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #62238C;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputWrapper = styled.div`
  position: relative;
  height: 50px;
`;

const Input = styled.input`
  width: 100%;
  height: 100%;
  padding: 0 1rem 0 2.5rem;
  border: none;
  border-radius: 10px;
  background-color: #e0e0e0;
  box-shadow: inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    box-shadow: inset 2px 2px 5px #bebebe, inset -2px -2px 5px #ffffff;
  }

  &:focus + label,
  &:not(:placeholder-shown) + label {
    top: -25px;
    left: 10px;
    font-size: 0.8rem;
    color: #62238C;
  }
`;

const Label = styled.label`
  position: absolute;
  top: 50%;
  left: 2.5rem;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #777;
  pointer-events: none;
  transition: all 0.3s ease;
`;

const Icon = styled.span`
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: #62238C;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  background-color: #62238C;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 5px 5px 10px #bebebe, -5px -5px 10px #ffffff;

  &:hover {
    background-color: #7C2DB4;
    box-shadow: 2px 2px 5px #bebebe, -2px -2px 5px #ffffff;
  }

  &:active {
    box-shadow: inset 2px 2px 5px #4A1B6A, inset -2px -2px 5px #7C2DB4;
  }
`;

const GoogleButton = styled(Button)`
  background-color: #DB4437;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: #C33D2E;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const ErrorMessage = styled.div`
  color: #ff0033;
  margin-top: 0.5rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #00aa00;
  margin-top: 0.5rem;
  text-align: center;
`;

const CouponSection = styled.div`
  background-color: #f0e6f5;
  border: 2px dashed #62238C;
  border-radius: 10px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CouponTitle = styled.h3`
  color: #62238C;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #62238C;
  cursor: pointer;
`;

const RegisterPopup = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const containerRef = useRef(null);
  const { showRegisterPopup, closeAllPopups, openLoginPopup, isFromCourseDetails, navigateBack } = usePopup();

  const validateCoupon = () => {
    if (coupon.toUpperCase() === 'OPENING25') {
      setCouponApplied(true);
      setError('');
      return true;
    } else {
      setError('קוד קופון לא תקין');
      return false;
    }
  };

  const applyCoupon = async (userId) => {
    if (coupon && validateCoupon()) {
      const { data, error } = await supabase
        .from('users')
        .update({
          discount: 25,
          discount_expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error applying coupon:', error);
        setError('שגיאה בהחלת הקופון. אנא נסה שנית.');
        return false;
      }
      return true;
    }
    return false;
  };

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
        const couponApplied = await applyCoupon(data.user.id);
        
        Swal.fire({
          title: 'הרשמה הושלמה בהצלחה!',
          text: couponApplied ? 'הקופון הופעל בהצלחה! נשלח אליך מייל לאימות. אנא בדוק את תיבת הדואר שלך.' : 'נשלח אליך מייל לאימות. אנא בדוק את תיבת הדואר שלך.',
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
                
                {/* הוספת שדה הקופון */}
                <CouponSection>
                  <CouponTitle>יש לך קופון? הזן אותו כאן</CouponTitle>
                  <InputWrapper>
                    <Input
                      id="coupon"
                      type="text"
                      placeholder=" "
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                    <Label htmlFor="coupon">קוד קופון</Label>
                    <Icon><FaTicketAlt /></Icon>
                  </InputWrapper>
                </CouponSection>

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
