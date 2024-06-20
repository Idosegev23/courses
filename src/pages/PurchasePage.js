import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled from 'styled-components';
import axios from 'axios';

const PageContainer = styled.div`
  padding: 2rem;
  background: #ffffff;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
  background: white;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #F25C78;
  margin-bottom: 2rem;
  text-align: center;
`;

const PaymentPage = () => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [coursePrice, setCoursePrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    const fetchCourseAndUserDiscount = async () => {
      try {
        // קבלת פרטי הקורס
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('price')
          .eq('id', courseId)
          .single();
        
        if (courseError) throw courseError;

        setCoursePrice(course.price);

        // קבלת פרטי המשתמש ואחוז ההנחה
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;

        const { data: userDiscount, error: discountError } = await supabase
          .from('users')
          .select('discount')
          .eq('id', user.id)
          .single();
        
        if (discountError) throw discountError;

        // חישוב המחיר הסופי לאחר ההנחה
        const discount = userDiscount.discount || 0; // הנחה באחוזים (0 אם לא קיימת)
        const calculatedPrice = course.price - (course.price * (discount / 100));
        setFinalPrice(calculatedPrice);

        // בקשת JWT Token ל-Green Invoice באמצעות הפונקציה ב-Vercel
        const tokenResponse = await axios.post('/api/green-invoice', {
          endpoint: '/account/token',
          data: {
            id: process.env.REACT_APP_GREEN_INVOICE_API_KEY,
            secret: process.env.REACT_APP_GREEN_INVOICE_API_SECRET,
          }
        });

        const jwtToken = tokenResponse.data.token;

        // בקשת תשלום ל-Green Invoice באמצעות הפונקציה ב-Vercel
        const paymentResponse = await axios.post('/api/green-invoice', {
          endpoint: '/transactions',
          data: {
            type: 320, // סוג עסקה
            sum: calculatedPrice, // סכום העסקה לאחר הנחה
            description: `תשלום עבור קורס ${courseId}`
          },
          token: jwtToken
        });

        // בדיקה אם יש כתובת תשלום תקפה
        if (paymentResponse.data.url) {
          // מעבר לכתובת התשלום
          window.location.href = paymentResponse.data.url;
        } else {
          throw new Error('התרחשה שגיאה בקבלת כתובת התשלום.');
        }
      } catch (error) {
        console.error('Error during payment initiation:', error);
        alert('התרחשה שגיאה במהלך התשלום.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndUserDiscount();
  }, [courseId]);

  return (
    <PageContainer>
      <PageTitle>מעבר לדף התשלום...</PageTitle>
      {loading ? (
        <p>אנא המתן בזמן שאנו מעבירים אותך לדף התשלום.</p>
      ) : (
        <p>ניסיון התחלה נכשל. נסה שוב מאוחר יותר.</p>
      )}
    </PageContainer>
  );
};

export default PaymentPage;
``
