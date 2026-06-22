const https = require('https');
const querystring = require('querystring');

function searchDuckDuckGo(query) {
  return new Promise((resolve, reject) => {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${querystring.escape(query)}`;
    
    https.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Length:', data.length);
        console.log('Snippet:', data.substring(0, 1000));
        
        const match = data.match(/dgp\.cnpq\.br\/dgp\/espelhogrupo\/\d+/i);
        if (match) {
          resolve('http://' + match[0]);
        } else {
          resolve(null);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function test() {
  const group = 'Biologia, Manejo e Produção de Espécies em Espaços Amazônicos';
  console.log(`Searching for: ${group}`);
  const link = await searchDuckDuckGo(`site:dgp.cnpq.br/dgp/espelhogrupo ${group}`);
  console.log(`Found link: ${link}`);
}

test();
