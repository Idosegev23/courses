import axios from 'axios';

export default async function handler(req, res) {
  const { method, body } = req;

  if (method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { endpoint, data, tokenRequest } = body;

    if (endpoint === '/account/token') {
      const { id, secret } = data;
      if (!id || !secret) {
        console.log('Missing API key or secret for token request');
        return res.status(400).json({ message: 'Missing API key or secret for token request' });
      }

      // בקשת Token
      console.log('Requesting token from Green Invoice API');
      const response = await axios.post('https://api.greeninvoice.co.il/api/v1/account/token', {
        id,
        secret
      });

      console.log('Token request successful:', response.data);
      res.status(200).json(response.data);
    } else {
      // בקשת POST ל-Green Invoice לכל endpoint אחר
      if (!endpoint || !data || !tokenRequest) {
        console.log('Missing required parameters for request:', { endpoint, data, tokenRequest });
        return res.status(400).json({ message: 'Missing required parameters: endpoint, data, or token' });
      }

      console.log(`Requesting ${endpoint} from Green Invoice API with token`);
      const response = await axios.post(`https://api.greeninvoice.co.il${endpoint}`, data, {
        headers: {
          Authorization: `Bearer ${tokenRequest}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('Request successful:', response.data);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.status(200).json(response.data);
    }
  } catch (error) {
    console.error('Error in serverless function:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error.response) {
      errorMessage = error.response.data.message || error.message;
      res.status(error.response.status).json({ message: errorMessage });
    } else if (error.request) {
      errorMessage = 'No response received from Green Invoice API';
      res.status(500).json({ message: errorMessage });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
}
