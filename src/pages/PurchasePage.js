import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styled, { createGlobalStyle } from 'styled-components';
import Swal from 'sweetalert2';
import newLogo from '../components/NewLogo_BLANK-outer.png';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #ffffff;
    direction: rtl;
    margin: 0;
    padding: 0;
  }
`;

const PageContainer = styled.div`
  padding: 1rem;
  background: #ffffff;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media (min-width: 768px) {
    padding: 2rem;
    border-radius: 2rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(${newLogo}) no-repeat center;
    background-size: cover;
    opacity: 0.05;
    pointer-events: none;
    z-index: 0;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  color: #62238C;
  margin-bottom: 1rem;
  text-align: center;
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const CourseDescription = styled.p`
  font-size: 1rem;
  color: #333;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }
`;

const PriceContainer = styled.div`
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: #BF4B81;
  text-decoration: line-through;
  margin-right: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    margin-right: 1rem;
  }
`;

const DiscountedPrice = styled.h2`
  font-size: 1.25rem;
  color: #62238C;
  display: inline;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const DiscountPercentage = styled.span`
  font-size: 1rem;
  color: #333;
  margin-left: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    margin-left: 1rem;
  }
`;

const StyledButton = styled.button`
  display: inline-block;
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: #fff;
  background-color: ${props => props.$isPurchase ? '#62238C' : '#BF4B81'};
  transition: background-color 0.3s, transform 0.3s;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  position: relative;
  z-index: 1;

  &:hover {
    background-color: ${props => props.$isPurchase ? '#BF4B81' : '#62238C'};
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #ddd;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 1rem;
  }
