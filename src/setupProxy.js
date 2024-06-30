const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://sandbox.d.greeninvoice.co.il',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // מוחק את ה-'/api' לפני השליחה לשרת
      },
    })
  );
};
