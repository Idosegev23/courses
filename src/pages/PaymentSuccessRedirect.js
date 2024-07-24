import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import confetti from 'canvas-confetti';
import { useAuth } from '../hooks/useAuth'; // ייתכן שתצטרך להתאים את הנתיב

const MySwal = withReactContent(Swal);

const PaymentSuccessRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const courseId = new URLSearchParams(location.search).get('courseId');
    
    // הפעלת אנימציית הקונפטי
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    let timerInterval;
    MySwal.fire({
      title: 'התשלום הושלם בהצלחה!',
      html: 'תודה על רכישת הקורס. מעביר אותך לאזור האישי בעוד <b></b> שניות.',
      timer: 5000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector('b');
        timerInterval = setInterval(() => {
          b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then(() => {
      if (user) {
        navigate('/personal-area', { state: { newPurchase: true, courseId } });
      } else {
        navigate('/login', { state: { from: '/payment-success', courseId } });
      }
    });

    return () => {
      clearInterval(timerInterval);
    };
  }, [navigate, location, user]);

  return null; // הקומפוננטה לא מרנדרת שום דבר, כי הכל מתבצע בפופאפ
};

export default PaymentSuccessRedirect;