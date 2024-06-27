import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { createGlobalStyle } from 'styled-components';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Container, Typography, TextField, Button, Box, 
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import newLogo from '../components/NewLogo_BLANK-outer.png';

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
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700&display=swap');
  
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #ffffff;
    direction: rtl;
    margin: 0;
    padding: 0;
  }
`;

const PageContainer = styled(Container)`
  padding: 2rem;
  background: #ffffff;
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

const AddCoursePage = () => {
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    discountPercentage: '',
    duration: '',
    details: '',
    lessons: [{ title: '', videoLink: '', duration: '', faq: [], exercises: [], summary: '' }],
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
    if (name === 'videoLink' && isValidUrl(value)) {
      fetchVideoDuration(value, index);
    } else {
      setCourse((prevCourse) => ({
        ...prevCourse,
        lessons: newLessons,
      }));
      setErrors((prevErrors) => ({ ...prevErrors, [`lesson_${index}_${name}`]: '' }));
    }
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
      lessons: [...prevCourse.lessons, { title: '', videoLink: '', duration: '', faq: [], exercises: [], summary: '' }],
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
    if (course.discountPrice && isNaN(course.discountPrice)) newErrors.discountPrice = 'נא להזין מחיר הנחה תקין';
    
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

  const fetchVideoDuration = async (videoLink, index) => {
    const videoId = extractVideoId(videoLink);
    const apiKey = process.env.REACT_APP_GOOGLE_API;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      const duration = data.items[0].contentDetails.duration;
      const formattedDuration = formatDuration(duration);
      handleLessonChange(index, 'duration', formattedDuration);
    } catch (error) {
      console.error('Error fetching video duration:', error);
    }
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    return (hours * 60 + minutes + seconds / 60).toFixed(2);
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
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageContainer maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" component="h1" gutterBottom color="primary" align="center">
            הוספת קורס חדש
          </Typography>
          <Box component="form" onSubmit={handleCourseCreation} noValidate sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="כותרת הקורס"
              name="title"
              value={course.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="תיאור הקורס"
              name="description"
              value={course.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              margin="normal"
            />
            <TextField
              fullWidth
              type="number"
              label="מחיר הקורס"
              name="price"
              value={course.price}
              onChange={handleChange}
              error={!!errors.price}
              helperText={errors.price}
              margin="normal"
            />
            <TextField
              fullWidth
              type="number"
              label="מחיר מבצע (אופציונלי)"
              name="discountPrice"
              value={course.discountPrice}
              onChange={handleChange}
              error={!!errors.discountPrice}
              helperText={errors.discountPrice}
              margin="normal"
            />
            <TextField
              fullWidth
              type="number"
              label="אחוז הנחה (אופציונלי)"
              name="discountPercentage"
              value={course.discountPercentage}
              onChange={handleChange}
              error={!!errors.discountPercentage}
              helperText={errors.discountPercentage}
              margin="normal"
            />
            <TextField
              fullWidth
              label="משך הקורס הכולל"
              value={course.duration}
              InputProps={{
                readOnly: true,
              }}
              margin="normal"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="פרטים נוספים"
              name="details"
              value={course.details}
              onChange={handleChange}
              margin="normal"
            />

            {course.lessons.map((lesson, index) => (
              <Accordion key={index} sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{`שיעור ${index + 1}`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TextField
                    fullWidth
                    label="כותרת השיעור"
                    value={lesson.title}
                    onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                    error={!!errors[`lesson_${index}_title`]}
                    helperText={errors[`lesson_${index}_title`]}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="קישור לוידאו"
                    value={lesson.videoLink}
                    onChange={(e) => handleLessonChange(index, 'videoLink', e.target.value)}
                    error={!!errors[`lesson_${index}_videoLink`]}
                    helperText={errors[`lesson_${index}_videoLink`]}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="משך השיעור (בשעות)"
                    value={lesson.duration}
                    onChange={(e) => handleLessonChange(index, 'duration', e.target.value)}
                    error={!!errors[`lesson_${index}_duration`]}
                    helperText={errors[`lesson_${index}_duration`]}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="סיכום השיעור"
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
                        label="שאלה"
                        value={faqItem.question}
                        onChange={(e) => handleFaqChange(index, faqIndex, 'question', e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="תשובה"
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
                        label="תיאור התרגיל"
                        value={exercise.description}
                        onChange={(e) => handleExerciseChange(index, exerciseIndex, 'description', e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="פתרון התרגיל"
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
                </AccordionDetails>
              </Accordion>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addLesson}
              sx={{ mt: 2 }}
            >
              הוסף שיעור
            </Button>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              צור קורס
            </Button>
          </Box>
        </motion.div>
      </PageContainer>
    </ThemeProvider>
  );
};

export default AddCoursePage;
