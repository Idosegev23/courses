// src/pages/ContactAndPolicyPage.js
import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

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
  max-width: 800px;
  margin: 0 auto;
  border-radius: 2rem;
  position: relative;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #F25C78;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
`;

const Paragraph = styled.p`
  font-size: 1rem;
  color: #333;
  margin-bottom: 1rem;
  text-align: justify;
`;

const ContactAndPolicyPage = () => {
  return (
    <PageContainer>
      <GlobalStyle />
      <PageTitle>פרטי קשר ותקנון ביטולים</PageTitle>
      <SectionTitle>פרטי קשר</SectionTitle>
      <Paragraph>
        טלפון: 054-7667775<br />
        אימייל: Triroars@gmail.com<br />
        כתובת: צבי סגל 20א, אשקלון, ישראל
      </Paragraph>
      <SectionTitle>תקנון ביטולים</SectionTitle>
      <Paragraph>
        לא ניתן לבטל את הרכישה או לבקש החזר כספי. כל ההזמנות הן סופיות.
      </Paragraph>
    </PageContainer>
  );
};

export default ContactAndPolicyPage;
