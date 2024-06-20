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

// Constants
const API_BASE_URL = 'https://api.greeninvoice.co.il/api/v1';
const API_KEY = process.env.REACT_APP_GREEN_INVOICE_API_KEY;
const API_SECRET = process.env.REACT_APP_GREEN_INVOICE_API_SECRET;

// Helper function to get Green Invoice token
const getGreenInvoiceToken = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/account/token`, {
      id: API_KEY,
      secret: API_SECRET
    });
    return response.data.token;
  } catch (error) {
    console.error('Error getting Green Invoice token:', error);
    throw error;
  }
};

// Helper function to create a payment transaction
const createPaymentTransaction = async (token, courseData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/transactions`,
      {
        type: 320,
        sum: courseData.price,
        description: `תשלום עבור קורס ${courseData.title}`,
        currency: 'ILS',
        success_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancel`
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw error;
  }
};

const PurchasePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
        setMessage('אירעה שגיאה בטעינת נתוני הקורס.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndUser();
  }, [courseId, handleAdminPurchase]);

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

      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: course.id,
          course_title: course.title
        });

      if (error) throw error;

      // Get Green Invoice token
      const token = await getGreenInvoiceToken();

      // Create payment transaction
      const paymentData = await createPaymentTransaction(token, course);

      if (paymentData && paymentData.url) {
        window.location.href = paymentData.url;
      } else {
        throw new Error('שגיאה בהפניה לסליקה.');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      if (error.response) {
        console.error('API error response:', error.response.data);
        if (error.response.status === 429) {
          setMessage('נא לנסות שוב בעוד מספר שניות. יותר מדי בקשות נשלחו.');
        } else {
          setMessage(`שגיאה בתהליך הרכישה: ${error.response.data.errorMessage || error.message}`);
        }
      } else if (error.request) {
        setMessage('לא התקבלה תשובה מהשרת. נא לבדוק את החיבור לאינטרנט ולנסות שוב.');
      } else {
        setMessage('אירעה שגיאה בלתי צפויה במהלך הרכישה.');
      }
    } finally {
      setIsProcessing(false);
    }
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
      {message && <p>{message}</p>}
      {isProcessing && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}
    </PageContainer>
  );
};

export default PurchasePage;
