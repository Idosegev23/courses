import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaEnvelope, FaIdCard, FaPhone, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
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
  ErrorMessage,
  ButtonContainer,
  PopupContent,
  TopLeftCircle,
  BottomRightCircle
} from './PopupStyles';

const ErrorText = ({ children }) => (
  <ErrorMessage>{children}</ErrorMessage>
);

const PurchasePopup = ({ course, onPurchaseSuccess, onClose, isOpen }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNum, setIdNum] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [error, setError] = useState('');
  const containerRef = useRef(null);

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNum: '',
    streetAddress: '',
    city: '',
    companyId: '',
  });

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching user data:', fetchError);
          setError('שגיאה בטעינת נתוני המשתמש');
        } else if (data) {
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setEmail(data.email || '');
          setPhone(data.phone_num || '');
          setIdNum(data.id_num || '');
          setStreetAddress(data.street_address || '');
          setCity(data.city || '');
          setIsCompany(data.is_company || false);
          setCompanyId(data.company_id || '');
        }
      };

      fetchUserData();
    }
  }, [user]);

  // Validation functions remain the same
// Validation functions
const isValidName = (name) => {
  const nameRegex = /^[\u0590-\u05FFa-zA-Z\s]{2,}$/;
  return nameRegex.test(name);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^05\d{8}$/;
  return phoneRegex.test(phone);
};

const isValidIdNumber = (id) => {
  if (id.length !== 9) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = parseInt(id[i]);
    if (i % 2 === 0) digit *= 1;
    else digit *= 2;
    if (digit > 9) digit -= 9;
    sum += digit;
  }
  return sum % 10 === 0;
};

const isValidAddress = (address) => {
  return address.trim().split(' ').length >= 2;
};

const isValidCity = (city) => {
  const cityRegex = /^[\u0590-\u05FFa-zA-Z\s]{2,}$/;
  return cityRegex.test(city);
};

const isValidCompanyId = (id) => {
  const companyIdRegex = /^\d{9}$/;
  return companyIdRegex.test(id);
};

