import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, Container, Grid } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Hero from './hero';
import StyledButton from '../components/StyledButton';

const theme = createTheme({
  palette: {
    primary: { main: '#62238C' },
    secondary: { main: '#BF4B81' },
  },
  typography: { fontFamily: 'Heebo, sans-serif' },
});

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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
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

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);

  useEffect(() => {
    const fetchCoursesAndEnrollments = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user) {
        const userId = userData.user.id;

        const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*');
        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
        } else {
          setCourses(coursesData);
        }

        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', userId);

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
        } else {
          setUserEnrollments(enrollmentsData.map(enrollment => enrollment.course_id));
        }
      } else {
        const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*');
        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
        } else {
          setCourses(coursesData);
        }
      }
    };

    fetchCoursesAndEnrollments();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Hero />
      <PageContainer maxWidth="lg">
        <Header>
          <Typography variant="h2" component="h1" sx={{
            fontWeight: 'bold',
            color: '#62238C',
            marginBottom: 2,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            ברוכים הבאים לקורסים שלנו
          </Typography>
          <Typography variant="h5" sx={{ color: '#0D0D0D' }}>
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
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 2, color: '#62238C' }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: '#0D0D0D' }}>
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
                          >
                            כניסה לקורס
                          </StyledButton>
                        ) : (
                          <StyledButton 
                            as={Link} 
                            to={`/course/${course.id}`} 
                            isprimary="true"
                            data-text="פרטים נוספים"
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
          <Typography variant="body1" sx={{ mt: 4, color: '#666' }}>
            לא נמצאו קורסים זמינים.
          </Typography>
        )}
      </PageContainer>
    </ThemeProvider>
  );
};

export default LandingPage;