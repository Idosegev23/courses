import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import newLogo from '../components/NewLogo_BLANK-outer.png';

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

const PersonalArea = () => {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [nonEnrolledCourses, setNonEnrolledCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      if (!user) {
        alert('אנא התחבר כדי לגשת לאזור האישי.');
        return;
      }
      setUser(user);

      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('userId', user.id);

      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        setEnrollments([]);
      } else {
        setEnrollments(enrollmentsData);
      }

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        setCourses([]);
      } else {
        setCourses(coursesData);
        if (enrollmentsData) {
          const enrolledCourseIds = enrollmentsData.map((enrollment) => enrollment.courseId);
          setNonEnrolledCourses(coursesData.filter((course) => !enrolledCourseIds.includes(course.id)));
        } else {
          setNonEnrolledCourses(coursesData);
        }
      }
    };

    fetchData();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>שלום, {user.email}</PageTitle>
        <PageContent>
          <div className="enrolled-courses" style={{ flex: 1 }}>
            <h3 className='text-xl font-semibold text-primary mb-2'>הקורסים שלי</h3>
            <Table>
              <thead>
                <tr>
                  <th>כותרת הקורס</th>
                  <th>שיעור נוכחי</th>
                  <th>התקדמות</th>
                </tr>
              </thead>
              <tbody>
                {enrollments && enrollments.length > 0 ? (
                  enrollments.map((enrollment) => {
                    const course = courses.find((course) => course.id === enrollment.courseId);
                    if (!course) return null;
                    return (
                      <tr key={enrollment.id}>
                        <td>{course.title}</td>
                        <td>{enrollment.currentLesson}</td>
                        <td>
                          <div className='w-full bg-gray-200 rounded-full h-2.5'>
                            <div className='bg-primary h-2.5 rounded-full' style={{ width: `${(enrollment.currentLesson / course.lessons.length) * 100}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3">לא נמצאו קורסים רשומים.</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <CalendarButton href="https://calendly.com/your-calendly-link" target="_blank" rel="noopener noreferrer">
              קביעת פגישה אישית עם עידו
            </CalendarButton>
          </div>
          <div className="non-enrolled-courses" style={{ flex: 1 }}>
            <h3 className='text-xl font-semibold text-primary mb-2'>קורסים שאינכם רשומים אליהם</h3>
            <PageContent>
              {nonEnrolledCourses && nonEnrolledCourses.length > 0 ? (
                nonEnrolledCourses.map((course) => (
                  <Card key={course.id}>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                    <CardLink to={`/purchase/${course.id}`} className="purchase">
                      רכשו קורס
                    </CardLink>
                  </Card>
                ))
              ) : (
                <TextSub>אין קורסים זמינים.</TextSub>
              )}
            </PageContent>
          </div>
        </PageContent>
      </PageContainer>
    </>
  );
}

export default PersonalArea;
