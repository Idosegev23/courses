const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { errorDetails } = req.body;

    const msg = {
      to: 'Triroars@gmail.com',
      from: 'triroars@gmail.com', // Updated to use the verified email
      subject: 'Error Log from Purchase Page',
      text: `An error occurred during purchase:\n\n${JSON.stringify(errorDetails, null, 2)}`,
      html: `
        <h2>Error Log from Purchase Page</h2>
        <pre>${JSON.stringify(errorDetails, null, 2)}</pre>
      `
    };

    try {
      await sgMail.send(msg);
      res.status(200).json({ message: 'Error log sent successfully' });
    } catch (error) {
      console.error('Error sending error log:', error);
      res.status(500).json({ error: 'Failed to send error log' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
