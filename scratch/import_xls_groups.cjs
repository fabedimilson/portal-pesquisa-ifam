const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function importGroups() {
  const xlsPath = path.join(__dirname, '../uploads/rel_consulta_parametrizada_por_grupo (2).xls');
  console.log(`Reading Excel file: ${xlsPath}`);
  
  if (!fs.existsSync(xlsPath)) {
    console.error('File not found!');
    return;
  }

  try {
    const workbook = XLSX.readFile(xlsPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Fetch existing projects to map leaders to their campus
    const projects = await prisma.project.findMany({});
    console.log(`Loaded ${projects.length} projects for leader-campus mapping.`);

    // Map of advisor name (lowercase) to campus
    const advisorCampusMap = {};
    projects.forEach(p => {
      if (p.orientador) {
        advisorCampusMap[p.orientador.toLowerCase().trim()] = p.campus;
      }
    });

    const groupsToInsert = [];
    const seenNames = new Set();

    // The first row of rows (index 0) is actually the header names:
    // { __EMPTY_1: 'INSTITUIÇÃO', 'Consulta Parametrizada': 'GRUPO', ... }
    // Actual data starts at index 1
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawNome = row['Consulta Parametrizada'];
      if (!rawNome) continue;

      const nome = rawNome.trim();
      if (seenNames.has(nome)) continue;
      seenNames.add(nome);

      const leader1 = row['__EMPTY_4'] ? row['__EMPTY_4'].trim() : '';
      const leader2 = row['__EMPTY_5'] ? row['__EMPTY_5'].trim() : '';
      
      let lideres = leader1;
      if (leader2 && leader2 !== '-' && leader2 !== leader1) {
        lideres += `, ${leader2}`;
      }

      const area = row['__EMPTY_6'] ? row['__EMPTY_6'].trim() : 'Ciências Tecnológicas';
      
      // Auto-detect campus from leader's name matching existing projects
      let campus = '';
      if (leader1) {
        campus = advisorCampusMap[leader1.toLowerCase()] || '';
      }
      if (!campus && leader2 && leader2 !== '-') {
        campus = advisorCampusMap[leader2.toLowerCase()] || '';
      }

      // Keyword-based fallback if no leader-project match
      if (!campus) {
        const lowerNome = nome.toLowerCase();
        if (lowerNome.includes('coari')) campus = 'COARI';
        else if (lowerNome.includes('figueiredo') || lowerNome.includes('gepeme')) campus = 'CPRF';
        else if (lowerNome.includes('parintins') || lowerNome.includes('pinheiro') || lowerNome.includes('gpefam')) campus = 'CPIN';
        else if (lowerNome.includes('itacoatiara')) campus = 'CITA';
        else if (lowerNome.includes('lábrea') || lowerNome.includes('labrea') || lowerNome.includes('purus')) campus = 'CLAB';
        else if (lowerNome.includes('maués') || lowerNome.includes('maues')) campus = 'CMA';
        else if (lowerNome.includes('zona leste') || lowerNome.includes('aleixo')) campus = 'CMZL';
        else if (lowerNome.includes('distrito') || lowerNome.includes('automação') || lowerNome.includes('processos industriais')) campus = 'CMDI';
        else campus = 'CMC'; // Default to central campus
      }

      const dateStr = row['__EMPTY_2'] || '';
      let lastActivity = new Date();
      if (dateStr) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // format: DD/MM/YYYY
          lastActivity = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }

      const cleanEmail = leader1 
        ? `${leader1.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.')}@ifam.edu.br` 
        : 'contato.grupo@ifam.edu.br';

      groupsToInsert.push({
        nome,
        lideres: lideres || 'Líder Não Informado',
        area,
        campus,
        endereco: `Campus IFAM - Sede ${campus}`,
        contatoEmail: cleanEmail,
        linhasPesquisa: 'Linhas de atuação e investigação científica do CNPq',
        membrosEquipe: lideres || 'Membros do grupo',
        status: 'ATIVO',
        linkCnpq: 'http://dgp.cnpq.br/dgp',
        lastActivity
      });
    }

    console.log(`Prepared ${groupsToInsert.length} unique research groups for insertion.`);
    
    if (groupsToInsert.length > 0) {
      await prisma.researchGroup.deleteMany({});
      await prisma.researchGroup.createMany({
        data: groupsToInsert
      });
      console.log(`Successfully imported ${groupsToInsert.length} research groups into SQLite.`);
    }

  } catch (error) {
    console.error('Error importing groups from XLS:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importGroups();
