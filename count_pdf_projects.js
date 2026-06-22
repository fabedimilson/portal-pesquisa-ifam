import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function count() {
  const filePath = path.join(__dirname, 'Resultado_final_IC-Graduação_2026_2027.pdf');
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new PDFParse(uint8Array);
    const result = await parser.getText();
    
    // Allow optional spaces or newlines after hyphen
    const projectRegex = /(PV[A-Z]\d{4}-\s*2026)/g;
    const matches = result.text.match(projectRegex) || [];
    
    console.log(`Total project codes matched in PDF text: ${matches.length}`);
    
    const lines = result.text.split('\n');
    const campusCounts = {};
    
    // Clean up text by removing linebreaks inside project codes for easier matching
    const cleanText = result.text.replace(/(PV[A-Z]\d{4}-)\s*(2026)/g, '$1$2');
    const cleanLines = cleanText.split('\n');

    cleanLines.forEach(line => {
      const match = line.match(/(PV[A-Z]\d{4}-2026)/);
      if (match) {
        const campuses = ['CMC', 'CMZL', 'CMDI', 'CPRF', 'CPIN', 'CITA', 'CLAB', 'CLBR', 'COARI', 'CCO', 'CMA'];
        let foundCampus = 'UNKNOWN';
        for (const c of campuses) {
          if (line.includes(c)) {
            foundCampus = c;
            break;
          }
        }
        campusCounts[foundCampus] = (campusCounts[foundCampus] || 0) + 1;
        
        if (foundCampus === 'UNKNOWN') {
          console.log(`Unmatched line: ${line.trim()}`);
        }
      }
    });

    console.log('\nCampus Counts in PDF (Final Approved):');
    console.log(JSON.stringify(campusCounts, null, 2));

  } catch (err) {
    console.error(err);
  }
}

count();
