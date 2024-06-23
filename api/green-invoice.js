import axios from 'axios';

export default async function handler(req, res) {
  const { method, body } = req;

  // לוג להתחלת הפונקציה
  console.log('Received request:', { method, body });

  // הגדרות CORS
  const allowedOrigins = [
    'https://courses-seven-alpha.vercel.app',
    'https://courses-idosegev23s-projects.vercel.app',
    'https://courses-git-main-idosegev23s-projects.vercel.app'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  // טיפול בבקשות OPTIONS
  if (method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // בדיקה אם השיטה היא POST
  if (method !== 'POST') {
    console.log('Method not allowed:', method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { endpoint, data, tokenRequest } = body;

    // לוגים לבדיקת ערכי הפרמטרים
    console.log('Endpoint:', endpoint);
    console.log('Data:', data);
    console.log('Token:', tokenRequest);

    // בדיקת בקשת ה-Token
    if (endpoint === '/account/token') {
      const { id, secret } = data;

      // בדיקה שה-ID וה-SECRET קיימים
      if (!id || !secret) {
        console.log('Missing API key or secret for token request');
        return res.status(400).json({ message: 'Missing API key or secret for token request' });
      }

      console.log('Requesting token from Green Invoice API');

      // בקשת Token מ-Green Invoice
      const response = await axios.post('https://api.greeninvoice.co.il/api/v1/account/token', {
        id,
        secret
      });

      // לוג לתוצאה מוצלחת של בקשת Token
      console.log('Token request successful:', response.data);
      res.status(200).json(response.data);
    } else if (endpoint === '/payments/form') {
      // טיפול בבקשת יצירת טופס תשלום

      const {
        description, type, lang, currency, vatType, amount, maxPayments,
        pluginId, client, income, remarks, successUrl, failureUrl, notifyUrl, custom
      } = data;

      // בדיקה שהפרמטרים הנדרשים קיימים
      if (!description || !type || !lang || !currency || !vatType || !amount || !pluginId || !client) {
        console.log('Missing required parameters for payment form request:', {
          description, type, lang, currency, vatType, amount, pluginId, client
        });
        return res.status(400).json({ message: 'Missing required parameters for payment form request' });
      }

      console.log('Requesting payment form from Green Invoice API');

      // בקשת טופס תשלום ל-API של Green Invoice
      const response = await axios.post('https://api.greeninvoice.co.il/api/v1/payments/form', {
        description,
        type,
        lang,
        currency,
        vatType,
        amount,
        maxPayments,
        pluginId,
        client,
        income,
        remarks,
        successUrl,
        failureUrl,
        notifyUrl,
        custom
      }, {
        headers: {
          Authorization: `Bearer ${tokenRequest}`,
          'Content-Type': 'application/json',
        }
      });

      // לוג לתוצאה מוצלחת של בקשת POST
      console.log('Payment form request successful:', response.data);

      res.status(200).json(response.data);
    } else {
      // טיפול בכל בקשה אחרת

      if (!endpoint || !data || !tokenRequest) {
        console.log('Missing required parameters for request:', { endpoint, data, tokenRequest });
        return res.status(400).json({ message: 'Missing required parameters: endpoint, data, or token' });
      }

      console.log(`Requesting ${endpoint} from Green Invoice API with token`);

      // בקשת POST ל-API של Green Invoice
      const response = await axios.post(`https://api.greeninvoice.co.il${endpoint}`, data, {
        headers: {
          Authorization: `Bearer ${tokenRequest}`,
          'Content-Type': 'application/json',
        }
      });

      // לוג לתוצאה מוצלחת של בקשת POST
      console.log('Request successful:', response.data);

      res.status(200).json(response.data);
    }
  } catch (error) {
    // לוג לשגיאה בפונקציה
    console.error('Error in serverless function:', error);

    let errorMessage = 'An unexpected error occurred';
    if (error.response) {
      // לוג לשגיאה שמתקבלת מה-API של Green Invoice
      errorMessage = error.response.data.message || error.message;
      console.error('Error response from Green Invoice API:', error.response.data);
      res.status(error.response.status).json({ message: errorMessage });
    } else if (error.request) {
      // לוג לשגיאה בבקשה ל-API של Green Invoice
      errorMessage = 'No response received from Green Invoice API';
      console.error('No response received from Green Invoice API:', error.request);
      res.status(500).json({ message: errorMessage });
    } else {
      // לוג לשגיאה כללית
      console.error('General error in request processing:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
}
