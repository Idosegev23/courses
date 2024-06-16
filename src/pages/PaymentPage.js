import React, { useEffect } from 'react';
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

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const response = await axios.post('https://api.greeninvoice.co.il/api/v1/transactions', {
          type: 320,
          sum: 100,
          description: `תשלום עבור קורס ${courseId}`
        }, {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_GREEN_INVOICE_API_KEY}`
          }
        });

        window.location.href = response.data.url;
      } catch (error) {
        console.error('Error during payment initiation:', error);
        alert('התרחשה שגיאה במהלך התשלום.');
      }
    };

    initiatePayment();
  }, [courseId]);

  return (
    <PageContainer>
      <PageTitle>מעבר לדף התשלום...</PageTitle>
      <p>אנא המתן בזמן שאנו מעבירים אותך לדף התשלום.</p>
    </PageContainer>
  );
};

export default PaymentPage;
