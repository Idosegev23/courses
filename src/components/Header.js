import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import newLogo from '../components/NewLogo_BLANK.png';
import { useAuth } from '../hooks/useAuth'; // לוודא שהמיקום נכון

const HeaderContainer = styled.header`
  background-color: #ffffff;
  padding: 2rem 1rem;
  text-align: center;
  border-bottom: 1px solid #f2d1b3;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
`;

const LogoImage = styled.img`
  width: 150px;
  height: auto;
  display: block;
  margin: 0 auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 4rem;
  margin-top: 1rem;
`;

const StyledButton = styled(Link)`
  background: none;
  padding: 15px;
  border-radius: 50px;
  display: inline-block;
  font-family: 'Glamour Absolute', sans-serif;
  color: #F25C78;
  text-decoration: none;
  font-weight: 100;
  font-size: 1.25rem;
  letter-spacing: 1px;
  border: 2px solid #F25C78;
  transition: all 0.3s ease-in-out;
  position: relative;
  
  &:hover {
    color: #BF4B81;
    border: 2px solid #BF4B81;
  }

  &::before,
  &::after {
    content: "";
    width: 16px;
    height: 16px;
    border-style: solid;
    border-width: 2px 0 0 2px;
    border-color: #F25C78;
    position: absolute;
    top: -6px;
    left: -6px;
    transition: all 0.3s ease-in-out;
  }

  &::after {
    border-width: 0 2px 2px 0;
    top: auto;
    bottom: -6px;
    left: auto;
    right: -6px;
  }

  &:hover::before,
  &:hover::after {
    width: calc(100% + 12px);
    height: calc(100% + 12px);
    border-color: #BF4B81;
    transform: rotateY(180deg);
  }
`;

const Header = () => {
  const { user, signOut } = useAuth();

  // בדיקה אם המשתמש הוא האדמין
  const isAdmin = user && user.email === 'triroars@gmail.com';

  return (
    <HeaderContainer>
      <LogoImage src={newLogo} alt="TriRoars Logo" />
      <ButtonContainer>
        <StyledButton to="/">דף הבית</StyledButton>
        {user ? (
          <>
            <StyledButton to="/personal-area">איזור אישי</StyledButton>
            {isAdmin && (
              <StyledButton to="/admin-dashboard">אזור אדמין</StyledButton>
            )}
            <StyledButton as="button" onClick={signOut}>התנתק</StyledButton>
          </>
        ) : (
          <StyledButton to="/login">התחברות</StyledButton>
        )}
        <StyledButton to="/courses">הקורסים</StyledButton>
      </ButtonContainer>
    </HeaderContainer>
  );
};

export default Header;
