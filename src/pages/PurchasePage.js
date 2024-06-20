// src/pages/PurchasePage.js

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #ffffff;
    direction: rtl;
    margin: 0;
    padding: 0;
  }
`;

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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #F25C78;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
`;

const PriceTag = styled.h2`
  font-size: 1.5rem;
  color: #000;
  margin-bottom: 2rem;
`;

const PurchaseButton = styled.button`
  background: #F25C78;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;

  &:hover {
    background-color: #BF4B81;
  }

  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }
`;

const PurchasePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleRegularPurchase = async () => {
    setIsProcessing(true);
    try {
      // בקשת טופס תשלום מ-Green Invoice
      const paymentFormResponse = await axios.post('/api/green-invoice', {
        description: `תשלום עבור קורס ${course.title}`,
        type: 320, // סוג עסקה
        lang: 'he',
        currency: 'ILS',
        vatType: 0,
        amount: course.price,
        maxPayments: 1,
        pluginId: 7944827a-c664-11e4-8231-080027271115, // שים כאן את ה-Plugin ID שקיבלת מ-Green Invoice
        client: {
          id: user.id,
          name: user.name || user.email,
          emails: [user.email],
          add: true
        },
        income: [
          {
            catalogNum: 'COURSE001',
            description: course.title,
            quantity: 1,
            price: course.price,
            currency: 'ILS',
            vatType: 0
          }
        ],
        remarks: `רכישת קורס ${course.title}`,
        successUrl: window.location.origin + '/payment-success',
        failureUrl: window.location.origin + '/payment-failure',
        notifyUrl: window.location.origin + '/payment-notification',
        custom: 'Additional data or internal order ID'
      });

      if (paymentFormResponse.data && paymentFormResponse.data.url) {
        // הפניה לדף התשלום
        window.location.href = paymentFormResponse.data.url;
      } else {
        throw new Error('שגיאה בהפניה לסליקה.');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      alert('התרחשה שגיאה במהלך הרכישה.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const fetchCourseAndUser = async () => {
      setLoading(true);
      try {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        setCourse(courseData);
        setUser(user);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndUser();
  }, [courseId]);

  if (loading) {
    return <div>טוען...</div>;
  }

  if (!course) {
    return <div>לא נמצאו פרטים עבור הקורס המבוקש.</div>;
  }

  return (
    <PageContainer>
      <GlobalStyle />
      <PageTitle>{course.title}</PageTitle>
      <PriceTag>עלות: {course.price} ש"ח</PriceTag>
      <PurchaseButton onClick={handleRegularPurchase} disabled={isProcessing}>
        רכוש קורס
      </PurchaseButton>
    </PageContainer>
  );
};

export default PurchasePage;
