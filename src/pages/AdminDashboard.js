import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBook, FaPlus, FaMoneyBillWave } from 'react-icons/fa';
import styled, { createGlobalStyle } from 'styled-components';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// סגנונות גלובליים
const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Heebo', sans-serif;
    direction: rtl;
  }
`;

// סגנונות עיצוב
const DashboardContainer = styled.div`
  background-color: #f4f4f4;
  min-height: 100vh;
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

const GraphContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%; /* נקטין את הרוחב */
  max-width: 400px; /* מקסימום רוחב */
  display: inline-block;
  vertical-align: top;
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

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleAddDiscount = (userId) => {
    // פתיחת מודל לעריכת הנחה למשתמש קיים
    const user = users.find((user) => user.id === userId);
    setEditingUserId(userId);
    setEditingUserDiscount(user ? user.discount : 0);
    setShowEditUserModal(true);
  };

  const handleUpdateDiscount = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ discount: editingUserDiscount })
        .eq('id', editingUserId);

      if (error) throw error;

      alert('ההנחה עודכנה בהצלחה.');
      // רענון הרשימה
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === editingUserId ? { ...user, discount: editingUserDiscount } : user
        )
      );

      setShowEditUserModal(false);
      setEditingUserId(null);
      setEditingUserDiscount('');
    } catch (error) {
      console.error('Error updating discount:', error);
      alert('התרחשה שגיאה בעדכון ההנחה.');
    }
  };

  const handleRemoveCourse = (courseId) => {
    // לוגיקה להסרת קורס
    console.log(`הסרת הקורס עם מזהה ${courseId}`);
  };

  const handleFilterUsers = () => {
    // לוגיקה לסינון משתמשים
    console.log('סינון משתמשים');
  };

  const handleAddUser = async () => {
    // פתיחת מודל להוספת משתמש חדש
    setShowAddUserModal(true);
  };

  const handleSaveNewUser = async () => {
    console.log('Saving new user...');

    // בדיקה שהשדות מלאים
    if (!newUserEmail || !newUserPassword || !newUsername) {
      alert('אנא מלא את כל השדות.');
      return;
    }

    try {
      // יצירת משתמש חדש ב-Supabase Auth
      console.log('Creating user in Supabase Auth...');
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

      console.log('User created in Supabase Auth:', newUser);

      // הוספת המשתמש החדש לטבלת ה-users עם הנחה קבועה
      console.log('Inserting new user into users table...');
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: newUser.user.id,
          email: newUserEmail,
          username: newUsername,
          discount: newUserDiscount || 0, // הנחה קבועה, אם קיימת
        });

      if (dbError) {
        console.error('Error saving user to database:', dbError);
        alert(`שגיאה בהוספת המשתמש לבסיס הנתונים: ${dbError.message}`);
        return;
      }

      console.log('User inserted into users table.');

      // סגירת המודל ואיפוס השדות
      setShowAddUserModal(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUsername('');
      setNewUserDiscount('');

      // רענון רשימת המשתמשים
      setUsers((prevUsers) => [
        ...prevUsers,
        {
          id: newUser.user.id,
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

  // נתונים לגרפים
  const userChartData = {
    labels: users.map(user => user.email),
    datasets: [
      {
        label: 'משתמשים',
        data: users.map(user => 1),
        backgroundColor: '#f25c78',
      },
    ],
  };

  const courseChartData = {
    labels: courses.map(course => course.title),
    datasets: [
      {
        label: 'קורסים',
        data: courses.map(course => 1),
        backgroundColor: '#4caf50',
      },
    ],
  };

  return (
    <>
      <GlobalStyle />
      <DashboardContainer>
        <main className='container mx-auto mt-10'>
          <SectionTitle><FaUser /> משתמשים</SectionTitle>
          <div className='flex justify-between'>
            <GraphContainer>
              <Doughnut data={userChartData} />
            </GraphContainer>
            <TableContainer style={{ flexGrow: 1 }}>
              <div className="flex justify-between mb-4">
                <ActionButton onClick={handleAddUser}>הוסף משתמש חדש</ActionButton>
                <ActionButton onClick={handleFilterUsers}>סנן משתמשים</ActionButton>
              </div>
              <Table>
                <thead>
                  <tr>
                    <th>אימייל</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>
                          <ActionButton onClick={() => handleViewUser(user.id)}>
                            צפייה בפרטים
                          </ActionButton>
                          <ActionButton onClick={() => handleAddDiscount(user.id)} style={{ marginLeft: '0.5rem' }}>
                            הוסף / ערוך הנחה
                          </ActionButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">לא נמצאו משתמשים.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </div>

          <SectionTitle><FaBook /> קורסים</SectionTitle>
          <div className='flex justify-between'>
            <GraphContainer>
              <Bar data={courseChartData} />
            </GraphContainer>
            <TableContainer style={{ flexGrow: 1 }}>
              <Table>
                <thead>
                  <tr>
                    <th>כותרת</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <tr key={course.id}>
                        <td>{course.title}</td>
                        <td>
                          <ActionButton onClick={() => handleViewCourse(course.id)}>
                            צפייה בפרטים
                          </ActionButton>
                          <ActionButton onClick={() => handleRemoveCourse(course.id)} style={{ marginLeft: '0.5rem' }}>
                            הסר קורס
                          </ActionButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2">לא נמצאו קורסים.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </div>

          <SectionTitle><FaMoneyBillWave /> הרשמות</SectionTitle>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <th>משתמש</th>
                  <th>קורס</th>
                  <th>שיעור נוכחי</th>
                  <th>תשלום</th>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">לא נמצאו הרשמות.</td>
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
            <h2>ערוך הנחה למשתמש</h2>
            <Input
              type="number"
              placeholder="הנחה קבועה (%)"
              value={editingUserDiscount}
              onChange={(e) => setEditingUserDiscount(e.target.value)}
            />
            <div className="flex justify-between mt-4">
              <ActionButton onClick={handleUpdateDiscount}>שמור</ActionButton>
              <ActionButton onClick={() => setShowEditUserModal(false)}>בטל</ActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default AdminDashboard;
