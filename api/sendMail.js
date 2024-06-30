const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendNewUserEmail = (req, res) => {
    const { name, email, phone } = req.body;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'Triroars@gmail.com',
        subject: 'New User Registration',
        text: `משתמש חדש נרשם:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send email' });
        } else {
            console.log('Email sent:', info.response);
            return res.status(200).json({ message: 'Email sent successfully' });
        }
    });
};

module.exports = sendNewUserEmail;
