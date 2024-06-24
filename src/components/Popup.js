import React from 'react';

const Popup = ({ isOpen, onClose, title, message, buttonText, onButtonClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              onButtonClick();
              onClose();
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;