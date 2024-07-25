import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Swal from 'sweetalert2';
import Confetti from 'react-confetti';
import { useAuth } from '../hooks/useAuth';

const GlobalStyle = createGlobalStyle`
  .custom-swal-container {
    direction: rtl;
  }
`;

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
`;

const PurchaseResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const success = searchParams.get('success') === 'true';
  const courseId = searchParams.get('courseId');
  const message = decodeURIComponent(searchParams.get('message') || '');
  const flow = searchParams.get('flow');
  const requestId = searchParams.get('requestId');
  const lang = searchParams.get('lang');
  const [showConfetti, setShowConfetti] = useState(success);
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      if (!user) {
        console.error('Auth error: User not found');
        Swal.fire({
          title: 'שגיאת אימות',
          text: 'אנא התחבר מחדש',
          icon: 'error',
          confirmButtonText: 'עבור לדף ההתחברות',
          customClass: {
            container: 'custom-swal-container'
          }
        }).then(() => {
          navigate('/login');
        });
        return;
      }

      if (success) {
        Swal.fire({
          title: 'רכישה מוצלחת!',
          text: message || 'הקורס נוסף בהצלחה לאזור האישי שלך. קבלה תשלח לתיבת המייל שלך',
          icon: 'success',
          confirmButtonText: 'לאזור האישי',
          confirmButtonColor: '#4CAF50',
          allowOutsideClick: false,
          customClass: {
            container: 'custom-swal-container'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            setShowConfetti(false);
            navigate('/personal-area');
          }
        });
      } else {
        Swal.fire({
          title: 'הרכישה נכשלה',
          text: message || 'מצטערים, הרכישה לא הושלמה. אנא נסה שוב',
          icon: 'error',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'חזרה לדף הקורס',
          cancelButtonText: 'חזרה לדף הבית',
          allowOutsideClick: false,
          customClass: {
            container: 'custom-swal-container'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/course/${courseId}`);
          } else {
            navigate('/');
          }
        });
      }

      // Log additional information
      console.log('Purchase Result:', {
        success,
        courseId,
        flow,
        requestId,
        lang,
        message
      });
    };

    checkAuth();
  }, [success, courseId, navigate, message, user, loading, flow, requestId, lang]);

  if (loading) {
    return <div>טוען...</div>;
  }

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}
      </PageContainer>
    </>
  );
};

export default PurchaseResultPage;