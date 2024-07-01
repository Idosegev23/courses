// pages/api/proxy.js

const axios = require('axios');

const API_BASE_URL = 'https://sandbox.d.greeninvoice.co.il/api/v1';

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { endpoint, data, token } = req.body;

    try {
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error requesting API:', error);
      res.status(500).json({ error: 'Failed to request API' });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
