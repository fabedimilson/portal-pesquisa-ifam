const https = require('https');

https.get('https://www.google.com', (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Google content length:', data.length);
  });
}).on('error', (err) => {
  console.error('Error fetching Google:', err);
});
