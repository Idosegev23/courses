import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import newLogo from '../components/NewLogo_BLANK.png';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';
import { usePopup } from '../PopupContext';

const HeaderContainer = styled.header`
  background-color: #8b81a8; /* Faded purple */
  padding: 1rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  border-bottom: 1px solid #f2d1b3;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-self: start;
`;

const LogoImage = styled.img`
  width: 125px;
  height: auto;
`;

const NavContainer = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;

const UserContainer = styled.div`
  justify-self: end;
`;

const StyledButton = styled(Link)`
  background: none;
  padding: 0.75rem 1.5rem; /* Increased button size */
  border-radius: 0.5rem;
  font-family: 'Heebo', sans-serif;
  color: #ffffff; /* White color for better contrast */
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem; /* Increased font size */
  border: 2px solid #ffffff; /* White border for better contrast */
  transition: all 0.3s ease-in-out;
  position: relative;
  cursor: pointer;

  &:hover {
    color: #8b81a8; /* Match the background color */
    background-color: #ffffff; /* White background on hover */
    border: 2px solid #8b81a8; /* Match the background color */
  }

  &::before,
  &::after {
    content: "";
    width: 8px;
    height: 8px;
    border-style: solid;
    border-width: 2px 0 0 2px;
    border-color: #ffffff;
    position: absolute;
    top: -4px;
    left: -4px;
    transition: all 0.3s ease-in-out;
  }

  &::after {
    border-width: 0 2px 2px 0;
    top: auto;
    bottom: -4px;
    left: auto;
    right: -4px;
  }

  &:hover::before,
  &:hover::after {
    width: calc(100% + 8px);
    height: calc(100% + 8px);
    border-color: #8b81a8; /* Match the background color */
  }
`;

const StyledSignOutButton = styled(StyledButton).attrs({ as: 'button' })``;

const UserStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Heebo', sans-serif;
  font-size: 1.3rem;
  color: #ffffff;
  margin-left: 1rem; /* Add some space between logo and status */
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4CAF50;
`;

const Greeting = styled.span`
  font-weight: bold;
`;

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { openLoginPopup, openRegisterPopup } = usePopup();

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully.");
      Swal.fire({
        title: 'התנתקת בהצלחה',
        icon: 'success',
        confirmButtonText: 'אישור'
      }).then(() => {
        navigate('/');
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

  const getFirstName = (user) => {
    if (user.user_metadata && user.user_metadata.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return 'אורח'; // Default to 'Guest' in Hebrew if no name is available
  };

  return (
    <HeaderContainer>
      <LogoContainer>
        <LogoImage src={newLogo} alt="TriRoars Logo" />
        {user && (
          <UserStatus>
            <StatusDot />
            <Greeting>שלום, {getFirstName(user)}</Greeting>
          </UserStatus>
        )}
      </LogoContainer>
      <NavContainer>
        <StyledButton to="/">דף הבית</StyledButton>
        {user ? (
          <>
            <StyledButton to="/personal-area">איזור אישי</StyledButton>
            {isAdmin && (
              <StyledButton to="/admin-dashboard">אזור אדמין</StyledButton>
            )}
            <StyledSignOutButton onClick={handleSignOut}>התנתקות</StyledSignOutButton>
          </>
        ) : (
          <>
            <StyledButton as="button" onClick={openLoginPopup}>התחברות</StyledButton>
            <StyledButton as="button" onClick={openRegisterPopup}>הרשמה</StyledButton>
          </>
        )}
      </NavContainer>
      <UserContainer />
    </HeaderContainer>
  );
};

export default Header;
