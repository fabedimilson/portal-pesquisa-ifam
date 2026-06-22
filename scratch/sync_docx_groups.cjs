const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const stopWords = new Set(['de', 'da', 'do', 'dos', 'das', 'e', 'o', 'a', 'os', 'as', 'junior', 'filho', 'neto', 'sobrinho']);

function normalize(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, ' ')
    .trim();
}

function getWords(text) {
  return normalize(text)
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

async function run() {
  console.log('Loading Controle Bolsas por campus AC.xlsx to build campus word index...');
  const workbook = XLSX.readFile('c:/Users/otran/Documents/Painel de Pesquisa_IFAM/Controle Bolsas por campus AC.xlsx');
  
  const campusWordMap = {};
  const campusFullNameMap = {};

  workbook.SheetNames.forEach(sheetName => {
    const campus = sheetName.replace('AC ', '').trim().toUpperCase();
    campusWordMap[campus] = new Set();
    campusFullNameMap[campus] = new Set();

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);
    
    rows.forEach(row => {
      Object.entries(row).forEach(([key, val]) => {
        if (!val) return;
        const valStr = String(val).trim();
        if (valStr.split(' ').length >= 2 && /^[a-zA-ZÀ-ÿ\s.'-]+$/.test(valStr)) {
          campusFullNameMap[campus].add(valStr);
          getWords(valStr).forEach(w => {
            campusWordMap[campus].add(w);
          });
        }
      });
    });
  });

  console.log(`Loaded ${Object.keys(campusWordMap).length} campuses from Excel.`);

  // Load Portal Integra groups for CNPq link mapping
  let portalGroups = [];
  const portalPath = path.join(__dirname, 'portal_groups_500.json');
  if (fs.existsSync(portalPath)) {
    const portalData = JSON.parse(fs.readFileSync(portalPath, 'utf8'));
    portalGroups = portalData[1] || [];
    console.log(`Loaded ${portalGroups.length} groups from Portal Integra cache.`);
  }

  // Parse DOCX paragraphs
  const xmlPath = path.join(__dirname, '../uploads/CNPq_extracted/word/document.xml');
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

  const pRegex = /<w:p(?:\s+[^>]*)?>([\s\S]*?)<\/w:p>/g;
  let match;
  const paragraphs = [];
  while ((match = pRegex.exec(xmlContent)) !== null) {
    const pContent = match[1];
    const items = [];
    const itemRegex = /(<w:hyperlink\s+[^>]*r:id="([^"]+)"[^>]*>([\s\S]*?)<\/w:hyperlink>|<w:t(?:\s+[^>]*)?>([^<]*)<\/w:t>)/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(pContent)) !== null) {
      if (itemMatch[2]) {
        const rId = itemMatch[2];
        const linkText = itemMatch[3].replace(/<[^>]+>/g, '').trim();
        items.push(`__LINK:${rId}:${linkText}__`);
      } else if (itemMatch[4]) {
        items.push(itemMatch[4]);
      }
    }
    const pText = items.join('').trim();
    if (pText) {
      paragraphs.push(pText);
    }
  }

  const docxGroups = [];
  let currentGroup = null;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    if (p.includes('Grupo de pesquisa:')) {
      if (currentGroup) docxGroups.push(currentGroup);
      currentGroup = { nome: '', lideres: [], area: '', campus: 'CMC' };
      let nextP = paragraphs[i + 1] || '';
      const nameMatch = nextP.match(/__LINK:rId\d+:([^_]+)__/);
      currentGroup.nome = nameMatch ? nameMatch[1].trim() : nextP.trim();
      i++;
    } else if (p.includes('Líder(es):')) {
      let j = i + 1;
      while (j < paragraphs.length && !paragraphs[j].includes('Área:') && !paragraphs[j].includes('Grupo de pesquisa:')) {
        const pLeader = paragraphs[j];
        const leadMatch = pLeader.match(/__LINK:rId\d+:([^_]+)__/);
        if (leadMatch) {
          currentGroup.lideres.push(leadMatch[1].trim());
        } else {
          const parts = pLeader.split(/__LINK:rId\d+:/);
          parts.forEach(part => {
            const cleanPart = part.replace(/__/, '').trim();
            if (cleanPart && cleanPart !== 'Líder(es):') currentGroup.lideres.push(cleanPart);
          });
        }
        j++;
      }
      i = j - 1;
    } else if (p.includes('Área:')) {
      let nextP = paragraphs[i + 1] || '';
      if (currentGroup) currentGroup.area = nextP.trim();
      i++;
    }
  }
  if (currentGroup) docxGroups.push(currentGroup);

  console.log(`Parsed ${docxGroups.length} groups from Word document.`);

  // Enrich and map groups to database structure
  const dbGroups = docxGroups.map(g => {
    // 1. Detect Campus via Excel names
    let detectedCampus = null;
    let maxMatch = 0;

    Object.keys(campusWordMap).forEach(campus => {
      let score = 0;
      g.lideres.forEach(leader => {
        const words = getWords(leader);
        words.forEach(w => {
          if (campusWordMap[campus].has(w)) {
            score += 1;
          }
        });
      });
      if (score > maxMatch) {
        maxMatch = score;
        detectedCampus = campus;
      }
    });

    // Fallback Priority 2: Keyword search in group name
    if (!detectedCampus || maxMatch === 0) {
      const nameLower = g.nome.toLowerCase();
      if (nameLower.includes('coari')) detectedCampus = 'COARI';
      else if (nameLower.includes('parintins')) detectedCampus = 'CPIN';
      else if (nameLower.includes('itacoatiara')) detectedCampus = 'CITA';
      else if (nameLower.includes('lábrea') || nameLower.includes('labrea')) detectedCampus = 'CLAB';
      else if (nameLower.includes('maués') || nameLower.includes('maues')) detectedCampus = 'CMA';
      else if (nameLower.includes('tabatinga')) detectedCampus = 'CTAB';
      else if (nameLower.includes('tefé') || nameLower.includes('tefe')) detectedCampus = 'CTEF';
      else if (nameLower.includes('humaitá') || nameLower.includes('humaita')) detectedCampus = 'CHUM';
      else if (nameLower.includes('são gabriel') || nameLower.includes('sao gabriel')) detectedCampus = 'CSGV';
      else if (nameLower.includes('presidente figueiredo')) detectedCampus = 'CPRF';
      else if (nameLower.includes('zona leste') || nameLower.includes('cmzl')) detectedCampus = 'CMZL';
      else if (nameLower.includes('distrito industrial') || nameLower.includes('cmdi')) detectedCampus = 'CMDI';
    }

    // Default Fallback
    if (!detectedCampus) {
      detectedCampus = 'CMC'; // Default to Manaus Centro
    }

    // Normalize campus name (e.g. CLBR to CLAB, or keeping standard prefixes)
    if (detectedCampus === 'CLBR') detectedCampus = 'CLAB';

    // 2. Resolve CNPq Link
    let linkCnpq = 'http://dgp.cnpq.br/dgp';
    const normName = g.nome.toLowerCase().replace(/[^a-z0-9]/g, '');
    const pgMatch = portalGroups.find(pg => {
      const pgNorm = pg.identificacaoDoGrupo?.nomeDoGrupo?.toLowerCase().replace(/[^a-z0-9]/g, '');
      return pgNorm === normName || pgNorm?.includes(normName) || normName.includes(pgNorm || '');
    });
    if (pgMatch) {
      linkCnpq = `http://dgp.cnpq.br/dgp/espelhogrupo/${pgMatch.nroIdGrupo || pgMatch.id}`;
    }

    // 3. Setup Default Address based on Campus
    let endereco = 'Av. Sete de Setembro, 1975 - Centro, Manaus - AM';
    if (detectedCampus === 'COARI') endereco = 'Estrada do Mami, Km 05 - Coari, AM';
    else if (detectedCampus === 'CMZL') endereco = 'Av. Cosme Ferreira, 8045 - Gilberto Mestrinho, Manaus - AM';
    else if (detectedCampus === 'CMDI') endereco = 'Av. Danilo de Mattos Areosa, 1672 - Distrito Industrial, Manaus - AM';
    else if (detectedCampus === 'CPRF') endereco = 'AM-240, Km 01 - Presidente Figueiredo, AM';
    else if (detectedCampus === 'CPIN') endereco = 'Estrada Odovaldo Novo, s/n - Parintins, AM';
    else if (detectedCampus === 'CITA') endereco = 'Rua Jasmim, s/n - Itacoatiara, AM';
    else if (detectedCampus === 'CLAB') endereco = 'Rua Manoel Rodrigues, s/n - Lábrea, AM';
    else if (detectedCampus === 'CMA') endereco = 'Estrada dos Moraes, s/n - Maués, AM';

    const cleanLideres = g.lideres.join(', ');

    return {
      nome: g.nome,
      lideres: cleanLideres || 'Coordenador Científico IFAM',
      area: g.area || 'Multidisciplinar',
      campus: detectedCampus,
      endereco: endereco,
      contatoEmail: g.lideres.length > 0 
        ? `${g.lideres[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.')}@ifam.edu.br` 
        : 'pesquisa@ifam.edu.br',
      linhasPesquisa: 'Linhas de pesquisa e desenvolvimento científico do grupo no CNPq.',
      membrosEquipe: cleanLideres || 'Equipe de pesquisadores do IFAM',
      status: 'ATIVO',
      linkCnpq: linkCnpq,
      lastActivity: new Date()
    };
  });

  console.log(`Enriched ${dbGroups.length} groups. Writing to Database...`);

  // Clear existing groups and insert new ones
  await prisma.researchGroup.deleteMany({});
  const result = await prisma.researchGroup.createMany({
    data: dbGroups
  });

  console.log(`Successfully synced ${result.count} research groups to dev.db!`);
  
  // Print some statistics
  const countByCampus = {};
  dbGroups.forEach(g => {
    countByCampus[g.campus] = (countByCampus[g.campus] || 0) + 1;
  });
  console.log('Final corrected groups per campus:', countByCampus);

  await prisma.$disconnect();
}

const XLSX = require('xlsx');
run().catch(console.error);
