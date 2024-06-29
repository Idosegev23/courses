import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBook, FaPlus, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import Swal from 'sweetalert2';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, Container, Grid, Button, TextField, Modal, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700&display=swap');
  
  body {
    font-family: 'Heebo', sans-serif;
    background-color: #f4f4f4;
    direction: rtl;
    margin: 0;
    padding: 0;
  }
`;

const DashboardContainer = styled(Container)`
  padding: 2rem;
  background: #ffffff;
  text-align: center;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled(Typography)`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: ${theme.palette.primary.main};

  svg {
    margin-left: 0.5rem;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  th, td {
    padding: 1rem;
    text-align: right;
    border-bottom: 1px solid #f0f0f0;
  }

  th {
    background-color: ${theme.palette.primary.main};
    color: white;
    font-weight: bold;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const ActionButton = styled(Button)`
  margin: 0.25rem;
`;

const ModalContent = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ProgressBar = styled.div`
  width: 100%;
  background-color: #ddd;
  border-radius: 5px;
  overflow: hidden;

  div {
    width: ${props => props.progress}%;
    background-color: #62238C;
    height: 20px;
  }
`;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [userProgress, setUserProgress] = useState({});
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
    fetchData();
    fetchUserProgress();
  }, []);

  const fetchData = async () => {
    const { data: usersData, error: usersError } = await supabase.from('users').select('*');
    const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*');
    const { data: enrollmentsData, error: enrollmentsError } = await supabase.from('enrollments').select('*');

    if (usersError) console.error('Error fetching users:', usersError);
    if (coursesError) console.error('Error fetching courses:', coursesError);
    if (enrollmentsError) console.error('Error fetching enrollments:', enrollmentsError);

    setUsers(usersData || []);
    setCourses(coursesData || []);
    setEnrollments(enrollmentsData || []);
  };

  const fetchUserProgress = async (userId) => {
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);
  
    if (progressError) {
      console.error('Error fetching user progress:', progressError);
      return;
    }
  
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (title, total_lessons)
      `)
      .eq('user_id', userId);
  
    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return;
    }
  
    const progressMap = {};
    progressData.forEach(progress => {
      progressMap[progress.user_id] = progress;
    });
  
    setUserProgress(prevState => ({
      ...prevState,
      [userId]: progressMap
    }));
    setEnrollments(enrollmentsData || []);
  };
  
  const sendCourseRecommendationEmail = async (userId) => {
    // קוד לשליחת אימייל המלצה לקורסים נוספים
    console.log(`Sending course recommendation email to user ${userId}`);
    // כאן תוכל להוסיף את הלוגיקה לשליחת אימייל אמיתי
  };

  const sendMotivationEmail = async (userId) => {
    // קוד לשליחת אימייל מוטיבציה
    console.log(`Sending motivation email to user ${userId}`);
    // כאן תוכל להוסיף את הלוגיקה לשליחת אימייל אמיתי
  };

  const handleEditCourse = (courseId) => {
    navigate(`/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = async (courseId) => {
    const result = await Swal.fire({
      title: 'האם אתה בטוח?',
      text: "לא ניתן לשחזר פעולה זו!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'כן, מחק!'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) throw error;
        setCourses(courses.filter(course => course.id !== courseId));
        Swal.fire('נמחק!', 'הקורס נמחק בהצלחה.', 'success');
      } catch (error) {
        console.error('Error deleting course:', error);
        Swal.fire('שגיאה', 'אירעה שגיאה במחיקת הקורס', 'error');
      }
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
      Swal.fire('עודכן בהצלחה', 'ההנחה עודכנה בהצלחה', 'success');
    } catch (error) {
      console.error('Error updating user discount:', error);
      Swal.fire('שגיאה', 'אירעה שגיאה בעדכון ההנחה', 'error');
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course-learning/${courseId}`);
  };

  const handleViewUser = async (userId) => {
    await fetchUserProgress(userId);
  
    const user = users.find((user) => user.id === userId);
    if (user) {
      const userEnrollments = enrollments.filter(enrollment => enrollment.user_id === userId);
  
      let enrollmentDetails = '';
      userEnrollments.forEach(enrollment => {
        const course = courses.find(course => course.id === enrollment.course_id);
        if (course) {
          enrollmentDetails += `
            <p><strong>Course:</strong> ${course.title}</p>
            <p><strong>Progress:</strong> ${enrollment.current_lesson} / ${course.total_lessons}</p>
          `;
        }
      });
  
      const result = await Swal.fire({
        title: `User Details: ${user.username}`,
        html: `
          <p><strong>אימייל:</strong> ${user.email}</p>
          <p><strong>הנחה:</strong> ${user.discount}%</p>
          <p><strong>שם משתמש:</strong> ${user.username}</p>
          ${enrollmentDetails}
        `,
        showCancelButton: true,
        confirmButtonText: 'עריכה',
        cancelButtonText: 'סגור'
      });
  
      if (result.isConfirmed) {
        handleEditUserDetails(userId);
      }
    }
  };
  
  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: 'האם אתה בטוח?',
      text: "לא ניתן לשחזר פעולה זו!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'כן, מחק!'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) throw error;
        setUsers(users.filter(user => user.id !== userId));
        Swal.fire('נמחק!', 'המשתמש נמחק בהצלחה.', 'success');
      } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire('שגיאה', 'אירעה שגיאה במחיקת המשתמש', 'error');
      }
    }
  };

  const handleSaveNewUser = async () => {
    try {
      const { error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            username: newUsername,
            discount: newUserDiscount,
          },
        },
      });

      if (error) throw error;

      Swal.fire('נוצר בהצלחה', 'המשתמש נוצר בהצלחה', 'success');
      setShowAddUserModal(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUsername('');
      setNewUserDiscount('');

      fetchData();
    } catch (error) {
      console.error('Error creating user:', error);
      Swal.fire('שגיאה', 'אירעה שגיאה ביצירת המשתמש', 'error');
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

      Swal.fire('עודכן בהצלחה', 'פרטי המשתמש עודכנו בהצלחה', 'success');
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
      Swal.fire('שגיאה', 'אירעה שגיאה בעדכון פרטי המשתמש', 'error');
    }
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    const result = await Swal.fire({
      title: 'האם אתה בטוח?',
      text: "לא ניתן לשחזר פעולה זו!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'כן, מחק!'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from('enrollments').delete().eq('id', enrollmentId);
        if (error) throw error;
        setEnrollments(enrollments.filter(enrollment => enrollment.id !== enrollmentId));
        Swal.fire('נמחק!', 'ההרשמה נמחקה בהצלחה.', 'success');
      } catch (error) {
        console.error('Error deleting enrollment:', error);
        Swal.fire('שגיאה', 'אירעה שגיאה במחיקת ההרשמה', 'error');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <DashboardContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SectionTitle variant="h4"><FaUser /> ניהול משתמשים</SectionTitle>
          <Grid container spacing={2} style={{ marginBottom: '2rem' }}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FaPlus />}
                onClick={() => setShowAddUserModal(true)}
              >
                הוסף משתמש חדש
              </Button>
            </Grid>
          </Grid>
          <StyledTable>
            <thead>
              <tr>
                <th>אימייל</th>
                <th>שם משתמש</th>
                <th>הנחה</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td>{user.email}</td>
                    <td>{user.username}</td>
                    <td>{user.discount}%</td>
                    <td>
                      <ActionButton
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleViewUser(user.id)}
                      >
                        צפייה
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => handleAddDiscount(user.id)}
                      >
                        עריכת הנחה
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        מחיקה
                      </ActionButton>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </StyledTable>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SectionTitle variant="h4"><FaBook /> ניהול קורסים</SectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <th>כותרת</th>
                <th>תיאור</th>
                <th>מחיר</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {courses.map((course) => (
                  <motion.tr
                    key={course.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td>{course.title}</td>
                    <td>{course.description}</td>
                    <td>{course.price} ש"ח</td>
                    <td>
                      <ActionButton
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleViewCourse(course.id)}
                      >
                        צפייה
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => handleEditCourse(course.id)}
                      >
                        עריכה
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        מחיקה
                      </ActionButton>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </StyledTable>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SectionTitle variant="h4"><FaMoneyBillWave /> ניהול הרשמות</SectionTitle>
          <StyledTable>
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
              <AnimatePresence>
                {enrollments.map((enrollment) => (
                  <motion.tr
                    key={enrollment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td>{users.find((user) => user.id === enrollment.user_id)?.email}</td>
                    <td>{courses.find((course) => course.id === enrollment.course_id)?.title}</td>
                    <td>{enrollment.current_lesson}</td>
                    <td>{enrollment.amount_paid} ש"ח</td>
                    <td>
                      <ActionButton
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteEnrollment(enrollment.id)}
                      >
                        מחיקה
                      </ActionButton>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </StyledTable>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <SectionTitle variant="h4"><FaChartLine /> התקדמות משתמשים</SectionTitle>
          <StyledTable>
            <thead>
              <tr>
                <th>משתמש</th>
                <th>קורס</th>
                <th>אחוז השלמה</th>
                <th>פעילות אחרונה</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {Object.entries(userProgress).map(([userId, progress]) => (
                  <motion.tr
                    key={userId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td>{users.find(user => user.id === userId)?.email}</td>
                    <td>{courses.find(course => course.id === progress.course_id)?.title}</td>
                    <td>
                      <ProgressBar progress={progress.completion_percentage}>
                        <div></div>
                      </ProgressBar>
                    </td>
                    <td>{new Date(progress.last_activity).toLocaleDateString()}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </StyledTable>
        </motion.div>

        <Grid container justifyContent="center" style={{ marginTop: '2rem' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<FaPlus />}
            onClick={() => navigate('/add-course')}
          >
            הוסף קורס חדש
          </Button>
        </Grid>

        <Grid container justifyContent="center" style={{ marginTop: '1rem' }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={checkAndSendAutomatedEmails}
          >
            בדוק והפעל אוטומציות
          </Button>
        </Grid>
      </DashboardContainer>

      <Modal open={showAddUserModal} onClose={() => setShowAddUserModal(false)}>
        <ModalContent>
          <Typography variant="h6" style={{ marginBottom: '1rem' }}>הוסף משתמש חדש</Typography>
          <TextField
            fullWidth
            label="אימייל"
            variant="outlined"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <TextField
            fullWidth
            label="סיסמה"
            type="password"
            variant="outlined"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <TextField
            fullWidth
            label="שם משתמש"
            variant="outlined"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <TextField
            fullWidth
            label="הנחה קבועה (%)"
            type="number"
            variant="outlined"
            value={newUserDiscount}
            onChange={(e) => setNewUserDiscount(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <Button variant="contained" color="primary" onClick={handleSaveNewUser}>שמור</Button>
          <Button variant="outlined" onClick={() => setShowAddUserModal(false)} style={{ marginLeft: '1rem' }}>ביטול</Button>
        </ModalContent>
      </Modal>

      <Modal open={showEditUserModal} onClose={() => setShowEditUserModal(false)}>
        <ModalContent>
          <Typography variant="h6" style={{ marginBottom: '1rem' }}>ערוך פרטי משתמש</Typography>
          <TextField
            fullWidth
            label="שם משתמש"
            variant="outlined"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <TextField
            fullWidth
            label="הנחה קבועה (%)"
            type="number"
            variant="outlined"
            value={editingUserDiscount}
            onChange={(e) => setEditingUserDiscount(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <Button variant="contained" color="primary" onClick={handleUpdateUserDetails}>שמור</Button>
          <Button variant="outlined" onClick={() => setShowEditUserModal(false)} style={{ marginLeft: '1rem' }}>ביטול</Button>
        </ModalContent>
      </Modal>
    </ThemeProvider>
  );
};

export default AdminDashboard;
