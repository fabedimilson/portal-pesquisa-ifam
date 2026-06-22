const https = require('https');
const querystring = require('querystring');
const fs = require('fs');

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
        resolve(data);
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
  const query = 'dgp cnpq espelhogrupo "Processos Industriais e Ambientais Amazônicos"';
  console.log(`Searching for: ${query}`);
  const html = await searchDDGLite(query);
  fs.writeFileSync('c:/Users/otran/Documents/Painel de Pesquisa_IFAM/scratch/ddg_result.html', html);
  console.log('Saved raw HTML to scratch/ddg_result.html');
  
  const matches = html.match(/espelhogrupo\/\d+/gi) || [];
  console.log('Matches:', matches);
}

run();
