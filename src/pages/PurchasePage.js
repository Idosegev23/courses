import React, { useEffect, useState } from 'react';
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
  color: #F25C78;
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

const PriceTag = styled.h2`
  font-size: 1.5rem;
  color: #000;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
`;

const StyledButton = styled.button`
  display: inline-block;
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  text-decoration: none;
  color: #fff;
  background-color: ${props => props.isPurchase ? '#BF4B81' : '#F25C78'};
  transition: background-color 0.3s, transform 0.3s;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  z-index: 1;

  &:hover {
    background-color: ${props => props.isPurchase ? '#62238C' : '#BF4B81'};
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
      } catch (error) {
        console.error('Error fetching course:', error);
        Swal.fire('שגיאה', 'אירעה שגיאה בטעינת פרטי הקורס. אנא נסה שוב מאוחר יותר.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handlePurchase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // משתמש לא מחובר, הצגת טופס הרשמה ותשלום
        const { value: formValues } = await Swal.fire({
          title: 'הרשמה ותשלום',
          html:
            '<input id="swal-input1" class="swal2-input" placeholder="שם משתמש">' +
            '<input id="swal-input2" class="swal2-input" type="email" placeholder="אימייל">' +
            '<input id="swal-input3" class="swal2-input" type="password" placeholder="סיסמה">' +
            '<input id="swal-input4" class="swal2-input" placeholder="מספר כרטיס">' +
            '<input id="swal-input5" class="swal2-input" placeholder="תאריך תפוגה (MM/YY)">' +
            '<input id="swal-input6" class="swal2-input" placeholder="CVV">',
          focusConfirm: false,
          preConfirm: () => {
            return {
              username: document.getElementById('swal-input1').value,
              email: document.getElementById('swal-input2').value,
              password: document.getElementById('swal-input3').value,
              cardNumber: document.getElementById('swal-input4').value,
              expiryDate: document.getElementById('swal-input5').value,
              cvv: document.getElementById('swal-input6').value,
            };
          }
        });

        if (formValues) {
          const { username, email, password, cardNumber, expiryDate, cvv } = formValues;

          // ביצוע הרשמה
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

          // ביצוע רכישה
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
        // משתמש מחובר, הצגת טופס תשלום בלבד
        const { value: paymentDetails } = await Swal.fire({
          title: 'פרטי תשלום',
          html:
            '<input id="card-number" class="swal2-input" placeholder="מספר כרטיס">' +
            '<input id="expiry-date" class="swal2-input" placeholder="תאריך תפוגה (MM/YY)">' +
            '<input id="cvv" class="swal2-input" placeholder="CVV">',
          focusConfirm: false,
          preConfirm: () => {
            return {
              cardNumber: document.getElementById('card-number').value,
              expiryDate: document.getElementById('expiry-date').value,
              cvv: document.getElementById('cvv').value,
            };
          }
        });

        if (paymentDetails) {
          // הדמיית תהליך רכישה מוצלח
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
          navigate('/personal-area');
        }
      }
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
        <PriceTag>עלות: {course.price} ש"ח</PriceTag>
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
