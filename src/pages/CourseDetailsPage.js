import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Typography, Container, Checkbox, FormControlLabel, Dialog, DialogContent } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import newLogo from '../components/NewLogo_BLANK-outer.png';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#62238C',
    },
    secondary: {
      main: '#BF4B81',
    },
  },
  typography: {
    fontFamily: 'Heebo, sans-serif',
  },
});

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Montserrat');
  
  body {
    font-family: 'Montserrat', arial, verdana;
    background-color: white;
    direction: rtl;
    margin: 0;
    padding: 0;
    height: 100%;
    overflow-y: auto;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const PageContainer = styled(Container)`
  padding: 2rem;
  background: #ffffff;
  text-align: center;
  max-width: 1200px;
  margin: 2rem auto;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
`;

const PageTitle = styled(Typography)`
  font-size: 2.5rem;
  font-weight: bold;
  color: #62238C;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
`;

const CourseDescription = styled.div`
  font-size: 1.1rem;
  color: #333;
  max-width: 800px;
  text-align: right;
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);

  h2 {
    font-size: 1.8rem;
    color: #62238C;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1rem;
  }

  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

const PurchaseButton = styled.button`
  width: 200px;
  height: 60px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  color: white;
  background: #BF4B81;
  border: 2px solid #62238C;
  box-shadow: 5px 5px 0 #62238C, -5px -5px 0 #62238C, -5px 5px 0 #62238C, 5px -5px 0 #62238C;
  transition: 500ms ease-in-out;

  &:hover {
    box-shadow: 20px 5px 0 #62238C, -20px -5px 0 #62238C;
  }

  &:focus {
    outline: none;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  position: relative;
`;

const progressAnimation = keyframes`
  0% { width: 0; }
  100% { width: 100%; }
`;

const ProgressBar = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  height: 2px;
  background-color: #62238C;
  transition: width 0.5s ease-in-out;
  width: ${props => ((props.currentStep - 1) / 2) * 100}%;
`;

const Step = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#62238C' : '#ccc'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  position: relative;
  z-index: 2;
  transition: background-color 0.3s ease-in-out;
`;

const StepConnector = styled.div`
  flex: 1;
  height: 2px;
  background-color: #ccc;
  align-self: center;
  margin: 0 5px;
  position: relative;
  z-index: 1;
`;

const PopupForm = styled(Dialog)`
  .MuiDialog-paper {
    padding: 20px;
    width: 400px;
    max-width: 90%;
  }
`;

const MultiStepForm = styled.form`
  width: 100%;
  margin: 0 auto;
  text-align: center;
  position: relative;
`;

const FormFieldset = styled.fieldset`
  background: white;
  border: 0 none;
  border-radius: 3px;
  padding: 20px 30px;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  position: relative;
`;

const FormInput = styled.input`
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
  font-family: montserrat;
  color: #2C3E50;
  font-size: 13px;
`;

const FormButton = styled.button`
  width: 100px;
  background: #62238C;
  font-weight: bold;
  color: white;
  border: 0 none;
  border-radius: 1px;
  cursor: pointer;
  padding: 10px;
  margin: 10px 5px;
  text-decoration: none;
  font-size: 14px;

  &:hover, &:focus {
    box-shadow: 0 0 0 2px white, 0 0 0 3px #62238C;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
  margin-top: -5px;
  margin-bottom: 10px;
`;

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    idNum: '',
    streetAddress: '',
    city: '',
    isCompany: false,
    companyId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const { user, signIn } = useAuth();

  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      if (error) {
        console.error('Error fetching course:', error);
      } else {
        setCourse(data);
      }
    };

    fetchCourse();
  }, [courseId]);

  const validateForm = (step) => {
    const errors = {};
    switch (step) {
      case 1:
        if (!formValues.firstName.trim()) errors.firstName = "שם פרטי הוא שדה חובה";
        if (!formValues.lastName.trim()) errors.lastName = "שם משפחה הוא שדה חובה";
        if (!/^\d{10}$/.test(formValues.phone)) errors.phone = "מספר טלפון לא תקין";
        break;
      case 2:
        if (!/\S+@\S+\.\S+/.test(formValues.email)) errors.email = "כתובת אימייל לא תקינה";
        if (formValues.password.length < 8) errors.password = "הסיסמה חייבת להכיל לפחות 8 תווים";
        if (formValues.password !== formValues.confirmPassword) errors.confirmPassword = "הסיסמאות אינן תואמות";
        break;
      case 3:
        if (!formValues.isCompany && !/^\d{9}$/.test(formValues.idNum)) errors.idNum = "מספר זהות לא תקין";
        if (!formValues.streetAddress.trim()) errors.streetAddress = "רחוב הוא שדה חובה";
        if (!formValues.city.trim()) errors.city = "עיר היא שדה חובה";
        if (formValues.isCompany && !formValues.companyId.trim()) errors.companyId = "ח.פ או מספר עוסק מורשה הוא שדה חובה";
        break;
      default:
        break;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNextStep = () => {
    if (validateForm(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm(3)) {
      try {
        // Register new user if not logged in
        if (!user) {
          const { data: newUserData, error: registrationError } = await supabase.auth.signUp({
            email: formValues.email,
            password: formValues.password,
          });

          if (registrationError) throw registrationError;

          // Add user details to 'users' table
          const { error: userError } = await supabase
            .from('users')
            .insert({ 
              id: newUserData.user.id,
              email: formValues.email,
              first_name: formValues.firstName,
              last_name: formValues.lastName,
              phone_num: formValues.phone,
              id_num: formValues.isCompany ? formValues.companyId : formValues.idNum,
              street_address: formValues.streetAddress,
              city: formValues.city,
              is_company: formValues.isCompany
            });

          if (userError) throw userError;

          // Sign in the new user
          await signIn(formValues.email, formValues.password);
        }

        // Proceed with purchase
        await handlePurchase();
      } catch (error) {
        console.error('Error during registration or purchase:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const handlePurchase = async () => {
    try {
      // Get JWT token for Green Invoice
      const tokenResponse = await axios.post('/api/green-invoice', {
        endpoint: 'account/token',
        data: {
          id: process.env.REACT_APP_API_KEY_GREEN_INVOICE_TEST,
          secret: process.env.REACT_APP_API_SECRET_GREEN_INVOICE_TEST
        }
      });

      const token = tokenResponse.data.token;

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Calculate final price
      const finalPrice = course.discountPrice || course.price;

      // Create invoice data
      const invoiceData = {
        description: `רכישת קורס ${course.title}`,
        type: 400,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        lang: "he",
        currency: "ILS",
        vatType: 0,
        amount: finalPrice,
        client: {
          name: `${userData.first_name} ${userData.last_name}`,
          emails: [userData.email],
          taxId: userData.id_num,
          address: userData.street_address,
          city: userData.city,
          country: "IL",
          phone: userData.phone_num,
          add: true
        },
        successUrl: `https://courses-seven-alpha.vercel.app/personal-area?status=success`,
        failureUrl: `https://courses-seven-alpha.vercel.app/course/${courseId}?status=failure`,
        notifyUrl: "https://courses-seven-alpha.vercel.app/notify",
        custom: "300700556"
      };

      // Create payment form
      const paymentFormResponse = await axios.post('/api/green-invoice', {
        endpoint: 'payments/form',
        data: invoiceData,
        tokenRequest: token
      });

      const paymentFormUrl = paymentFormResponse.data.url;

      // Save enrollment details to Supabase
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          current_lesson: 1,
          amount_paid: finalPrice,
          course_title: course.title,
          total_lessons: course.total_lessons
        });

      if (enrollmentError) throw enrollmentError;

      // Redirect to payment form
      window.location.href = paymentFormUrl;
    }
    catch (error) {
      console.error('Error during purchase:', error);
      alert('An error occurred during the purchase. Please try again.');
    }
  };

  if (!course) return <div>טוען...</div>;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <PageContainer>
        <PageTitle variant="h1" component="h1">{course.title}</PageTitle>
        <PageContent>
          <CourseDescription>
            <h2>פרטי הקורס</h2>
            <p>{course.description}</p>
            <p><strong>עלות:</strong> {course.discountPrice || course.price} ש"ח</p>
            {course.discountPrice && (
              <p><strong>הנחה:</strong> {course.discountPercentage}%</p>
            )}
            <p><strong>משך הקורס:</strong> {course.duration}</p>
            <p><strong>פרטים נוספים:</strong> {course.details}</p>
          </CourseDescription>
          <PurchaseButton onClick={() => setShowRegistrationForm(true)}>רכוש עכשיו</PurchaseButton>
        </PageContent>

        <PopupForm open={showRegistrationForm} onClose={() => setShowRegistrationForm(false)}>
          <DialogContent>
            <MultiStepForm onSubmit={handleSubmit}>
              <StepIndicator>
                <ProgressBar currentStep={currentStep} />
                <Step active={currentStep >= 1}>1</Step>
                <StepConnector />
                <Step active={currentStep >= 2}>2</Step>
                <StepConnector />
                <Step active={currentStep >= 3}>3</Step>
              </StepIndicator>

              {currentStep === 1 && (
                <FormFieldset>
                  <h2 className="fs-title">בוא נכיר אותך</h2>
                  <FormInput
                    type="text"
                    name="firstName"
                    placeholder="שם פרטי"
                    value={formValues.firstName}
                    onChange={handleInputChange}
                  />
                  {formErrors.firstName && <ErrorMessage>{formErrors.firstName}</ErrorMessage>}
                  
                  <FormInput
                    type="text"
                    name="lastName"
                    placeholder="שם משפחה"
                    value={formValues.lastName}
                    onChange={handleInputChange}
                  />
                  {formErrors.lastName && <ErrorMessage>{formErrors.lastName}</ErrorMessage>}
                  
                  <FormInput
                    type="tel"
                    name="phone"
                    placeholder="נייד"
                    value={formValues.phone}
                    onChange={handleInputChange}
                  />
                  {formErrors.phone && <ErrorMessage>{formErrors.phone}</ErrorMessage>}
                  
                  <FormButton type="button" onClick={handleNextStep}>הבא</FormButton>
                </FormFieldset>
              )}

              {currentStep === 2 && (
                <FormFieldset>
                  <h2 className="fs-title">הרשמה</h2>
                  <FormInput
                    type="email"
                    name="email"
                    placeholder="אימייל"
                    value={formValues.email}
                    onChange={handleInputChange}
                  />
                  {formErrors.email && <ErrorMessage>{formErrors.email}</ErrorMessage>}
                  
                  <FormInput
                    type="password"
                    name="password"
                    placeholder="סיסמה"
                    value={formValues.password}
                    onChange={handleInputChange}
                  />
                  {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
                  
                  <FormInput
                    type="password"
                    name="confirmPassword"
                    placeholder="אימות סיסמה"
                    value={formValues.confirmPassword}
                    onChange={handleInputChange}
                  />
                  {formErrors.confirmPassword && <ErrorMessage>{formErrors.confirmPassword}</ErrorMessage>}
                  
                  <FormButton type="button" onClick={handlePreviousStep}>הקודם</FormButton>
                  <FormButton type="button" onClick={handleNextStep}>הבא</FormButton>
                </FormFieldset>
              )}

              {currentStep === 3 && (
                <FormFieldset>
                  <h2 className="fs-title">פרטים לקבלה</h2>
                  {!formValues.isCompany && (
                    <>
                      <FormInput
                        type="text"
                        name="idNum"
                        placeholder="ת.ז"
                        value={formValues.idNum}
                        onChange={handleInputChange}
                      />
                      {formErrors.idNum && <ErrorMessage>{formErrors.idNum}</ErrorMessage>}
                    </>
                  )}
                  
                  <FormInput
                    type="text"
                    name="streetAddress"
                    placeholder="רחוב"
                    value={formValues.streetAddress}
                    onChange={handleInputChange}
                  />
                  {formErrors.streetAddress && <ErrorMessage>{formErrors.streetAddress}</ErrorMessage>}
                  
                  <FormInput
                    type="text"
                    name="city"
                    placeholder="עיר"
                    value={formValues.city}
                    onChange={handleInputChange}
                  />
                  {formErrors.city && <ErrorMessage>{formErrors.city}</ErrorMessage>}
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formValues.isCompany}
                        onChange={handleInputChange}
                        name="isCompany"
                      />
                    }
                    label="חברה או עוסק מורשה"
                  />
                  
                  {formValues.isCompany && (
                    <>
                      <FormInput
                        type="text"
                        name="companyId"
                        placeholder="ח.פ או מספר עוסק מורשה"
                        value={formValues.companyId}
                        onChange={handleInputChange}
                      />
                      {formErrors.companyId && <ErrorMessage>{formErrors.companyId}</ErrorMessage>}
                    </>
                  )}
                  
                  <FormButton type="button" onClick={handlePreviousStep}>הקודם</FormButton>
                  <FormButton type="submit">רכוש</FormButton>
                </FormFieldset>
              )}
            </MultiStepForm>
          </DialogContent>
        </PopupForm>
      </PageContainer>
    </ThemeProvider>
  );
};

export default CourseDetailsPage;