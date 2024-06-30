const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001; // שינוי הפורט ל-5001

app.use(cors());
app.use(express.json());

app.post('/api/payments/form', async (req, res) => {
  try {
    const { data } = await axios.post('https://sandbox.d.greeninvoice.co.il/api/v1/payments/form', req.body, {
      auth: {
        username: process.env.REACT_APP_API_KEY_GREEN_INVOICE_TEST,
        password: process.env.REACT_APP_API_SECRET_GREEN_INVOICE_TEST
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error creating payment form:', error);
    res.status(500).json({ message: 'Failed to create payment form' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
