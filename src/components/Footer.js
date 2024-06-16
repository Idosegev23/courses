import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  padding: 1rem;
  text-align: center;
  background-color: #F25C78;
  color: #fff;
  border-radius: 1rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const FooterLink = styled(Link)`
  color: #fff;
  margin: 0 0.5rem;
  text-decoration: underline;

  &:hover {
    color: #BF4B81;
  }
`;

const Footer = () => (
  <FooterContainer>
    <p>&copy; 2024 TriRoars - נבנה בעזרת AI</p>
    <FooterLink to="/">חזרה לדף הבית</FooterLink>
  </FooterContainer>
);

export default Footer;
