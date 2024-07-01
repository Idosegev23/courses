const axios = require('axios');
const API_BASE_URL = 'https://sandbox.d.greeninvoice.co.il/api/v1';

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { endpoint, data, token } = req.body;
        console.log('Proxy request data:', { endpoint, data, token });

        try {
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` })
            };
            console.log('Request Headers:', headers);
            console.log('Request Body:', data);

            const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data, {
                headers
            });

            console.log('Response from Green Invoice:', response.data);
            res.status(response.status).json(response.data);
        } catch (error) {
            console.error('Error in proxy:', error.response ? error.response.data : error.message);
            res.status(error.response ? error.response.status : 500).json({
                message: error.message,
                ...(error.response && { data: error.response.data })
            });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
