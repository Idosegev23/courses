const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { name, email, phone } = req.body;

    const msg = {
      to: 'Triroars@gmail.com',
      from: 'triroars@gmail.com', // Updated to use the verified email
      subject: 'New User Registration',
      text: `A new user has registered:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`,
      html: `
        <h2>New User Registration</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
      `
    };

    try {
      await sgMail.send(msg);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};