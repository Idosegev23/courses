import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { Typography, Container } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const SectionContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ContactAndPolicyPage = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageContainer maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h2" component="h1" gutterBottom color="primary" align="center" sx={{
            fontWeight: 'bold',
            marginBottom: 4,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            פרטי קשר ותקנון ביטולים
          </Typography>

          <SectionContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Typography variant="h4" gutterBottom color="secondary">
              פרטי קשר
            </Typography>
            <Typography variant="body1" paragraph>
              טלפון: 054-7667775<br />
              אימייל: Triroars@gmail.com<br />
              כתובת: צבי סגל 20א, אשקלון, ישראל
            </Typography>
          </SectionContainer>

          <SectionContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Typography variant="h4" gutterBottom color="secondary">
              תקנון ביטולים
            </Typography>
            <Typography variant="body1" paragraph>
              ניתן לבטל את רכישת הקורס בתוך 14 יום ממועד הרכישה, בתנאי שהקורס לא נפתח או נצפה. הביטול יעשה בהודעה בכתב לכתובת האימייל שלנו. לאחר קבלת הודעת הביטול, יוחזר סכום הרכישה בתוך 14 ימי עסקים לאמצעי התשלום ממנו בוצעה הרכישה.
            </Typography>
          </SectionContainer>

          <SectionContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Typography variant="h4" gutterBottom color="secondary">
              מדיניות אספקת קורסים
            </Typography>
            <Typography variant="body1" paragraph>
              הקורסים יהיו זמינים לצפייה מיד לאחר השלמת תהליך הרכישה ואישור התשלום. הגישה לקורסים תינתן דרך חשבון המשתמש באתר.
            </Typography>
          </SectionContainer>

          <SectionContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Typography variant="h4" gutterBottom color="secondary">
              הגבלת גיל
            </Typography>
            <Typography variant="body1" paragraph>
              תנאי לרכישה באתר כי הרוכש הינו בן 18 שנים ומעלה.
            </Typography>
          </SectionContainer>

          <SectionContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <Typography variant="h4" gutterBottom color="secondary">
              אחריות המוצר
            </Typography>
            <Typography variant="body1" paragraph>
              החברה ו/או מי מטעמה לא יהיו אחראים לנזק ישיר ו/או עקיף שיגרם כתוצאה משימוש בקורסים הנרכשים באתר. כל מידע שנמסר באתר אינו מהווה ייעוץ מקצועי. האחריות על השימוש במידע שיימצא באתר היא על המשתמש בלבד.
            </Typography>
          </SectionContainer>

          <SectionContainer
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            <Typography variant="h4" gutterBottom color="secondary">
              פרטיות
            </Typography>
            <Typography variant="body1" paragraph>
              החנות נוקטת באמצעי זהירות מקובלים על מנת לשמור, ככל האפשר, על סודיות המידע. החנות מתחייבת לא לעשות שימוש בפרטי הלקוחות הרשומים באתר אלא לצרכי תפעול האתר בלבד, ועל מנת לאפשר את ביצוע הרכישה.
            </Typography>
          </SectionContainer>
        </motion.div>
      </PageContainer>
    </ThemeProvider>
  );
};

export default ContactAndPolicyPage;
