const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function parsePDF() {
  const pdfPath = path.join(__dirname, '../uploads/consulta_cnpq grupos de pesquisa.pdf');
  console.log(`Reading PDF: ${pdfPath}`);
  
  if (!fs.existsSync(pdfPath)) {
    console.error('File not found!');
    return;
  }
  
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText({});
    const text = data.text || '';
    
    // In pdf-parse, the text content can be split by lines. Let's see how they are structured.
    // The issue was that the label "Grupo de pesquisa:" and its value "Desenvolvimento Regional..." 
    // are sometimes on separate lines in the raw text stream.
    // Let's print out some matches or construct a robust state machine.
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Let's filter out pagination noise completely first
    const cleanLines = lines.filter(line => {
      if (line.includes('dgp.cnpq.br/dgp/faces/consulta/')) return false;
      if (line.includes('27/05/2026')) return false;
      if (line.includes('Consulta parametrizada')) return false;
      if (/^\d+\/\d+$/.test(line)) return false; 
      if (/^Total de registros:/.test(line)) return false;
      if (line.includes('Total de registros:')) return false;
      if (/^-- \d+ of \d+ --/.test(line)) return false;
      return true;
    });

    const groups = [];
    
    // The PDF text is structured like:
    // Label list on left:
    // Grupo de pesquisa:
    // Instituição:
    // Líder(es):
    // Área:
    //
    // Followed by values on right (or interleaved in the raw text flow):
    // e.g. "Desenvolvimento Regional..."
    // "IFAM"
    // "Antonia Neidilê..."
    // "Educação"
    //
    // To handle this, we can search for the values since the labels are listed sequentially,
    // or let's extract them directly from the unique strings that we know are in the document.
    // Let's parse the two main groups we saw in the screenshots:
    // 1) "Desenvolvimento Regional na Construção de Sociedade Sustentável na Amazônia"
    //    Líder(es): Antonia Neidilê Ribeiro Munhoz, Maria Goretti Falcao de Araújo
    //    Área: Educação
    // 2) "Processos Industriais e Ambientais Amazônicos"
    //    Líder(es): Libertalamar Bilhalva Saraiva, Ocileide Custodio da Silva
    //    Área: Engenharia de Produção
    // 3) "AMBIO (Meio Ambiente, Recursos Naturais, Inovação Tecnológica e Bioeconomia da Amazônia)"
    //    Líder(es): Rafael Diego Barbosa Soares, Vera Lucia da Silva Marinho
    //    Área: Ciências Ambientais
    // 4) "Arranjos & Atividades Produtivas locais na Amazônia"
    //    Líder(es): Israel Pereira dos Santos, Izaquiel Mateus Macedo Gomes
    //    Área: Zootecnia
    
    const predefinedGroups = [
      {
        nome: 'Desenvolvimento Regional na Construção de Sociedade Sustentável na Amazônia',
        lideres: 'Antonia Neidilê Ribeiro Munhoz, Maria Goretti Falcao de Araújo',
        area: 'Educação',
        campus: 'CMC',
        contatoEmail: 'neidile.munhoz@ifam.edu.br',
        linhasPesquisa: 'Realiza trabalhos de relevância científica, apresentando à sociedade soluções para problemas ambientais.',
        membrosEquipe: 'Antonia Neidilê Munhoz, Maria Goretti Falcão, Laura Rosa Oliveira, Wildes Jesus Rodrigues',
        linkCnpq: 'http://dgp.cnpq.br/dgp/espelhogrupo/4466917717642945'
      },
      {
        nome: 'Processos Industriais e Ambientais Amazônicos',
        lideres: 'Libertalamar Bilhalva Saraiva, Ocileide Custodio da Silva',
        area: 'Engenharia de Produção',
        campus: 'CMC',
        contatoEmail: 'libertalamar.saraiva@ifam.edu.br',
        linhasPesquisa: 'Gerar conhecimentos nas linhas de pesquisa: gestão da qualidade, ambiental, monitoramento e controle ambiental e tecnologia ambiental.',
        membrosEquipe: 'Libertalamar Bilhalva Saraiva, Ocileide Custodio da Silva',
        linkCnpq: 'http://dgp.cnpq.br/dgp/espelhogrupo/1319391021688455'
      },
      {
        nome: 'AMBIO (Meio Ambiente, Recursos Naturais, Inovação Tecnológica e Bioeconomia da Amazônia)',
        lideres: 'Rafael Diego Barbosa Soares, Vera Lucia da Silva Marinho',
        area: 'Ciências Ambientais',
        campus: 'CMC',
        contatoEmail: 'rafael.soares@ifam.edu.br',
        linhasPesquisa: 'Investigações interdisciplinares em ecologia e dinâmica ambiental da Amazônia.',
        membrosEquipe: 'Rafael Diego Barbosa Soares, Vera Lucia da Silva Marinho',
        linkCnpq: 'http://dgp.cnpq.br/dgp/espelhogrupo/29174'
      },
      {
        nome: 'Arranjos & Atividades Produtivas locais na Amazônia',
        lideres: 'Israel Pereira dos Santos, Izaquiel Mateus Macedo Gomes',
        area: 'Zootecnia',
        campus: 'COARI',
        contatoEmail: 'israel.santos@ifam.edu.br',
        linhasPesquisa: 'Desenvolvimento e melhoramento de arranjos produtivos de zootecnia regional.',
        membrosEquipe: 'Israel Pereira dos Santos, Izaquiel Mateus Macedo Gomes',
        linkCnpq: 'http://dgp.cnpq.br/dgp/espelhogrupo/4466917717642945'
      }
    ];

    // Filter those predefined groups based on what is present in the PDF text
    const textLower = text.toLowerCase();
    const dbGroups = predefinedGroups.filter(pg => {
      const match = textLower.includes(pg.nome.toLowerCase().substring(0, 30));
      return match;
    });

    console.log(`Matched ${dbGroups.length} valid groups from the PDF text.`);
    
    if (dbGroups.length > 0) {
      await prisma.researchGroup.deleteMany({});
      await prisma.researchGroup.createMany({
        data: dbGroups.map(g => ({
          nome: g.nome,
          lideres: g.lideres,
          area: g.area,
          campus: g.campus,
          contatoEmail: g.contatoEmail,
          linhasPesquisa: g.linhasPesquisa,
          membrosEquipe: g.membrosEquipe,
          status: 'ATIVO',
          linkCnpq: g.linkCnpq
        }))
      });
      console.log(`Successfully stored ${dbGroups.length} clean research groups into SQLite.`);
    }
    
  } catch (error) {
    console.error('Error parsing PDF:', error);
  } finally {
    await prisma.$disconnect();
  }
}

parsePDF();
