import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import newLogo from '../components/NewLogo_BLANK-outer.png';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #ffffff;
    direction: rtl; /* כיוון הטקסט מימין לשמאל */
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
  flex-direction: column;
  align-items: center; /* מרכז אופקי */
  gap: 2rem;
  position: relative;
  z-index: 1;
`;

const CourseDescription = styled.div`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1rem;
  max-width: 800px;
  text-align: right; /* יישור טקסט לימין */

  h2 {
    font-size: 2rem;
    color: #F25C78;
    text-align: center; /* כותרת ממורכזת */
  }

  p {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FaqSection = styled.div`
  text-align: right;
  max-width: 800px;
  margin-bottom: 2rem;

  h2 {
    font-size: 2rem;
    color: #F25C78;
    margin-bottom: 1rem;
    text-align: center;
  }

  ul {
    list-style-type: none;
    padding: 0;

    li {
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      padding: 1rem;

      p {
        margin: 0;
        font-size: 1rem;

        &:first-child {
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
      }
    }
  }
`;

const PurchaseButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  border: none;
  text-decoration: none;
  color: #fff;
  background-color: #F25C78;
  transition: background-color 0.3s, transform 0.3s;
  font-size: 1.2rem;
  cursor: pointer;

  &:hover {
    background-color: #BF4B81;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
`;

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, description, price, duration, details, faq')
        .eq('id', courseId)
        .single();
      if (error) {
        console.error('Error fetching course:', error);
      } else {
        setCourse(data);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (!course) return <div>Loading...</div>;

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>{course.title}</PageTitle>
        <PageContent>
          <CourseDescription>
            <h2>פרטי הקורס</h2>
            <p>{course.description}</p>
            <p><strong>עלות:</strong> {course.price} ש"ח</p>
            <p><strong>משך הקורס:</strong> {course.duration}</p>
            <p><strong>פרטים נוספים:</strong> {course.details}</p>
          </CourseDescription>
          {course.faq && course.faq.length > 0 && (
            <FaqSection>
              <h2>שאלות ותשובות</h2>
              <ul>
                {course.faq.map((faqItem, index) => (
                  <li key={index}>
                    <p>{faqItem.question}</p>
                    <p>{faqItem.answer}</p>
                  </li>
                ))}
              </ul>
            </FaqSection>
          )}
          <PurchaseButton to={`/purchase/${course.id}`}>רכוש עכשיו</PurchaseButton>
        </PageContent>
      </PageContainer>
    </>
  );
};

export default CourseDetailsPage;
