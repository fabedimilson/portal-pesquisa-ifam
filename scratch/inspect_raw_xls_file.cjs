const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../uploads/rel_consulta_parametrizada_por_grupo (2).xls');
const content = fs.readFileSync(file, 'utf8');

console.log('Is HTML?', content.includes('<html') || content.includes('<table') || content.includes('<tr'));
console.log('File length:', content.length);
console.log('Snippet:');
console.log(content.substring(0, 1000));
