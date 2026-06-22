const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function normalizeName(name) {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, '') // keep alphanumeric and spaces
    .replace(/\s+/g, ' ')
    .trim();
}

async function run() {
  const workbook = XLSX.readFile('c:/Users/otran/Documents/Painel de Pesquisa_IFAM/Controle Bolsas por campus AC.xlsx');
  
  // Parse all cells in all sheets to find where any of the unmatched leaders' name fragments appear
  const cellMatches = [];
  
  // Let's first list the unmatched leaders we got from the previous run
  const unmatched = [
    { group: 'Processos Industriais e Ambientais Amazônicos', leaders: ['Libertalamar Bilhalva Saraiva', 'Ocileide Custodio da Silva'] },
    { group: 'Arranjos & Atividades Produtivas locais na Amazônia', leaders: ['Israel Pereira dos Santos', 'Izaquiel Mateus Macedo Gomes'] },
    { group: 'Biologia, Manejo e Produção de Espécies em Espaços Amazônicos', leaders: ['Marcio Quara de Carvalho Santos'] },
    { group: 'Ciências Ambientais', leaders: ['Fábio Alexandre Costa Mota'] },
    { group: 'CIÊNCIAS DA NATUREZA', leaders: ['Cleoni Virginio da Silveira', 'Eurídes Francisco Teixeira Júnior'] },
    { group: 'CULTURA, SOCIEDADE, EDUCAÇAO PROFISSIONAL E AMAZONIA', leaders: ['Raimundo Emerson Dourado Pereira'] },
    { group: 'DAPAAM - Desenvolvimento da Aquicultura, Pesca e Agropecuária do Amazonas', leaders: ['Rafael Lustosa Maciel', 'Silvio Vieira da Silva'] },
    { group: 'Desenvolvimento de Sistemas para Automação Industrial', leaders: ['Isaac Benjamim Benchimol', 'José Pinheiro de Queiroz Neto'] },
    { group: 'Educação, Politecnia e Sociedades Amazônicas', leaders: ['Deuzilene Marques Salazar', 'Efraim Menezes de Lima Costa'] },
    { group: 'Educação Profissional, meio ambiente e desenvolvimento sustentável na Amazônia', leaders: ['Bruna Aparecida Madureira de Souza'] },
    { group: 'Educação, Tecnologia, Desenvolvimento e Sustentabilidade', leaders: ['Willison Eduardo Oliveira Campos', 'Reginaldo Almeida Andrade'] },
    { group: 'Fisiologia e Produção Vegetal na Amazônia', leaders: ['Adamir da Rocha Nina Junior', 'Flávia Camila Schimpl'] },
    { group: 'Gênero e meio Ambiente -GEMA', leaders: ['Christiane Pereira Rodrigues'] },
    { group: 'GEPEME - GRUPO DE ESTUDOS E PESQUISAS EM EDUCAÇÃO MATEMÁTICA E ESTATÍSTICA', leaders: ['Darlane Cristina Maciel Saraiva', 'Antonio Junior Evangelista'] },
    { group: 'GIPCULT - Grupo Interdisciplinar de Pesquisas em Cultura, Língua, Sociedade e Tecnologia', leaders: ['Dirley Aparecida Zolletti Zanerato', 'Bruno Avelino Leal'] },
    { group: 'Grupo de Ensino e Pesquisa em Ciências e Matemática', leaders: ['Noam Gadelha da Silva', 'Di Angelo Matos Pinheiro'] },
    { group: 'Grupo de Estudo e Pesquisa sobre Processos Formativos de Professores no Ensino Tecnológico (GEPROFET)', leaders: ['Cinara Calvi Anic', 'Maria Lucia Tinoco Pacheco'] },
    { group: 'GRUPO DE ESTUDOS E PESQUISAS EM EDUCAÇÃO A DISTÂNCIA (GEPEaD)', leaders: ['Juliano Milton Kruger', 'Ana Patricia Peinado e Silva'] },
    { group: 'Grupo de Estudos e Pesquisas em Políticas, Práticas e Processos Educativos na Contemporaneidade', leaders: ['Josemar Farias da Silva', 'Maria Rutimar de Jesus Belizario'] },
    { group: 'GRUPO DE ESTUDOS E PESQUISAS SOBRE O MODELO DE FORMAÇÃO REFLEXIVO (GEMPFORE)', leaders: ['Ailton Gonçalves Reis'] },
    { group: 'Grupo de Investigação sobre Recursos e Práticas de Ensino (GIRPEN)', leaders: ['Andréa Pereira Mendonça', 'João dos Santos Cabral Neto'] },
    { group: 'Grupo de Pesquisa, Desenvolvimento e Inovação na área de Materiais', leaders: ['Jose Anglada Rivera', 'Lizandro Manzato'] },
    { group: 'Grupo de Pesquisa em EducaÃ§Ã£o na Fronteira AmazÃ´nica - GPEFAM', leaders: ['Guilherme Balieiro Gomes'] },
    { group: 'Grupo de Pesquisa em Educação e Ciências Humanas na Amazônia', leaders: ['Ricardo Lima da Silva', 'Rômulo Pinheiro de Amorim'] },
    { group: 'Grupo de pesquisa em Tecnologia e Gestão para o Desenvolvimento Sustentável do Rio Solimões', leaders: ['Francisco das Chagas Mendes dos Santos', 'Alyson de Jesus dos Santos'] },
    { group: 'Grupo de Recursos Energéticos e Nanomateriais - GREEN', leaders: ['Francisco Xavier Nobre'] },
    { group: 'Grupo Interdisciplinar de Pesquisa em Ciências do Ambiente Amazônico - GIPECAM', leaders: ['Geasi Pavao Soares', 'Maurício Papa de Arruda'] },
    { group: 'Interculturalidade e saberes étnicos no Alto Rio Negro', leaders: ['Letícia Alves da Silva'] },
    { group: 'Linguagens, Sociedade e Transdiciplinalidade na Amazônia', leaders: ['Terezinha de Jesus Reis Vilas Boas', 'Meire Albuquerque de Siqueira'] },
    { group: 'Meio Ambiente, Trabalho e Tecnologia no Médio Purus', leaders: ['Pablo Marques da Silva', 'João Maciel de Araújo'] },
    { group: 'NÚCLEO AMAZÔNICO DE ESTUDOS EM CIÊNCIA, ENSINO, TECNOLOGIA E INOVAÇÃO NAECETI', leaders: ['Nidianne Nascimento Vilhena'] },
    { group: 'Núcleo de Estudo Socioeconômico-Ambiental do Amazonas - NESAS', leaders: ['Cristóvão Gomes Placido Júnior', 'Marisol Elias de Barros Plácido'] },
    { group: 'NÚCLEO DE ESTUDOS APLICADOS EM RECURSOS PESQUEIROS', leaders: ['Renato Soares Cardoso', 'Eyner Godinho de Andrade'] },
    { group: 'Núcleo de Estudos da Agricultura Periurbana e Agroecologia - NEAPA', leaders: ['Cristóvão Gomes Placido Júnior', 'Matheus Miranda Caniato'] },
    { group: 'Núcleo de Estudos de Invertebrados e Vertebrados da Amazônia (NEIVA)', leaders: ['Adriano Teixeira de Oliveira', 'Paulo Henrique Rocha Aride'] },
    { group: 'NÚCLEO DE ESTUDOS E PESQUISA EM TECNOLOGIAS SUSTENTÁVEIS EM ENERGIA E BIOTECNOLOGIA DA AMAZÔNIA - NEPTSEBA', leaders: ['Jose Josimar Soares'] },
    { group: 'Núcleo de Estudos em Produção Animal e Produtos de Origem Animal', leaders: ['Felipe Faccini dos Santos'] },
    { group: 'Núcleo de Pesquisa Aplicada à Produção Agropecuária', leaders: ['Marcelo de Queiroz Rocha', 'Lucas Vinicius Andrade Oliveira'] },
    { group: 'NÚCLEO MULTIDISCIPLINAR EM ESTUDOS DAS CIÊNCIAS EXATAS E AGRÁRIAS NO CONTEXTO AMAZÔNICO.', leaders: ['Danilo Cavalcante Braz'] },
    { group: 'NUPA', leaders: ['Eyner Godinho de Andrade', 'Flávio Augusto Leão da Fonseca'] },
    { group: 'Observatório em Educação e Diversidade na Amazônia: Indígena, Quilombola e do Campo/Floresta - OEDIQCF', leaders: ['Claudina Azevedo Maximiano', 'Alessandra de Souza Fonseca'] },
    { group: 'Produção e Sustentabilidade na Amazônia', leaders: ['Rafael Augusto Ferraz', 'Kaline Ziemniczak'] },
    { group: 'Produtos Naturais e Antimicrobianos', leaders: ['Juliana Mesquita Vidal Martinez de Lucena', 'Ana Lúcia Mendes dos Santos'] },
    { group: 'Rede Amazônica de Saúde Única', leaders: ['Paulo Alex Machado Carneiro'] },
    { group: 'Segurança Alimentar e Nutricional - Núcleo Integrado de Pesquisa na Amazônia (NIPA)', leaders: ['Lúcia Schuch Boeira'] },
    { group: 'SOCIEDADE, ECONOMIA, CULTURA E AMBIENTE NA AMAZÔNIA: interfaces e perspectivas', leaders: ['Paulo de Oliveira Nascimento'] },
    { group: 'Utilização de Recursos Naturais Amazônicos no processo de ensino e aprendizagem (URNAEA)', leaders: ['Lais Alves da Gama', 'Edson Valente Chaves'] }
  ];

  // Scan sheets
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    rows.forEach((row, rowIdx) => {
      row.forEach((cellVal, colIdx) => {
        if (!cellVal) return;
        const normCell = normalizeName(cellVal);
        
        unmatched.forEach(u => {
          u.leaders.forEach(lead => {
            if (!lead) return;
            const normLead = normalizeName(lead);
            // check if the cell contains the leader name, or part of it (e.g. last name + first name)
            // or if leader name contains cell content
            if (normCell.includes(normLead) || normLead.includes(normCell)) {
              cellMatches.push({
                group: u.group,
                leader: lead,
                matchedCell: cellVal,
                sheet: sheetName,
                row: rowIdx,
                col: colIdx
              });
            }
          });
        });
      });
    });
  }

  console.log(`Found ${cellMatches.length} cell matches in the Excel spreadsheet.`);
  // Print unique groups matched this way and their resolved sheets (campuses)
  const groupCampusResolved = {};
  cellMatches.forEach(m => {
    // sheetName is like "AC CMDI" or "AC COARI", let's extract campus
    const campus = m.sheet.replace('AC ', '').trim().toUpperCase();
    if (!groupCampusResolved[m.group]) {
      groupCampusResolved[m.group] = [];
    }
    groupCampusResolved[m.group].push({ leader: m.leader, campus, cell: m.matchedCell });
  });

  console.log('Fuzzy Excel cell matches:');
  console.log(JSON.stringify(groupCampusResolved, null, 2));
}

run().catch(console.error);
