const axios = require('axios');
const API_BASE_URL = 'https://sandbox.d.greeninvoice.co.il/api/v1';

module.exports = async (req, res) => {
  const { method, body } = req;

  console.log('Received request:', { method, body });

  // CORS handling
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    console.log('Method not allowed:', method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { endpoint, data, tokenRequest } = body;

    console.log('Endpoint:', endpoint);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Token:', tokenRequest);

    let response;

    if (endpoint === 'account/token') {
      const id = process.env.REACT_APP_API_KEY_GREEN_INVOICE_TEST;
      const secret = process.env.REACT_APP_API_SECRET_GREEN_INVOICE_TEST;
      console.log('API Key:', process.env.REACT_APP_API_KEY_GREEN_INVOICE_TEST);
console.log('API Secret:', process.env.REACT_APP_API_SECRET_GREEN_INVOICE_TEST);

      if (!id || !secret) {
        console.log('Missing API key or secret in server environment');
        return res.status(500).json({ message: 'Server configuration error' });
      }

      console.log('Requesting token from Green Invoice Sandbox API');
      response = await axios.post(`${API_BASE_URL}/account/token`, { id, secret });
      console.log('Token request successful:', response.data);
    } else if (endpoint === 'payments/form') {
      if (!data || !tokenRequest) {
        console.log('Missing required parameters for payment form request');
        return res.status(400).json({ message: 'Missing required parameters: data or token' });
      }

      console.log('Requesting payment form from Green Invoice Sandbox API');
      response = await axios.post(`${API_BASE_URL}/payments/form`, data, {
        headers: {
          Authorization: `Bearer ${tokenRequest}`,
          'Content-Type': 'application/json',
        }
      });
      console.log('Payment form request successful:', response.data);
    } else {
      console.log('Unknown endpoint requested');
      return res.status(400).json({ message: 'Unknown endpoint requested' });
    }

    return res.status(200).json(response.data);

  } catch (error) {
    console.error('Error in serverless function:', error);

    if (error.response) {
      console.error('Error response from Green Invoice API:', error.response.data);
      return res.status(error.response.status).json({ 
        message: error.response.data.message || error.message,
        data: error.response.data
      });
    } 

    if (error.request) {
      console.error('No response received from Green Invoice API');
      return res.status(500).json({ message: 'No response received from Green Invoice API' });
    } 

    console.error('General error in request processing:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
