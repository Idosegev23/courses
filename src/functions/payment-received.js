exports.handler = async (event, context) => {
  try {
    const data = JSON.parse(event.body);
    console.log('Received Webhook Data:', data);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook received successfully!' }),
    };
  } catch (error) {
    console.error('Error handling Webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process Webhook' }),
    };
  }
};
