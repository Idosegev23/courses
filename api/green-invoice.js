// api/green-invoice.js
import axios from 'axios';

export default async function handler(req, res) {
const { method, body } = req;

if (method !== 'POST') {
return res.status(405).json({ message: 'Method Not Allowed' });
}

try {
const { endpoint, data, token } = body;

javascript
Copy code
const response = await axios.post(`https://api.greeninvoice.co.il${endpoint}`, data, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

res.status(200).json(response.data);
} catch (error) {
console.error('Error in serverless function:', error);
res.status(error.response?.status || 500).json({ message: error.message });
}
}
