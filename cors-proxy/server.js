const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/proxy', async (req, res) => {
    try {
        const response = await axios.post('https://sandbox.d.greeninvoice.co.il/api/v1/account/token', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Basic OWNkMTEyYzItYjRkNi00OTYwLTk2OTQtY2NiMDkyODBjM2Q0OlgyczhXcW5za2JFaVNtbnhvQkUtb0E='
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ message: error.message });
    }
});

app.post('/api/proxy-form', async (req, res) => {
    try {
        console.log('Request Data:', req.body);  // הדפסת הנתונים שנשלחו לשרת
        const response = await axios.post('https://sandbox.d.greeninvoice.co.il/api/v1/payments/form', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.headers.authorization.split(' ')[1]}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error in proxy-form:', error.response.data);  // הדפסת השגיאה
        res.status(error.response?.status || 500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
