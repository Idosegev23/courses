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
  padding: 1rem 2rem;
  border-radius: 1rem;
  text-decoration: none;
  color: #fff !important;
  background: linear-gradient(45deg, #6DBFF2 30%, #62238C 90%);
  transition: all 0.3s;
  border: none;
  box-shadow: 0 3px 5px 2px rgba(0, 0, 0, .3);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px 4px rgba(0, 0, 0, .3);
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
  }

  svg {
    margin-left: 8px;
  }
`;

const CardContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 300px;
  width: 300px;
`;

const ProgressBar = styled.div`
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  height: 20px;
  margin-top: 5px;
`;

const Progress = styled.div`
  width: ${props => props.$percent}%;
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

const CourseGrid = styled(Grid)`
  margin-top: 2rem;
`;

const CourseCard = styled(Grid)`
  display: flex;
  align-items: stretch;
`;

const PersonalArea = () => {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [nonEnrolledCourses, setNonEnrolledCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [meetingUsed, setMeetingUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          navigate('/login');
          return;
        }

        if (!session) {
          console.log('No active session');
          navigate('/login');
          return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error fetching user:', userError);
          navigate('/login');
          return;
        }

        if (!userData || !userData.user) {
          console.log('No user data');
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
      } finally {
        setLoading(false);
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
        Swal.fire('הבקשה נשלחה!', 'הבקשה לפגישה נשלחה בהצלחה!', 'success').then(() => {
          window.location.href = 'https://calendly.com/your-calendly-link';
        });
      } catch (error) {
        console.error('Unexpected error:', error);
        alert('אירעה שגיאה בבקשה לפגישה.');
      }
    }
  };

  const handleCourseEnter = async (courseId, currentLesson, totalLessons) => {
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('completed_exercises, completion_percentage')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (progressError) {
        if (progressError.code === 'PGRST116') {
          console.error('Error fetching progress data: No rows or multiple rows returned');
        } else {
          console.error('Error fetching progress data:', progressError);
        }
        return;
      }

      const completedExercises = progressData?.completed_exercises || [];
      const allExercisesCompleted = completedExercises.length >= totalLessons;

      if (currentLesson >= totalLessons) {
        Swal.fire({
          title: 'סיימת את הקורס!',
          text: 'כל הכבוד! השלמת את כל השיעורים בקורס זה.',
          icon: 'success',
          confirmButtonText: 'תרגול מסכם',
          showCancelButton: true,
          cancelButtonText: 'עבר לקורס הבא'
        }).then((result) => {
          if (result.isConfirmed) {
            // Show summary exercises
            showSummaryExercises(courseId);
          } else {
            // Navigate to the next course or the home page
            navigate('/');
          }
        });
      } else {
        if (!allExercisesCompleted && currentLesson < totalLessons) {
          Swal.fire({
            title: 'לא סיימת את התרגילים!',
            text: 'אתה בטוח שאתה רוצה להמשיך?',
            icon: 'warning',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'כן, המשך',
            denyButtonText: 'לא, חזור על התרגילים',
          }).then((result) => {
            if (result.isConfirmed) {
              navigate(`/course-learning/${courseId}?lesson=${currentLesson + 1}`);
            } else if (result.isDenied) {
              navigate(`/course-learning/${courseId}?lesson=${currentLesson}`);
            }
          });
        } else {
          navigate(`/course-learning/${courseId}?lesson=${currentLesson + 1}`);
        }
      }
    } catch (error) {
      console.error('Error checking exercises completion:', error);
    }
  };

  const showSummaryExercises = (courseId) => {
    // Implement the logic to fetch and show exercises in a modal or another UI component
    console.log('Showing summary exercises for course:', courseId);
  };

  const handleCourseButton = (courseId, currentLesson, totalLessons) => {
    return (
      <StyledButton component={Link} to={`/course/${courseId}`}>
        צפייה בפרטי הקורס
      </StyledButton>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to access this page.</div>;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageContainer>
        <Typography variant="h2" component="h1" gutterBottom color="primary" align="center" sx={{ fontSize: { xs: '1.5rem', sm: '2.5rem', md: '3rem' } }}>
          שלום, {user.email}
        </Typography>

        {discount > 0 && (
          <DiscountInfo>
            יש לך הנחה של {discount}% לקורסים שלנו!
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
                    const progressPercent = Math.round((enrollment.current_lesson / course.total_lessons) * 100);
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{enrollment.current_lesson || 'אין נתונים'}</TableCell>
                        <TableCell>
                          <ProgressBar>
                            <Progress $percent={progressPercent}>{progressPercent}%</Progress>
                          </ProgressBar>
                        </TableCell>
                        <TableCell align="center">
                          {handleCourseButton(course.id, enrollment.current_lesson, course.total_lessons)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        <Box mb={4} mt={4}>
          <StyledButton
            disabled={meetingUsed}
            onClick={handleMeetingRequest}
          >
            <FaCalendarAlt style={{ marginRight: '8px' }} />
            קביעת פגישה אישית עם עידו
          </StyledButton>
        </Box>

        <Box mb={4}>
          <Typography variant="h4" gutterBottom>קורסים נוספים</Typography>
          <CourseGrid container spacing={3}>
            {nonEnrolledCourses.map((course) => (
              <CourseCard item xs={12} sm={6} md={4} key={course.id}>
                <CardContainer>
                  <div>
                    <Typography variant="h5" gutterBottom style={{ height: '3em', overflow: 'hidden' }}>{course.title}</Typography>
                    <Typography variant="body2" style={{ height: '4.5em', overflow: 'hidden' }}>{course.description}</Typography>
                  </div>
                  <StyledButton component={Link} to={`/course/${course.id}`}>
                    צפייה בפרטי הקורס
                  </StyledButton>
                </CardContainer>
              </CourseCard>
            ))}
          </CourseGrid>
        </Box>
      </PageContainer>
    </ThemeProvider>
  );
};

export default PersonalArea;
