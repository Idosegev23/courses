import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBook, FaPlus, FaMoneyBillWave, FaSort, FaFileExcel } from 'react-icons/fa';
import Swal from 'sweetalert2';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, Container, Grid, Button, TextField, Modal, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { utils, writeFile } from 'xlsx';
import sendEmail from './sendMail'; // נייבא את הפונקציה לשליחת מיילים


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
    cursor: pointer;
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
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
    try {
      console.log('Fetching progress and enrollments for user ID:', userId);
  
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);
  
      if (progressError) {
        console.error('Error fetching user progress:', progressError);
        return;
      }
  
      console.log('User progress data:', progressData);
  
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*, courses (title, total_lessons)')
        .eq('user_id', userId);
  
      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        return;
      }
  
      console.log('User enrollments data:', enrollmentsData);
  
      const progressMap = {};
      progressData.forEach(progress => {
        progressMap[progress.course_id] = progress;
      });
  
      console.log('Progress map:', progressMap);
  
      setUserProgress(prevState => ({
        ...prevState,
        [userId]: progressMap
      }));
      setEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const handleViewUser = async (userId) => {
    console.log('Fetching user progress for user ID:', userId);
  
    await fetchUserProgress(userId);
  
    const user = users.find((user) => user.id === userId);
    if (!user) {
      console.error('User not found for ID:', userId);
      return;
    }
  
    console.log('User data:', user);
  
    const userEnrollments = enrollments.filter(enrollment => enrollment.user_id === userId);
    if (userEnrollments.length === 0) {
      console.warn('No enrollments found for user ID:', userId);
    }
  
    console.log('User enrollments:', userEnrollments);
  
    let enrollmentDetails = '';
    userEnrollments.forEach(enrollment => {
      const course = courses.find(course => course.id === enrollment.course_id);
      const progress = userProgress[userId] && userProgress[userId][course.id];
      if (course && progress) {
        enrollmentDetails += `
          <p><strong>קורס:</strong> ${course.title}</p>
          <p><strong>שיעור נוכחי:</strong> ${enrollment.current_lesson}</p>
          <p><strong>תשלום:</strong> ${enrollment.amount_paid} ש"ח</p>
          <p><strong>התקדמות:</strong> ${progress.current_lesson} / ${course.total_lessons}</p>
          <p><strong>סיים תרגילים:</strong> ${progress.completed_exercises?.join(', ') || 'לא סיים תרגילים'}</p>
        `;
      } else {
        console.warn(`No progress found for course ID: ${course?.id}, title: ${course?.title}`);
      }
    });
  
    console.log('Enrollment details:', enrollmentDetails);
  
    const result = await Swal.fire({
      title: `פרטי משתמש: ${user.username}`,
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
  };

  const handleEditUserDetails = (userId) => {
    const user = users.find((user) => user.id === userId);
    setEditingUserId(userId);
    setNewUsername(user ? user.username : '');
    setShowEditUserModal(true);
  };

  const handleAddDiscount = (userId) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      setEditingUserId(userId);
      setEditingUserDiscount(user.discount);
      setShowEditUserModal(true);
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

  const handleEditCourse = (courseId) => {
    navigate(`/courses/${courseId}/edit`);
  };

  const handleViewCourse = async (courseId) => {
    const course = courses.find((course) => course.id === courseId);
    if (course) {
      const { data: enrollmentsData, error } = await supabase
        .from('enrollments')
        .select('*, users(email)')
        .eq('course_id', courseId);

      if (error) {
        console.error('Error fetching enrollments:', error);
        return;
      }

      const completedUsers = enrollmentsData.filter(e => e.current_lesson >= course.total_lessons);
      const notStartedUsers = enrollmentsData.filter(e => e.current_lesson === 1);
      const activeUsers = enrollmentsData.filter(e => e.current_lesson > 1 && e.current_lesson < course.total_lessons);

      const enrollmentsList = (users) => users.map(u => `<li>${u.users.email} (שיעור נוכחי: ${u.current_lesson})</li>`).join('');

      Swal.fire({
        title: `פרטי קורס: ${course.title}`,
        html: `
          <p><strong>תיאור:</strong> ${course.description}</p>
          <p><strong>מחיר:</strong> ${course.price} ש"ח</p>
          <h3>משתתפים רשומים:</h3>
          <h4>סיימו את הקורס (${completedUsers.length}):</h4>
          <ul>${enrollmentsList(completedUsers)}</ul>
          <h4>לא התחילו (${notStartedUsers.length}):</h4>
          <ul>${enrollmentsList(notStartedUsers)}</ul>
          <h4>משתתפים פעילים (${activeUsers.length}):</h4>
          <ul>${enrollmentsList(activeUsers)}</ul>
        `,
        showCancelButton: true,
        confirmButtonText: 'עריכה',
        cancelButtonText: 'סגור'
      }).then((result) => {
        if (result.isConfirmed) {
          handleEditCourse(courseId);
        }
      });
    }
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

  const handleUpdateUserDetails = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ username: newUsername, discount: editingUserDiscount })
        .eq('id', editingUserId);

      if (error) throw error;

      Swal.fire('עודכן בהצלחה', 'פרטי המשתמש עודכנו בהצלחה', 'success');
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === editingUserId ? { ...user, username: newUsername, discount: editingUserDiscount } : user
        )
      );

      setShowEditUserModal(false);
      setEditingUserId(null);
      setNewUsername('');
      setEditingUserDiscount('');
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

  const sortData = (data, key) => {
    if (!key) return data;

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });

    return sortedData;
  };

  const filterData = (data, filters) => {
    return data.filter(item => {
      for (let key in filters) {
        if (filters[key] && !String(item[key]).toLowerCase().includes(filters[key].toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilter = (key, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
  };

  const exportToExcel = (data, fileName) => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Sheet1");
    writeFile(wb, `${fileName}.xlsx`);
  };

  const renderTable = (data, columns, tableName) => {
    const sortedAndFilteredData = sortData(filterData(data, filters), sortConfig.key);

    return (
      <>
        <Grid container spacing={2} style={{ marginBottom: '1rem' }}>
          {columns.map(column => (
            <Grid item key={column.key}>
              <TextField
                label={`סנן לפי ${column.label}`}
                variant="outlined"
                size="small"
                onChange={(e) => handleFilter(column.key, e.target.value)}
              />
            </Grid>
          ))}
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<FaFileExcel />}
              onClick={() => exportToExcel(sortedAndFilteredData, tableName)}
            >
              ייצא לאקסל
            </Button>
          </Grid>
        </Grid>
        <StyledTable>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column.key} onClick={() => handleSort(column.key)}>
                  {column.label} <FaSort />
                </th>
              ))}
              {tableName === 'enrollments' && <th>התקדמות</th>}
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sortedAndFilteredData.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {columns.map(column => (
                    <td key={column.key}>{item[column.key]}</td>
                  ))}
                  {tableName === 'enrollments' && (
                    <td>
                      <ProgressBar progress={(item.current_lesson / item.total_lessons) * 100}>
                        <div></div>
                      </ProgressBar>
                      {item.current_lesson} / {item.total_lessons}
                    </td>
                  )}
                  <td>
                    {tableName === 'users' && (
                      <>
                        <ActionButton
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleViewUser(item.id)}
                        >
                          צפייה
                        </ActionButton>
                        <ActionButton
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleAddDiscount(item.id)}
                        >
                          עריכת הנחה
                        </ActionButton>
                        <ActionButton
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteUser(item.id)}
                        >
                          מחיקה
                        </ActionButton>
                      </>
                    )}
                    {tableName === 'courses' && (
                      <>
                        <ActionButton
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => handleViewCourse(item.id)}
                        >
                          צפייה
                        </ActionButton>
                        <ActionButton
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleEditCourse(item.id)}
                        >
                          עריכה
                        </ActionButton>
                        <ActionButton
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteCourse(item.id)}
                        >
                          מחיקה
                        </ActionButton>
                      </>
                    )}
                    {tableName === 'enrollments' && (
                      <ActionButton
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteEnrollment(item.id)}
                      >
                        מחיקה
                      </ActionButton>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </StyledTable>
      </>
    );
  };

  const handleSaveNewUser = async () => {
    try {
      // Register new user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (authError) throw authError;

      // Add user details to 'users' table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: newUserEmail,
          username: newUsername,
          discount: newUserDiscount,
        });

      if (userError) throw userError;

      Swal.fire('נוסף בהצלחה', 'המשתמש החדש נוסף בהצלחה', 'success');
      setShowAddUserModal(false);
      fetchData(); // Refresh the users list
    } catch (error) {
      console.error('Error adding new user:', error);
      Swal.fire('שגיאה', 'אירעה שגיאה בהוספת המשתמש החדש', 'error');
    }
  };
  
