// src/pages/PaymentPage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        // בקשת JWT Token
        const tokenResponse = await axios.post('https://api.greeninvoice.co.il/api/v1/account/token', {
          id: process.env.REACT_APP_GREEN_INVOICE_API_KEY,
          secret: process.env.REACT_APP_GREEN_INVOICE_API_SECRET,
        });

        const jwtToken = tokenResponse.data.token;

        // בקשת תשלום
        const response = await axios.post('https://api.greeninvoice.co.il/api/v1/transactions', {
          type: 320, // סוג עסקה
          sum: 100, // סכום העסקה (שזה צריך להיות הדינמי לפי מחיר הקורס שלך)
          description: `תשלום עבור קורס ${courseId}`
        }, {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        });

        // מעבר לכתובת התשלום
        window.location.href = response.data.url;
      } catch (error) {
        console.error('Error during payment initiation:', error);
        alert('התרחשה שגיאה במהלך התשלום.');
      } finally {
        setLoading(false);
      }
    };

    initiatePayment();
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
