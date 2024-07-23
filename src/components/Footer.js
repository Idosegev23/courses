import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

const FooterContainer = styled.footer`
  padding: 1rem;
  text-align: center;
  background-color: #62238C;
  color: #fff;
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

const ContactButton = styled.button`
  color: #fff;
  margin: 0 0.5rem;
  text-decoration: underline;
  background: none;
  border: none;
  font-size: inherit;
  cursor: pointer;
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

const Separator = styled.span`
  margin: 0 0.5rem;
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopupContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  padding: 0.5rem;
  margin: 0.5rem 0;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  margin: 0.5rem 0;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  height: 100px;
`;

const SubmitButton = styled.button`
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #BF4B81;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #A33A6A;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Footer = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
  
    try {
      const response = await fetch('http://localhost:3001/api/send-mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error('שליחת המייל נכשלה');
      }
  
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      setError('אירעה שגיאה בשליחת ההודעה, אנא נסה שוב מאוחר יותר');
    } finally {
      setLoading(false);
    }
  };
  
    return (
    <>
      <FooterContainer>
        <p>&copy; 2024 TriRoars - נבנה בעזרת AI</p>
        <FooterLink to="/">חזרה לדף הבית</FooterLink>
        <Separator>|</Separator>
        <FooterLink to="/contact-and-policy">פרטי קשר ותקנון ביטולים</FooterLink>
        <Separator>|</Separator>
        <ContactButton onClick={() => setShowPopup(true)}>צור קשר</ContactButton>
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

      {showPopup && (
        <PopupOverlay>
          <PopupContent>
            <CloseButton onClick={() => setShowPopup(false)}>&times;</CloseButton>
            <h2>צור קשר</h2>
            <ContactForm onSubmit={handleSubmit}>
              <Input 
                type="text" 
                name="name" 
                placeholder="שם" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
              <Input 
                type="email" 
                name="email" 
                placeholder="אימייל" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
              <TextArea 
                name="message" 
                placeholder="הודעה" 
                value={formData.message} 
                onChange={handleChange} 
                required
              ></TextArea>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? 'שולח...' : 'שלח'}
              </SubmitButton>
              {success && <p>ההודעה נשלחה בהצלחה!</p>}
              {error && <p>{error}</p>}
            </ContactForm>
          </PopupContent>
        </PopupOverlay>
      )}
    </>
  );
};

export default Footer;