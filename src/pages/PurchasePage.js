import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
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
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndUser();
  }, [courseId]);

  const handlePurchase = async () => {
    setShowConfirmPopup(true);
  };

  const confirmPurchase = async () => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({ user_id: user.id, course_id: courseId });

      if (error) throw error;

      setShowConfirmPopup(false);
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('התרחשה שגיאה בעת הוספת הקורס. אנא נסה שנית.');
    }
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    navigate('/personal-area');
  };

  if (loading) {
    return <div>טוען...</div>;
  }

  if (!course) {
    return <div>לא נמצאו פרטים עבור הקורס המבוקש.</div>;
  }

  return (
    <PageContainer>
      <GlobalStyle />
      <PageTitle>{course.title}</PageTitle>
      <CourseDescription>{course.description}</CourseDescription>
      <PriceTag>עלות: {course.price} ש"ח</PriceTag>
      <PurchaseButton onClick={handlePurchase}>רכוש קורס</PurchaseButton>
      
      <Popup
        isOpen={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        title="אישור רכישה"
        message={`האם אתה בטוח שברצונך לרכוש את הקורס "${course.title}" במחיר ${course.price} ש"ח?`}
        buttonText="אשר רכישה"
        onButtonClick={confirmPurchase}
      />
      
      <Popup
        isOpen={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        title="הרכישה הושלמה בהצלחה"
        message={`הקורס "${course.title}" נוסף בהצלחה לרשימת הקורסים שלך.`}
        buttonText="עבור לאזור האישי"
        onButtonClick={handleSuccessPopupClose}
      />
    </PageContainer>
  );
};

export default PurchasePage;