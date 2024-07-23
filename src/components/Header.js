import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

// סגנונות משותפים
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

  &:hover {
    color: #8b81a8;
    background-color: #ffffff;
    border: 2px solid #8b81a8;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
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
    width: 100px; // לוגו קטן יותר למסכים ניידים
  }
`;

const NavContainer = styled.nav`
  display: flex;
  gap: 1rem;
  align-items: center;

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

const UserMenu = styled.div`
  position: relative;
`;

const UserMenuButton = styled.button`
  ${buttonStyles}
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #8b81a8;
  border-radius: 0.5rem;
  padding: 0.5rem;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const UserMenuItem = styled(Link)`
  ${buttonStyles}
  color: #8b81a8;
  border: none;
  justify-content: flex-start;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { openLoginPopup, openRegisterPopup } = usePopup();
  const userMenuRef = useRef(null);

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

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderNavItems = () => (
    <>
      <StyledButton to="/">
        <Home size={18} />
        דף הבית
      </StyledButton>
      {user ? (
        <UserMenu ref={userMenuRef}>
          <UserMenuButton onClick={toggleUserMenu}>
            <User size={18} />
            {getFirstName(user)}
          </UserMenuButton>
          <UserMenuDropdown isOpen={isUserMenuOpen}>
            <UserMenuItem to="/personal-area">
              <Settings size={18} />
              איזור אישי
            </UserMenuItem>
            {isAdmin && (
              <UserMenuItem to="/admin-dashboard">
                <Settings size={18} />
                אזור אדמין
              </UserMenuItem>
            )}
            <UserMenuItem as="button" onClick={handleSignOut}>
              <LogOut size={18} />
              התנתקות
            </UserMenuItem>
          </UserMenuDropdown>
        </UserMenu>
      ) : (
        <>
          <StyledButton as="button" onClick={openLoginPopup}>
            <User size={18} />
            התחברות
          </StyledButton>
          <StyledButton as="button" onClick={openRegisterPopup}>
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
        <LogoImage src={newLogo} alt="TriRoars Logo" />
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
          {renderNavItems()}
        </MobileMenu>
      )}
    </HeaderContainer>
  );
};

export default Header;