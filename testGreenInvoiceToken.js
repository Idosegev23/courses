const axios = require('axios');

const getJwtToken = async () => {
  console.log('Starting the process to obtain JWT token...');
  
  const requestData = {
    id: 'd8281ab1-2ebc-44a9-a53f-e19a46b879dc',
    secret: 'f5gxE9n2H43sY4d-P-Ivhg'
  };

  console.log('Request data:', requestData);

  try {
    console.log('Sending request to Green Invoice API...');
    const response = await axios.post('https://sandbox.d.greeninvoice.co.il/api/v1/account/token', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Response received:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    console.log('JWT Token:', response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('An error occurred during the request:');

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request data:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('General error message:', error.message);
    }

    console.error('Error config:', error.config);
    throw new Error('Failed to obtain JWT token');
  }
};

getJwtToken();
