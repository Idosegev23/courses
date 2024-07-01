const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api/proxy',
    createProxyMiddleware({
      target: 'https://sandbox.d.greeninvoice.co.il',
      changeOrigin: true,
      pathRewrite: {
        '^/api/proxy': '', // remove base path
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add custom headers if necessary
        if (req.body) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      }
    })
  );
};
