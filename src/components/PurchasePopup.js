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

const PurchasePopup = ({ userId, course, onPurchaseSuccess, onClose }) => {
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

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (data) {
          setFirstName(data.first_name);
          setLastName(data.last_name);
          setEmail(data.email);
          setPhone(data.phone_num);
          setIdNum(data.id_num);
          setStreetAddress(data.street_address);
          setCity(data.city);
          setIsCompany(data.is_company);
          setCompanyId(data.company_id);
        }
      };

      fetchUserData();
    }
  }, [userId]);

  const handleNextStep = () => {
    if (step === 1 && (!firstName || !lastName || !email)) {
      setError('כל השדות חייבים להיות מלאים');
      return;
    } else if (step === 2 && (!phone || !idNum)) {
      setError('כל השדות חייבים להיות מלאים');
      return;
    }
    setStep(step + 1);
    setError('');
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
            id: process.env.API_KEY_GREEN_INVOICE_TEST,
            secret: process.env.API_SECRET_GREEN_INVOICE_TEST
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
          name: `${userData.first_name} ${userData.last_name}`,
          emails: [userData.email],
          taxId: userData.id_num,
          address: userData.street_address,
          city: userData.city,
          country: "IL",
          phone: `0${userData.phone_num}`,
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
          total_lessons: course.lessons?.length || 0 // שימוש ב-Optional Chaining ובערך ברירת מחדל
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
      alert('An error occurred during the purchase. Please try again.');
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
        <BrandTitle>רכישה</BrandTitle>
        <Inputs>
          {step === 1 && (
            <>
              <Label>שם פרטי</Label>
              <Input 
                type="text" 
                placeholder="לדוגמה: יוסי" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
              />
              <Label>שם משפחה</Label>
              <Input 
                type="text" 
                placeholder="לדוגמה: כהן" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
              />
              <Label>אימייל</Label>
              <Input 
                type="email" 
                placeholder="example@test.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              <Button onClick={handleNextStep}>הבא</Button>
            </>
          )}
          {step === 2 && (
            <>
              <Label>מספר טלפון</Label>
              <Input 
                type="tel" 
                placeholder="לדוגמה: 0501234567" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
              <Label>תעודת זהות</Label>
              <Input 
                type="text" 
                placeholder="לדוגמה: 123456789" 
                value={idNum} 
                onChange={(e) => setIdNum(e.target.value)} 
              />
              <Button onClick={handlePreviousStep}>הקודם</Button>
              <Button onClick={handleNextStep}>הבא</Button>
            </>
          )}
          {step === 3 && (
            <>
              <Label>כתובת רחוב</Label>
              <Input 
                type="text" 
                placeholder="לדוגמה: הרצל 1" 
                value={streetAddress} 
                onChange={(e) => setStreetAddress(e.target.value)} 
              />
              <Label>עיר</Label>
              <Input 
                type="text" 
                placeholder="לדוגמה: תל אביב" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
              />
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
                    placeholder="לדוגמה: 123456789" 
                    value={companyId} 
                    onChange={(e) => setCompanyId(e.target.value)} 
                  />
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
