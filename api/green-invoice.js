import axios from 'axios';

export default async function handler(req, res) {
  const { method, body } = req;

  if (method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { endpoint, data, tokenRequest } = body;

    // בדיקה אם מדובר בבקשת Token
    if (endpoint === '/account/token') {
      const { id, secret } = data;
      if (!id || !secret) {
        return res.status(400).json({ message: 'Missing API key or secret for token request' });
      }
      
      // בקשת Token
      const response = await axios.post('https://api.greeninvoice.co.il/api/v1/account/token', {
        id,
        secret
      });

      res.status(200).json(response.data);
    } else {
      // בקשת POST ל-Green Invoice לכל endpoint אחר
      if (!endpoint || !data || !tokenRequest) {
        return res.status(400).json({ message: 'Missing required parameters: endpoint, data, or token' });
      }

      // בקשת POST ל-API של Green Invoice
      const response = await axios.post(`https://api.greeninvoice.co.il${endpoint}`, data, {
        headers: {
          Authorization: `Bearer ${tokenRequest}`,
          'Content-Type': 'application/json',
        }
      });

      // שליחת התגובה חזרה ללקוח עם הכותרות המתאימות ל-CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.status(200).json(response.data);
    }
  } catch (error) {
    console.error('Error in serverless function:', error);

    // טיפול בשגיאות HTTP וציור הודעה מתאימה
    let errorMessage = 'An unexpected error occurred';
    if (error.response) {
      // שגיאה מהתגובה של ה-API
      errorMessage = error.response.data.message || error.message;
      res.status(error.response.status).json({ message: errorMessage });
    } else if (error.request) {
      // שגיאה בבקשה עצמה
      errorMessage = 'No response received from Green Invoice API';
      res.status(500).json({ message: errorMessage });
    } else {
      // שגיאה בהכנת הבקשה
      res.status(500).json({ message: error.message });
    }
  }
}
