const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const file = path.join(__dirname, '../uploads/rel_consulta_parametrizada_por_grupo (2).xls');
const workbook = XLSX.readFile(file);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Get cell ranges
const range = XLSX.utils.decode_range(sheet['!ref']);
console.log('Sheet Range:', sheet['!ref']);

// Print top left cells (rows 0 to 5, columns 0 to 8)
for (let r = 0; r <= 5; r++) {
  let rowStr = '';
  for (let c = 0; c <= 8; c++) {
    const cellRef = XLSX.utils.encode_cell({ r, c });
    const cell = sheet[cellRef];
    rowStr += `${cellRef}: ${cell ? JSON.stringify(cell.v) : 'empty'} | `;
  }
  console.log(`Row ${r}: ${rowStr}`);
}
