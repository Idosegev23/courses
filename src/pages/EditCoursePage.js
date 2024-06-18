// src/pages/EditCoursePage.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ActionButton = styled.button`
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

const EditCoursePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: 0,
    duration: '',
    details: '',
    lessons: [{ title: '', videoLink: '', faq: [] }],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('Error fetching course:', error);
        return;
      }

      setCourse({
        title: data.title,
        description: data.description,
        price: data.price,
        duration: data.duration,
        details: data.details,
        lessons: data.lessons || [],
      });
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value,
    }));
  };

  const handleLessonChange = (index, name, value) => {
    const newLessons = [...course.lessons];
    newLessons[index][name] = value;
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: newLessons,
    }));
  };

  const handleFaqChange = (lessonIndex, faqIndex, name, value) => {
    const newLessons = [...course.lessons];
    newLessons[lessonIndex].faq[faqIndex][name] = value;
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: newLessons,
    }));
  };

  const addLesson = () => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: [...prevCourse.lessons, { title: '', videoLink: '', faq: [] }],
    }));
  };

  const addFaq = (lessonIndex) => {
    const newLessons = [...course.lessons];
    newLessons[lessonIndex].faq.push({ question: '', answer: '' });
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: newLessons,
    }));
  };

  const removeLesson = (index) => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: prevCourse.lessons.filter((_, i) => i !== index),
    }));
  };

  const handleCourseUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', courseId);

    if (error) {
      console.error('Error updating course:', error);
      alert(`שגיאה בעדכון הקורס: ${error.message}`);
      return;
    }

    alert('הקורס עודכן בהצלחה!');
    navigate('/admin-dashboard');
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>ערוך קורס</PageTitle>
        <Form onSubmit={handleCourseUpdate}>
          <Input
            type="text"
            name="title"
            placeholder="כותרת הקורס"
            value={course.title}
            onChange={handleChange}
          />
          <Textarea
            name="description"
            placeholder="תיאור הקורס"
            value={course.description}
            onChange={handleChange}
          />
          <Input
            type="number"
            name="price"
            placeholder="מחיר הקורס"
            value={course.price}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="duration"
            placeholder="משך הקורס"
            value={course.duration}
            onChange={handleChange}
          />
          <Textarea
            name="details"
            placeholder="פרטים נוספים"
            value={course.details}
            onChange={handleChange}
          />
          {course.lessons.map((lesson, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <h3>שיעור {index + 1}</h3>
              <Input
                type="text"
                placeholder={`כותרת השיעור ${index + 1}`}
                value={lesson.title}
                onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
              />
              <Input
                type="text"
                placeholder={`קישור וידאו לשיעור ${index + 1}`}
                value={lesson.videoLink}
                onChange={(e) => handleLessonChange(index, 'videoLink', e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ActionButton type="button" onClick={() => addFaq(index)}>
                  הוסף שאלות ותשובות לשיעור
                </ActionButton>
                <div style={{ textAlign: 'right' }}>
                  <ActionButton type="button" onClick={() => removeLesson(index)}>
                    🗑️ הסר שיעור
                  </ActionButton>
                </div>
              </div>
              {lesson.faq.map((faqItem, faqIndex) => (
                <div key={faqIndex} style={{ marginBottom: '0.5rem' }}>
                  <Input
                    type="text"
                    placeholder={`שאלה ${faqIndex + 1}`}
                    value={faqItem.question}
                    onChange={(e) => handleFaqChange(index, faqIndex, 'question', e.target.value)}
                  />
                  <Textarea
                    placeholder={`תשובה ${faqIndex + 1}`}
                    value={faqItem.answer}
                    onChange={(e) => handleFaqChange(index, faqIndex, 'answer', e.target.value)}
                  />
                </div>
              ))}
            </div>
          ))}
          <ActionButton type="button" onClick={addLesson}>הוסף שיעור</ActionButton>
          <ActionButton type="submit">עדכן קורס</ActionButton>
        </Form>
      </PageContainer>
    </>
  );
};

export default EditCoursePage;
