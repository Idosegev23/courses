import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import Swal from 'sweetalert2';

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

const Message = styled.p`
  margin-top: 1rem;
  color: #333;
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
      const { data: newUser, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Error creating user in Supabase Auth:', authError);
        setMessage(`שגיאה בהרשמה: ${authError.message}`);
        return;
      }

      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: newUser.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          phone_num: phone,
          created_at: new Date(),
        });

      if (dbError) {
        console.error('Error saving user to database:', dbError);
        setMessage(`שגיאה בהוספת המשתמש לבסיס הנתונים: ${dbError.message}`);
        return;
      }

      setMessage('נשלח אליך מייל לאימות. אנא בדוק את תיבת הדואר הנכנס שלך.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage('אירעה שגיאה בלתי צפויה.');
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider });

      if (error) {
        console.error(`Error signing in with ${provider}:`, error);
        setMessage(`שגיאה בהרשמה עם ${provider}: ${error.message}`);
        return;
      }

      if (data?.user) {
        Swal.fire({
          title: 'השלמת פרטים',
          html: `
            <input type="text" id="firstName" class="swal2-input" placeholder="שם פרטי">
            <input type="text" id="lastName" class="swal2-input" placeholder="שם משפחה">
            <input type="text" id="phone" class="swal2-input" placeholder="נייד">
          `,
          confirmButtonText: 'שמור',
          focusConfirm: false,
          preConfirm: () => {
            const firstName = Swal.getPopup().querySelector('#firstName').value;
            const lastName = Swal.getPopup().querySelector('#lastName').value;
            const phone = Swal.getPopup().querySelector('#phone').value;
            return { firstName, lastName, phone };
          },
        }).then(async (result) => {
          const { firstName, lastName, phone } = result.value;

          const { error: updateUserError } = await supabase
            .from('users')
            .update({
              first_name: firstName,
              last_name: lastName,
              phone_num: phone,
            })
            .eq('id', data.user.id);

          if (updateUserError) {
            console.error('Error updating user details:', updateUserError);
            setMessage(`שגיאה בעדכון פרטי המשתמש: ${updateUserError.message}`);
          } else {
            setMessage('הרשמה הושלמה בהצלחה.');
            setTimeout(() => {
              navigate('/personal-area');
            }, 3000);
          }
        });
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
                />
                <Input
                  type="password"
                  placeholder="וידוא סיסמה"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <ActionButton type="button" onClick={handleBack}>חזור</ActionButton>
                <ActionButton type="button" onClick={handleNext}>הבא</ActionButton>
              </>
            )}
            {step === 3 && (
              <>
                <Input
                  type="text"
                  placeholder="נייד"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <ActionButton type="button" onClick={handleBack}>חזור</ActionButton>
                <ActionButton type="button" onClick={handleRegister}>הרשמה</ActionButton>
              </>
            )}
            {message && <Message>{message}</Message>}
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

                 
