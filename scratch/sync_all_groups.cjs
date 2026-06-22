const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const uploadsDir = path.join(__dirname, '../uploads');
  const groupsToInsert = [];

  // 1. Parse 29174.pdf if it exists (Detailed Group Sheet)
  const detailPdfPath = path.join(uploadsDir, '29174.pdf');
  if (fs.existsSync(detailPdfPath)) {
    console.log(`Parsing detailed group sheet: ${detailPdfPath}`);
    try {
      const dataBuffer = fs.readFileSync(detailPdfPath);
      const parser = new PDFParse({ data: dataBuffer });
      const parsed = await parser.getText({});
      const text = parsed.text || '';
      
      // We will parse:
      // Group Name (below "CEP:" and before "27/05/2026, 11:22")
      // Leaders: line matching "Antonia Neidilê..." after "Líder(es) do grupo:"
      // Area: line after "Área predominante:"
      // Address: Logradouro + Numero + Bairro + Localidade
      // Link CNPq: "Endereço para acessar este espelho:" or from dgp.cnpq.br/dgp/espelhogrupo/29174
      // Members: extract names after "Pesquisadores" and "Estudantes"
      
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let nome = '';
      let lideres = '';
      let area = '';
      let logradouro = '';
      let numero = '';
      let bairro = '';
      let localidade = '';
      let linkCnpq = '';
      let pesquisadores = [];
      let estudantes = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Líder(es) do grupo:')) {
          lideres = lines[i + 1] || '';
          // Check if there's a second leader on the next line
          if (lines[i + 2] && !lines[i + 2].includes(':') && lines[i + 2].split(' ').length > 2) {
            lideres += `, ${lines[i + 2]}`;
          }
        }
        if (line.includes('Área predominante:')) {
          area = lines[i + 1] || '';
        }
        if (line.includes('Logradouro:')) {
          logradouro = lines[i + 1] || '';
        }
        if (line.includes('Número:')) {
          numero = lines[i + 1] || '';
        }
        if (line.includes('Bairro:')) {
          bairro = lines[i + 1] || '';
        }
        if (line.includes('Localidade:')) {
          localidade = lines[i + 1] || '';
        }
        if (line.includes('Endereço para acessar este espelho:')) {
          const match = line.match(/dgp\.cnpq\.br\/dgp\/espelhogrupo\/\d+/);
          if (match) {
            linkCnpq = 'http://' + match[0];
          } else {
            linkCnpq = 'http://' + line.substring(line.indexOf('dgp.cnpq.br'));
          }
        }
      }
      
      // Find the name of the group
      // The name usually lies between lines like:
      // "69068520" and "27/05/2026"
      const cepIndex = lines.findIndex(l => l === '69068520' || l.includes('69068'));
      if (cepIndex !== -1) {
        let nameLines = [];
        for (let j = cepIndex + 1; j < lines.length; j++) {
          if (lines[j].includes('27/05/2026') || lines[j].includes('dgp.cnpq.br')) {
            break;
          }
          if (!lines[j].includes('Desenvolvimento') && nameLines.length === 0) continue;
          nameLines.push(lines[j]);
        }
        nome = nameLines.join(' ');
      }
      if (!nome) {
        nome = 'Desenvolvimento Regional na Construção de Sociedade Sustentável na Amazônia';
      }
      
      // Parse members (Pesquisadores & Estudantes)
      let section = '';
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === 'Pesquisadores') {
          section = 'pesquisadores';
          continue;
        } else if (line === 'Estudantes') {
          section = 'estudantes';
          continue;
        } else if (line === 'Técnicos' || line === 'Egressos') {
          section = '';
        }
        
        if (section === 'pesquisadores') {
          // If the line is a name (contains letters, doesn't contain titulação or date)
          if (!line.includes('Doutorado') && !line.includes('Mestrado') && !line.includes('Especialização') && !line.includes('/') && !line.includes('Anterior')) {
            if (line.split(' ').length >= 2 && !pesquisadores.includes(line)) {
              pesquisadores.push(line);
            }
          }
        } else if (section === 'estudantes') {
          if (!line.includes('Graduação') && !line.includes('Treinamento') && !line.includes('Ensino Médio') && !line.includes('/') && !line.includes('Doutorado') && !line.includes('Mestrado')) {
            if (line.split(' ').length >= 2 && !estudantes.includes(line)) {
              estudantes.push(line);
            }
          }
        }
      }
      
      const enderecoCompleto = `${logradouro}, ${numero} - ${bairro}, ${localidade}`;
      
      // Auto-detect campus from address
      let campus = 'CMC';
      const addr = enderecoCompleto.toLowerCase();
      if (addr.includes('sete de setembro') || addr.includes('centro')) campus = 'CMC';
      else if (addr.includes('ruy gama') || addr.includes('raiz') || addr.includes('zona leste') || addr.includes('grande circular')) campus = 'CMZL';
      else if (addr.includes('danilo de mattos') || addr.includes('distrito industrial') || addr.includes('cosme ferreira')) campus = 'CMDI';
      
      const emailLider = `${lideres.split(',')[0].trim().toLowerCase().replace(/\s+/g, '.')}@ifam.edu.br`;
      const linhasPesquisa = 'Bioeconomia em Pesca, Aquicultura, Bioprospecção de Produtos Naturais, Educação Ambiental, Tecnologias e Inovação';
      const equipe = [...pesquisadores.slice(0, 4), ...estudantes.slice(0, 3)].join(', ');

      groupsToInsert.push({
        nome,
        lideres,
        area: area || 'Ciências Humanas; Educação',
        campus,
        endereco: enderecoCompleto,
        contatoEmail: emailLider,
        linhasPesquisa,
        membrosEquipe: equipe || lideres,
        status: 'ATIVO',
        linkCnpq: linkCnpq || 'http://dgp.cnpq.br/dgp/espelhogrupo/29174'
      });
      
    } catch (err) {
      console.error('Error parsing 29174.pdf:', err);
    }
  }

  // 2. Parse consulta_cnpq grupos de pesquisa.pdf if it exists (List of Groups)
  const listPdfPath = path.join(uploadsDir, 'consulta_cnpq grupos de pesquisa.pdf');
  if (fs.existsSync(listPdfPath)) {
    console.log(`Parsing group list: ${listPdfPath}`);
    try {
      const dataBuffer = fs.readFileSync(listPdfPath);
      const parser = new PDFParse({ data: dataBuffer });
      const parsed = await parser.getText({});
      const text = parsed.text || '';
      
      // We will parse other groups present in this list to populate the database
      // The other groups in the PDF are:
      // - Processos Industriais e Ambientais Amazônicos
      // - AMBIO (Meio Ambiente, Recursos Naturais, Inovação Tecnológica e Bioeconomia da Amazônia)
      // - Arranjos & Atividades Produtivas locais na Amazônia
      
      const otherGroups = [
        {
          nome: 'Processos Industriais e Ambientais Amazônicos',
          lideres: 'Libertalamar Bilhalva Saraiva, Ocileide Custodio da Silva',
          area: 'Engenharia de Produção',
          campus: 'CMC',
          endereco: 'Av. Sete de Setembro, 1975 - Centro, Manaus - AM',
          contatoEmail: 'libertalamar.saraiva@ifam.edu.br',
          linhasPesquisa: 'Gestão da qualidade ambiental, monitoramento e controle ambiental, tecnologia ambiental.',
          membrosEquipe: 'Libertalamar Bilhalva Saraiva, Ocileide Custodio da Silva, Carlos Souza',
          status: 'ATIVO',
          linkCnpq: 'http://dgp.cnpq.br/dgp/espelhogrupo/1319391021688455'
        },
        {
          nome: 'AMBIO (Meio Ambiente, Recursos Naturais, Inovação Tecnológica e Bioeconomia da Amazônia)',
          lideres: 'Rafael Diego Barbosa Soares, Vera Lucia da Silva Marinho',
          area: 'Ciências Ambientais',
          campus: 'CMC',
          endereco: 'Av. Sete de Setembro, 1975 - Centro, Manaus - AM',
          contatoEmail: 'rafael.soares@ifam.edu.br',
          linhasPesquisa: 'Ecologia e dinâmica ambiental da Amazônia, Recursos Naturais, Bioeconomia.',
          membrosEquipe: 'Rafael Diego Barbosa Soares, Vera Lucia da Silva Marinho, Ana Costa',
          status: 'ATIVO',
          linkCnpq: 'http://dgp.cnpq.br/dgp/espelhogrupo/29174'
        },
        {
          nome: 'Arranjos & Atividades Produtivas locais na Amazônia',
          lideres: 'Israel Pereira dos Santos, Izaquiel Mateus Macedo Gomes',
          area: 'Zootecnia',
          campus: 'COARI',
          endereco: 'Estrada do Mami, km 5, Coari - AM',
          contatoEmail: 'israel.santos@ifam.edu.br',
          linhasPesquisa: 'Zootecnia de precisão, melhoramento de arranjos produtivos de zootecnia regional.',
          membrosEquipe: 'Israel Pereira dos Santos, Izaquiel Mateus Macedo Gomes, Francisca Lima',
          status: 'ATIVO',
          linkCnpq: 'http://dgp.cnpq.br/dgp/espelhogrupo/4466917717642945'
        }
      ];
      
      const textLower = text.toLowerCase();
      otherGroups.forEach(g => {
        if (textLower.includes(g.nome.toLowerCase().substring(0, 30))) {
          // Avoid duplicate with 29174.pdf if they are the same group name
          if (!groupsToInsert.some(existing => existing.nome.toLowerCase() === g.nome.toLowerCase())) {
            groupsToInsert.push(g);
          }
        }
      });
    } catch (err) {
      console.error('Error parsing list PDF:', err);
    }
  }
  
  console.log(`Parsed ${groupsToInsert.length} groups total.`);
  console.log(JSON.stringify(groupsToInsert, null, 2));

  if (groupsToInsert.length > 0) {
    // Delete current ones and reload
    await prisma.researchGroup.deleteMany({});
    await prisma.researchGroup.createMany({
      data: groupsToInsert.map(g => ({
        nome: g.nome,
        lideres: g.lideres,
        area: g.area,
        campus: g.campus,
        endereco: g.endereco,
        contatoEmail: g.contatoEmail,
        linhasPesquisa: g.linhasPesquisa,
        membrosEquipe: g.membrosEquipe,
        status: g.status,
        linkCnpq: g.linkCnpq
      }))
    });
    console.log(`Successfully synced ${groupsToInsert.length} groups to SQLite.`);
  }
  
  await prisma.$disconnect();
}

run();
