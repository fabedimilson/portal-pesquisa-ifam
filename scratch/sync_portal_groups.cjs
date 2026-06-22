const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Fetching groups from Portal Integra IFAM using native fetch...');
  try {
    const response = await fetch('https://integra.ifam.edu.br/api/portfolio/grupo-de-pesquisa/data?start=0&length=100');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data) || data.length < 2 || !Array.isArray(data[1])) {
      throw new Error('Formato de resposta inesperado do Portal Integra.');
    }
    
    const rawGroups = data[1];
    console.log(`Found ${rawGroups.length} groups on the portal. Synchronizing database...`);
    
    const dbGroups = [];
    for (const g of rawGroups) {
      const ident = g.identificacaoDoGrupo || {};
      
      const nome = ident.nomeDoGrupo || 'Grupo de Pesquisa sem Nome';
      const area = ident.areaPredominante || 'Multidisciplinar';
      const lideres = ident.lideres && ident.lideres.length > 0
        ? ident.lideres.map(l => l.nome).join(', ')
        : 'Coordenador Científico IFAM';
        
      // Extract or estimate campus from the group address or organic organization name
      let campus = 'CMC';
      const campusList = ['COARI', 'CMC', 'CMZL', 'CMDI', 'CPRF', 'CPIN', 'CITA', 'CLAB', 'CMA'];
      const textToSearch = (nome + ' ' + (ident.nomeDaUnidade || '')).toUpperCase();
      for (const c of campusList) {
        if (textToSearch.includes(c)) {
          campus = c;
          break;
        }
      }
      
      const contatoEmail = ident.contatoEmail || `${slugify(lideres)}@ifam.edu.br`;
      const linhasPesquisa = ident.repercussoes ? ident.repercussoes.substring(0, 300) : 'Pesquisa Aplicada regional';
      const membrosEquipe = 'Pesquisadores do IFAM e discentes associados';
      const linkCnpq = `http://dgp.cnpq.br/dgp/espelhogrupo/${g.nroIdGrupo || g.id}`;
      
      dbGroups.push({
        nome,
        area,
        lideres,
        campus,
        contatoEmail,
        linhasPesquisa,
        membrosEquipe,
        status: 'ATIVO',
        linkCnpq
      });
    }
    
    // Clear and batch load
    if (dbGroups.length > 0) {
      await prisma.researchGroup.deleteMany({});
      await prisma.researchGroup.createMany({
        data: dbGroups
      });
      console.log(`Success! Synchronized ${dbGroups.length} research groups with the local database.`);
    }
  } catch (error) {
    console.error('Error synchronizing portal groups:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    .replace(/[^\w.]+/g, '');
}

run();
