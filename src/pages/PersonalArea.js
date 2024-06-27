import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { Typography, Container, Grid, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import newLogo from '../components/NewLogo_BLANK-outer.png';
import Swal from 'sweetalert2';
import { FaCalendarAlt } from 'react-icons/fa';

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
  background: #ffffff;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 2rem;
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

const StyledButton = styled(Button)`
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  text-decoration: none;
  color: #fff !important;
  background: linear-gradient(45deg, #62238C 30%, #BF4B81 90%);
  transition: all 0.3s;
  border: none;
  box-shadow: 0 3px 5px 2px rgba(191, 75, 129, .3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px 4px rgba(191, 75, 129, .3);
  }
`;

const CardContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const ProgressBar = styled.div`
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  height: 20px;
  margin-top: 5px;
`;

const Progress = styled.div`
  width: ${props => props.percent}%;
  background-color: #4CAF50;
  height: 100%;
  border-radius: 5px;
  text-align: center;
  line-height: 20px;
  color: white;
`;

const NotificationContainer = styled.div`
  margin-bottom: 2rem;
`;

const Notification = styled.div`
  background-color: #ffeb3b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  position: relative;
`;

const MarkAsReadButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }
`;

const DiscountInfo = styled.div`
  background: #eaf8ff;
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1rem;
  color: #333;
`;

const MeetingButtonContainer = styled.div`
  margin-top: 2rem;
`;

const PersonalArea = () => {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [nonEnrolledCourses, setNonEnrolledCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [meetingUsed, setMeetingUsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }

        if (!userData || !userData.user) {
          alert('אנא התחבר כדי לגשת לאזור האישי.');
          navigate('/login');
          return;
        }

        const userId = userData.user.id;
        setUser(userData.user);

        // Fetching discount
        const { data: userDiscount, error: discountError } = await supabase
          .from('users')
          .select('discount')
          .eq('id', userId)
          .single();

        if (discountError) {
          console.error('Error fetching discount:', discountError);
        } else {
          setDiscount(userDiscount?.discount || 0);
        }

        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', userId);

        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');

        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .eq('read', false);

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
          setEnrollments([]);
        } else {
          setEnrollments(enrollmentsData || []);
        }

        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
          setCourses([]);
        } else {
          setCourses(coursesData || []);

          if (enrollmentsData) {
            const enrolledCourseIds = enrollmentsData.map((enrollment) => enrollment.course_id);
            setNonEnrolledCourses(coursesData.filter((course) => !enrolledCourseIds.includes(course.id)));
          } else {
            setNonEnrolledCourses(coursesData);
          }
        }

        if (notificationsError) {
          console.error('Error fetching notifications:', notificationsError);
          setNotifications([]);
        } else {
          setNotifications(notificationsData || []);
        }

        const { data: meetingsData, error: meetingsError } = await supabase
          .from('meetings')
          .select('*')
          .eq('user_id', userId);

        if (meetingsError) {
          console.error('Error fetching meetings:', meetingsError);
        } else {
          setMeetingUsed(meetingsData.length > 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [navigate]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== notificationId));
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleMeetingRequest = async () => {
    const result = await Swal.fire({
      title: 'האם אתה בטוח?',
      text: "זוהי פגישה חד פעמית של 30 דקות.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'כן, קבע פגישה!',
      cancelButtonText: 'ביטול'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('meetings')
          .insert({ user_id: user.id });

        if (error) {
          console.error('Error requesting meeting:', error);
          alert('אירעה שגיאה בבקשה לפגישה.');
          return;
        }

        setMeetingUsed(true);
        Swal.fire('הבקשה נשלחה!', 'הבקשה לפגישה נשלחה בהצלחה!', 'success');
        window.location.href = 'https://calendly.com/your-calendly-link';
      } catch (error) {
        console.error('Unexpected error:', error);
        alert('אירעה שגיאה בבקשה לפגישה.');
      }
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageContainer>
        <Typography variant="h2" component="h1" gutterBottom color="primary" align="center">
          שלום, {user.email}
        </Typography>

        {discount > 0 && (
          <DiscountInfo>
            <Typography variant="h6">יש לך הנחה של {discount}% לקורסים שלנו!</Typography>
          </DiscountInfo>
        )}

        {notifications.length > 0 && (
          <NotificationContainer>
            <Typography variant="h4" gutterBottom>הודעות</Typography>
            {notifications.map((notification) => (
              <Notification key={notification.id}>
                <Typography>{notification.message}</Typography>
                <MarkAsReadButton onClick={() => handleMarkAsRead(notification.id)}>
                  סמן כנקרא
                </MarkAsReadButton>
              </Notification>
            ))}
          </NotificationContainer>
        )}

        <Box mb={4}>
          <Typography variant="h4" gutterBottom>הקורסים שלי</Typography>
          {enrollments.length === 0 ? (
            <Typography>לא נמצאו קורסים רשומים.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table aria-label="enrolled courses table">
                <TableHead>
                  <TableRow>
                    <TableCell>קורס</TableCell>
                    <TableCell>שיעור נוכחי</TableCell>
                    <TableCell>התקדמות</TableCell>
                    <TableCell align="center">כניסה לקורס</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrollments.map((enrollment) => {
                    const course = courses.find((c) => c.id === enrollment.course_id);
                    if (!course) return null;
                    const progressPercent = Math.round((enrollment.current_lesson / (course.total_lessons || 1)) * 100);
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{enrollment.current_lesson || 'אין נתונים'}</TableCell>
                        <TableCell>
                          <ProgressBar>
                            <Progress percent={progressPercent}>{progressPercent}%</Progress>
                          </ProgressBar>
                        </TableCell>
                        <TableCell align="center">
                          <StyledButton component={Link} to={`/course-learning/${course.id}`}>
                            כניסה לקורס
                          </StyledButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Box mb={4}>
          <Typography variant="h4" gutterBottom>קורסים נוספים</Typography>
          <Grid container spacing={3}>
            {nonEnrolledCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <CardContainer>
                  <Typography variant="h5">{course.title}</Typography>
                  <Typography>{course.description}</Typography>
                  <StyledButton component={Link} to={`/purchase/${course.id}`}>
                    רכוש קורס
                  </StyledButton>
                </CardContainer>
              </Grid>
            ))}
          </Grid>
        </Box>

        <MeetingButtonContainer>
          <StyledButton
            disabled={meetingUsed}
            startIcon={<FaCalendarAlt />}
            onClick={handleMeetingRequest}
          >
            קביעת פגישה אישית עם עידו
          </StyledButton>
        </MeetingButtonContainer>
      </PageContainer>
    </ThemeProvider>
  );
};

export default PersonalArea;
