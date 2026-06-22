const https = require('https');
const querystring = require('querystring');

function searchDDGLite(query) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({ q: query });
    
    const req = https.request({
      hostname: 'lite.duckduckgo.com',
      port: 443,
      path: '/lite/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        // Find links matching dgp.cnpq.br/dgp/espelhogrupo/<ID>
        const matches = data.match(/dgp\.cnpq\.br\/dgp\/espelhogrupo\/\d+/gi) || [];
        resolve(Array.from(new Set(matches.map(m => 'http://' + m))));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  const group = 'Biologia, Manejo e Produção de Espécies em Espaços Amazônicos';
  console.log(`Searching for: ${group}`);
  const links = await searchDDGLite(`site:dgp.cnpq.br/dgp/espelhogrupo "${group}"`);
  console.log('Found links:', links);
}

run();
