// mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // או כל ספק דואר אחר
    auth: {
        user: 'ido.segev23@gmail.com',
        pass: 'Gs090919'
    }
});

const sendErrorLog = (errorDetails) => {
    const mailOptions = {
        from: 'triroars@gmail.com',
        to: 'Triroars@gmail.com', // כתובת המייל שלך לקבלת הלוג
        subject: 'Error Log from Purchase Page',
        text: `An error occurred during purchase:\n\n${JSON.stringify(errorDetails, null, 2)}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = { sendErrorLog };
