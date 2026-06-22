const https = require('https');
const fs = require('fs');
const path = require('path');

// Let's first search google for the Integra IFAM API endpoint of groups, 
// or search inside the main pages of the integra site.
// Let's write a script that downloads the home page of integra.ifam.edu.br to see if there is an API or index js file name.

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching Integra IFAM homepage...');
  try {
    const { body } = await fetchUrl('https://integra.ifam.edu.br/');
    console.log('Page length:', body.length);
    
    // Look for script tags
    const scripts = [];
    const regex = /src="([^"]+)"/g;
    let match;
    while ((match = regex.exec(body)) !== null) {
      if (match[1].includes('.js')) {
        scripts.push(match[1]);
      }
    }
    console.log('JS Scripts found:', scripts);
    
    // Let's fetch the first JS file and see if we can find CNPq URLs
    for (const scr of scripts) {
      const fullUrl = scr.startsWith('http') ? scr : `https://integra.ifam.edu.br${scr}`;
      console.log(`Fetching script: ${fullUrl}`);
      const { body: jsBody } = await fetchUrl(fullUrl);
      console.log(`Script length: ${jsBody.length}`);
      
      // Look for matches of espelhogrupo or cnpq
      const cnpqMatches = jsBody.match(/dgp\.cnpq\.br\/dgp\/espelhogrupo\/[a-zA-Z0-9]+/g) || [];
      const apiMatches = jsBody.match(/\/api\/[a-zA-Z0-9\-\_/]*/g) || [];
      
      console.log('CNPq Matches in script:', Array.from(new Set(cnpqMatches)));
      console.log('API Matches sample in script:', Array.from(new Set(apiMatches)).slice(0, 15));
    }
  } catch (err) {
    console.error(err);
  }
}

run();
