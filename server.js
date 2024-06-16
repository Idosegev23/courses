require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

app.post('/api/greeninvoice/checkout', async (req, res) => {
  const { amount, description, email } = req.body;

  try {
    const response = await fetch('https://api.greeninvoice.co.il/api/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GREEN_INVOICE_TOKEN}`,
      },
      body: JSON.stringify({
        amount,
        description,
        email,
        successUrl: 'https://yourwebsite.com/success', // כתובת חזרה להצלחה
        failureUrl: 'https://yourwebsite.com/failure', // כתובת חזרה לכישלון
      }),
    });

    const result = await response.json();
    if (response.ok) {
      res.json({ url: result.url });
    } else {
      res.status(response.status).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

