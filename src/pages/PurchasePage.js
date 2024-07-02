import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import Swal from 'sweetalert2';
import newLogo from '../components/NewLogo_BLANK-outer.png';

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
  padding: 1rem;
  background: #ffffff;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 2rem;
    border-radius: 2rem;
  }

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
  font-size: 1.5rem;
  font-weight: bold;
  color: #62238C;
  margin-bottom: 1rem;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const CourseDescription = styled.p`
  font-size: 1rem;
  color: #333;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }
`;

const PriceContainer = styled.div`
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: #BF4B81;
  text-decoration: line-through;
  margin-right: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    margin-right: 1rem;
  }
`;

const DiscountedPrice = styled.h2`
  font-size: 1.25rem;
  color: #62238C;
  display: inline;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const DiscountPercentage = styled.span`
  font-size: 1rem;
  color: #333;
  margin-left: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    margin-left: 1rem;
  }
`;

const StyledButton = styled.button`
  display: inline-block;
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #fff;
  background-color: ${props => props.$isPurchase ? '#62238C' : '#BF4B81'};
  transition: background-color 0.3s, transform 0.3s;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  position: relative;
  z-index: 1;

  &:hover {
    background-color: ${props => props.$isPurchase ? '#BF4B81' : '#62238C'};
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 1rem;
  }
