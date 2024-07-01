// api/proxy.js

const axios = require('axios');

const API_BASE_URL = 'https://sandbox.d.greeninvoice.co.il/api/v1';

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { id, secret } = req.body;

    if (id && secret) {
      try {
        const response = await axios.post(`${API_BASE_URL}/account/token`, {
          id,
          secret
        });
        const token = response.data.token;
        res.status(200).json({ token });
      } catch (error) {
        console.error('Error requesting token:', error);
        res.status(500).json({ error: 'Failed to obtain token' });
      }
    } else {
      res.status(400).json({ error: "Invalid ID or secret" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
