import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Swal from 'sweetalert2';
import {
  GlobalStyle,
  PageContainer,
  PageTitle,
  CourseDescription,
  PriceContainer,
  OriginalPrice,
  DiscountedPrice,
  DiscountPercentage,
  StyledButton,
  Message
} from './StyledComponents';  // וודא שהנתיב נכון

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
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;

        setCourse(courseData);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userError) throw userError;

          setUserDetails({ ...user, ...userData });

          let finalPrice = courseData.price;
          let discount = 0;

          if (courseData.discountPrice) {
            finalPrice = courseData.discountPrice;
            discount = Math.round(((courseData.price - courseData.discountPrice) / courseData.price) * 100);
          } else if (userData.discount) {
            discount = userData.discount;
            finalPrice = courseData.price * (1 - discount / 100);
          }

          setFinalPrice(finalPrice);
          setDiscount(discount);
        } else {
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
      const response = await fetch('/api/green-invoice', {
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
  
  const createGreenInvoice = async (invoiceData) => {
    const token = await getJwtToken();
    console.log('Fetched Token:', token);
    if (!token) {
      Swal.fire({
        title: 'שגיאה',
        text: 'אירעה שגיאה בהשגת אסימון אימות. אנא נסה שוב מאוחר יותר.',
        icon: 'error'
      });
      return false;
    }
  
    console.log('Invoice Data:', invoiceData);
  
    try {
      console.log('Sending request to create invoice with token:', token);
      const response = await fetch('/api/green-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: 'payments/form', data: invoiceData, tokenRequest: token })
      });
  
      const responseData = await response.json();
      console.log('Invoice request sent with data:', invoiceData);
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);
  
      if (response.status === 200 && responseData.errorCode === 0) {
        console.log('Payment form created successfully:', responseData);
        window.location.href = responseData.url;
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
      const { data: { user } } = await supabase.auth.getUser();
      let formValues;

      if (!user) {
        const result = await Swal.fire({
          title: 'הרשמה ורכישה',
          html: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input id="swal-input1" class="swal2-input" placeholder="שם פרטי *" required>
              <input id="swal-input2" class="swal2-input" placeholder="שם משפחה *" required>
              <input id="swal-input3" class="swal2-input" placeholder="אימייל *" required>
              <input id="swal-input4" class="swal2-input" placeholder="סיסמה *" type="password" required>
              <input id="swal-input5" class="swal2-input" placeholder="מספר טלפון *" required>
              <input id="swal-input6" class="swal2-input" placeholder="כתובת (רחוב + מספר) *" required>
              <input id="swal-input7" class="swal2-input" placeholder="עיר *" required>
              <input id="swal-input8" class="swal2-input" placeholder="מיקוד">
              <input id="swal-input9" class="swal2-input" placeholder="תעודת זהות *" required>
            </div>
            <p style="margin-top: 10px; font-size: 0.8em;">* שדות חובה</p>
          `,
          focusConfirm: false,
          preConfirm: () => {
            const values = {
              firstName: document.getElementById('swal-input1').value,
              lastName: document.getElementById('swal-input2').value,
              email: document.getElementById('swal-input3').value,
              password: document.getElementById('swal-input4').value,
              phone: document.getElementById('swal-input5').value,
              address: document.getElementById('swal-input6').value,
              city: document.getElementById('swal-input7').value,
              zip: document.getElementById('swal-input8').value || '7822800',
              idNum: document.getElementById('swal-input9').value,
            };
            
            for (const [key, value] of Object.entries(values)) {
              if (!value && key !== 'zip') {
                Swal.showValidationMessage(`אנא מלא את כל שדות החובה`);
                return false;
              }
            }
            
            return values;
          }
        });

        if (result.isConfirmed) {
          formValues = result.value;
        } else {
          return;
        }

        const { data: newUser, error: signUpError } = await supabase.auth.signUp({
          email: formValues.email,
          password: formValues.password,
        });

        if (signUpError) throw signUpError;

        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert({
            id: newUser.user.id,
            email: formValues.email,
            first_name: formValues.firstName,
            last_name: formValues.lastName,
            phone_num: formValues.phone.startsWith('0') ? formValues.phone : `0${formValues.phone}`,
            street_address: formValues.address,
            city: formValues.city,
            zip: formValues.zip,
            id_num: formValues.idNum
          })
          .single();

        if (userError) throw userError;

        user = newUser.user;
      } else {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;

        formValues = {
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: userData.email,
          phone: userData.phone_num,
          address: userData.street_address,
          city: userData.city,
          zip: userData.zip || '7822800',
          idNum: userData.id_num
        };

        const missingFields = Object.entries(formValues).filter(([key, value]) => !value && key !== 'zip');
        if (missingFields.length > 0) {
          const result = await Swal.fire({
            title: 'השלמת פרטים',
            html: missingFields.map(([key, _]) => 
              `<input id="swal-input-${key}" class="swal2-input" placeholder="${key}" required>`
            ).join(''),
            focusConfirm: false,
            preConfirm: () => {
              const updatedValues = {};
              missingFields.forEach(([key, _]) => {
                updatedValues[key] = document.getElementById(`swal-input-${key}`).value;
              });
              return updatedValues;
            }
          });

          if (result.isConfirmed) {
            Object.assign(formValues, result.value);
            await supabase
              .from('users')
              .update(result.value)
              .eq('id', user.id);
          } else {
            return;
          }
        }
      }

      if (formValues.phone && typeof formValues.phone === 'string') {
        formValues.phone = formValues.phone.startsWith('0') ? formValues.phone : `0${formValues.phone}`;
      } else {
        throw new Error('מספר טלפון לא תקין');
      }

      const invoiceData = {
        description: 'רכישת קורס',
        type: 400,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        lang: "he",
        currency: "ILS",
        vatType: 0,
        amount: finalPrice,
        group: 100,
        maxPayments: 1,
        pluginId: "74fd5825-12c4-4e20-9942-cc0f2b6dfe85",
        client: {
          name: `${formValues.firstName} ${formValues.lastName}`,
          emails: [formValues.email],
          taxId: formValues.idNum,
          address: formValues.address,
          city: formValues.city,
          zip: formValues.zip,
          country: "IL",
          phone: formValues.phone,
          fax: formValues.phone,
          mobile: formValues.phone,
          add: true
        },
        successUrl: `https://courses-seven-alpha.vercel.app/personal-area?status=success`,
        failureUrl: `https://courses-seven-alpha.vercel.app/purchase/${course.id}?status=failure`,
        notifyUrl: "https://courses-seven-alpha.vercel.app/notify",
        custom: "300700556"
      };

      const invoiceCreated = await createGreenInvoice(invoiceData);

      if (!invoiceCreated) throw new Error('Failed to create invoice');

      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          current_lesson: 1,
          amount_paid: finalPrice,
          course_title: course.title,
        });

      if (enrollmentError) throw enrollmentError;

      Swal.fire('הרכישה בתהליך', 'אתה מועבר לדף התשלום.', 'info');
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