import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CoursePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('Error fetching course:', error);
      } else {
        setCourse(data);
      }
      setLoading(false);
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return <div>טוען...</div>;
  }

  if (!course) {
    return <div>לא נמצאו פרטים עבור הקורס המבוקש.</div>;
  }

  // מטפל במקרה שבו השדה lessons הוא null או לא קיים
  const lessons = course.lessons || [];

  return (
    <div className="course-page">
      <h1 className="course-title">{course.title}</h1>
      <p className="course-description">{course.description}</p>
      <h2>רשימת שיעורים:</h2>
      {lessons.length > 0 ? (
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.number}>
              <h3>{lesson.title}</h3>
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                width="560"
                height="315"
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <h4>שאלות ותשובות:</h4>
              <ul>
                {lesson.faq.map((qa, index) => (
                  <li key={index}>
                    <strong>שאלה:</strong> {qa.question}
                    <br />
                    <strong>תשובה:</strong> {qa.answer}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>אין שיעורים זמינים עבור הקורס הזה.</p>
      )}
    </div>
  );
};

export default CoursePage;
