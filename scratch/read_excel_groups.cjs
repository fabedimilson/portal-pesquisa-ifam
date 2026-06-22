const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const file = path.join(__dirname, '../uploads/rel_consulta_parametrizada_por_grupo (2).xls');
console.log('Reading file:', file);

const workbook = XLSX.readFile(file);
console.log('Sheet Names:', workbook.SheetNames);

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log('Total rows found:', rows.length);
console.log('First 5 rows:');
console.log(rows.slice(0, 5));
