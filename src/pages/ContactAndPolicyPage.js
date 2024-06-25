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
              לא ניתן לבטל את הרכישה או לבקש החזר כספי. כל ההזמנות הן סופיות.
            </Typography>
          </SectionContainer>
        </motion.div>
      </PageContainer>
    </ThemeProvider>
  );
};

export default ContactAndPolicyPage;