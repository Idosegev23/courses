const axios = require('axios');

const API_BASE_URL = 'https://sandbox.d.greeninvoice.co.il/api/v1';

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { endpoint, data, token } = req.body;

    console.log('Proxy request received');
    console.log('Endpoint:', endpoint);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Token:', token);

    try {
      const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      console.log('Proxy request successful:', response.data);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error in proxy request:', error);

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
  } else {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: "Method not allowed" });
  }
};
