const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const file = path.join(__dirname, '../uploads/rel_consulta_parametrizada_por_grupo (2).xls');
const workbook = XLSX.readFile(file);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

console.log('sheet["!links"]:', sheet['!links']);
console.log('Workbook keys:', Object.keys(workbook));
console.log('Sheet keys:', Object.keys(sheet).filter(k => k.startsWith('!')));
