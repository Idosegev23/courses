import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import { FaClock, FaBook } from 'react-icons/fa';

// סגנונות כלליים לדף
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #f4f4f4;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;

const CourseCard = styled.div`
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`;

const CourseImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CourseContent = styled.div`
  padding: 1rem;
  text-align: right;
`;

const CourseTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
`;

const CourseDescription = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
`;

const CourseDetails = styled.p`
  font-size: 0.875rem;
  color: #888;
  margin-bottom: 1rem;
`;

const CourseLink = styled(Link)`
  display: inline-block;
  margin: 0.5rem 0;
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
`;

const CourseInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #666;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
`;

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      }
    };

    fetchCoursesAndEnrollments();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>הקורסים שלנו</PageTitle>
        <SearchInput
          type="text"
          placeholder="חפש קורסים..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CoursesGrid>
          {filteredCourses.map((course) => (
            <CourseCard key={course.id}>
              <CourseImage src={course.image || 'default_image_url'} alt={course.title} />
              <CourseContent>
                <CourseTitle>{course.title}</CourseTitle>
                <CourseDescription>{course.description}</CourseDescription>
                <CourseInfo>
                  <span><FaClock /> {course.duration}</span>
                  <span><FaBook /> {course.lessons_count} שיעורים</span>
                </CourseInfo>
                <CourseDetails>{course.details}</CourseDetails>
                {userEnrollments.includes(course.id) ? (
                  <CourseLink to={`/course-learning/${course.id}`} className="purchase">
                    כניסה לקורס
                  </CourseLink>
                ) : (
                  <CourseLink to={`/purchase/${course.id}`} className="purchase">
                    רכוש עכשיו - {course.price} ₪
                  </CourseLink>
                )}
              </CourseContent>
            </CourseCard>
          ))}
        </CoursesGrid>
      </PageContainer>
    </>
  );
};

export default CoursePage;
