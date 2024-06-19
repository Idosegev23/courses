import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import newLogo from '../components/NewLogo_BLANK-outer.png';

// ייבוא רכיבים מתאימים
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #ffffff;
    direction: rtl;
    margin: 0;
    padding: 0;
  }
`;

const StyledButton = styled(Link)`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  font-size: 1rem;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.4rem 0.8rem;
  }
`;

const PageContainer = styled.div`
  padding: 2rem;
  background: #ffffff;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
  background: white;

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

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color: #F25C78;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
`;

const PageContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  padding: 1rem;
  width: calc(40% - 2rem);
  max-width: 320px;
  text-align: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 768px) {
    width: calc(100% - 2rem);
  }
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
  flex-grow: 1;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const CardLink = styled(Link)`
  display: inline-block;
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  text-decoration: none;
  color: #fff;
  background-color: #F25C78;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #BF4B81;
    transform: translateY(-2px);
  }

  &.purchase {
    background-color: #BF4B81;
  }

  &.purchase:hover {
    background-color: #62238C;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

const TextSub = styled.p`
  color: #666;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;

  th, td {
    border: 1px solid #ddd;
    padding: 0.75rem;
    text-align: center;
  }

  th {
    background-color: #f5f5f5;
    font-weight: bold;
  }

  td {
    background-color: #fff;
  }
`;

const CalendarButton = styled.a`
  display: inline-block;
  margin: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  text-decoration: none;
  color: #fff;
  background-color: #00A3E0;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #007BBD;
    transform: translateY(-2px);
  }
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
`;

const PersonalArea = () => {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [nonEnrolledCourses, setNonEnrolledCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [discount, setDiscount] = useState(0); // הוספת סטייט להנחה

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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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

      // עדכון המצב המקומי לאחר שסימנו את ההודעה כהתקראה
      setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== notificationId));
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>שלום, {user.email}</PageTitle>

        {/* הצגת אחוז ההנחה */}
        <DiscountInfo>
          <h3>אחוז ההנחה שלך:</h3>
          <p>{discount}%</p>
        </DiscountInfo>

        {/* הצגת הודעות */}
        {notifications.length > 0 && (
          <NotificationContainer>
            <h3 className='text-xl font-semibold text-primary mb-2'>הודעות</h3>
            {notifications.map((notification) => (
              <Notification key={notification.id}>
                <p>{notification.message}</p>
                <MarkAsReadButton onClick={() => handleMarkAsRead(notification.id)}>
                  סמן כנקרא
                </MarkAsReadButton>
              </Notification>
            ))}
          </NotificationContainer>
        )}

        <PageContent>
          <div className="enrolled-courses" style={{ flex: 1 }}>
            <h3 className='text-xl font-semibold text-primary mb-2'>הקורסים שלי</h3>
            {enrollments.length === 0 ? (
              <p>לא נמצאו קורסים רשומים.</p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>כותרת הקורס</th>
                    <th>שיעור נוכחי</th>
                    <th>התקדמות</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => {
                    const course = courses.find((course) => course.id === enrollment.course_id);
                    if (!course) return null;
                    return (
                      <tr key={enrollment.id}>
                        <td>{course.title}</td>
                        <td>{enrollment.current_lesson || 'אין נתונים'}</td>
                        <td>
                          <div className='w-full bg-gray-200 rounded-full h-2.5'>
                            <div className='bg-primary h-2.5 rounded-full' style={{ width: `${(enrollment.current_lesson / (course.total_lessons || 1)) * 100}%` }}></div>
                          </div>
                        </td>
                        <td>
                          <StyledButton to={`/course-learning/${course.id}`}>
                            כניסה לקורס
                          </StyledButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
            <CalendarButton href="https://calendly.com/your-calendly-link" target="_blank" rel="noopener noreferrer">
              קביעת פגישה אישית עם עידו
            </CalendarButton>
          </div>

          <div className="non-enrolled-courses" style={{ flex: 1 }}>
            <h3 className='text-xl font-semibold text-primary mb-2'>קורסים שאינכם רשומים אליהם</h3>
            <PageContent>
              {nonEnrolledCourses.length === 0 ? (
                <TextSub>אין קורסים זמינים.</TextSub>
              ) : (
                nonEnrolledCourses.map((course) => (
                  <Card key={course.id}>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                    <CardLink to={`/purchase/${course.id}`} className="purchase">
                      רכשו קורס
                    </CardLink>
                  </Card>
                ))
              )}
            </PageContent>
          </div>
        </PageContent>
      </PageContainer>
    </>
  );
};

export default PersonalArea;
