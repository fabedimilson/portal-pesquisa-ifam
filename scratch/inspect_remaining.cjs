const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'pdf_raw_text.txt'), 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

// Find where the values section begins. 
// In the text, we have lists of "Grupo de pesquisa:", "Instituição:", "Líder(es):", "Área:" at the top of pages,
// and then the actual text values appear later in the stream.
// Let's filter out all lines that are exactly labels:
const labels = ['Grupo de pesquisa:', 'Instituição:', 'Líder(es):', 'Área:'];
const filtered = lines.filter(l => !labels.includes(l));

// Let's find unique segments. We can print the lines from 800 to the end of the text file to see the rest of the groups.
const remainingText = lines.slice(800).join('\n');
console.log('--- REMAINING TEXT ---');
console.log(remainingText);
