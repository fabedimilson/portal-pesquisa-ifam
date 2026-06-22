const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'pdf_raw_text.txt'), 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const uniqueGroups = new Set();
let matchCount = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].toLowerCase() === 'grupo de pesquisa:') {
    matchCount++;
    // Let's find the next lines that don't match labels to see what the value is
    let value = '';
    for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
      if (lines[j].includes('Instituição:') || lines[j].includes('Líder(es):') || lines[j].includes('Área:')) {
        break;
      }
      value += (value ? ' ' : '') + lines[j];
    }
    if (value) {
      uniqueGroups.add(value.trim());
    }
  }
}

console.log(`Total "Grupo de pesquisa:" matches: ${matchCount}`);
console.log('Unique group names found in PDF:');
console.log(Array.from(uniqueGroups));
