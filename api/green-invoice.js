// api/green-invoice.js
import axios from 'axios';

export default async function handler(req, res) {
  const { method, body } = req;

  if (method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { endpoint, data, token } = body;

    const response = await axios.post(`https://api.greeninvoice.co.il/api/v1/${endpoint}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(error.response?.status || 500).json({ message: error.message });
  }
}
