const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function normalizeName(name) {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z\s]/g, '') // keep only letters and spaces
    .replace(/\s+/g, ' ')
    .trim();
}

async function run() {
  const projects = await prisma.project.findMany({
    select: {
      orientador: true,
      campus: true
    }
  });

  const coordMap = {};
  projects.forEach(p => {
    const norm = normalizeName(p.orientador);
    coordMap[norm] = p.campus.trim().toUpperCase();
  });

  // Let's parse DOCX groups
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
    if (pText) paragraphs.push(pText);
  }

  const docxGroups = [];
  let currentGroup = null;

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    if (p.includes('Grupo de pesquisa:')) {
      if (currentGroup) docxGroups.push(currentGroup);
      currentGroup = { nome: '', lideres: [] };
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

  console.log('--- Matching Leaders ---');
  let matchedCount = 0;
  const matchDetails = [];
  
  docxGroups.forEach(g => {
    let resolvedCampus = null;
    let matchedLeader = null;
    
    for (const leader of g.lideres) {
      const normLeader = normalizeName(leader);
      
      // Try exact match on normalized names
      if (coordMap[normLeader]) {
        resolvedCampus = coordMap[normLeader];
        matchedLeader = leader;
        break;
      }
      
      // Try fuzzy match: does a coordinator's name contain the leader's name, or vice versa?
      for (const [coord, camp] of Object.entries(coordMap)) {
        if (coord.includes(normLeader) || normLeader.includes(coord)) {
          resolvedCampus = camp;
          matchedLeader = leader;
          break;
        }
      }
      if (resolvedCampus) break;
    }
    
    if (resolvedCampus) {
      matchedCount++;
      matchDetails.push({
        group: g.nome,
        leader: matchedLeader,
        campus: resolvedCampus
      });
    } else {
      matchDetails.push({
        group: g.nome,
        leader: g.lideres.join(', '),
        campus: 'NOT_FOUND'
      });
    }
  });

  console.log(`Total matched groups by leader name: ${matchedCount} of ${docxGroups.length}`);
  
  console.log('\nMatched groups distribution:');
  const counts = {};
  matchDetails.forEach(d => {
    counts[d.campus] = (counts[d.campus] || 0) + 1;
  });
  console.log(counts);

  console.log('\nUnmatched groups list:');
  matchDetails.filter(d => d.campus === 'NOT_FOUND').forEach(d => {
    console.log(`- "${d.group}" (Lider: ${d.leader})`);
  });

  await prisma.$disconnect();
}

run().catch(console.error);
