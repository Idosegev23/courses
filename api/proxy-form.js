const axios = require('axios');

const API_BASE_URL = 'https://sandbox.d.greeninvoice.co.il/api/v1';

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { data, tokenRequest } = req.body;

    if (!data || !tokenRequest) {
      return res.status(400).json({ message: 'Missing required parameters: data or token' });
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/payments/form`, data, {
        headers: {
          Authorization: `Bearer ${tokenRequest}`,
          'Content-Type': 'application/json',
        }
      });
      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Error creating payment form:', error);

      if (error.response) {
        return res.status(error.response.status).json({
          message: error.response.data.message || error.message,
          data: error.response.data
        });
      }

      return res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
