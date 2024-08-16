import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
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
    right: 0;
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
  margin-bottom: 1rem;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
`;

const CourseProgress = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #3498db;
  font-weight: bold;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  width: ${props => props.progress}%;
  height: 100%;
  background-color: #3498db;
  transition: width 0.5s ease-in-out;
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
  text-align: right;
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

const ExerciseSection = styled.div`
  margin-top: 2rem;
  text-align: right;
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
  }

  li {
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 0.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SummarySection = styled.div`
  margin-top: 2rem;
  text-align: right;
  max-width: 800px;
  width: 100%;

  h2 {
    font-size: 1.5rem;
    color: #F25C78;
    margin-bottom: 1rem;
  }

  p {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-top: 1rem;
  cursor: pointer;

  input {
    margin-left: 0.5rem;
  }
`;

const CompletionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #F25C78;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 1rem;

  &:hover {
    background-color: #e84468;
    transform: translateY(-2px);
  }
`;

const CourseLearningPage = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [exercisesCompleted, setExercisesCompleted] = useState({});
  const [totalLessons, setTotalLessons] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const lastUpdatedIndex = useRef(null);
  const isUpdatingRef = useRef(false);

  const updateProgress = useCallback(async (lessonIndex, completeEntireCourse = false) => {
    if (isUpdatingRef.current || (lessonIndex === lastUpdatedIndex.current && !completeEntireCourse)) return;
    isUpdatingRef.current = true;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('total_lessons')
        .eq('id', courseId)
        .single();
  
      if (courseError) {
        console.error('Error fetching course data:', courseError);
        isUpdatingRef.current = false;
        return;
      }
  
      const totalLessons = courseData.total_lessons;
      
      const updateData = {
        current_lesson: completeEntireCourse ? totalLessons : lessonIndex
      };
  
      if (completeEntireCourse) {
        updateData.completed = true;
        updateData.completion_date = new Date().toISOString();
      }
  
      console.log("Updating progress for lesson index:", updateData.current_lesson);
  
      const { error } = await supabase
        .from('enrollments')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('course_id', courseId);
  
      if (error) {
        console.error('Error updating progress:', error);
      } else {
        console.log("Progress updated successfully in the database");
        setCurrentLessonIndex(updateData.current_lesson);
        lastUpdatedIndex.current = updateData.current_lesson;
  
        if (completeEntireCourse) {
          Swal.fire({
            title: 'סיימת את הקורס!',
            text: 'כל הכבוד! השלמת את כל השיעורים בקורס זה.',
            icon: 'success',
            confirmButtonText: 'תודה!'
          }).then(() => {
            navigate('/personal-area');
          });
        }
      }
    } else {
      console.error("User not found");
    }
    isUpdatingRef.current = false;
  }, [courseId, navigate, setCurrentLessonIndex]);
  const handleNextLesson = useCallback(() => {
    if (currentLessonIndex < lessons.length - 1) {
      const nextLessonIndex = currentLessonIndex + 1;
      updateProgress(nextLessonIndex);
    }
  }, [currentLessonIndex, lessons.length, updateProgress]);

  const handlePrevLesson = useCallback(() => {
    if (currentLessonIndex > 0) {
      const prevLessonIndex = currentLessonIndex - 1;
      updateProgress(prevLessonIndex);
    }
  }, [currentLessonIndex, updateProgress]);

  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('courses')
            .select('lessons, faq, total_lessons')
            .eq('id', courseId)
            .single();
      
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('current_lesson')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single();
      
          if (error || enrollmentError) {
            console.error('Error fetching data:', error || enrollmentError);
          } else {
            setLessons(data.lessons || []);
            setFaqs(data.faq || []);
            setTotalLessons(data.total_lessons || 0);
      
            const urlParams = new URLSearchParams(location.search);
            const lessonParam = urlParams.get('lesson');
              
            if (lessonParam) {
              const lessonIndex = parseInt(lessonParam) - 1;
              if (lessonIndex >= 0 && lessonIndex < data.lessons.length) {
                setCurrentLessonIndex(lessonIndex);
              }
            } else if (enrollmentData && enrollmentData.current_lesson >= 0) {
              setCurrentLessonIndex(enrollmentData.current_lesson);
            } else {
              setCurrentLessonIndex(0);
            }
      
            // Fetch user progress
            const { data: progressData, error: progressError } = await supabase
              .from('user_progress')
              .select('completed_exercises')
              .eq('user_id', user.id)
              .eq('course_id', courseId)
              .single();
      
            if (progressError) {
              console.error('Error fetching user progress:', progressError);
            } else {
              setExercisesCompleted(progressData?.completed_exercises || {});
            }
          }
        } else {
          console.error("User not found");
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchCourseContent();
  }, [courseId, location.search, navigate]);

  const handleCourseCompletion = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    updateProgress(totalLessons, true);  // שימו לב שכאן השתמשנו ב-totalLessons ולא ב-totalLessons - 1
  };


  const getYouTubeEmbedURL = (url) => {
    const videoId = url.split('v=')[1];
    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  };

  const handleExerciseCompletion = (exerciseIndex) => {
    setExercisesCompleted(prev => ({
      ...prev,
      [exerciseIndex]: !prev[exerciseIndex]
    }));
  };

  if (lessons.length === 0) return <div>טוען...</div>;

  const currentLesson = lessons[currentLessonIndex];
  const progressPercentage = (currentLessonIndex / totalLessons) * 100;

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>{currentLesson.title}</PageTitle>
        <CourseProgress>
          שיעור {currentLessonIndex + 1} מתוך {totalLessons}
          <ProgressBar>
            <ProgressFill progress={progressPercentage} />
          </ProgressBar>
          {currentLessonIndex + 1 === totalLessons ? (
            'הגעת לשיעור האחרון בקורס.'
          ) : currentLessonIndex + 1 === totalLessons - 1 ? (
            'נותר שיעור אחד להשלמת הקורס'
          ) : (
            `נותרו ${totalLessons - (currentLessonIndex + 1)} שיעורים להשלמת הקורס`
          )}
        </CourseProgress>
        <PageContent>
  {currentLesson ? (
    <VideoContainer>
      <iframe
        title={`שיעור ${currentLessonIndex}`}
        src={getYouTubeEmbedURL(currentLesson.videoLink)}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </VideoContainer>
  ) : (
    <p>טוען שיעור...</p>
  )}
</PageContent>

        <LessonNavigation>
          <button onClick={handlePrevLesson} disabled={currentLessonIndex === 0}>
            שיעור קודם
          </button>
          {currentLessonIndex === lessons.length - 1 ? (
            <CompletionButton onClick={handleCourseCompletion}>
              סיום קורס
            </CompletionButton>
          ) : (
            <button onClick={handleNextLesson}>
              שיעור הבא
            </button>
          )}
        </LessonNavigation>

        {currentLesson.summary && (
          <SummarySection>
            <h2>סיכום השיעור</h2>
            <p>{currentLesson.summary}</p>
          </SummarySection>
        )}

        {currentLesson.faq && currentLesson.faq.length > 0 && (
          <FAQSection>
            <h2>שאלות ותשובות לשיעור זה</h2>
            <ul>
              {currentLesson.faq.map((faq, index) => (
                <li key={index}>
                  <strong>{faq.question}</strong>
                  <p>{faq.answer}</p>
                </li>
              ))}
            </ul>
          </FAQSection>
        )}

        {currentLesson.exercises && currentLesson.exercises.length > 0 && (
          <ExerciseSection>
            <h2>תרגול עצמי</h2>
            <ul>
              {currentLesson.exercises.map((exercise, index) => (
                <li key={index}>
                  <p>{exercise.description}</p>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={exercisesCompleted[index] || false}
                      onChange={() => handleExerciseCompletion(index)}
                    />
                    סיימתי את התרגיל
                  </CheckboxLabel>
                </li>
              ))}
            </ul>
          </ExerciseSection>
        )}

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