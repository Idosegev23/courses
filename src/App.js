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
import EditCoursePage from './pages/EditCoursePage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessRedirect from './pages/PaymentSuccessRedirect';
import CourseLearningPage from './pages/CourseLearningPage';
import ContactAndPolicyPage from './pages/ContactAndPolicyPage';
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
          <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />
          <Route path="/payment/:courseId" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccessRedirect />} />
          <Route path="/course-learning/:courseId" element={<CourseLearningPage />} />
          <Route path="/contact-and-policy" element={<ContactAndPolicyPage />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  );
};

export default App;