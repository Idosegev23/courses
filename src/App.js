import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { PopupProvider, usePopup } from './PopupContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPopupNew from './components/loginPopUpNew';
import RegisterPopup from './components/registerPopup';
import PurchasePopup from './components/PurchasePopup';

// Pages
import LandingPage from './pages/LandingPage';
import PersonalArea from './pages/PersonalArea';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CourseDetailsPage from './pages/CourseDetailsPage';
import AddCoursePage from './pages/AddCoursePage';
import EditCoursePage from './pages/EditCoursePage';
import PaymentSuccessRedirect from './pages/PaymentSuccessRedirect';
import CourseLearningPage from './pages/CourseLearningPage';
import ContactAndPolicyPage from './pages/ContactAndPolicyPage';
import PurchaseResultPage from './pages/PurchaseResultPage';
import AuthCallback from './pages/AuthCallback';

const AppContent = () => {
  const { showLoginPopup, showRegisterPopup, showPurchasePopup, purchaseCourse, closeAllPopups } = usePopup();

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/personal-area" element={<PersonalArea />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/course/:courseId" element={<CourseDetailsPage />} />
        <Route path="/add-course" element={<AddCoursePage />} />
        <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />
        <Route path="/payment-success" element={<PaymentSuccessRedirect />} />
        <Route path="/course-learning/:courseId" element={<CourseLearningPage />} />
        <Route path="/contact-and-policy" element={<ContactAndPolicyPage />} />
        <Route path="/purchase-result" element={<PurchaseResultPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
      {showLoginPopup && <LoginPopupNew />}
      {showRegisterPopup && <RegisterPopup />}
      {showPurchasePopup && <PurchasePopup course={purchaseCourse} onClose={closeAllPopups} isOpen={showPurchasePopup} />}
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <PopupProvider>
          <AppContent />
        </PopupProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
