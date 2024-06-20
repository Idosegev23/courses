import axios from 'axios';

export default async function handler(req, res) {
  const { method, body } = req;

  if (method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { endpoint, data, token } = body;

    // בדיקה שהפרמטרים הנדרשים קיימים
    if (!endpoint || !data || !token) {
      return res.status(400).json({ message: 'Missing required parameters: endpoint, data, or token' });
    }

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
