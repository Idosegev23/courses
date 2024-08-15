import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import newLogo from '../components/NewLogo_BLANK.png';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';
import { usePopup } from '../PopupContext';
import { Menu, X, User, LogOut, Home, Settings } from 'lucide-react';
import { supabase } from '../supabaseClient';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

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

const BannerContainer = styled.div`
  background-color: #6DBFF2; /* צבע רקע */
  color: #0D0D0D; /* צבע טקסט */
  text-align: center;
  padding: 0.5rem;
  font-family: 'Heebo', sans-serif;
  font-size: 1rem;
  font-weight: bold;
`;

const Banner = () => (
  <BannerContainer>
    השקת אתר! קבלו 25% הנחה עם קוד הקופון: <span style={{ color: '#62238C' }}>OPENING25</span>
  </BannerContainer>
);

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

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
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
  direction: rtl;
  text-align: right;
`;

const PopupLogo = styled.img`
  width: 100px;
  height: auto;
  display: block;
  margin: 0 auto 1rem;
`;

const PopupTitle = styled.h2`
  text-align: center;
  margin-bottom: 1rem;
`;

const ExitButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4d4d;
  border: none;
  color: white;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff3333;
  }
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

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openLoginPopup, openRegisterPopup } = usePopup();

  useEffect(() => {
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
    if (user && user.user_metadata) {
      if (user.user_metadata.first_name) {
        return user.user_metadata.first_name;
      } else if (user.user_metadata.full_name) {
        return user.user_metadata.full_name.split(' ')[0];
      }
    }
    return 'אורח';
  };

  const getProfileImage = (user) => {
    if (user && user.user_metadata) {
      return user.user_metadata.avatar_url || 'default-profile.png';
    }
    return 'default-profile.png';
  };

  const handlePersonalAreaClick = () => {
    if (!user.email_confirmed_at) {
      Swal.fire({
        title: 'אימות חשבון נדרש',
        text: 'עליך לאמת את חשבונך במייל לפני הכניסה לאזור האישי.',
        icon: 'warning',
        confirmButtonText: 'שלח שוב מייל אימות'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await supabase.auth.api.resendConfirmationEmail(user.email);
          Swal.fire('מייל אימות נשלח', 'אנא בדוק את תיבת הדואר שלך.', 'success');
        }
      });
    } else {
      navigate('/personal-area');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleContactClick = () => {
    setShowPopup(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const renderNavItems = (isMobile = false) => (
    <>
      <StyledButton to="/" onClick={isMobile ? toggleMobileMenu : undefined}>
        <Home size={18} />
        דף הבית
      </StyledButton>
      <StyledButton to="/about" onClick={isMobile ? toggleMobileMenu : undefined}>
        <User size={18} />
        אודות
      </StyledButton>
      <StyledButton as="button" onClick={handleContactClick}>
        <Settings size={18} />
        צור קשר
      </StyledButton>
      {user ? (
        <>
          <StyledButton as="button" onClick={handlePersonalAreaClick}>
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
    <>
      <HeaderContainer>
        <LogoContainer>
          <Link to="/">
            <LogoImage src={newLogo} alt="TriRoars Logo" />
          </Link>
          {user && (
            <UserStatus>
              <StatusDot />
              <Greeting>שלום, {getFirstName(user)}</Greeting>
              <ProfileImage src={getProfileImage(user)} alt="Profile" />
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
     <Banner />
     {showPopup && (
       <PopupOverlay>
         <PopupContent>
           <PopupLogo src={newLogo} alt="TriRoars Logo" />
           <PopupTitle>צור קשר</PopupTitle>
           <ExitButton onClick={() => setShowPopup(false)}>X</ExitButton>
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

export default Header;
