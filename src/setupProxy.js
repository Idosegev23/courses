const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/proxy',
    createProxyMiddleware({
      target: 'https://sandbox.d.greeninvoice.co.il',
      changeOrigin: true,
      pathRewrite: {
        '^/api/proxy': '/', // rewrite path
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to:', proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Received response from:', proxyRes.req.path);
      },
    })
  );

  // הוספת proxy עבור שליחת מיילים
  app.use(
    '/api/send-mail',
    createProxyMiddleware({
      target: 'http://localhost:3001', // או כתובת השרת שלך
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying mail request to:', proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('Received mail response from:', proxyRes.req.path);
      },
    })
  );
};