import React from 'react';
import { createRoot } from 'react-dom/client'; // ייבוא createRoot
import App from './App';

const container = document.getElementById('root'); // בחירת ה-element שבו נרנדר את האפליקציה
const root = createRoot(container); // יצירת root חדש

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
