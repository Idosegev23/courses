// functions/purchase.js
const axios = require('axios');

exports.handler = async function(event, context) {
  try {
    const { courseTitle, finalPrice } = JSON.parse(event.body);

    const response = await axios.post('https://api.greeninvoice.co.il/api/v1/transactions', {
      type: 320,
      sum: finalPrice,
      description: `תשלום עבור קורס ${courseTitle}`
    }, {
      headers: {
        Authorization: `Bearer ${process.env.GREEN_INVOICE_API_KEY}`
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: response.data.url })
    };
  } catch (error) {
    console.error('Error during purchase:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'התרחשה שגיאה במהלך התשלום.' })
    };
  }
};
