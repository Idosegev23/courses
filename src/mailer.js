const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // או כל ספק דואר אחר
    auth: {
        user: 'ido.segev23@gmail.com',
        pass: 'Gs090919'
    }
});

const sendNewUserEmail = (user) => {
    const mailOptions = {
        from: 'ido.segev23@gmail.com',
        to: 'Triroars@gmail.com', // כתובת המייל שלך לקבלת הפרטים
        subject: 'New User Registration',
        text: `A new user has registered:\n\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = { sendNewUserEmail };
