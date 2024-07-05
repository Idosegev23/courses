import React, { useState } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { FaGoogle } from 'react-icons/fa';

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

const PopupOverlay = styled.div`
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
`;

const PopupContent = styled.div`
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  animation: ${slideIn} 0.3s ease-out;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #62238C;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const FormContainer = styled.form`
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
  padding: 0 1rem;
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
  left: 1rem;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #777;
  pointer-events: none;
  transition: all 0.3s ease;
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
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

const ProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const ProgressStep = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#62238C' : '#e0e0e0'};
  color: ${props => props.active ? 'white' : '#777'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? 'inset 2px 2px 5px #4A1B6A, inset -2px -2px 5px #7C2DB4' : '3px 3px 6px #bebebe, -3px -3px 6px #ffffff'};
`;

const RegisterPopup = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    idNum: '',
    streetAddress: '',
    city: '',
    isCompany: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика отправки данных на сервер
    console.log('Form submitted:', formData);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <InputWrapper>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <Label>שם פרטי</Label>
            </InputWrapper>
            <InputWrapper>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <Label>שם משפחה</Label>
            </InputWrapper>
          </>
        );
      case 2:
        return (
          <>
            <InputWrapper>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <Label>אימייל</Label>
            </InputWrapper>
            <InputWrapper>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <Label>סיסמה</Label>
            </InputWrapper>
            <InputWrapper>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <Label>אימות סיסמה</Label>
            </InputWrapper>
          </>
        );
      case 3:
        return (
          <>
            <InputWrapper>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <Label>טלפון</Label>
            </InputWrapper>
            <InputWrapper>
              <Input
                type="text"
                name="idNum"
                value={formData.idNum}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <Label>מספר זהות</Label>
            </InputWrapper>
            <InputWrapper>
              <Input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <Label>כתובת</Label>
            </InputWrapper>
            <InputWrapper>
              <Input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder=" "
                required
              />
              <Label>עיר</Label>
            </InputWrapper>
            <label>
              <input
                type="checkbox"
                name="isCompany"
                checked={formData.isCompany}
                onChange={handleInputChange}
              />
              חברה או עוסק מורשה
            </label>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <PopupOverlay>
      <PopupContent>
        <GlobalStyle />
        <Title>הרשמה</Title>
        <ProgressBar>
          <ProgressStep active={step >= 1}>1</ProgressStep>
          <ProgressStep active={step >= 2}>2</ProgressStep>
          <ProgressStep active={step >= 3}>3</ProgressStep>
        </ProgressBar>
        <FormContainer onSubmit={handleSubmit}>
          {renderStep()}
          <ButtonContainer>
            {step > 1 && <Button type="button" onClick={handleBack}>חזור</Button>}
            {step < 3 ? (
              <Button type="button" onClick={handleNext}>הבא</Button>
            ) : (
              <Button type="submit">הרשמה</Button>
            )}
          </ButtonContainer>
        </FormContainer>
        {step === 1 && (
          <GoogleButton type="button" onClick={() => console.log('Google Sign In')}>
            <FaGoogle /> הרשמה עם גוגל
          </GoogleButton>
        )}
      </PopupContent>
    </PopupOverlay>
  );
};

export default RegisterPopup;