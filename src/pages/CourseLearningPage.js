// src/pages/CourseLearningPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import Swal from 'sweetalert2';
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
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
`;

const VideoContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;

  iframe {
    width: 100%;
    height: 450px;
    border: none;
    border-radius: 1rem;

    @media (max-width: 768px) {
      height: 300px;
    }
  }
`;

const LessonNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 2rem;

  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    background-color: #3498db;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s;
    font-size: 1rem;

    &:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
    }

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
    }
  }
`;

const FAQSection = styled.div`
  margin-top: 2rem;
  text-align: left;
  max-width: 800px;
  width: 100%;

  h2 {
    font-size: 1.5rem;
    color: #F25C78;
    margin-bottom: 1rem;
  }

  ul {
    list-style-type: none;
    padding: 0;

    li {
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f9f9f9;
      border-radius: 0.5rem;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

      strong {
        display: block;
        margin-bottom: 0.5rem;
      }
    }
  }
`;

const CourseLearningPage = () => {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    const fetchCourseContent = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('lessons, faq')
        .eq('id', courseId)
        .single();
      if (error) {
        console.error('Error fetching course content:', error);
      } else {
        setLessons(data.lessons || []);
        setFaqs(data.faq || []);
      }
    };

    fetchCourseContent();
  }, [courseId]);

  const handleNextLesson = async () => {
    if (currentLessonIndex < lessons.length - 1) {
      Swal.fire({
        title: 'סיימת את השיעור?',
        text: "האם אתה בטוח שברצונך לעבור לשיעור הבא?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'כן, סיימתי!',
        cancelButtonText: 'לא, עדיין לא',
      }).then(async (result) => {
        if (result.isConfirmed) {
          setCurrentLessonIndex(currentLessonIndex + 1);
          await updateProgress(currentLessonIndex + 1);
          Swal.fire('מעולה!', 'עברת לשיעור הבא.', 'success');
        }
      });
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const updateProgress = async (lessonIndex) => {
    console.log("Updating progress for lesson index:", lessonIndex + 1); // הבהרה שהשיעור הוא אינדקס + 1 להצגה נכונה
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('enrollments')
        .update({ current_lesson: lessonIndex + 1 }) // עדכון המסד לייצוג נכון של מספר השיעור
        .eq('user_id', user.id)
        .eq('course_id', courseId);
      if (error) {
        console.error('Error updating progress:', error);
      } else {
        console.log("Progress updated successfully in the database");
      }
    } else {
      console.error("User not found");
    }
  };

  const getYouTubeEmbedURL = (url) => {
    const videoId = url.split('v=')[1];
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  };

  if (lessons.length === 0) return <div>Loading...</div>;

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>{lessons[currentLessonIndex].title}</PageTitle>
        <PageContent>
          <VideoContainer>
            <iframe
              title={`שיעור ${currentLessonIndex + 1}`}
              src={getYouTubeEmbedURL(lessons[currentLessonIndex].videoLink)}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </VideoContainer>
        </PageContent>

        <LessonNavigation>
          <button onClick={handlePrevLesson} disabled={currentLessonIndex === 0}>
            שיעור קודם
          </button>
          <button onClick={handleNextLesson} disabled={currentLessonIndex === lessons.length - 1}>
            שיעור הבא
          </button>
        </LessonNavigation>

        {faqs.length > 0 && (
          <FAQSection>
            <h2>שאלות ותשובות כלליות</h2>
            <ul>
              {faqs.map((faq, index) => (
                <li key={index}>
                  <strong>{faq.question}</strong>
                  <p>{faq.answer}</p>
                </li>
              ))}
            </ul>
          </FAQSection>
        )}
      </PageContainer>
    </>
  );
};

export default CourseLearningPage;
