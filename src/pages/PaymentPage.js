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
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('price')
          .eq('id', courseId)
          .single();
        
        if (courseError) throw courseError;

        setCoursePrice(course.price);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;

        const { data: userDiscount, error: discountError } = await supabase
          .from('users')
          .select('discount')
          .eq('id', user.id)
          .single();
        
        if (discountError) throw discountError;

        const discount = userDiscount.discount || 0;
        const calculatedPrice = course.price - (course.price * (discount / 100));
        setFinalPrice(calculatedPrice);

        const tokenResponse = await axios.post('/api/green-invoice/account/token', {
          id: process.env.REACT_APP_GREEN_INVOICE_API_KEY,
          secret: process.env.REACT_APP_GREEN_INVOICE_API_SECRET,
        });

        const jwtToken = tokenResponse.data.token;

        const paymentResponse = await axios.post('/api/green-invoice/transactions', {
          type: 320,
          sum: calculatedPrice,
          description: `תשלום עבור קורס ${courseId}`
        }, {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        });

        window.location.href = paymentResponse.data.url;
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