const checkCourseProgress = async () => {
  try {
    const { data: enrollments, error: enrollmentsError } = await supabase.from('enrollments').select('*, users(email), courses(total_lessons)');
    
    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return;
    }

    enrollments.forEach(enrollment => {
      const progress = (enrollment.current_lesson / enrollment.courses.total_lessons) * 100;

      if (progress >= 80) {
        sendEmail(
          enrollment.users.email,
          'קורסי המשך מומלצים',
          `<p>היי ${enrollment.users.email},</p>
           <p>שמחנו לראות שהתקדמת בצורה יפה בקורס שלך! נשמח להציע לך קורסים נוספים להמשך הלמידה.</p>
           <p>לחץ <a href="your-website-link">כאן</a> כדי לגלות עוד.</p>`
        );
      }

      if (enrollment.current_lesson === 1) {
        sendEmail(
          enrollment.users.email,
          'מתחילים בקורס',
          `<p>היי ${enrollment.users.email},</p>
           <p>שמנו לב שאתה עדיין לא התחלת את הקורס. נשמח לראות אותך מתקדם!</p>`
        );
      }
    });
  } catch (error) {
    console.error('Error in checkCourseProgress:', error);
  }
};

// קריאה לפונקציה כל זמן מסוים או בהפעלה ידנית
setInterval(checkCourseProgress, 24 * 60 * 60 * 1000); // לדוגמה, כל יום


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
          {renderTable(users, [
            { key: 'email', label: 'אימייל' },
            { key: 'username', label: 'שם משתמש' },
            { key: 'discount', label: 'הנחה' }
          ], 'users')}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SectionTitle variant="h4"><FaBook /> ניהול קורסים</SectionTitle>
          {renderTable(courses, [
            { key: 'title', label: 'כותרת' },
            { key: 'description', label: 'תיאור' },
            { key: 'price', label: 'מחיר' }
          ], 'courses')}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SectionTitle variant="h4"><FaMoneyBillWave /> ניהול הרשמות</SectionTitle>
          {renderTable(enrollments, [
            { key: 'username', label: 'משתמש' },
            { key: 'course_title', label: 'קורס' },
            { key: 'current_lesson', label: 'שיעור נוכחי' },
            { key: 'amount_paid', label: 'תשלום' }
          ], 'enrollments')}
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
