const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.post('/api/greeninvoice/token', async (req, res) => {
  try {
    const response = await axios.post('https://sandbox.d.greeninvoice.co.il/api/v1/account/token', {
      id: process.env.REACT_APP_API_KEY_GREEN_INVOICE_TEST,
      secret: process.env.REACT_APP_API_SECRET_GREEN_INVOICE_TEST
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error obtaining JWT token:', error);
    res.status(500).json({ error: 'Failed to obtain JWT token' });
  }
});

app.post('/api/greeninvoice/form', async (req, res) => {
  try {
    const { token, invoiceData } = req.body;
    const response = await axios.post('https://sandbox.d.greeninvoice.co.il/api/v1/payments/form', invoiceData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error creating payment form:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
