// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PersonalArea from './pages/PersonalArea';
import PurchasePage from './pages/PurchasePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import CourseDetailsPage from './pages/CourseDetailsPage';
import AddCoursePage from './pages/AddCoursePage';
import PaymentPage from './pages/PaymentPage'; // הוספתי את דף הסליקה
import PaymentSuccessRedirect from './pages/PaymentSuccessRedirect'; // הוספתי את הדף לניתוב מוצלח
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './hooks/useAuth';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/personal-area" element={<PersonalArea />} />
          <Route path="/purchase/:courseId" element={<PurchasePage />} />
          <Route path="/course/:courseId" element={<CourseDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/add-course" element={<AddCoursePage />} />
          <Route path="/payment/:courseId" element={<PaymentPage />} /> {/* נתיב לדף הסליקה */}
          <Route path="/payment-success" element={<PaymentSuccessRedirect />} /> {/* נתיב לניתוב מוצלח */}
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default App;
