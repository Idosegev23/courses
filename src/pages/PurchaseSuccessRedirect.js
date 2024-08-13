import React, { useEffect } from 'react';
   import { useNavigate, useLocation } from 'react-router-dom';
   import Swal from 'sweetalert2';
   import withReactContent from 'sweetalert2-react-content';
   import confetti from 'canvas-confetti';
   import { useAuth } from '../hooks/useAuth';

   const MySwal = withReactContent(Swal);

   const PurchaseSuccessRedirect = () => {
     const navigate = useNavigate();
     const location = useLocation();
     const { user } = useAuth();

     useEffect(() => {
       const params = new URLSearchParams(location.search);
       const courseId = params.get('courseId');
       const success = params.get('success');
       const message = params.get('message');
       
       if (success !== 'true') {
         // טיפול במקרה של כישלון בתשלום
         MySwal.fire({
           icon: 'error',
           title: 'שגיאה בתשלום',
           text: message || 'אירעה שגיאה בעת ביצוע התשלום. אנא נסה שנית.',
         }).then(() => {
           navigate('/courses');
         });
         return;
       }

       // הפעלת אנימציית הקונפטי
       const duration = 5 * 1000;
       const end = Date.now() + duration;

       const frame = () => {
         confetti({
           particleCount: 2,
           angle: 60,
           spread: 55,
           origin: { x: 0 },
           colors: ['#ff0000', '#00ff00', '#0000ff']
         });
         confetti({
           particleCount: 2,
           angle: 120,
           spread: 55,
           origin: { x: 1 },
           colors: ['#ff0000', '#00ff00', '#0000ff']
         });

         if (Date.now() < end) {
           requestAnimationFrame(frame);
         }
       };

       frame();

       MySwal.fire({
         icon: 'success',
         title: 'התשלום הושלם בהצלחה!',
         html: `${message}<br>מעביר אותך לאזור האישי בעוד <b></b> שניות.`,
         timer: 5000,
         timerProgressBar: true,
         didOpen: () => {
           Swal.showLoading();
           const b = Swal.getHtmlContainer().querySelector('b');
           const timerInterval = setInterval(() => {
             b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
           }, 100);
           return () => clearInterval(timerInterval);
         }
       }).then(() => {
         if (user) {
           navigate('/personal-area', { state: { newPurchase: true, courseId } });
         } else {
           navigate('/login', { state: { from: '/payment-success', courseId } });
         }
       });
     }, [navigate, location, user]);

     return null;
   };

   export default PurchaseSuccessRedirect;