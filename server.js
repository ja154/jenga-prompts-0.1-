
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'https://generativelanguage.googleapis.com',
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Extract the part of the path after /api and append it to the new target
    const newPath = path.replace(/^\/api/, '');
    return newPath;
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-Goog-Api-Key', process.env.GEMINI_API_KEY);
    
    // Important: Express.json() middleware is needed to parse the body
    if (req.body) {
      let bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  }
}));

const port = 3001;
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
