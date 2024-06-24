import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBook, FaPlus, FaMoneyBillWave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    direction: rtl;
    background-color: #f4f4f4;
  }
`;

const DashboardContainer = styled.div`
  padding: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;

  & > svg {
    margin-left: 0.5rem;
  }
`;

const TableContainer = styled.div`
  margin-bottom: 2rem;
  background: #fff;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 1rem;
    border-bottom: 1px solid #ddd;
    text-align: right; /* מימין לשמאל */
  }

  th {
    background-color: #f5f5f5;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const ActionButton = styled.button`
  background-color: #f25c78;
  color: #fff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #bf4b81;
  }
`;

const AddCourseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }

  & > svg {
    margin-left: 0.5rem;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Input = styled.input`
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #ddd;
  width: 100%;
`;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUserDiscount, setNewUserDiscount] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserDiscount, setEditingUserDiscount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData, error: usersError } = await supabase.from('users').select('*');
      const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*');
      const { data: enrollmentsData, error: enrollmentsError } = await supabase.from('enrollments').select('*');

      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else {
        setUsers(usersData || []);
      }

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
      } else {
        setCourses(coursesData || []);
      }

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
      } else {
        setEnrollments(enrollmentsData || []);
      }
    };

    fetchData();
  }, []);

  const handleEditCourse = (courseId) => {
    navigate(`/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId);

      if (enrollmentsError) throw enrollmentsError;

      const userList = enrollments.map(enrollment => {
        const user = users.find(user => user.id === enrollment.user_id);
        return user ? user.email : 'לא ידוע';
      });

      const result = await Swal.fire({
        title: 'האם אתה בטוח שברצונך למחוק את הקורס?',
        html: `<p>להלן רשימת המשתמשים הרשומים לקורס:</p>
               <ul>${userList.map(email => `<li>${email}</li>`).join('')}</ul>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'כן, מחק',
        cancelButtonText: 'בטל',
      });

      if (!result.isConfirmed) {
        return;
      }

      for (const enrollment of enrollments) {
        const { user_id } = enrollment;
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id,
            message: `הקורס אליו היית רשום בוטל: ${courses.find(course => course.id === courseId)?.title}`,
            read: false,
            created_at: new Date().toISOString()
          });

        if (notificationError) {
          console.error(`Error sending notification to user ${user_id}:`, notificationError);
        }
      }

      const { error: deleteEnrollmentsError } = await supabase
        .from('enrollments')
        .delete()
        .eq('course_id', courseId);

      if (deleteEnrollmentsError) throw deleteEnrollmentsError;

      const { error: deleteCourseError } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (deleteCourseError) throw deleteCourseError;

      alert('הקורס וההרשמות הקשורות אליו הוסרו בהצלחה.');
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Error deleting course and enrollments:', error);
      alert('התרחשה שגיאה בהסרת הקורס וההרשמות הקשורות.');
    }
  };
  const handleAddDiscount = (userId) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      setEditingUserId(userId);
      setEditingUserDiscount(user.discount);
      setShowEditUserModal(true);
    }
  };
  
  const handleUpdateUserDiscount = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ discount: editingUserDiscount })
        .eq('id', editingUserId);
  
      if (error) throw error;
  
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUserId ? { ...user, discount: editingUserDiscount } : user
        )
      );
  
      setShowEditUserModal(false);
      setEditingUserId(null);
      setEditingUserDiscount('');
    } catch (error) {
      console.error('Error updating user discount:', error);
      alert('התרחשה שגיאה בעדכון ההנחה של המשתמש.');
    }
  };
  
  const handleViewCourse = (courseId) => {
    navigate(`/course-learning/${courseId}`);
  };

  const handleViewUser = async (userId) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      const result = await Swal.fire({
        title: `פרטי משתמש: ${user.username}`,
        html: `
          <p><strong>אימייל:</strong> ${user.email}</p>
          <p><strong>הנחה:</strong> ${user.discount}%</p>
          <p><strong>שם משתמש:</strong> ${user.username}</p>
          <div class="swal2-actions">
            <button id="edit-user-details" class="swal2-confirm swal2-styled">ערוך פרטי משתמש</button>
            <button id="add-discount" class="swal2-confirm swal2-styled">הוסף / ערוך הנחה</button>
            <button id="delete-user" class="swal2-cancel swal2-styled">מחק משתמש</button>
          </div>
        `,
        showCancelButton: false,
        showConfirmButton: false,
        didRender: () => {
          const editUserDetailsButton = Swal.getPopup().querySelector('#edit-user-details');
          const addDiscountButton = Swal.getPopup().querySelector('#add-discount');
          const deleteUserButton = Swal.getPopup().querySelector('#delete-user');

          editUserDetailsButton.addEventListener('click', () => handleEditUserDetails(userId));
          addDiscountButton.addEventListener('click', () => handleAddDiscount(userId));
          deleteUserButton.addEventListener('click', () => handleDeleteUser(userId));
        }
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      const result = await Swal.fire({
        title: `האם אתה בטוח שברצונך למחוק את המשתמש: ${user.username}?`,
        text: 'פעולה זו אינה ניתנת לביטול!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'כן, מחק',
        cancelButtonText: 'בטל'
      });

      if (result.isConfirmed) {
        try {
          const serviceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;
          const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;

          // בדיקת השליפה של הפרמטרים הנכונים
          console.log('Supabase URL:', supabaseUrl);
          console.log('Service Role Key:', serviceRoleKey);

          if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Missing Supabase URL or Service Role Key');
          }

          // מחיקת המשתמש מההרשאות (Auth)
          const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (!authResponse.ok) {
            throw new Error('Error deleting user from auth');
          }

          // מחיקת המשתמש מבסיס הנתונים
          const { error: dbError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

          if (dbError) throw dbError;

          setUsers(users.filter(user => user.id !== userId));
          Swal.fire('נמחק!', 'המשתמש נמחק בהצלחה.', 'success');
        } catch (error) {
          console.error('Error deleting user:', error);
          Swal.fire('שגיאה!', 'התרחשה שגיאה במחיקת המשתמש.', 'error');
        }
      }
    }
  };

  const handleSaveNewUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUsername) {
      alert('אנא מלא את כל השדות.');
      return;
    }

    try {
      const { data: newUser, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (authError) {
        if (authError.message.includes('Email rate limit exceeded')) {
          console.error('Email rate limit exceeded. Please wait and try again later.');
          alert('שגיאה: יותר מדי בקשות יצירת משתמשים בזמן קצר. אנא המתן ונסה שוב מאוחר יותר.');
          return;
        } else {
          console.error('Error creating user in Supabase Auth:', authError);
          alert(`שגיאה ביצירת משתמש באוטנטיקציה: ${authError.message}`);
          return;
        }
      }

      const { user } = newUser;

      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: newUserEmail,
          username: newUsername,
          discount: newUserDiscount || 0,
        });

      if (dbError) {
        console.error('Error saving user to database:', dbError);
        alert(`שגיאה בהוספת המשתמש לבסיס הנתונים: ${dbError.message}`);
        return;
      }

      setShowAddUserModal(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUsername('');
      setNewUserDiscount('');

      setUsers((prevUsers) => [
        ...prevUsers,
        {
          id: user.id,
          email: newUserEmail,
          username: newUsername,
          discount: newUserDiscount || 0,
        },
      ]);

      alert('המשתמש נוסף בהצלחה!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('אירעה שגיאה בלתי צפויה.');
    }
  };

  const handleEditUserDetails = (userId) => {
    const user = users.find((user) => user.id === userId);
    setEditingUserId(userId);
    setNewUsername(user ? user.username : '');
    setShowEditUserModal(true);
  };

  const handleUpdateUserDetails = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', editingUserId);

      if (error) throw error;

      alert('פרטי המשתמש עודכנו בהצלחה.');
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === editingUserId ? { ...user, username: newUsername } : user
        )
      );

      setShowEditUserModal(false);
      setEditingUserId(null);
      setNewUsername('');
    } catch (error) {
      console.error('Error updating user details:', error);
      alert('התרחשה שגיאה בעדכון פרטי המשתמש.');
    }
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    try {
      const result = await Swal.fire({
        title: 'האם אתה בטוח שברצונך למחוק את ההרשמה הזו?',
        text: 'פעולה זו אינה ניתנת לביטול!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'כן, מחק',
        cancelButtonText: 'בטל'
      });

      if (!result.isConfirmed) {
        return;
      }

      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;

      // עדכון הרשימה המקומית של ההרשמות
      setEnrollments(enrollments.filter(enrollment => enrollment.id !== enrollmentId));
      Swal.fire('נמחק!', 'ההרשמה נמחקה בהצלחה.', 'success');
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      Swal.fire('שגיאה!', 'התרחשה שגיאה במחיקת ההרשמה.', 'error');
    }
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleFilterUsers = () => {
    console.log('סינון משתמשים');
  };

  return (
    <>
      <GlobalStyle />
      <DashboardContainer>
        <main className='container mx-auto mt-10'>
        <SectionTitle><FaUser /> משתמשים</SectionTitle>
<TableContainer>
  <div className="flex justify-between mb-4">
    <ActionButton onClick={handleAddUser}>הוסף משתמש חדש</ActionButton>
    <ActionButton onClick={handleFilterUsers}>סנן משתמשים</ActionButton>
  </div>
  <Table>
    <thead>
      <tr>
        <th>אימייל</th>
        <th>שם משתמש</th>
        <th>הנחה</th>
        <th>פעולות</th>
      </tr>
    </thead>
    <tbody>
      {users.length > 0 ? (
        users.map((user) => (
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>{user.username}</td>
            <td>{user.discount}%</td>
            <td>
              <ActionButton onClick={() => handleViewUser(user.id)}>
                צפייה בפרטים
              </ActionButton>
              <ActionButton onClick={() => handleAddDiscount(user.id)} style={{ marginLeft: '0.5rem' }}>
                הוסף / ערוך הנחה
              </ActionButton>
              <ActionButton onClick={() => handleDeleteUser(user.id)} style={{ marginLeft: '0.5rem' }}>
                מחק משתמש
              </ActionButton>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="4">לא נמצאו משתמשים.</td>
        </tr>
      )}
    </tbody>
  </Table>
</TableContainer>

          <SectionTitle><FaBook /> קורסים</SectionTitle>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>כותרת</th>
                  <th>תיאור</th>
                  <th>מחיר</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.title}</td>
                      <td>{course.description}</td>
                      <td>{course.price} ש"ח</td>
                      <td>
                        <ActionButton onClick={() => handleViewCourse(course.id)}>
                          צפייה בפרטים
                        </ActionButton>
                        <ActionButton onClick={() => handleEditCourse(course.id)} style={{ marginLeft: '0.5rem' }}>
                          ערוך קורס
                        </ActionButton>
                        <ActionButton onClick={() => handleDeleteCourse(course.id)} style={{ marginLeft: '0.5rem' }}>
                          הסר קורס
                        </ActionButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">לא נמצאו קורסים.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          <SectionTitle><FaMoneyBillWave /> הרשמות</SectionTitle>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>משתמש</th>
                  <th>קורס</th>
                  <th>שיעור נוכחי</th>
                  <th>תשלום</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.length > 0 ? (
                  enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>{users.find((user) => user.id === enrollment.user_id)?.email}</td>
                      <td>{courses.find((course) => course.id === enrollment.course_id)?.title}</td>
                      <td>{enrollment.current_lesson}</td>
                      <td>{enrollment.amount_paid} ש"ח</td>
                      <td>
                        <ActionButton onClick={() => handleDeleteEnrollment(enrollment.id)}>
                          מחק הרשמה
                        </ActionButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">לא נמצאו הרשמות.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          <div className='flex justify-center mt-8'>
            <AddCourseButton onClick={() => navigate('/add-course')}>
              <FaPlus /> הוסף קורס חדש
            </AddCourseButton>
          </div>
        </main>
      </DashboardContainer>

      {showAddUserModal && (
        <ModalOverlay>
          <ModalContent>
            <h2>הוסף משתמש חדש</h2>
            <Input
              type="email"
              placeholder="אימייל"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="סיסמה"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
            />
            <Input
              type="text"
              placeholder="שם משתמש"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <Input
              type="number"
              placeholder="הנחה קבועה (%)"
              value={newUserDiscount}
              onChange={(e) => setNewUserDiscount(e.target.value)}
            />
            <div className="flex justify-between mt-4">
              <ActionButton onClick={handleSaveNewUser}>שמור</ActionButton>
              <ActionButton onClick={() => setShowAddUserModal(false)}>בטל</ActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {showEditUserModal && (
        <ModalOverlay>
          <ModalContent>
            <h2>ערוך פרטי משתמש</h2>
            <Input
              type="text"
              placeholder="שם משתמש"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <Input
              type="number"
              placeholder="הנחה קבועה (%)"
              value={editingUserDiscount}
              onChange={(e) => setEditingUserDiscount(e.target.value)}
            />
            <div className="flex justify-between mt-4">
              <ActionButton onClick={handleUpdateUserDetails}>שמור</ActionButton>
              <ActionButton onClick={() => setShowEditUserModal(false)}>בטל</ActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default AdminDashboard;