`;

const Message = styled.p`
  font-size: 1rem;
  color: #333;
  text-align: center;
  position: relative;
  z-index: 1;

  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`;

const PurchasePage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [finalPrice, setFinalPrice] = useState(null);
  const [discount, setDiscount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseAndUserDetails = async () => {
      setLoading(true);
      try {
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;

        setCourse(courseData);

        // Fetch user details
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userError) throw userError;

          setUserDetails({ ...user, ...userData });

          // Calculate final price and discount
          let finalPrice = courseData.price;
          let discount = 0;

          if (courseData.original_price && courseData.original_price > courseData.price) {
            discount = Math.round(((courseData.original_price - courseData.price) / courseData.original_price) * 100);
          } else if (userData.discount_percentage) {
            discount = userData.discount_percentage;
            finalPrice = courseData.price * (1 - discount / 100);
          }

          setFinalPrice(finalPrice);
          setDiscount(discount);
        } else {
          // If no user is logged in, set the course price as the final price
          setFinalPrice(courseData.price);
          setDiscount(0);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire('שגיאה', 'אירעה שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndUserDetails();
  }, [courseId]);

  const getJwtToken = async () => {
    console.log('Starting getJwtToken function');
    const data = {
      id: 'd8281ab1-2ebc-44a9-a53f-e19a46b879dc',
      secret: 'f5gxE9n2H43sY4d-P-Ivhg'
    };

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ endpoint: 'account/token', data })
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return responseData.token;
    } catch (error) {
      console.error('Error in getJwtToken:', error);
      throw error;
    }
  };

  const createGreenInvoice = async (user, course, additionalData) => {
    const token = await getJwtToken();
    if (!token) {
        Swal.fire({
            title: 'שגיאה',
            text: 'אירעה שגיאה בהשגת אסימון אימות. אנא נסה שוב מאוחר יותר.',
            icon: 'error'
        });
        return false;
    }

    const invoiceData = {
        description: course.title,
        type: 400,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        lang: "he",
        currency: "ILS",
        vatType: 0,
        amount: finalPrice,
        maxPayments: 1,
        pluginId: "74fd5825-12c4-4e20-9942-cc0f2b6dfe85",
        client: {
            name: `${additionalData.firstName} ${additionalData.lastName}`,
            emails: [additionalData.email],
            taxId: additionalData.taxId,
            address: additionalData.address || "Unknown address",
            city: additionalData.city || "Unknown city",
            zip: additionalData.zip || "0000000",
            country: "IL",
            phone: additionalData.phone,
            mobile: additionalData.phone,
            add: true
        },
        successUrl: `https://courses-seven-alpha.vercel.app/personal-area?status=success`,
        failureUrl: `https://courses-seven-alpha.vercel.app/purchase/${course.id}?status=failure`,
        notifyUrl: "https://courses-seven-alpha.vercel.app/notify",
        custom: "12345"
    };

    console.log('Invoice Data:', invoiceData);  // Log invoice data

    try {
        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Ensure token is correctly included
            },
            body: JSON.stringify({
                endpoint: 'payments/form',
                data: invoiceData,
                tokenRequest: token
            })
        });

        const responseData = await response.json();
        console.log('Invoice request sent with data:', invoiceData);  // Log request data
        console.log('Response status:', response.status);
        console.log('Response data:', responseData);

        if (response.status === 200 && responseData.errorCode === 0) {
            console.log('Payment form created successfully:', responseData);
            window.location.href = responseData.url;  // Redirect to payment form
            return true;
        } else {
            console.error('Failed to create payment form:', responseData);
            Swal.fire({
                title: 'שגיאה',
                text: 'אירעה שגיאה ביצירת טופס התשלום. אנא נסה שוב מאוחר יותר.',
                icon: 'error'
            });
            return false;
        }
    } catch (error) {
        console.error('Error creating payment form:', error);
        Swal.fire({
            title: 'שגיאה',
            text: 'אירעה שגיאה ביצירת טופס התשלום. אנא נסה שוב מאוחר יותר.',
            icon: 'error'
        });
        return false;
    }
};


  const handlePurchase = async () => {
    try {
      if (!userDetails) {
        // User is not logged in, show sign-up and payment form
        const { value: formValues } = await Swal.fire({
          title: 'הרשמה',
          html:
            '<input id="swal-input1" class="swal2-input" placeholder="שם פרטי">' +
            '<input id="swal-input2" class="swal2-input" placeholder="שם משפחה">' +
            '<input id="swal-input3" class="swal2-input" placeholder="אימייל">' +
            '<input id="swal-input4" class="swal2-input" type="password" placeholder="סיסמה">' +
            '<input id="swal-input5" class="swal2-input" placeholder="כתובת">' +
            '<input id="swal-input6" class="swal2-input" placeholder="עיר">' +
            '<input id="swal-input7" class="swal2-input" placeholder="מיקוד">' +
            '<input id="swal-input8" class="swal2-input" placeholder="מספר טלפון">',
          focusConfirm: false,
          preConfirm: () => {
            return {
              firstName: document.getElementById('swal-input1').value,
              lastName: document.getElementById('swal-input2').value,
              email: document.getElementById('swal-input3').value,
              password: document.getElementById('swal-input4').value,
              address: document.getElementById('swal-input5').value,
              city: document.getElementById('swal-input6').value,
              zip: document.getElementById('swal-input7').value,
              phone: document.getElementById('swal-input8').value,
            };
          }
        });

        if (formValues) {
          const { firstName, lastName, email, password, address, city, zip, phone } = formValues;

          console.log('Form values:', formValues);

          // Perform sign-up
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
                phone_num: phone
              },
            },
          });

          if (signUpError) {
            throw signUpError;
          }

          const { data: { user: newUser } } = await supabase.auth.signInWithPassword({ email, password });
          setUserDetails({ ...newUser, first_name: firstName, last_name: lastName, phone_num: phone });

          // Create Green Invoice
          const { value: additionalValues } = await Swal.fire({
            title: 'פרטים אחרונים לרכישת הקורס',
            html:
              '<input id="swal-input9" class="swal2-input" placeholder="מספר ת.ז.">',
            focusConfirm: false,
            preConfirm: () => {
              return {
                taxId: document.getElementById('swal-input9').value,
              };
            }
          });

          if (!additionalValues || !additionalValues.taxId) {
            Swal.fire('שגיאה', 'מספר ת.ז. נדרש.', 'error');
            return;
          }

          const additionalData = {
            firstName,
            lastName,
            email,
            address,
            city,
            zip,
            phone,
            taxId: additionalValues.taxId
          };

          const invoiceCreated = await createGreenInvoice(newUser, course, additionalData);
          if (!invoiceCreated) {
            throw new Error('Failed to create invoice');
          }

          // Perform purchase
          const { error: purchaseError } = await supabase
            .from('enrollments')
            .insert({
              user_id: newUser.id,
              course_id: courseId,
              current_lesson: 1,
              amount_paid: finalPrice,
              course_title: course.title,
            });

          if (purchaseError) {
            throw purchaseError;
          }

          Swal.fire('הרכישה הושלמה', 'הקורס נוסף בהצלחה לרשימת הקורסים שלך.', 'success');
          navigate('/personal-area');
        }
      } else {
        // User is already logged in
        let { first_name: firstName, last_name: lastName, phone_num: phone } = userDetails;
        if (!phone || !firstName || !lastName) {
          // Ask user for first name, last name, and phone number if not present in the database
          const { value: formValues } = await Swal.fire({
            title: 'עדכון פרטים',
            html:
              '<input id="swal-input1" class="swal2-input" placeholder="שם פרטי">' +
              '<input id="swal-input2" class="swal2-input" placeholder="שם משפחה">' +
              '<input id="swal-input3" class="swal2-input" placeholder="מספר טלפון">',
            focusConfirm: false,
            preConfirm: () => {
              return {
                firstName: document.getElementById('swal-input1').value,
                lastName: document.getElementById('swal-input2').value,
                phone: document.getElementById('swal-input3').value,
              };
            }
          });

          if (!formValues.firstName || !formValues.lastName || !formValues.phone) {
            Swal.fire('שגיאה', 'כל הפרטים נדרשים.', 'error');
            return;
          }

          firstName = formValues.firstName;
          lastName = formValues.lastName;
          phone = formValues.phone;

          // Update the user's details in the database
          const { error: updateError } = await supabase
            .from('users')
            .update({ first_name: firstName, last_name: lastName, phone_num: phone })
            .eq('id', userDetails.id);

          if (updateError) {
            throw updateError;
          }
        }

        const { value: updateAddress } = await Swal.fire({
          title: 'עדכון כתובת',
          text: 'האם תרצה לעדכן את הכתובת לקבלה?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'כן',
          cancelButtonText: 'לא'
        });

        let address = userDetails.address;
        let city = userDetails.city;
        let zip = userDetails.zip;

        if (updateAddress) {
          const { value: addressValues } = await Swal.fire({
            title: 'הזן כתובת',
            html:
              '<input id="swal-input4" class="swal2-input" placeholder="כתובת">' +
              '<input id="swal-input5" class="swal2-input" placeholder="עיר">' +
              '<input id="swal-input6" class="swal2-input" placeholder="מיקוד">',
            focusConfirm: false,
            preConfirm: () => {
              return {
                address: document.getElementById('swal-input4').value,
                city: document.getElementById('swal-input5').value,
                zip: document.getElementById('swal-input6').value,
              };
            }
          });

          address = addressValues.address;
          city = addressValues.city;
          zip = addressValues.zip;
        }

        const { value: additionalValues } = await Swal.fire({
          title: 'פרטים אחרונים לרכישת הקורס',
          html:
            '<input id="swal-input9" class="swal2-input" placeholder="מספר ת.ז.">',
          focusConfirm: false,
          preConfirm: () => {
            return {
              taxId: document.getElementById('swal-input9').value,
            };
          }
        });

        if (!additionalValues || !additionalValues.taxId) {
          Swal.fire('שגיאה', 'מספר ת.ז. נדרש.', 'error');
          return;
        }

        const additionalData = {
          firstName,
          lastName,
          email: userDetails.email,
          address: address || 'Unknown address',
          city: city || 'Unknown city',
          zip: zip || '0000000',
          phone,
          taxId: additionalValues.taxId
        };

        const invoiceCreated = await createGreenInvoice(userDetails, course, additionalData);
        if (!invoiceCreated) {
          throw new Error('Failed to create invoice');
        }

        // Perform purchase
        const { error } = await supabase
          .from('enrollments')
          .insert({
            user_id: userDetails.id,
            course_id: courseId,
            current_lesson: 1,
            amount_paid: finalPrice,
            course_title: course.title,
          });

        if (error) {
          throw error;
        }

        Swal.fire('הרכישה הושלמה', 'הקורס נוסף בהצלחה לרשימת הקורסים שלך.', 'success');
        navigate('/personal-area');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      Swal.fire('שגיאה', 'אירעה שגיאה במהלך הרכישה. אנא נסה שוב מאוחר יותר.', 'error');
    }
  };

  if (loading) {
    return <Message>טוען...</Message>;
  }

  if (!course) {
    return <Message>לא נמצא קורס עם המזהה הזה.</Message>;
  }

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <PageTitle>{course.title}</PageTitle>
        <CourseDescription>{course.description}</CourseDescription>
        <PriceContainer>
          {discount > 0 && (
            <>
              <OriginalPrice>{course.price} ש"ח</OriginalPrice>
              <DiscountedPrice>{finalPrice.toFixed(2)} ש"ח</DiscountedPrice>
              <DiscountPercentage>({discount}% הנחה)</DiscountPercentage>
            </>
          )}
          {discount === 0 && (
            <DiscountedPrice>{course.price} ש"ח</DiscountedPrice>
          )}
        </PriceContainer>
        {course.is_available ? (
          <StyledButton onClick={handlePurchase} $isPurchase>רכוש קורס</StyledButton>
        ) : (
          <Message>הקורס עדיין לא זמין לרכישה.</Message>
        )}
      </PageContainer>
    </>
  );
};

export default PurchasePage;
