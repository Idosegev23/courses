import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import { Button, TextField, Typography, Box } from '@mui/material';
import newLogo from '../components/NewLogo_BLANK-outer.png';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#62238C',
    },
    secondary: {
      main: '#BF4B81',
    },
  },
  typography: {
    fontFamily: 'Heebo, sans-serif',
  },
});

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

const ActionButton = styled(Button)`
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-size: 1.2rem;
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
    discountPrice: 0,
    discountPercentage: 0,
    duration: '',
    details: '',
    lessons: [{ title: '', videoLink: '', duration: '', summary: '', faq: [], exercises: [] }],
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
        discountPrice: data.discountPrice || 0,
        discountPercentage: data.discountPercentage || 0,
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

    if (name === 'price' || name === 'discountPrice' || name === 'discountPercentage') {
      handleDiscountCalculation(name, value);
    }
  };

  const handleDiscountCalculation = (name, value) => {
    let newCourse = { ...course, [name]: value };

    if (name === 'price') {
      if (course.discountPrice) {
        newCourse.discountPercentage = calculateDiscountPercentage(value, course.discountPrice);
      }
    } else if (name === 'discountPrice') {
      if (course.price) {
        newCourse.discountPercentage = calculateDiscountPercentage(course.price, value);
      }
    } else if (name === 'discountPercentage') {
      if (course.price) {
        newCourse.discountPrice = calculateDiscountPrice(course.price, value);
      }
    }

    setCourse(newCourse);
  };

  const calculateDiscountPercentage = (price, discountPrice) => {
    if (price && discountPrice) {
      return ((price - discountPrice) / price * 100).toFixed(2);
    }
    return '';
  };

  const calculateDiscountPrice = (price, discountPercentage) => {
    if (price && discountPercentage) {
      return (price - (price * discountPercentage / 100)).toFixed(2);
    }
    return '';
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

  const handleExerciseChange = (lessonIndex, exerciseIndex, name, value) => {
    const newLessons = [...course.lessons];
    newLessons[lessonIndex].exercises[exerciseIndex][name] = value;
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: newLessons,
    }));
  };

  const addLesson = () => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: [...prevCourse.lessons, { title: '', videoLink: '', duration: '', summary: '', faq: [], exercises: [] }],
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

  const addExercise = (lessonIndex) => {
    const newLessons = [...course.lessons];
    newLessons[lessonIndex].exercises.push({ description: '', solution: '' });
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
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageContainer>
        <Typography variant="h4" component="h1" gutterBottom color="primary" align="center">
          ערוך קורס
        </Typography>
        <Form onSubmit={handleCourseUpdate}>
          <TextField
            fullWidth
            label="כותרת הקורס"
            name="title"
            variant="outlined"
            value={course.title}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="תיאור הקורס"
            name="description"
            variant="outlined"
            value={course.description}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="מחיר הקורס"
            name="price"
            variant="outlined"
            value={course.price}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="מחיר מבצע (אופציונלי)"
            name="discountPrice"
            variant="outlined"
            value={course.discountPrice}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="אחוז הנחה (אופציונלי)"
            name="discountPercentage"
            variant="outlined"
            value={course.discountPercentage}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="משך הקורס הכולל"
            name="duration"
            variant="outlined"
            value={course.duration}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="פרטים נוספים"
            name="details"
            variant="outlined"
            value={course.details}
            onChange={handleChange}
            margin="normal"
          />

          {course.lessons.map((lesson, index) => (
            <Box key={index} sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="h6" gutterBottom>{`שיעור ${index + 1}`}</Typography>
              <TextField
                fullWidth
                label={`כותרת השיעור ${index + 1}`}
                variant="outlined"
                value={lesson.title}
                onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label={`קישור וידאו לשיעור ${index + 1}`}
                variant="outlined"
                value={lesson.videoLink}
                onChange={(e) => handleLessonChange(index, 'videoLink', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                type="number"
                label={`משך השיעור ${index + 1} (בדקות)`}
                variant="outlined"
                value={lesson.duration}
                onChange={(e) => handleLessonChange(index, 'duration', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="סיכום השיעור"
                variant="outlined"
                value={lesson.summary}
                onChange={(e) => handleLessonChange(index, 'summary', e.target.value)}
                margin="normal"
              />
              <Button
                startIcon={<AddIcon />}
                onClick={() => addFaq(index)}
                sx={{ mt: 2 }}
              >
                הוסף שאלה ותשובה
              </Button>
              {lesson.faq.map((faqItem, faqIndex) => (
                <Box key={faqIndex} sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
                  <TextField
                    fullWidth
                    label={`שאלה ${faqIndex + 1}`}
                    variant="outlined"
                    value={faqItem.question}
                    onChange={(e) => handleFaqChange(index, faqIndex, 'question', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={`תשובה ${faqIndex + 1}`}
                    variant="outlined"
                    value={faqItem.answer}
                    onChange={(e) => handleFaqChange(index, faqIndex, 'answer', e.target.value)}
                    margin="normal"
                  />
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => addExercise(index)}
                sx={{ mt: 2 }}
              >
                הוסף תרגיל
              </Button>
              {lesson.exercises.map((exercise, exerciseIndex) => (
                <Box key={exerciseIndex} sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
                  <TextField
                    fullWidth
                    label={`תיאור התרגיל ${exerciseIndex + 1}`}
                    variant="outlined"
                    value={exercise.description}
                    onChange={(e) => handleExerciseChange(index, exerciseIndex, 'description', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={`פתרון התרגיל ${exerciseIndex + 1}`}
                    variant="outlined"
                    value={exercise.solution}
                    onChange={(e) => handleExerciseChange(index, exerciseIndex, 'solution', e.target.value)}
                    margin="normal"
                  />
                </Box>
              ))}
              <Button
                startIcon={<RemoveIcon />}
                onClick={() => removeLesson(index)}
                sx={{ mt: 2 }}
                color="error"
              >
                הסר שיעור
              </Button>
            </Box>
          ))}
          <ActionButton
            startIcon={<AddIcon />}
            onClick={addLesson}
            sx={{ mt: 2 }}
          >
            הוסף שיעור
          </ActionButton>
          <ActionButton
            type="submit"
            sx={{ mt: 2 }}
          >
            עדכן קורס
          </ActionButton>
        </Form>
      </PageContainer>
    </ThemeProvider>
  );
};

export default EditCoursePage;
