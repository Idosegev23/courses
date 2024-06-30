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
      const response = await axios.post('https://cors-anywhere.herokuapp.com/https://sandbox.d.greeninvoice.co.il/api/v1/account/token', {
        id: 'd8281ab1-2ebc-44a9-a53f-e19a46b879dc',
        secret: 'f5gxE9n2H43sY4d-P-Ivhg'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data.token;
    } catch (error) {
      console.error('Error obtaining JWT token:', error);
      throw new Error('Failed to obtain JWT token');
    }
  };
  
  const createGreenInvoice = async (user, course, additionalData) => {
    const token = await getJwtToken();
    if (!token) {
      Swal.fire({
        title: 'שגיאה',
        text: 'אירעה שגיאה בהשגת אסימון אימות. אנא נסה שוב מאוחר יותר.',
        icon: 'error'
      });
      return false;
    }

    const invoiceData = {
      description: course.title,
      type: 400,
      date: new Date().toISOString().split('T')[0], // current date
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // 30 days from now
      lang: "he",
      currency: "ILS",
      vatType: 0,
      amount: course.price,
      maxPayments: 1,
      group: 100,
      pluginId: "74fd5825-12c4-4e20-9942-cc0f2b6dfe85",
      client: {
        name: additionalData.username,
        emails: [additionalData.email],
        taxId: additionalData.taxId || "000000000",
        address: additionalData.address || "Unknown address",
        city: additionalData.city || "Unknown city",
        zip: additionalData.zip || "0000000",
        country: "IL",
        phone: additionalData.phone,
        mobile: additionalData.phone,
        add: true
      },
      successUrl: "https://www.your-site-here.com",
      failureUrl: "https://www.your-site-here.com",
      notifyUrl: "https://www.your-site-here.com",
      custom: "12345"
    };

    try {
      const response = await axios.post('https://cors-anywhere.herokuapp.com/https://sandbox.d.greeninvoice.co.il/api/v1/payments/form', invoiceData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200 && response.data.errorCode === 0) {
        console.log('Payment form created successfully:', response.data);
        window.open(response.data.url, '_blank');
        return true;
      } else {
        console.error('Failed to create payment form:', response.data);
        Swal.fire({
          title: 'שגיאה',
          text: 'אירעה שגיאה ביצירת טופס התשלום. אנא נסה שוב מאוחר יותר.',
          icon: 'error'
        });
        return false;
      }
    } catch (error) {
      console.error('Error creating payment form:', error);
      Swal.fire({
        title: 'שגיאה',
        text: 'אירעה שגיאה ביצירת טופס התשלום. אנא נסה שוב מאוחר יותר.',
        icon: 'error'
      });
      return false;
    }
  };

  const handlePurchase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // User is not logged in, show sign-up and payment form
        const { value: formValues } = await Swal.fire({
          title: 'הרשמה',
          html:
            '<input id="swal-input1" class="swal2-input" placeholder="שם משתמש">' +
            '<input id="swal-input2" class="swal2-input" type="email" placeholder="אימייל">' +
            '<input id="swal-input3" class="swal2-input" type="password" placeholder="סיסמה">' +
            '<input id="swal-input4" class="swal2-input" placeholder="כתובת">' +
            '<input id="swal-input5" class="swal2-input" placeholder="עיר">' +
            '<input id="swal-input6" class="swal2-input" placeholder="מיקוד">' +
            '<input id="swal-input7" class="swal2-input" placeholder="מספר טלפון">',
          focusConfirm: false,
          preConfirm: () => {
            return {
              username: document.getElementById('swal-input1').value,
              email: document.getElementById('swal-input2').value,
              password: document.getElementById('swal-input3').value,
              address: document.getElementById('swal-input4').value,
              city: document.getElementById('swal-input5').value,
              zip: document.getElementById('swal-input6').value,
              phone: document.getElementById('swal-input7').value,
            };
          }
        });

        if (formValues) {
          const { username, email, password, address, city, zip, phone } = formValues;

          console.log('Form values:', formValues);

          // Perform sign-up
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
              },
            },
          });

          if (signUpError) throw signUpError;

          const { data: { user: newUser } } = await supabase.auth.signInWithPassword({ email, password });

          // Create Green Invoice
          const invoiceCreated = await createGreenInvoice(newUser, course, { username, email, address, city, zip, phone });
          if (!invoiceCreated) throw new Error('Failed to create invoice');

          // Perform purchase
          const { error: purchaseError } = await supabase
            .from('enrollments')
            .insert({
              user_id: newUser.id,
              course_id: courseId,
              current_lesson: 1,
              amount_paid: course.price,
              course_title: course.title,
            });

          if (purchaseError) throw purchaseError;

          Swal.fire('הרכישה הושלמה', 'הקורס נוסף בהצלחה לרשימת הקורסים שלך.', 'success');
          navigate('/personal-area');
        }
      } else {
        // User is logged in, create Green Invoice
        const additionalData = {
          username: user.user_metadata.username,
          email: user.email,
          address: user.user_metadata.address || '',
          city: user.user_metadata.city || '',
          zip: user.user_metadata.zip || '',
          phone: user.user_metadata.phone || ''
        };

        const invoiceCreated = await createGreenInvoice(user, course, additionalData);
        if (!invoiceCreated) throw new Error('Failed to create invoice');

        // Perform purchase
        const { error } = await supabase
          .from('enrollments')
          .insert({
            user_id: user.id,
            course_id: courseId,
            current_lesson: 1,
            amount_paid: course.price,
            course_title: course.title,
          });

        if (error) throw error;

        Swal.fire('הרכישה הושלמה', 'הקורס נוסף בהצלחה לרשימת הקורסים שלך.', 'success');
      }
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
