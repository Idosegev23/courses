import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { v4 as uuidv4 } from 'uuid'; // ייבוא uuid

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    direction: rtl;
  }
`;

const PageContainer = styled.div`
  background-color: #f4f4f4;
  min-height: 100vh;
  padding: 2rem;
`;

const FormContainer = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: auto;
`;

const Input = styled.input`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #ddd;
  width: 100%;
`;

const Textarea = styled.textarea`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #ddd;
  width: 100%;
`;

const ActionButton = styled.button`
  background-color: #4caf50;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;
  margin-top: 1rem;

  &:hover {
    background-color: #45a049;
  }
`;

const AddCoursePage = () => {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [coursePrice, setCoursePrice] = useState(''); // שדה לקליטת עלות הקורס
  const [lessonLinks, setLessonLinks] = useState(['']); // Start with one link field
  const [faq, setFaq] = useState([{ question: '', answer: '' }]); // Start with one FAQ
  const navigate = useNavigate();

  const handleAddCourse = async () => {
    // בדיקה שהשדות מלאים
    if (!courseTitle || !courseDescription || !coursePrice || lessonLinks.some(link => !link)) {
      alert('אנא מלא את כל השדות.');
      return;
    }

    try {
      // הוספת הקורס לטבלת הקורסים עם UUID
      const { data, error } = await supabase
        .from('courses')
        .insert([
          { 
            id: uuidv4(), // יצירת UUID חדש עבור הקורס
            title: courseTitle,
            description: courseDescription,
            price: coursePrice, // הוספת עלות הקורס
            lesson_links: lessonLinks,
            faq: faq,
          }
        ]);

      if (error) {
        console.error('Error adding course to database:', error);
        alert(`שגיאה בהוספת הקורס לבסיס הנתונים: ${error.message}`);
        return;
      }

      alert('הקורס נוסף בהצלחה!');
      navigate('/admin-dashboard'); // חזרה לדף האדמין
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('אירעה שגיאה בלתי צפויה.');
    }
  };

  const handleAddLessonLink = () => {
    setLessonLinks([...lessonLinks, '']);
  };

  const handleLessonLinkChange = (index, value) => {
    const newLinks = [...lessonLinks];
    newLinks[index] = value;
    setLessonLinks(newLinks);
  };

  const handleAddFaq = () => {
    setFaq([...faq, { question: '', answer: '' }]);
  };

  const handleFaqChange = (index, field, value) => {
    const newFaq = [...faq];
    newFaq[index][field] = value;
    setFaq(newFaq);
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <FormContainer>
          <h2>הוסף קורס חדש</h2>
          <Input
            type="text"
            placeholder="שם הקורס"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
          />
          <Textarea
            placeholder="תיאור הקורס"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
          />
          <Input
            type="number"
            placeholder="עלות הקורס (בשקלים)"
            value={coursePrice}
            onChange={(e) => setCoursePrice(e.target.value)}
          />
          <h3>קישורי שיעורים:</h3>
          {lessonLinks.map((link, index) => (
            <Input
              key={index}
              type="text"
              placeholder={`קישור לשיעור ${index + 1}`}
              value={link}
              onChange={(e) => handleLessonLinkChange(index, e.target.value)}
            />
          ))}
          <ActionButton onClick={handleAddLessonLink}>הוסף קישור לשיעור</ActionButton>
          <h3>שאלות ותשובות:</h3>
          {faq.map((item, index) => (
            <div key={index}>
              <Input
                type="text"
                placeholder={`שאלה ${index + 1}`}
                value={item.question}
                onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
              />
              <Textarea
                placeholder={`תשובה ${index + 1}`}
                value={item.answer}
                onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
              />
            </div>
          ))}
          <ActionButton onClick={handleAddFaq}>הוסף שאלה ותשובה</ActionButton>
          <ActionButton onClick={handleAddCourse}>שמור קורס</ActionButton>
        </FormContainer>
      </PageContainer>
    </>
  );
};

export default AddCoursePage;
