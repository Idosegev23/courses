import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import newLogo from '../components/NewLogo_BLANK.png';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';
import { usePopup } from '../PopupContext';
import { Menu, X, User, LogOut, Home, Settings } from 'lucide-react';

// אנימציות
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

// סגנונות משותפים לכפתורים
const buttonStyles = css`
  background: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-family: 'Heebo', sans-serif;
  color: #ffffff;
  text-decoration: none;
  font-weight: bold;
  font-size: 1rem;
  border: 2px solid #ffffff;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;

  &:hover {
    color: #8b81a8;
    background-color: #ffffff;
    border: 2px solid #8b81a8;
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
    border-color: #8b81a8;
  }
`;

// רכיבים מעוצבים
const HeaderContainer = styled.header`
  background-color: #8b81a8;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f2d1b3;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  width: 125px;
  height: auto;

  @media (max-width: 768px) {
    width: 100px;
  }
`;

const NavContainer = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  flex-grow: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(139, 129, 168, 0.95);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out, ${slideIn} 0.3s ease-out;
`;

const CloseButton = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
`;

const StyledButton = styled(Link)`
  ${buttonStyles}
`;

const StyledSignOutButton = styled.button`
  ${buttonStyles}
`;

const UserStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Heebo', sans-serif;
  font-size: 1.3rem;
  color: #ffffff;
  margin-right: 1rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openLoginPopup, openRegisterPopup } = usePopup();

  useEffect(() => {
    // סגירת התפריט הנייד בעת שינוי נתיב
    setIsMobileMenuOpen(false);
  }, [location]);

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
    return 'אורח';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderNavItems = (isMobile = false) => (
    <>
      <StyledButton to="/" onClick={isMobile ? toggleMobileMenu : undefined}>
        <Home size={18} />
        דף הבית
      </StyledButton>
      {user ? (
        <>
          <StyledButton to="/personal-area" onClick={isMobile ? toggleMobileMenu : undefined}>
            <User size={18} />
            איזור אישי
          </StyledButton>
          {isAdmin && (
            <StyledButton to="/admin-dashboard" onClick={isMobile ? toggleMobileMenu : undefined}>
              <Settings size={18} />
              אזור אדמין
            </StyledButton>
          )}
          <StyledSignOutButton onClick={() => {
            handleSignOut();
            if (isMobile) toggleMobileMenu();
          }}>
            <LogOut size={18} />
            התנתקות
          </StyledSignOutButton>
        </>
      ) : (
        <>
          <StyledButton as="button" onClick={() => {
            openLoginPopup();
            if (isMobile) toggleMobileMenu();
          }}>
            <User size={18} />
            התחברות
          </StyledButton>
          <StyledButton as="button" onClick={() => {
            openRegisterPopup();
            if (isMobile) toggleMobileMenu();
          }}>
            <User size={18} />
            הרשמה
          </StyledButton>
        </>
      )}
    </>
  );

  return (
    <HeaderContainer>
      <LogoContainer>
        <Link to="/">
          <LogoImage src={newLogo} alt="TriRoars Logo" />
        </Link>
        {user && (
          <UserStatus>
            <StatusDot />
            <Greeting>שלום, {getFirstName(user)}</Greeting>
          </UserStatus>
        )}
      </LogoContainer>
      <NavContainer>
        {renderNavItems()}
      </NavContainer>
      <MobileMenuButton onClick={toggleMobileMenu} aria-label="פתח תפריט">
        <Menu />
      </MobileMenuButton>
      {isMobileMenuOpen && (
        <MobileMenu>
          <CloseButton onClick={toggleMobileMenu} aria-label="סגור תפריט">
            <X />
          </CloseButton>
          {renderNavItems(true)}
        </MobileMenu>
      )}
    </HeaderContainer>
  );
};

export default Header;