`;

const Message = styled.p`
  font-size: 1rem;
  color: #333;
  text-align: center;
  position: relative;
  z-index: 1;

  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`;
const PurchasePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const [discount, setDiscount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseAndUserDetails = async () => {
      setLoading(true);
      try {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;

        setCourse(courseData);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userError) throw userError;

          setUserDetails({ ...user, ...userData });

          let finalPrice = courseData.price;
          let discount = 0;

          if (courseData.discountPrice) {
            finalPrice = courseData.discountPrice;
            discount = Math.round(((courseData.price - courseData.discountPrice) / courseData.price) * 100);
          } else if (userData.discount) {
            discount = userData.discount;
            finalPrice = courseData.price * (1 - discount / 100);
          }

          setFinalPrice(finalPrice);
          setDiscount(discount);
        } else {
          setFinalPrice(courseData.price);
          setDiscount(0);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire('שגיאה', 'אירעה שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndUserDetails();
  }, [courseId]);

  const getJwtToken = async () => {
    console.log('Starting getJwtToken function');
    const data = {
      id: 'd8281ab1-2ebc-44a9-a53f-e19a46b879dc',
      secret: 'f5gxE9n2H43sY4d-P-Ivhg'
    };
  
    try {
      const response = await fetch('/api/green-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ endpoint: 'account/token', data })
      });
  
      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return responseData.token;
    } catch (error) {
      console.error('Error in getJwtToken:', error);
      throw error;
    }
  };
  
  const createGreenInvoice = async (invoiceData) => {
    const token = await getJwtToken();
    console.log('Fetched Token:', token);
    if (!token) {
      Swal.fire({
        title: 'שגיאה',
        text: 'אירעה שגיאה בהשגת אסימון אימות. אנא נסה שוב מאוחר יותר.',
        icon: 'error'
      });
      return false;
    }
  
    console.log('Invoice Data:', invoiceData);
  
    try {
      console.log('Sending request to create invoice with token:', token);
      const response = await fetch('/api/green-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: 'payments/form', data: invoiceData, tokenRequest: token })
      });
  
      const responseData = await response.json();
      console.log('Invoice request sent with data:', invoiceData);
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);
  
      if (response.status === 200 && responseData.errorCode === 0) {
        console.log('Payment form created successfully:', responseData);
        window.location.href = responseData.url;
        return true;
      } else {
        console.error('Failed to create payment form:', responseData);
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

      let formValues;
      
      if (user && userDetails) {
        formValues = {
          firstName: userDetails.first_name || '',
          lastName: userDetails.last_name || '',
          phone: userDetails.phone_num || '',
          address: userDetails.street_address || '',
          city: userDetails.city || '',
          zip: userDetails.zip || '',
          idNum: userDetails.id_num || '',
        };
      }

      if (!formValues || Object.values(formValues).some(val => !val)) {
        const result = await Swal.fire({
          title: 'פרטים לקבלה',
          html:
            `<input id="swal-input1" class="swal2-input" placeholder="שם פרטי" value="${formValues?.firstName || ''}">` +
            `<input id="swal-input2" class="swal2-input" placeholder="שם משפחה" value="${formValues?.lastName || ''}">` +
            `<input id="swal-input3" class="swal2-input" placeholder="מספר טלפון" value="${formValues?.phone || ''}">` +
            `<input id="swal-input4" class="swal2-input" placeholder="כתובת" value="${formValues?.address || ''}">` +
            `<input id="swal-input5" class="swal2-input" placeholder="עיר" value="${formValues?.city || ''}">` +
            `<input id="swal-input6" class="swal2-input" placeholder="מיקוד" value="${formValues?.zip || ''}">` +
            `<input id="swal-input7" class="swal2-input" placeholder="תעודת זהות" value="${formValues?.idNum || ''}">`,
          focusConfirm: false,
          preConfirm: () => {
            return {
              firstName: document.getElementById('swal-input1').value,
              lastName: document.getElementById('swal-input2').value,
              phone: document.getElementById('swal-input3').value,
              address: document.getElementById('swal-input4').value,
              city: document.getElementById('swal-input5').value,
              zip: document.getElementById('swal-input6').value,
              idNum: document.getElementById('swal-input7').value,
            };
          }
        });

        if (result.isConfirmed) {
          formValues = result.value;
        } else {
          return;
        }
      }

      const { firstName, lastName, phone, address, city, zip, idNum } = formValues;

      let userEmail = user ? user.email : null;
      let userId = user ? user.id : null;

      if (!user) {
        const { value: email } = await Swal.fire({
          title: 'הכנס כתובת אימייל',
          input: 'email',
          inputPlaceholder: 'אימייל'
        });

        if (email) {
          userEmail = email;
          userId = 'TEMP-' + Date.now();
        } else {
          throw new Error('Email is required');
        }
      }

      // Format phone number
      const formattedPhone = phone.startsWith('0') ? phone : `0${phone}`;

      // Prepare invoice data
      const invoiceData = {
        description: 'רכישת קורס',
        type: 400,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        lang: "he",
        currency: "ILS",
        vatType: 0,
        amount: finalPrice,
        group: 100,
        maxPayments: 1,
        pluginId: "74fd5825-12c4-4e20-9942-cc0f2b6dfe85",
        client: {
          name: `${firstName} ${lastName}`,
          emails: [userEmail],
          taxId: idNum,
          address: address || "1 Luria st",
          city: city || "Tel Aviv",
          zip: zip || "1234567",
          country: "IL",
          phone: formattedPhone,
          fax: formattedPhone,
          mobile: formattedPhone,
          add: true
        },
        successUrl: `https://courses-seven-alpha.vercel.app/personal-area?status=success`,
        failureUrl: `https://courses-seven-alpha.vercel.app/purchase/${course.id}?status=failure`,
        notifyUrl: "https://courses-seven-alpha.vercel.app/notify",
        custom: "300700556"
      };

      // Create Green Invoice
      const invoiceCreated = await createGreenInvoice(invoiceData);

      if (!invoiceCreated) throw new Error('Failed to create invoice');

      if (user) {
        // Update user information in Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone_num: formattedPhone,
            street_address: address,
            city: city,
            zip: zip,
            id_num: idNum
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Perform purchase
        const { error: purchaseError } = await supabase
          .from('enrollments')
          .insert({
            user_id: user.id,
            course_id: courseId,
            current_lesson: 1,
            amount_paid: finalPrice,
            course_title: course.title,
          });

        if (purchaseError) throw purchaseError;
      } else {
        console.log('User not logged in. Enrollment will be created after successful payment.');
      }

      Swal.fire('הרכישה בתהליך', 'אתה מועבר לדף התשלום.', 'info');
    } catch (error) {
      console.error('Error during purchase:', error);
      Swal.fire('שגיאה', 'אירעה שגיאה במהלך הרכישה. אנא נסה שוב מאוחר יותר.', 'error');
    }
  };

  if (loading) {
    return <Message>טוען...</Message>;
  }

  if (!course) {
    return <Message>לא נמצא קורס עם המזהה הזה.</Message>;
  }

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>{course.title}</PageTitle>
        <CourseDescription>{course.description}</CourseDescription>
        <PriceContainer>
          {discount > 0 && (
            <>
              <OriginalPrice>{course.price} ש"ח</OriginalPrice>
              <DiscountedPrice>{finalPrice.toFixed(2)} ש"ח</DiscountedPrice>
              <DiscountPercentage>({discount}% הנחה)</DiscountPercentage>
            </>
          )}
          {discount === 0 && (
            <DiscountedPrice>{course.price} ש"ח</DiscountedPrice>
          )}
        </PriceContainer>
        {course.is_available ? (
          <StyledButton onClick={handlePurchase} $isPurchase>רכוש קורס</StyledButton>
        ) : (
          <Message>הקורס עדיין לא זמין לרכישה.</Message>
        )}
      </PageContainer>
    </>
  );
};

export default PurchasePage;