const ErrorText = ({ children }) => (
  <ErrorMessage>{children}</ErrorMessage>
);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let error = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!isValidName(value)) error = 'שם לא תקין';
        break;
      case 'email':
        if (!isValidEmail(value)) error = 'אימייל לא תקין';
        break;
      case 'phone':
        if (!isValidPhone(value)) error = 'מספר טלפון לא תקין';
        break;
      case 'idNum':
        if (!isValidIdNumber(value)) error = 'מספר זהות לא תקין';
        break;
      case 'streetAddress':
        if (!isValidAddress(value)) error = 'כתובת לא תקינה';
        break;
      case 'city':
        if (!isValidCity(value)) error = 'שם עיר לא תקין';
        break;
      case 'companyId':
        if (isCompany && !isValidCompanyId(value)) error = 'מספר חברה/עוסק מורשה לא תקין';
        break;
      default:
        break;
    }

    setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    
    switch (name) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'idNum':
        setIdNum(value);
        break;
      case 'streetAddress':
        setStreetAddress(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'companyId':
        setCompanyId(value);
        break;
      default:
        break;
    }
  };

  const handleNextStep = () => {
    let hasErrors = false;
    
    if (step === 1) {
      if (!isValidName(firstName)) {
        setErrors(prev => ({ ...prev, firstName: 'שם פרטי לא תקין' }));
        hasErrors = true;
      }
      if (!isValidName(lastName)) {
        setErrors(prev => ({ ...prev, lastName: 'שם משפחה לא תקין' }));
        hasErrors = true;
      }
      if (!isValidEmail(email)) {
        setErrors(prev => ({ ...prev, email: 'כתובת אימייל לא תקינה' }));
        hasErrors = true;
      }
    } else if (step === 2) {
      if (!isValidPhone(phone)) {
        setErrors(prev => ({ ...prev, phone: 'מספר טלפון לא תקין' }));
        hasErrors = true;
      }
      if (!isValidIdNumber(idNum)) {
        setErrors(prev => ({ ...prev, idNum: 'מספר תעודת זהות לא תקין' }));
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return;
    }

    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handlePurchase = async () => {
    // Purchase logic remains the same
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay>
      <Container ref={containerRef}>
        <TopLeftCircle color="#62238C" />
        <BottomRightCircle color="#9D4EDD" />
        <PopupContent>
          <CloseButton onClick={onClose}>✕</CloseButton>
          <BrandTitle>השלמת רכישה</BrandTitle>
          <Inputs>
            {step === 1 && (
              <>
                <InputWrapper delay="0.1s">
                  <Label htmlFor="firstName">שם פרטי</Label>
                  <Input 
                    id="firstName"
                    type="text" 
                    name="firstName"
                    placeholder="לדוגמה: יוסי" 
                    value={firstName} 
                    onChange={handleInputChange} 
                  />
                  <Icon><FaUser /></Icon>
                </InputWrapper>
                {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
                
                <InputWrapper delay="0.2s">
                  <Label htmlFor="lastName">שם משפחה</Label>
                  <Input 
                    id="lastName"
                    type="text"
                    name="lastName" 
                    placeholder="לדוגמה: כהן" 
                    value={lastName} 
                    onChange={handleInputChange} 
                  />
                  <Icon><FaUser /></Icon>
                </InputWrapper>
                {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
                
                <InputWrapper delay="0.3s">
                  <Label htmlFor="email">אימייל</Label>
                  <Input 
                    id="email"
                    type="email"
                    name="email" 
                    placeholder="example@test.com" 
                    value={email} 
                    onChange={handleInputChange} 
                  />
                  <Icon><FaEnvelope /></Icon>
                </InputWrapper>
                {errors.email && <ErrorText>{errors.email}</ErrorText>}
                
                <ButtonContainer>
                  <Button onClick={handleNextStep}>הבא</Button>
                </ButtonContainer>
              </>
            )}
            {step === 2 && (
              <>
                <InputWrapper delay="0.1s">
                  <Label htmlFor="phone">מספר טלפון</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    name="phone" 
                    placeholder="לדוגמה: 0501234567" 
                    value={phone} 
                    onChange={handleInputChange} 
                  />
                  <Icon><FaPhone /></Icon>
                </InputWrapper>
                {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
                
                <InputWrapper delay="0.2s">
                  <Label htmlFor="idNum">תעודת זהות</Label>
                  <Input 
                    id="idNum"
                    type="text"
                    name="idNum" 
                    placeholder="לדוגמה: 123456789" 
                    value={idNum} 
                    onChange={handleInputChange} 
                  />
                  <Icon><FaIdCard /></Icon>
                </InputWrapper>
                {errors.idNum && <ErrorText>{errors.idNum}</ErrorText>}
                
                <ButtonContainer>
                  <Button onClick={handleNextStep}>הבא</Button>
                  <Button onClick={handlePreviousStep}>הקודם</Button>
                </ButtonContainer>
              </>
            )}
            {step === 3 && (
              <>
                <InputWrapper delay="0.1s">
                  <Label htmlFor="streetAddress">כתובת רחוב</Label>
                  <Input 
                    id="streetAddress"
                    type="text"
                    name="streetAddress" 
                    placeholder="לדוגמה: הרצל 1" 
                    value={streetAddress} 
                    onChange={handleInputChange} 
                  />
                  <Icon><FaMapMarkerAlt /></Icon>
                </InputWrapper>
                {errors.streetAddress && <ErrorText>{errors.streetAddress}</ErrorText>}
                
                <InputWrapper delay="0.2s">
                  <Label htmlFor="city">עיר</Label>
                  <Input 
                    id="city"
                    type="text"
                    name="city" 
                    placeholder="לדוגמה: תל אביב" 
                    value={city} 
                    onChange={handleInputChange} 
                  />
                  <Icon><FaMapMarkerAlt /></Icon>
                </InputWrapper>
                {errors.city && <ErrorText>{errors.city}</ErrorText>}
                
                <Label style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={isCompany} 
                    onChange={(e) => setIsCompany(e.target.checked)} 
                    style={{ marginLeft: '8px' }} 
                  />
                  חברה או עוסק מורשה
                </Label>
                {isCompany && (
                  <InputWrapper delay="0.3s">
                    <Label htmlFor="companyId">מספר חברה/עוסק מורשה</Label>
                    <Input 
                      id="companyId"
                      type="text"
                      name="companyId" 
                      placeholder="לדוגמה: 123456789" 
                      value={companyId} 
                      onChange={handleInputChange} 
                    />
                    <Icon><FaBuilding /></Icon>
                  </InputWrapper>
                )}
                {errors.companyId && <ErrorText>{errors.companyId}</ErrorText>}
                <ButtonContainer>
                  <Button onClick={handlePurchase}>רכוש עכשיו</Button>
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

export default PurchasePopup;