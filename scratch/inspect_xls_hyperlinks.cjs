const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const file = path.join(__dirname, '../uploads/rel_consulta_parametrizada_por_grupo (2).xls');
const workbook = XLSX.readFile(file, { cellFormula: true, cellHTML: true, cellText: true, cellNF: true });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

console.log('Inspecting cell links...');

let linkCount = 0;
for (const cellAddress in sheet) {
  if (cellAddress[0] === '!') continue; // skip metadata
  const cell = sheet[cellAddress];
  
  // In sheetjs, cell links are stored in the cell.l property
  if (cell && cell.l) {
    linkCount++;
    console.log(`Cell ${cellAddress}: value="${cell.v}", target="${cell.l.Target}"`);
  }
}

console.log(`Total cells with links found: ${linkCount}`);
