import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePurchase = () => {
    // בדיקה אם המשתמש הוא האדמין
    if (user && user.email === 'Triroars@gmail.com') {
      navigate(`/purchase/${course.id}`);
    } else {
      // מעבר לדף הסליקה עבור משתמשים רגילים
      navigate(`/purchase/${course.id}`);
    }
  };

  return (
    <div className='bg-white shadow-custom rounded-lg p-4 m-4 w-72'>
      <img src={course.image || '/default-course.jpg'} alt={course.title} className='w-full h-40 object-cover rounded-t-lg' />
      <div className='p-4'>
        <h3 className='text-xl font-bold text-primary mb-2'>{course.title}</h3>
        <p className='text-gray-600 mb-4'>{course.description}</p>
        <div className='flex justify-between'>
          <button 
            onClick={() => navigate(`/courses/${course.id}`)} 
            className='bg-primary text-white py-2 px-4 rounded-lg'
          >
            פרטים נוספים
          </button>
          <button 
            onClick={handlePurchase} 
            className='bg-secondary text-white py-2 px-4 rounded-lg'
          >
            רכישה
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
