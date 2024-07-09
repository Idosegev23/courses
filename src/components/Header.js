import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import newLogo from '../components/NewLogo_BLANK.png';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

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
  gap: 2rem;
  margin-top: 1rem;
`;

const StyledButton = styled(Link)`
  background: none;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  display: inline-block;
  font-family: 'Heebo', sans-serif;
  color: #62238C;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  border: 2px solid #62238C;
  transition: all 0.3s ease-in-out;
  position: relative;
  cursor: pointer;

  &:hover {
    color: #6DBFF2;
    border: 2px solid #6DBFF2;
  }

  &::before,
  &::after {
    content: "";
    width: 16px;
    height: 16px;
    border-style: solid;
    border-width: 2px 0 0 2px;
    border-color: #62238C;
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
    border-color: #6DBFF2;
    transform: rotateY(180deg);
  }
`;

const StyledSignOutButton = styled.button`
  background: none;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  display: inline-block;
  font-family: 'Heebo', sans-serif;
  color: #62238C;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  border: 2px solid #62238C;
  transition: all 0.3s ease-in-out;
  position: relative;
  cursor: pointer;

  &:hover {
    color: #6DBFF2;
    border: 2px solid #6DBFF2;
  }

  &::before,
  &::after {
    content: "";
    width: 16px;
    height: 16px;
    border-style: solid;
    border-width: 2px 0 0 2px;
    border-color: #62238C;
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
    border-color: #6DBFF2;
    transform: rotateY(180deg);
  }
`;

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully.");
      Swal.fire({
        title: 'התנתקת בהצלחה',
        icon: 'success',
        confirmButtonText: 'אישור'
      }).then(() => {
        navigate('/'); // ניווט לדף הבית לאחר התנתקות מוצלחת
      });
    } catch (error) {
      console.error("Error signing out:", error);
      Swal.fire({
        title: 'שגיאה בהתנתקות',
        text: 'אנא נסה שוב מאוחר יותר',
        icon: 'error',
        confirmButtonText: 'אישור'
      });
    }
  };

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
            <StyledSignOutButton onClick={handleSignOut}>התנתק</StyledSignOutButton>
          </>
        ) : (
          <StyledButton to="/login">התחברות</StyledButton>
        )}
      </ButtonContainer>
    </HeaderContainer>
  );
};

export default Header;
