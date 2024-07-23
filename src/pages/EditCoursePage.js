import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import { Button, TextField, Typography, Box, Checkbox, FormControlLabel, CircularProgress } from '@mui/material';
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
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        setLoading(false);
        return;
      }

      setCourse({
        title: data.title ?? '',
        description: data.description ?? '',
        price: data.price ?? 0,
        discountPrice: data.discountPrice ?? 0,
        discountPercentage: data.discountPercentage ?? 0,
        duration: data.duration ?? '',
        details: data.details ?? '',
        lessons: data.lessons ?? [],
        lesson_links: data.lesson_links ?? [],
        faq: data.faq ?? [],
        is_available: data.is_available ?? false,
        total_lessons: data.total_lessons ?? 0
      });
      setLoading(false);
    };

    fetchCourse();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]: type === 'checkbox' ? checked : value,
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
    const newLessons = [...(course?.lessons ?? [])];
    newLessons[index] = { ...newLessons[index], [name]: value };
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: newLessons,
    }));
  };

  const handleFaqChange = (index, name, value) => {
    const newFaq = [...(course?.faq ?? [])];
    newFaq[index] = { ...newFaq[index], [name]: value };
    setCourse((prevCourse) => ({
      ...prevCourse,
      faq: newFaq,
    }));
  };

  const handleExerciseChange = (lessonIndex, exerciseIndex, name, value) => {
    const newLessons = [...(course?.lessons ?? [])];
    if (newLessons[lessonIndex]?.exercises) {
      newLessons[lessonIndex].exercises[exerciseIndex] = {
        ...newLessons[lessonIndex].exercises[exerciseIndex],
        [name]: value
      };
      setCourse((prevCourse) => ({
        ...prevCourse,
        lessons: newLessons,
      }));
    }
  };

  const addLesson = () => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: [...(prevCourse?.lessons ?? []), { title: '', videoLink: '', duration: '', summary: '', exercises: [] }],
      total_lessons: (prevCourse?.total_lessons ?? 0) + 1
    }));
  };

  const addFaq = () => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      faq: [...(prevCourse?.faq ?? []), { question: '', answer: '' }],
    }));
  };

  const addExercise = (lessonIndex) => {
    const newLessons = [...(course?.lessons ?? [])];
    if (newLessons[lessonIndex]) {
      newLessons[lessonIndex].exercises = [...(newLessons[lessonIndex].exercises ?? []), { description: '', solution: '' }];
      setCourse((prevCourse) => ({
        ...prevCourse,
        lessons: newLessons,
      }));
    }
  };

  const removeLesson = (index) => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      lessons: (prevCourse?.lessons ?? []).filter((_, i) => i !== index),
      total_lessons: Math.max(0, (prevCourse?.total_lessons ?? 1) - 1)
    }));
  };

  const removeFaq = (index) => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      faq: (prevCourse?.faq ?? []).filter((_, i) => i !== index),
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>קורס לא נמצא או שגיאה בטעינה</Typography>
      </Box>
    );
  }

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
            required
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
            label="מחיר מבצע"
            name="discountPrice"
            variant="outlined"
            value={course.discountPrice}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="אחוז הנחה"
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
          <FormControlLabel
            control={
              <Checkbox
                checked={course.is_available}
                onChange={handleChange}
                name="is_available"
              />
            }
            label="הקורס זמין"
          />
          <TextField
            fullWidth
            type="number"
            label="מספר שיעורים כולל"
            name="total_lessons"
            variant="outlined"
            value={course.total_lessons}
            onChange={handleChange}
            margin="normal"
          />

          {(course?.lessons ?? []).map((lesson, index) => (
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
              {(lesson?.exercises ?? []).map((exercise, exerciseIndex) => (
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
                startIcon={<AddIcon />}
                onClick={() => addExercise(index)}
                sx={{ mt: 2 }}
              >
                הוסף תרגיל
              </Button>
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

          {(course?.faq ?? []).map((faqItem, index) => (
            <Box key={index} sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
              <TextField
                fullWidth
                label={`שאלה ${index + 1}`}
                variant="outlined"
                value={faqItem.question}
                onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label={`תשובה ${index + 1}`}
                variant="outlined"
                value={faqItem.answer}
                onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                margin="normal"
              />
              <Button
                startIcon={<RemoveIcon />}
                onClick={() => removeFaq(index)}
                sx={{ mt: 2 }}
                color="error"
              >
                הסר שאלה ותשובה
              </Button>
            </Box>
          ))}
          <ActionButton
            startIcon={<AddIcon />}
            onClick={addFaq}
            sx={{ mt: 2 }}
          >
            הוסף שאלה ותשובה
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