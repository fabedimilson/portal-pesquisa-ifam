const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'pdf_raw_text.txt'), 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const uniquePreceding = new Set();

for (let i = 0; i < lines.length; i++) {
  if (lines[i] === 'IFAM') {
    // Collect preceding lines until we reach a line that is a label, date, URL, or another "IFAM"
    const groupNameParts = [];
    for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
      const l = lines[j];
      if (l.includes('Grupo de pesquisa:') || l.includes('Instituição:') || l.includes('Líder(es):') || l.includes('Área:') || l.includes('IFAM') || l.includes('/') || l.includes('--')) {
        break;
      }
      groupNameParts.unshift(l);
    }
    if (groupNameParts.length > 0) {
      uniquePreceding.add(groupNameParts.join(' '));
    }
  }
}

console.log('All unique preceding strings before IFAM:');
console.log(Array.from(uniquePreceding));
