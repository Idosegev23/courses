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
};
