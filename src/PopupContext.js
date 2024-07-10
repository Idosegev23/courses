import React, { createContext, useState, useContext } from 'react';

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showPurchasePopup, setShowPurchasePopup] = useState(false);
  const [purchaseCourse, setPurchaseCourse] = useState(null);

  const openLoginPopup = () => {
    setShowRegisterPopup(false);
    setShowPurchasePopup(false);
    setShowLoginPopup(true);
  };

  const openRegisterPopup = () => {
    setShowLoginPopup(false);
    setShowPurchasePopup(false);
    setShowRegisterPopup(true);
  };

  const openPurchasePopup = (course) => {
    setShowLoginPopup(false);
    setShowRegisterPopup(false);
    setPurchaseCourse(course);
    setShowPurchasePopup(true);
  };

  const closeAllPopups = () => {
    setShowLoginPopup(false);
    setShowRegisterPopup(false);
    setShowPurchasePopup(false);
    setPurchaseCourse(null);
  };

  return (
    <PopupContext.Provider value={{
      showLoginPopup,
      showRegisterPopup,
      showPurchasePopup,
      purchaseCourse,
      openLoginPopup,
      openRegisterPopup,
      openPurchasePopup,
      closeAllPopups
    }}>
      {children}
    </PopupContext.Provider>
  );
};