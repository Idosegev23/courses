import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import Popup from '../components/Popup';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #ffffff;
    direction: rtl;
    margin: 0;
    padding: 0;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
`;

const Spinner = styled.div`
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

const CourseDescription = styled.p`
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 2rem;
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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showFailurePopup, setShowFailurePopup] = useState(false);
  const [failureReason, setFailureReason] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminPurchase = useCallback(async (userId, courseId) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({ user_id: userId, course_id: courseId });

      if (error) throw error;

      alert('הקורס נוסף בהצלחה לרשימה שלך.');
      navigate('/personal-area');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('התרחשה שגיאה בעת הוספת הקורס.');
    }
  }, [navigate]);

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

        if (user.email === 'Triroars@gmail.com') {
          await handleAdminPurchase(user.id, courseData.id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndUser();
  }, [courseId, handleAdminPurchase]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const status = urlParams.get('status');
    const reason = urlParams.get('reason');

    if (status === 'success') {
      setShowSuccessPopup(true);
    } else if (status === 'failure') {
      setFailureReason(reason || 'סיבה לא ידועה');
      setShowFailurePopup(true);
    }
  }, [location]);

  const handleRegularPurchase = async () => {
    setIsProcessing(true);
    try {
      const { data: existingUsers, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email);

      if (userCheckError) throw userCheckError;

      let userId;
      if (existingUsers && existingUsers.length > 0) {
        userId = existingUsers[0].id;
      } else {
        const { data: newUser, error: insertUserError } = await supabase
          .from('users')
          .insert([{ email: user.email, name: user.email.split('@')[0] }])
          .select('id')
          .single();

        if (insertUserError) throw insertUserError;
        userId = newUser.id;
      }

      // בקשת JWT Token ל-Green Invoice דרך השרת שלך
      const tokenResponse = await axios.post('/api/green-invoice', {
        endpoint: '/account/token',
        data: {
          id: process.env.REACT_APP_GREEN_INVOICE_API_KEY,
          secret: process.env.REACT_APP_GREEN_INVOICE_API_SECRET,
        }
      });

      const jwtToken = tokenResponse.data.token;

      // בקשת טופס תשלום מ-Green Invoice
      const paymentResponse = await axios.post('https://api.greeninvoice.co.il/api/v1/payments/formRequest', {
        description: `תשלום עבור קורס ${course.title}`,
        type: 320,
        lang: 'he',
        currency: 'ILS',
        vatType: 0,
        amount: course.price,
        maxPayments: 1,
        pluginId: '309fc9b8031709c6',
        group: 100, // כפי שנדרש על ידי התמיכה
        client: {
          name: user.email.split('@')[0],
          emails: [user.email],
          add: true,
        },
        successUrl: `${window.location.origin}/purchase/${courseId}?status=success`,
        failureUrl: `${window.location.origin}/purchase/${courseId}?status=failure`,
        notifyUrl: `${window.location.origin}/payment-notification`,
        custom: `order_${courseId}_${userId}`
      }, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (paymentResponse.data && paymentResponse.data.url) {
        window.location.href = paymentResponse.data.url;
      } else {
        throw new Error('שגיאה בהפניה לסליקה.');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      setFailureReason('התרחשה שגיאה במהלך הרכישה. אנא נסה שנית או צור קשר עם התמיכה.');
      setShowFailurePopup(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    navigate(`/course/${courseId}`);
  };

  const handleFailurePopupClose = () => {
    setShowFailurePopup(false);
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  if (!course) {
    return <div>לא נמצאו פרטים עבור הקורס המבוקש.</div>;
  }

  const isAdminAsUser = user && user.email === 'Triroars@gmail.com';

  return (
    <PageContainer>
      <GlobalStyle />
      <PageTitle>{course.title}</PageTitle>
      <CourseDescription>{course.description}</CourseDescription>
      <PriceTag>עלות: {course.price} ש"ח</PriceTag>
      {isAdminAsUser ? (
        <p>הקורס נוסף בהצלחה לרשימה שלך.</p>
      ) : (
        <PurchaseButton onClick={handleRegularPurchase} disabled={isProcessing}>רכוש קורס</PurchaseButton>
      )}
      {isProcessing && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}
      <Popup
        isOpen={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        title="תשלום התקבל"
        message="התשלום עבור הקורס התקבל בהצלחה. אתה מועבר לדף הקורס."
        buttonText="המשך לקורס"
        onButtonClick={handleSuccessPopupClose}
      />
      <Popup
        isOpen={showFailurePopup}
        onClose={handleFailurePopupClose}
        title="התשלום נכשל"
        message={`התשלום עבור הקורס נכשל. סיבה: ${failureReason}`}
        buttonText="סגור"
        onButtonClick={handleFailurePopupClose}
      />
    </PageContainer>
  );
};

export default PurchasePage;