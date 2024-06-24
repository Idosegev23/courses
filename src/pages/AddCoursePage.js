import React, { useState, useEffect } from 'react';
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
  max-width: 800px;
  margin: 0 auto;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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
  font-size: 2.5rem;
  font-weight: bold;
  color: #F25C78;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  color: #333;
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
  min-height: 100px;
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  color: #fff;
  background-color: ${props => props.secondary ? '#3498db' : '#F25C78'};
  transition: background-color 0.3s, transform 0.3s;
  font-size: 1rem;
  cursor: pointer;
  align-self: ${props => props.alignRight ? 'flex-end' : 'flex-start'};

  &:hover {
    background-color: ${props => props.secondary ? '#2980b9' : '#BF4B81'};
    transform: translateY(-2px);
  }
`;

const LessonContainer = styled.div`
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const FaqContainer = styled.div`
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
`;

const ErrorMessage = styled.span`
  color: red;
  font-size: 0.875rem;
`;

const AddCoursePage = () => {
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    details: '',
    lessons: [{ title: '', videoLink: '', duration: '', faq: [] }],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    calculateTotalDuration();
  }, [course.lessons]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleLessonChange = (index, name, value) => {
    const newLessons = [...course.lessons];
    newLessons[index][name] = value;
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: newLessons,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [`lesson_${index}_${name}`]: '' }));
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
      lessons: [...prevCourse.lessons, { title: '', videoLink: '', duration: '', faq: [] }],
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

  const calculateTotalDuration = () => {
    const totalMinutes = course.lessons.reduce((total, lesson) => {
      const duration = parseFloat(lesson.duration) || 0;
      return total + duration;
    }, 0);
    
    const hours = (totalMinutes / 60).toFixed(2);
    
    setCourse(prevCourse => ({
      ...prevCourse,
      duration: `${hours} שעות`
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!course.title.trim()) newErrors.title = 'שדה חובה';
    if (!course.description.trim()) newErrors.description = 'שדה חובה';
    if (!course.price || isNaN(course.price)) newErrors.price = 'נא להזין מחיר תקין';
    
    course.lessons.forEach((lesson, index) => {
      if (!lesson.title.trim()) newErrors[`lesson_${index}_title`] = 'שדה חובה';
      if (!lesson.videoLink.trim()) {
        newErrors[`lesson_${index}_videoLink`] = 'שדה חובה';
      } else if (!isValidUrl(lesson.videoLink)) {
        newErrors[`lesson_${index}_videoLink`] = 'נא להזין קישור תקין';
      }
      if (!lesson.duration || isNaN(lesson.duration)) {
        newErrors[`lesson_${index}_duration`] = 'נא להזין משך זמן תקין בשעות';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleCourseCreation = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const { error } = await supabase.from('courses').insert([course]);
        if (error) throw error;
        alert('הקורס נוצר בהצלחה!');
        // כאן תוכל להוסיף ניווט לדף אחר או לאפס את הטופס
      } catch (error) {
        console.error('שגיאה ביצירת הקורס:', error);
        alert('אירעה שגיאה ביצירת הקורס. אנא נסה שנית.');
      }
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>הוספת קורס חדש</PageTitle>
        <Form onSubmit={handleCourseCreation}>
          <FormSection>
            <Label htmlFor="title">כותרת הקורס</Label>
            <Input
              id="title"
              name="title"
              value={course.title}
              onChange={handleChange}
            />
            {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
          </FormSection>

          <FormSection>
            <Label htmlFor="description">תיאור הקורס</Label>
            <Textarea
              id="description"
              name="description"
              value={course.description}
              onChange={handleChange}
            />
            {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
          </FormSection>

          <FormSection>
            <Label htmlFor="price">מחיר הקורס</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={course.price}
              onChange={handleChange}
            />
            {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
          </FormSection>

          <FormSection>
            <Label>משך הקורס הכולל</Label>
            <Input
              value={course.duration}
              readOnly
            />
          </FormSection>

          <FormSection>
            <Label htmlFor="details">פרטים נוספים</Label>
            <Textarea
              id="details"
              name="details"
              value={course.details}
              onChange={handleChange}
            />
          </FormSection>

          {course.lessons.map((lesson, index) => (
            <LessonContainer key={index}>
              <h3>שיעור {index + 1}</h3>
              <FormSection>
                <Label htmlFor={`lesson_${index}_title`}>כותרת השיעור</Label>
                <Input
                  id={`lesson_${index}_title`}
                  value={lesson.title}
                  onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                />
                {errors[`lesson_${index}_title`] && <ErrorMessage>{errors[`lesson_${index}_title`]}</ErrorMessage>}
              </FormSection>

              <FormSection>
                <Label htmlFor={`lesson_${index}_videoLink`}>קישור לוידאו</Label>
                <Input
                  id={`lesson_${index}_videoLink`}
                  value={lesson.videoLink}
                  onChange={(e) => handleLessonChange(index, 'videoLink', e.target.value)}
                />
                {errors[`lesson_${index}_videoLink`] && <ErrorMessage>{errors[`lesson_${index}_videoLink`]}</ErrorMessage>}
              </FormSection>

              <FormSection>
                <Label htmlFor={`lesson_${index}_duration`}>משך השיעור (בשעות)</Label>
                <Input
                  id={`lesson_${index}_duration`}
                  type="number"
                  step="0.01"
                  value={lesson.duration}
                  onChange={(e) => handleLessonChange(index, 'duration', e.target.value)}
                />
                {errors[`lesson_${index}_duration`] && <ErrorMessage>{errors[`lesson_${index}_duration`]}</ErrorMessage>}
              </FormSection>

              <Button type="button" onClick={() => addFaq(index)} secondary>
                הוסף שאלה ותשובה
              </Button>

              {lesson.faq.map((faqItem, faqIndex) => (
                <FaqContainer key={faqIndex}>
                  <FormSection>
                    <Label htmlFor={`lesson_${index}_faq_${faqIndex}_question`}>שאלה</Label>
                    <Input
                      id={`lesson_${index}_faq_${faqIndex}_question`}
                      value={faqItem.question}
                      onChange={(e) => handleFaqChange(index, faqIndex, 'question', e.target.value)}
                    />
                  </FormSection>
                  <FormSection>
                    <Label htmlFor={`lesson_${index}_faq_${faqIndex}_answer`}>תשובה</Label>
                    <Textarea
                      id={`lesson_${index}_faq_${faqIndex}_answer`}
                      value={faqItem.answer}
                      onChange={(e) => handleFaqChange(index, faqIndex, 'answer', e.target.value)}
                    />
                  </FormSection>
                </FaqContainer>
              ))}

              <Button type="button" onClick={() => removeLesson(index)} secondary alignRight>
                הסר שיעור
              </Button>
            </LessonContainer>
          ))}

          <Button type="button" onClick={addLesson} secondary>
            הוסף שיעור
          </Button>

          <Button type="submit">צור קורס</Button>
        </Form>
      </PageContainer>
    </>
  );
};

export default AddCoursePage;