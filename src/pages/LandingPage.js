// src/pages/LandingPage.js

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';

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
  gap: 4rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    gap: 2rem;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  padding: 5rem;
  width: 100%;
  max-width: 350px;
  text-align: center;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CardDescription = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
  flex-grow: 1;

  @media (max-width: 768px) {
    font-size: 0.875rem;
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

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);

  useEffect(() => {
    const fetchCoursesAndEnrollments = async () => {
      // Fetch user enrollments
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
        // Fetch courses if user is not logged in or not enrolled in any courses
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
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>ברוכים הבאים לקורסים שלנו</PageTitle>
        <PageContent>
          {courses.length > 0 ? (
            courses.map((course) => (
              <Card key={course.id}>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
                <div>
                  {userEnrollments.includes(course.id) ? (
                    <CardLink to={`/course-learning/${course.id}`} className="purchase">
                      כניסה לקורס
                    </CardLink>
                  ) : (
                    <>
                      <CardLink to={`/course/${course.id}`}>פרטים נוספים</CardLink>
                      <CardLink to={`/purchase/${course.id}`} className="purchase">
                        רכוש עכשיו
                      </CardLink>
                    </>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <TextSub>לא נמצאו קורסים זמינים.</TextSub>
          )}
        </PageContent>
      </PageContainer>
    </>
  );
};

export default LandingPage;
