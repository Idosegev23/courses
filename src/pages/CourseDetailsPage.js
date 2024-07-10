import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import { Typography, Container, Snackbar, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import newLogo from '../components/NewLogo_BLANK-outer.png';
import { useAuth } from '../hooks/useAuth';
import { usePopup } from '../PopupContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#62238C',
    },
    secondary: {
      main: '#BF4B81',
    },
  },
  typography: {
    fontFamily: 'Heebo, sans-serif',
  },
});

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Montserrat');
  
  body {
    font-family: 'Montserrat', arial, verdana;
    background-color: white;
    direction: rtl;
    margin: 0;
    padding: 0;
    height: 100%;
    overflow-y: auto;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const PageContainer = styled(Container)`
  padding: 2rem;
  background: #ffffff;
  text-align: center;
  max-width: 1200px;
  margin: 2rem auto;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

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

const PageTitle = styled(Typography)`
  font-size: 0.8rem;
  font-weight: light;
  color: #62238C;
  margin-bottom: 1.2rem;
  position: relative;
  z-index: 1;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  
  @media (min-width: 480px) {
    font-size: 1rem;
  }
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
  
  &:hover {
    transform: scale(1.05);
    text-shadow: 2px 2px 4px rgba(98, 35, 140, 0.3);
  }
`;

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
`;

const CourseDescription = styled.div`
  font-size: 1rem;
  color: #333;
  max-width: 100%;
  text-align: right;
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);

  h2 {
    font-size: 1.5rem;
    color: #62238C;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1rem;
  }

  @media (min-width: 768px) {
    font-size: 1.1rem;
    padding: 2rem;
    max-width: 800px;

    h2 {
      font-size: 2rem;
    }
  }
`;

const PurchaseButton = styled.button`
  width: 200px;
  height: 60px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  color: white;
  background: #BF4B81;
  border: 2px solid #62238C;
  box-shadow: 5px 5px 0 #62238C, -5px -5px 0 #62238C, -5px 5px 0 #62238C, 5px -5px 0 #62238C;
  transition: 500ms ease-in-out;

  &:hover {
    box-shadow: 20px 5px 0 #62238C, -20px -5px 0 #62238C;
  }

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    width: 180px;
    height: 50px;
    font-size: 18px;
  }
`;

const LoadingSpinner = styled(CircularProgress)`
  color: #62238C;
`;

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage,] = useState('');
  const { openLoginPopup, openPurchasePopup } = usePopup();

  useEffect(() => {
    const fetchCourse = async () => {
      console.log('Fetching course details for courseId:', courseId);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      if (error) {
        console.error('Error fetching course:', error);
      } else {
        console.log('Course data fetched:', data);
        setCourse(data);
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handlePurchaseClick = () => {
    if (user) {
      openPurchasePopup(course);
    } else {
      openLoginPopup();
    }
  };



  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageContainer>
        <PageTitle variant="h1">פרטי הקורס</PageTitle>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <PageContent>
            <CourseDescription>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <p>{course.details}</p>
              <p>משך זמן :{course.duration}</p>
              <p>עלות : {course.price} ש״ח</p>
              <p>מספר שיעורים : {course.total_lessons}</p>
            </CourseDescription>
            <PurchaseButton onClick={handlePurchaseClick}>
              רכוש עכשיו
            </PurchaseButton>
          </PageContent>
        )}
        <Snackbar
          open={snackbarOpen}
          message={snackbarMessage}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        />
      </PageContainer>
    </ThemeProvider>
  );
};

export default CourseDetailsPage;

