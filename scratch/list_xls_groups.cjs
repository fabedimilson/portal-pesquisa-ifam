const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const file = path.join(__dirname, '../uploads/rel_consulta_parametrizada_por_grupo (2).xls');
const workbook = XLSX.readFile(file);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet);

// The first row contains the header text
const groupKey = 'Consulta Parametrizada';
const uniqueGroups = new Set();

rows.forEach((row, idx) => {
  if (idx === 0) return; // skip headers
  const gName = row[groupKey];
  if (gName) {
    uniqueGroups.add(gName.trim());
  }
});

console.log('Total unique group names found in XLS:', uniqueGroups.size);
console.log('List of group names:');
console.log(Array.from(uniqueGroups));
