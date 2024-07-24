import React, { createContext, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showPurchasePopup, setShowPurchasePopup] = useState(false);
  const [purchaseCourse, setPurchaseCourse] = useState(null);
  const [previousPath, setPreviousPath] = useState(null);
  const [isFromCourseDetails, setIsFromCourseDetails] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openLoginPopup = () => {
    console.log('Opening login popup');
    setShowRegisterPopup(false);
    setShowPurchasePopup(false);
    setShowLoginPopup(true);
    setPreviousPath(location.pathname);
  };

  const openRegisterPopup = (fromCourseDetails = false) => {
    console.log('Opening register popup');
    setShowLoginPopup(false);
    setShowPurchasePopup(false);
    setShowRegisterPopup(true);
    setPreviousPath(location.pathname);
    setIsFromCourseDetails(fromCourseDetails);
  };

  const openPurchasePopup = (course) => {
    console.log('Opening purchase popup for course:', course);
    setShowLoginPopup(false);
    setShowRegisterPopup(false);
    setPurchaseCourse(course);
    setShowPurchasePopup(true);
    setPreviousPath(location.pathname);
  };

  const closeAllPopups = () => {
    console.log('Closing all popups');
    setShowLoginPopup(false);
    setShowRegisterPopup(false);
    setShowPurchasePopup(false);
    setPurchaseCourse(null);
    setIsFromCourseDetails(false);
  };

  const navigateBack = () => {
    if (previousPath) {
      navigate(previousPath);
    }
    closeAllPopups();
  };

  return (
    <PopupContext.Provider value={{
      showLoginPopup,
      showRegisterPopup,
      showPurchasePopup,
      purchaseCourse,
      isFromCourseDetails,
      openLoginPopup,
      openRegisterPopup,
      openPurchasePopup,
      closeAllPopups,
      navigateBack
    }}>
      {children}
    </PopupContext.Provider>
  );
};