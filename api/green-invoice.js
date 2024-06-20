import axios from 'axios';

export default async function handler(req, res) {
  const { method, body } = req;

  if (method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { endpoint, data, token } = body;

    // בקשת POST ל-Green Invoice
    const response = await axios.post(`https://api.greeninvoice.co.il${endpoint}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    // שליחת התגובה חזרה ללקוח עם הכותרות המתאימות ל-CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(error.response?.status || 500).json({ message: error.message });
  }
}
