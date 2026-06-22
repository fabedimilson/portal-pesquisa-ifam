const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const file = path.join(__dirname, '../uploads/rel_consulta_parametrizada_por_grupo (2).xls');
const workbook = XLSX.readFile(file, { cellFormula: true });
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

let formulaCount = 0;
for (const cellAddress in sheet) {
  if (cellAddress[0] === '!') continue;
  const cell = sheet[cellAddress];
  if (cell && cell.f) {
    formulaCount++;
    console.log(`Cell ${cellAddress}: formula="${cell.f}", value="${cell.v}"`);
  }
}

console.log(`Total cells with formulas found: ${formulaCount}`);
