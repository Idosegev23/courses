import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, Container, Grid } from '@mui/material';
import Swal from 'sweetalert2';
import Hero from './hero';
import StyledButton from '../components/StyledButton';
import { supabase } from '../supabaseClient';
import FlipCard from '../components/FlipCard';

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

const InteractiveContainer = styled(motion.div)`
  padding: 2rem;
  margin-bottom: 4rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 6px 50px rgba(0, 0, 0, 0.2);
  }
`;

const CookieConsentBanner = styled(motion.div)`
  position: fixed;
  left: 0;
  right: 0;
  background-color: #62238C;
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
  background-color: #ffffff;
  color: #62238C;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #f0f0f0;
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
        <InteractiveContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h2" component="h1" sx={{
            fontWeight: 'bold',
            color: '#62238C',
            marginBottom: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            מה יש פה בעצם?
          </Typography>
          <Typography variant="h6" sx={{ color: '#0D0D0D', marginBottom: 4 }}>
            האתר שלנו מציע מגוון רחב של קורסים דיגיטליים בנושאי בינה מלאכותית, המיועדים לשפר את הכישורים שלך, הן במישור האישי והן במקצועי. תוכל למצוא כאן כלים שימושיים, מדריכים מעשיים וקורסים שמותאמים במיוחד לצרכים שלך.
          </Typography>
        </InteractiveContainer>

        <InteractiveContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h2" component="h1" sx={{
            fontWeight: 'bold',
            color: '#62238C',
            marginBottom: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            מה אנחנו מציעים לכם?
          </Typography>
          <Typography variant="h6" sx={{ color: '#0D0D0D', marginBottom: 4 }}>
            קורסים דיגיטליים בנושאי בינה מלאכותית שיעזרו לכם לא רק בהתפתחות אישית אלא גם בחיי העבודה והעסק שלכם. עם הקורסים שלנו תוכלו ללמוד כיצד להשתמש בבינה מלאכותית לשיפור ביצועים, אוטומציה של תהליכים, ויצירת יתרון תחרותי בעולם העסקי המודרני.
          </Typography>
        </InteractiveContainer>

        <Grid container spacing={4} id="course-content">
          <AnimatePresence>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ 
                    height: '100%', 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px'
                  }}
                >
                  <FlipCard
  title={course.title}
  imageSrc={course.imageSrc || "/path/to/default-image.jpg"}
  description={course.details}
  courseId={course.id}
  isEnrolled={userEnrollments.includes(course.id)}
>
  <StyledButton 
    as={Link} 
    to={userEnrollments.includes(course.id) ? `/course-learning/${course.id}` : `/course/${course.id}`} 
    isprimary="true"
    data-text={userEnrollments.includes(course.id) ? "כניסה לקורס" : "פרטים נוספים"}
  >
    {userEnrollments.includes(course.id) ? "כניסה לקורס" : "פרטים נוספים"}
  </StyledButton>
</FlipCard>
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>

        {courses.length === 0 && (
          <Typography variant="body1" sx={{ mt: 4, color: '#666' }}>
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
              <Link to="/privacy-policy" style={{ color: '#ffffff', textDecoration: 'underline', marginRight: '5px' }}>
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