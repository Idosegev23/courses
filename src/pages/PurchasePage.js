import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import Swal from 'sweetalert2';
import newLogo from '../components/NewLogo_BLANK-outer.png';
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(${newLogo}) no-repeat center;
    background-size: cover;
    opacity: 0.05;
    pointer-events: none;
    z-index: 0;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #62238C; /* Primary brand color */
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
`;

const CourseDescription = styled.p`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const PriceContainer = styled.div`
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const OriginalPrice = styled.span`
  font-size: 1.25rem;
  color: #BF4B81; /* Secondary brand color */
  text-decoration: line-through;
  margin-right: 1rem;
`;

const DiscountedPrice = styled.h2`
  font-size: 1.5rem;
  color: #62238C; /* Primary brand color */
  display: inline;
`;

const DiscountPercentage = styled.span`
  font-size: 1.25rem;
  color: #333;
  margin-left: 1rem;
`;

const StyledButton = styled.button`
  display: inline-block;
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  text-decoration: none;
  color: #fff;
  background-color: ${props => props.isPurchase ? '#62238C' : '#BF4B81'};
  transition: background-color 0.3s, transform 0.3s;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  z-index: 1;

  &:hover {
    background-color: ${props => props.isPurchase ? '#BF4B81' : '#62238C'};
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

const Message = styled.p`
  font-size: 1.25rem;
  color: #333;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const PurchasePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error) throw error;

        setCourse(data);
        console.log('Course fetched successfully:', data);
      } catch (error) {
        console.error('Error fetching course:', error);
        Swal.fire('שגיאה', 'אירעה שגיאה בטעינת פרטי הקורס. אנא נסה שוב מאוחר יותר.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const getJwtToken = async () => {
    try {
      const response = await axios.post('https://sandbox.d.greeninvoice.co.il/api/v1/account/token', {
        id: 'd8281ab1-2ebc-44a9-a53f-e19a46b879dc',
        secret: 'f5gxE9n2H43sY4d-P-Ivhg'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('JWT Token:', response.data.token);
      return response.data.token;
    } catch (error) {
      console.error('Error obtaining JWT token:', error);
      throw new Error('Failed to obtain JWT token');
    }
  };

  const handlePurchase = async () => {
    try {
      const token = await getJwtToken();
      console.log('JWT Token:', token);
      Swal.fire('Token', `JWT Token: ${token}`, 'success');
    } catch (error) {
      console.error('Error during purchase:', error);
      Swal.fire('שגיאה', 'אירעה שגיאה במהלך הרכישה. אנא נסה שוב מאוחר יותר.', 'error');
    }
  };

  const calculateDiscount = (originalPrice, newPrice) => {
    if (originalPrice && newPrice && originalPrice > newPrice) {
      const discount = ((originalPrice - newPrice) / originalPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  if (loading) {
    return <Message>טוען...</Message>;
  }

  if (!course) {
    return <Message>לא נמצא קורס עם המזהה הזה.</Message>;
  }

  const discountPercentage = calculateDiscount(course.original_price, course.price);

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>{course.title}</PageTitle>
        <CourseDescription>{course.description}</CourseDescription>
        <PriceContainer>
          {course.original_price && course.original_price > course.price && (
            <>
              <OriginalPrice>{course.original_price} ש"ח</OriginalPrice>
              <DiscountedPrice>{course.price} ש"ח</DiscountedPrice>
              <DiscountPercentage>({discountPercentage}% הנחה)</DiscountPercentage>
            </>
          )}
          {!course.original_price || course.original_price <= course.price ? (
            <DiscountedPrice>{course.price} ש"ח</DiscountedPrice>
          ) : null}
        </PriceContainer>
        {course.is_available ? (
          <StyledButton onClick={handlePurchase} isPurchase>רכוש קורס</StyledButton>
        ) : (
          <Message>הקורס עדיין לא זמין לרכישה.</Message>
        )}
      </PageContainer>
    </>
  );
};

export default PurchasePage;
