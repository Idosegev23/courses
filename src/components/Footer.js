import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

const FooterContainer = styled.footer`
  padding: 1rem;
  text-align: center;
  background-color: #62238C;
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

const SocialContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  color: #fff;
  margin: 0 0.5rem;
  font-size: 1.5rem;
  transition: color 0.3s;

  &:hover {
    color: #BF4B81;
  }
`;

const Footer = () => (
  <FooterContainer>
    <p>&copy; 2024 TriRoars - נבנה בעזרת AI</p>
    <FooterLink to="/">חזרה לדף הבית</FooterLink>
    <FooterLink to="/contact-and-policy">פרטי קשר ותקנון ביטולים</FooterLink>
    <SocialContainer>
      <SocialLink href="https://www.facebook.com/profile.php?id=61553596496338" target="_blank" aria-label="Facebook">
        <FaFacebook />
      </SocialLink>
      <SocialLink href="https://www.instagram.com/triroars/" target="_blank" aria-label="Instagram">
        <FaInstagram />
      </SocialLink>
      <SocialLink href="https://www.tiktok.com/@triroars" target="_blank" aria-label="Tiktok">
        <FaTiktok />
      </SocialLink>
      <SocialLink href="https://chat.whatsapp.com/Er9gUVQ0zxsF1BDSQlCbMC" target="_blank" aria-label="Whatsapp">
        <FaWhatsapp />
      </SocialLink>
    </SocialContainer>
  </FooterContainer>
);

export default Footer;
