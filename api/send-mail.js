const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: 'הודעה חדשה מטופס יצירת קשר',
    text: `שם: ${name}\nאימייל: ${email}\nהודעה: ${message}`,
    html: `<p><strong>שם:</strong> ${name}</p>
           <p><strong>אימייל:</strong> ${email}</p>
           <p><strong>הודעה:</strong> ${message}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'המייל נשלח בהצלחה' });
  } catch (error) {
    console.error('שגיאה בשליחת המייל:', error);
    res.status(500).json({ message: 'אירעה שגיאה בשליחת המייל' });
  }
};