const express = require('express');
const axios = require('axios');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

// טען את משתני הסביבה מהקובץ .env בשימוש נתיב יחסי
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// בדוק אם כל משתני הסביבה הנדרשים הוגדרו
const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_SECURE', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'EMAIL_TO'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`חסרים משתני סביבה הכרחיים: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// הגדרת הטרנספורטר של Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// אימות הגדרות הטרנספורטר
transporter.verify(function (error, success) {
  if (error) {
    console.log('שגיאה באימות הטרנספורטר:', error);
  } else {
    console.log('השרת מוכן לקבל הודעות');
  }
});

// פונקציה ליצירת תבנית HTML מעוצבת
function createEmailTemplate(name, email, message) {
  return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>הודעה חדשה מטופס יצירת קשר - אתר הקורסים</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #62238C;
      border-bottom: 3px solid #BF4B81;
      padding-bottom: 10px;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .contact-info {
      background-color: #f9f9f9;
      border-right: 5px solid #BF4B81;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 5px;
    }
    .contact-info p {
      margin: 5px 0;
      font-size: 16px;
    }
    .message {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px;
      margin-top: 20px;
    }
    .message h2 {
      color: #62238C;
      font-size: 20px;
      margin-bottom: 10px;
    }
    .message p {
      margin: 10px 0;
      font-size: 16px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 0.9em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>הודעה חדשה מטופס יצירת קשר - אתר הקורסים</h1>
    <div class="contact-info">
      <p><strong>שם:</strong> ${name}</p>
      <p><strong>אימייל:</strong> ${email}</p>
    </div>
    <div class="message">
      <h2>תוכן ההודעה:</h2>
      <p>${message}</p>
    </div>
    <div class="footer">
      <p>© 2024 TriRoars. כל הזכויות שמורות.</p>
    </div>
  </div>
</body>
</html>
`;
}

app.post('/api/proxy', async (req, res) => {
    try {
        const response = await axios.post('https://sandbox.d.greeninvoice.co.il/api/v1/account/token', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Basic OWNkMTEyYzItYjRkNi00OTYwLTk2OTQtY2NiMDkyODBjM2Q0OlgyczhXcW5za2JFaVNtbnhvQkUtb0E='
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ message: error.message });
    }
});

app.post('/api/proxy-form', async (req, res) => {
    try {
        console.log('Request Data:', req.body);
        const response = await axios.post('https://sandbox.d.greeninvoice.co.il/api/v1/payments/form', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.headers.authorization.split(' ')[1]}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error in proxy-form:', error.response.data);
        res.status(error.response?.status || 500).json({ message: error.message });
    }
});

app.post('/api/send-mail', async (req, res) => {
    console.log('Received request to send mail:', req.body);
    const { name, email, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: 'הודעה חדשה מטופס יצירת קשר - אתר הקורסים',
      html: createEmailTemplate(name, email, message)
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      res.status(200).send('המייל נשלח בהצלחה');
    } catch (error) {
      console.error('שגיאה בשליחת המייל:', error);
      res.status(500).send('אירעה שגיאה בשליחת המייל: ' + error.message);
    }
});

// טיפול בשגיאות
app.use((err, req, res, next) => {
  console.error('שגיאה לא מטופלת:', err);
  res.status(500).send('שגיאת שרת פנימית');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`השרת פועל בפורט ${PORT}`);
    console.log('משתני הסביבה:');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
    console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('EMAIL_TO:', process.env.EMAIL_TO);
});