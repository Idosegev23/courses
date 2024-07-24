import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, Container, Grid } from '@mui/material';
import Swal from 'sweetalert2';
import Hero from './hero';
import StyledButton from '../components/StyledButton';
import { supabase } from '../supabaseClient';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #ffffff;
    direction: rtl;
    margin: 0;
    padding: 0;
  }
`;

const PageContainer = styled(Container)`
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const Header = styled.header`
  margin-bottom: 4rem;
`;

const CardContainer = styled(motion.div)`
  background-color: #C4E4F9;
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 2px solid #D16A1D;
  padding: 2rem;
  height: 80%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: auto;
`;

const CookieConsentBanner = styled(motion.div)`
  position: fixed;
  left: 0;
  right: 0;
  background-color: #65218F;
  color: #ffffff;
  padding: 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 1000;

  ${({ isMobile }) => isMobile
    ? `
      bottom: 0;
      border-radius: 20px 20px 0 0;
    `
    : `
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 400px;
      border-radius: 10px;
    `
  }
`;

const AcceptButton = styled.button`
  background-color: #346B75;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #D16A1D;
  }
`;

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [cookiesAccepted, setCookiesAccepted] = useState(localStorage.getItem('cookiesAccepted'));
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user && !user.email_confirmed_at) {
        const result = await Swal.fire({
          title: 'אימות מייל נדרש',
          text: 'לא אישרת עדיין את כתובת המייל שלך. אנא בדוק את תיבת הדואר שלך ואשר את ההרשמה.',
          icon: 'warning',
          confirmButtonText: 'הבנתי',
          showCancelButton: true,
          cancelButtonText: 'שלח מייל אימות מחדש',
        });

        if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
          await resendVerificationEmail(user.email);
        }
      }

      const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*');
      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
      } else {
        setCourses(coursesData);
      }

      if (user) {
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id);

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
        } else {
          setUserEnrollments(enrollmentsData.map(enrollment => enrollment.course_id));
        }
      }
    };

    fetchData();
  }, []);

  const resendVerificationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Error resending verification email:', error);
        Swal.fire('שגיאה', 'לא הצלחנו לשלוח מייל אימות. אנא נסה שוב מאוחר יותר.', 'error');
      } else {
        Swal.fire('נשלח בהצלחה', 'מייל אימות חדש נשלח לכתובת המייל שלך.', 'success');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Swal.fire('שגיאה', 'אירעה שגיאה בלתי צפויה. אנא נסה שוב מאוחר יותר.', 'error');
    }
  };

  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setCookiesAccepted('true');
  };

  return (
    <>
      <GlobalStyle />
      <Hero />
      <PageContainer maxWidth="lg">
        <Header>
          <Typography variant="h2" component="h1" sx={{
            fontWeight: 'bold',
            color: '#D16A1D',
            marginBottom: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            ברוכים הבאים לקורסים שלנו
          </Typography>
          <Typography variant="h5" sx={{ color: '#363B46' }}>
            גלו את הקורסים החדשניים ביותר שלנו
          </Typography>
        </Header>

        <Grid container spacing={4} id="course-content">
          <AnimatePresence>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%' }}
                >
                  <CardContainer>
                    <CardContent>
                      <div>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2, color: '#363B46' }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: '#363B46' }}>
                          {course.description}
                        </Typography>
                      </div>
                      <ButtonContainer>
                        {userEnrollments.includes(course.id) ? (
                          <StyledButton 
                            as={Link} 
                            to={`/course-learning/${course.id}`} 
                            isprimary="true"
                            data-text="כניסה לקורס"
                            style={{ backgroundColor: '#346B75', color: '#ffffff' }}
                          >
                            כניסה לקורס
                          </StyledButton>
                        ) : (
                          <StyledButton 
                            as={Link} 
                            to={`/course/${course.id}`} 
                            isprimary="true"
                            data-text="פרטים נוספים"
                            style={{ backgroundColor: '#346B75', color: '#ffffff' }}
                          >
                            פרטים נוספים
                          </StyledButton>
                        )}
                      </ButtonContainer>
                    </CardContent>
                  </CardContainer>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {courses.length === 0 && (
          <Typography variant="body1" sx={{ mt: 4, color: '#363B46' }}>
            לא נמצאו קורסים זמינים.
          </Typography>
        )}
      </PageContainer>

      <AnimatePresence>
        {!cookiesAccepted && (
          <CookieConsentBanner
            isMobile={isMobile}
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: 50 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="body1" sx={{ color: '#ffffff', marginBottom: 2 }}>
              האתר שלנו משתמש בעוגיות על מנת לשפר את חוויית הגלישה שלך. 
              <Link to="/privacy-policy" style={{ color: '#C4E4F9', textDecoration: 'underline', marginRight: '5px' }}>
                קרא עוד
              </Link>
            </Typography>
            <AcceptButton onClick={handleAcceptCookies}>אני מסכים</AcceptButton>
          </CookieConsentBanner>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingPage;