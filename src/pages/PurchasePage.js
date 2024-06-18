import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';

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

const PurchasePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // פונקציה להוספת הקורס לאדמין ללא סליקה
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

        // אם המשתמש הוא אדמין, רושמים אותו ללא סליקה
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

  const handleRegularPurchase = async () => {
    setIsProcessing(true);
    try {
      // בדוק אם המשתמש קיים בטבלת users לפי המייל
      const { data: existingUsers, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email);

      if (userCheckError) throw userCheckError;

      let userId;
      if (existingUsers && existingUsers.length > 0) {
        // אם המשתמש קיים, נשתמש ב-ID שלו
        userId = existingUsers[0].id;
      } else {
        // אם המשתמש לא קיים, ניצור אותו בטבלת users
        const { data: newUser, error: insertUserError } = await supabase
          .from('users')
          .insert([{ email: user.email, name: user.email.split('@')[0] }]) // נתנו שם ברירת מחדל המבוסס על החלק שלפני ה-@
          .select('id')
          .single();

        if (insertUserError) throw insertUserError;
        userId = newUser.id;
      }

      // הוספת הקורס לטבלת ההרשמות ב-Supabase כולל ה-title של הקורס
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: course.id,
          course_title: course.title // הוספת ה-title של הקורס
        });

      if (error) throw error;

      // הצגת הודעת הצלחה
      alert('הרכישה בוצעה בהצלחה!');
      navigate('/personal-area');
    } catch (error) {
      console.error('Error during purchase:', error);
      alert('התרחשה שגיאה במהלך הרכישה.');
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
      <p>{course.description}</p>
      <h2>עלות: {course.price} ש"ח</h2>
      {isAdminAsUser ? (
        <p>הקורס נוסף בהצלחה לרשימה שלך.</p>
      ) : (
        <button onClick={handleRegularPurchase} disabled={isProcessing}>רכוש קורס</button>
      )}
      {isProcessing && (
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      )}
    </PageContainer>
  );
};

export default PurchasePage;
