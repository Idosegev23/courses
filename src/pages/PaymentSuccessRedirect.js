// src/pages/PaymentSuccessRedirect.js

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #ffffff;
  text-align: center;
  padding: 2rem;
`;

const MessageTitle = styled.h1`
  font-size: 2rem;
  color: #F25C78;
`;

const MessageText = styled.p`
  font-size: 1rem;
  color: #333;
`;

const PaymentSuccessRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // כיוון מחדש לאזור האישי אחרי כמה שניות
    setTimeout(() => {
      navigate('/personal-area');
    }, 3000);
  }, [navigate]);

  return (
    <MessageContainer>
      <MessageTitle>התשלום הושלם בהצלחה!</MessageTitle>
      <MessageText>מעביר לאזור האישי שלך...</MessageText>
    </MessageContainer>
  );
};

export default PaymentSuccessRedirect;
