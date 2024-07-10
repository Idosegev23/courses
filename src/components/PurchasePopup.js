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

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
`;

const ErrorText = styled.p`
  color: red;
  font-size: 0.8rem;
  margin-top: -10px;
  margin-bottom: 10px;
`;

const PurchasePopup = ({ userId, course, onPurchaseSuccess, onClose, isOpen }) => {
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
    if (userId) {
      const fetchUserData = async () => {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
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
  }, [userId]);

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
    console.log('Starting regular purchase process');
    try {
      console.log('Requesting token from Green Invoice');
      const tokenResponse = await fetch('/api/green-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          endpoint: 'account/token',
          data: {
            id: process.env.REACT_APP_API_KEY_GREEN_INVOICE_TEST,
            secret: process.env.REACT_APP_API_SECRET_GREEN_INVOICE_TEST
          }
        })
      });

      const tokenResponseData = await tokenResponse.json();
      console.log('Token response status:', tokenResponse.status);
      console.log('Token response data:', tokenResponseData);

      if (!tokenResponse.ok) {
        throw new Error(`HTTP error! status: ${tokenResponse.status}`);
      }

      const token = tokenResponseData.token;
      console.log('Token received:', token);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }

      console.log('User data fetched for invoice:', userData);

      const finalPrice = course.discountPrice || course.price;

      const invoiceData = {
        description: `רכישת קורס ${course.title}`,
        type: 400,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        lang: "he",
        pluginId:"74fd5825-12c4-4e20-9942-cc0f2b6dfe85",
        currency: "ILS",
        vatType: 0,
        amount: finalPrice,
        group: 100,
        client: {
          name: `${firstName} ${lastName}`,
          emails: [email],
          taxId: idNum,
          address: streetAddress,
          city: city,
          country: "IL",
          phone: phone,
          add: true
        },
        successUrl: `${process.env.REACT_APP_API_URL}/purchase-result?success=true&courseId=${course.id}`,
        failureUrl: `${process.env.REACT_APP_API_URL}/purchase-result?success=false&courseId=${course.id}`,
        notifyUrl: `${process.env.REACT_APP_API_URL}/api/notify`,
        custom: "300700556"
      };

      console.log('Invoice Data:', invoiceData);

      console.log('Requesting payment form from Green Invoice');
      const paymentFormResponse = await fetch('/api/green-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          endpoint: 'payments/form',
          data: invoiceData,
          tokenRequest: token
        })
      });

      const paymentFormResponseData = await paymentFormResponse.json();
      console.log('Payment form response status:', paymentFormResponse.status);
      console.log('Payment form response data:', paymentFormResponseData);

      if (!paymentFormResponse.ok) {
        throw new Error(`HTTP error! status: ${paymentFormResponse.status}`);
      }

      const paymentFormUrl = paymentFormResponseData.url;

      console.log('Creating enrollment record');
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: course.id,
          current_lesson: 1,
          amount_paid: finalPrice,
          course_title: course.title,
          total_lessons: course.lessons?.length || 0
        });

      if (enrollmentError) {
        console.error('Error creating enrollment:', enrollmentError);
        throw enrollmentError;
      }

      console.log('Redirecting to payment form URL:', paymentFormUrl);
      window.location.href = paymentFormUrl;
    } catch (error) {
      console.error('Error during purchase:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setError('אירעה שגיאה במהלך הרכישה. אנא נסה שוב.');
    }
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
        <BrandLogo />
        <BrandTitle>רכישה</BrandTitle>
        <Inputs>
          {step === 1 && (
            <>
              <Label>שם פרטי</Label>
              <Input 
                type="text" 
                name="firstName"
                placeholder="לדוגמה: יוסי" 
                value={firstName} 
                onChange={handleInputChange} 
              />
              {errors.firstName && <ErrorText>{errors.firstName}</ErrorText>}
              
              <Label>שם משפחה</Label>
              <Input 
                type="text"
                name="lastName" 
                placeholder="לדוגמה: כהן" 
                value={lastName} 
                onChange={handleInputChange} 
              />
              {errors.lastName && <ErrorText>{errors.lastName}</ErrorText>}
              
              <Label>אימייל</Label>
              <Input 
                type="email"
                name="email" 
                placeholder="example@test.com" 
                value={email} 
                onChange={handleInputChange} 
              />
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
              
              <Button onClick={handleNextStep}>הבא</Button>
            </>
          )}
          {step === 2 && (
            <>
              <Label>מספר טלפון</Label>
              <Input 
                type="tel"
                name="phone" 
                placeholder="לדוגמה: 0501234567" 
                value={phone} 
                onChange={handleInputChange} 
              />
              {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
              
              <Label>תעודת זהות</Label>
              <Input 
                type="text"
                name="idNum" 
                placeholder="לדוגמה: 123456789" 
                value={idNum} 
                onChange={handleInputChange} 
              />
              {errors.idNum && <ErrorText>{errors.idNum}</ErrorText>}
              
              <Button onClick={handlePreviousStep}>הקודם</Button>
              <Button onClick={handleNextStep}>הבא</Button>
            </>
          )}
          {step === 3 && (
            <>
              <Label>כתובת רחוב</Label>
              <Input 
                type="text"
                name="streetAddress" 
                placeholder="לדוגמה: הרצל 1" 
                value={streetAddress} 
                onChange={handleInputChange} 
              />
              {errors.streetAddress && <ErrorText>{errors.streetAddress}</ErrorText>}
              
              <Label>עיר</Label>
              <Input 
                type="text"
                name="city" 
                placeholder="לדוגמה: תל אביב" 
                value={city} 
                onChange={handleInputChange} 
              />
              {errors.city && <ErrorText>{errors.city}</ErrorText>}
              
              <Label style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={isCompany} 
                  onChange={(e) => setIsCompany(e.target.checked)} 
                  style={{ marginRight: '8px' }} 
                />
                חברה או עוסק מורשה
              </Label>
              {isCompany && (
                <>
                  <Label>מספר חברה/עוסק מורשה</Label>
                  <Input 
                    type="text"
                    name="companyId" 
                    placeholder="לדוגמה: 123456789" 
                    value={companyId} 
                    onChange={handleInputChange} 
                  />
                  {errors.companyId && <ErrorText>{errors.companyId}</ErrorText>}
                </>
              )}
              <Button onClick={handlePreviousStep}>הקודם</Button>
              <Button onClick={handlePurchase}>רכוש עכשיו</Button>
            </>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Inputs>
      </Container>
    </Overlay>
  );
};

export default PurchasePopup;