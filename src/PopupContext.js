import React, { createContext, useState, useContext } from 'react';

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  const openLoginPopup = () => {
    setShowRegisterPopup(false);
    setShowLoginPopup(true);
  };

  const openRegisterPopup = () => {
    setShowLoginPopup(false);
    setShowRegisterPopup(true);
  };

  const closeAllPopups = () => {
    setShowLoginPopup(false);
    setShowRegisterPopup(false);
  };

  return (
    <PopupContext.Provider value={{
      showLoginPopup,
      showRegisterPopup,
      openLoginPopup,
      openRegisterPopup,
      closeAllPopups
    }}>
      {children}
    </PopupContext.Provider>
  );
};