const XLSX = require('xlsx');
const fs = require('fs');

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
  const workbook = XLSX.readFile('c:/Users/otran/Documents/Painel de Pesquisa_IFAM/Controle Bolsas por campus AC.xlsx');
  
  // Map of Campus -> Set of Name Words in that campus sheet
  const campusWordMap = {};
  // Map of Campus -> List of full names found in that campus sheet
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
        // If it looks like a person's name (multiple words, mostly letters)
        if (valStr.split(' ').length >= 2 && /^[a-zA-ZÀ-ÿ\s.'-]+$/.test(valStr)) {
          campusFullNameMap[campus].add(valStr);
          getWords(valStr).forEach(w => {
            campusWordMap[campus].add(w);
          });
        }
      });
    });
  });

  console.log('Campuses loaded:');
  Object.keys(campusWordMap).forEach(c => {
    console.log(`- ${c}: ${campusFullNameMap[c].size} names, ${campusWordMap[c].size} unique words`);
  });

  // Load DOCX groups
  const docxGroups = [
    { nome: "Desenvolvimento Regional na Construção de Sociedade Sustentável na Amazônia", lideres: ["Antonia Neidilê Ribeiro Munhoz", "Maria Goretti Falcao de Araújo"] },
    { nome: "Desenvolvimento Regional na Construção de Sociedade Sustentável na Amazônia", lideres: ["Antonia Neidilê Ribeiro Munhoz"] },
    { nome: "Processos Industriais e Ambientais Amazônicos", lideres: ["Libertalamar Bilhalva Saraiva", "Ocileide Custodio da Silva"] },
    { nome: "AMBIO (Meio Ambiente, Recursos Naturais, Inovação Tecnológica e Bioeconomia da Amazônia)", lideres: ["Rafael Diego Barbosa Soares", "Vera Lucia da Silva Marinho"] },
    { nome: "Arranjos & Atividades Produtivas locais na Amazônia", lideres: ["Israel Pereira dos Santos", "Izaquiel Mateus Macedo Gomes"] },
    { nome: "Biologia, Manejo e Produção de Espécies em Espaços Amazônicos", lideres: ["Marcio Quara de Carvalho Santos"] },
    { nome: "BIOTECNOLOGIA E BIOECONOMIA NA AMAZÔNIA", lideres: ["Elson Antonio Sadalla Pinto"] },
    { nome: "Biotecnologia e bioprocessos na Biodiversidade Amazônica", lideres: ["Miriam de Medeiros Cartonilho"] },
    { nome: "Ciências Ambientais", lideres: ["Fábio Alexandre Costa Mota"] },
    { nome: "CIÊNCIAS DA NATUREZA", lideres: ["Cleoni Virginio da Silveira", "Eurídes Francisco Teixeira Júnior"] },
    { nome: "Computação Aplicada", lideres: ["Jucimar Brito de Souza", "Emmerson Santa Rita da Silva"] },
    { nome: "CULTURA, SOCIEDADE, EDUCAÇAO PROFISSIONAL E AMAZONIA", lideres: ["Raimundo Emerson Dourado Pereira"] },
    { nome: "DAPAAM - Desenvolvimento da Aquicultura, Pesca e Agropecuária do Amazonas", lideres: ["Rafael Lustosa Maciel", "Silvio Vieira da Silva"] },
    { nome: "Desenvolvimento de Sistemas para Automação Industrial", lideres: ["Isaac Benjamim Benchimol", "José Pinheiro de Queiroz Neto"] },
    { nome: "Desenvolvimento, Etnicidade e Políticas Públicas na Amazônia", lideres: ["Alvatir Carolino da Silva"] },
    { nome: "Desenvolvimento regional e meio ambiente no médio Purus", lideres: ["Débora Rodrigues de Aquino", "Samanta Ongaratto Gil"] },
    { nome: "Educação, Politecnia e Sociedades Amazônicas", lideres: ["Deuzilene Marques Salazar", "Efraim Menezes de Lima Costa"] },
    { nome: "Educação Profissional, meio ambiente e desenvolvimento sustentável na Amazônia", lideres: ["Bruna Aparecida Madureira de Souza"] },
    { nome: "Educação, Tecnologia, Desenvolvimento e Sustentabilidade", lideres: ["Willison Eduardo Oliveira Campos", "Reginaldo Almeida Andrade"] },
    { nome: "Engenharia de Controle e Processos Industriais Inteligentes - ECOPII", lideres: ["Vanderson de Lima Reis", "Cleonor Crescencio das Neves"] },
    { nome: "Fisiologia e Produção Vegetal na Amazônia", lideres: ["Adamir da Rocha Nina Junior", "Flávia Camila Schimpl"] },
    { nome: "Gênero e meio Ambiente -GEMA", lideres: ["Christiane Pereira Rodrigues"] },
    { nome: "GEPEME - GRUPO DE ESTUDOS E PESQUISAS EM EDUCAÇÃO MATEMÁTICA E ESTATÍSTICA", lideres: ["Darlane Cristina Maciel Saraiva", "Antonio Junior Evangelista"] },
    { nome: "GIPCULT - Grupo Interdisciplinar de Pesquisas em Cultura, Língua, Sociedade e Tecnologia", lideres: ["Dirley Aparecida Zolletti Zanerato", "Bruno Avelino Leal"] },
    { nome: "Grupo de Ensino e Pesquisa em Ciências e Matemática", lideres: ["Noam Gadelha da Silva", "Di Angelo Matos Pinheiro"] },
    { nome: "Grupo de Estudo e Pesquisa sobre Processos Formativos de Professores no Ensino Tecnológico (GEPROFET)", lideres: ["Cinara Calvi Anic", "Maria Lucia Tinoco Pacheco"] },
    { nome: "Grupo de Estudo em Ciências Agrárias e Ambientais da Amazônia-GECAAM", lideres: ["Nelly Lúcia Simões de Faria", "Rodrigo Barbosa da Silva"] },
    { nome: "GRUPO DE ESTUDOS E PESQUISAS EM EDUCAÇÃO A DISTÂNCIA (GEPEaD)", lideres: ["Juliano Milton Kruger", "Ana Patricia Peinado e Silva"] },
    { nome: "Grupo de Estudos e Pesquisas em Políticas, Práticas e Processos Educativos na Contemporaneidade", lideres: ["Josemar Farias da Silva", "Maria Rutimar de Jesus Belizario"] },
    { nome: "Grupo de Estudos e Pesquisas em Produção, Logística e Administração no Amazonas - GEPLAM", lideres: ["Dandara de Oliveira Souza", "Alexandre Araujo de Souza"] },
    { nome: "GRUPO DE ESTUDOS E PESQUISAS SOBRE O MODELO DE FORMAÇÃO REFLEXIVO (GEMPFORE)", lideres: ["Ailton Gonçalves Reis"] },
    { nome: "Grupo de Investigação sobre Recursos e Práticas de Ensino (GIRPEN)", lideres: ["Andréa Pereira Mendonça", "João dos Santos Cabral Neto"] },
    { nome: "Grupo de Pesquisa, Desenvolvimento e Inovação na área de Materiais", lideres: ["Jose Anglada Rivera", "Lizandro Manzato"] },
    { nome: "Grupo de Pesquisa em EducaÃ§Ã£o na Fronteira AmazÃ´nica - GPEFAM", lideres: ["Guilherme Balieiro Gomes"] },
    { nome: "Grupo de Pesquisa em Educação e Ciências Humanas na Amazônia", lideres: ["Ricardo Lima da Silva", "Rômulo Pinheiro de Amorim"] },
    { nome: "Grupo de Pesquisa em Engenharia Civil - GPEC/IFAM", lideres: ["Silvana Reis da Silva"] },
    { nome: "Grupo de Pesquisa em Sociodiversidade e Bioeconomia na Amazônia", lideres: ["Jordanny de Oliveira Silva", "Klenio Silva Souza"] },
    { nome: "Grupo de pesquisa em Tecnologia e Gestão para o Desenvolvimento Sustentável do Rio Solimões", lideres: ["Francisco das Chagas Mendes dos Santos", "Alyson de Jesus dos Santos"] },
    { nome: "Grupo de Recursos Energéticos e Nanomateriais - GREEN", lideres: ["Francisco Xavier Nobre"] },
    { nome: "Grupo Interdisciplinar de Pesquisa em Ciências do Ambiente Amazônico - GIPECAM", lideres: ["Geasi Pavao Soares", "Maurício Papa de Arruda"] },
    { nome: "Grupo interdisciplinar de pesquisas socioambientais da Amazônia (GIPAM)", lideres: ["Klenio Silva Souza", "Ronaldo Medeiros dos Santos"] },
    { nome: "Grupo Multidisciplinar de Estudos e Pesquisas sobre Inclusão e Cidadania", lideres: ["Klaus de Souza Oliveira", "Jéssica de Alencar Albuquerque"] },
    { nome: "Interculturalidade e saberes étnicos no Alto Rio Negro", lideres: ["Letícia Alves da Silva"] },
    { nome: "Linguagem, Arte, Comunicação e Ciência - LACC", lideres: ["Eglê Wanzeler dos Santos Pimenta", "Ana Carolina da Silva Galvão"] },
    { nome: "Linguagens, Sociedade e Transdiciplinalidade na Amazônia", lideres: ["Terezinha de Jesus Reis Vilas Boas", "Meire Albuquerque de Siqueira"] },
    { nome: "MATEMÁTICA APLICADA E COMPUTAÇÃO CIENTÍFICA", lideres: ["Reginaldo Almeida Andrade", "Carlos José de Oliveira"] },
    { nome: "Meio Ambiente, Trabalho e Tecnologia no Médio Purus", lideres: ["Pablo Marques da Silva", "João Maciel de Araújo"] },
    { nome: "Modelagem Computacional e Inteligência Artificial", lideres: ["Vitor Bremgartner da Frota", "Jeanne Moreira de Sousa"] },
    { nome: "NÚCLEO AMAZÔNICO DE ESTUDOS EM CIÊNCIA, ENSINO, TECNOLOGIA E INOVAÇÃO NAECETI", lideres: ["Nidianne Nascimento Vilhena"] },
    { nome: "Núcleo de Estudo Socioeconômico-Ambiental do Amazonas - NESAS", lideres: ["Cristóvão Gomes Placido Júnior", "Marisol Elias de Barros Plácido"] },
    { nome: "NÚCLEO DE ESTUDOS APLICADOS EM RECURSOS PESQUEIROS", lideres: ["Renato Soares Cardoso", "Eyner Godinho de Andrade"] },
    { nome: "Núcleo de Estudos da Agricultura Periurbana e Agroecologia - NEAPA", lideres: ["Cristóvão Gomes Placido Júnior", "Matheus Miranda Caniato"] },
    { nome: "Núcleo de Estudos de Invertebrados e Vertebrados da Amazônia (NEIVA)", lideres: ["Adriano Teixeira de Oliveira", "Paulo Henrique Rocha Aride"] },
    { nome: "NÚCLEO DE ESTUDOS E PESQUISA EM TECNOLOGIAS SUSTENTÁVEIS EM ENERGIA E BIOTECNOLOGIA DA AMAZÔNIA - NEPTSEBA", lideres: ["Jose Josimar Soares"] },
    { nome: "NÚCLEO DE ESTUDOS E PESQUISAS EM ENSINO DE QUÍMICA (NEPEQ/IFAM).", lideres: ["Nelly Lúcia Simões de Faria", "Francisco Xavier Nobre"] },
    { nome: "NÚCLEO DE ESTUDOS EM CIÊNCIA E TECNOLOGIS DA AMAZÔNIA - NECTAM", lideres: ["Alberdan Silva Santos"] },
    { nome: "Núcleo de Estudos em Morfofisiologia e Saúde Animal", lideres: ["Adriano Teixeira de Oliveira", "Israel Pereira dos Santos"] },
    { nome: "Núcleo de Estudos em Produção Animal e Produtos de Origem Animal", lideres: ["Felipe Faccini dos Santos"] },
    { nome: "Núcleo de Pesquisa Aplicada à Produção Agropecuária", lideres: ["Marcelo de Queiroz Rocha", "Lucas Vinicius Andrade Oliveira"] },
    { nome: "Núcleo de Pesquisa em Sustentabilidade na Amazônia", lideres: ["Edivaldo Xavier de Medeiros", "Guilherme de Melo Neto"] },
    { nome: "NÚCLEO MULTIDISCIPLINAR EM ESTUDOS DAS CIÊNCIAS EXATAS E AGRÁRIAS NO CONTEXTO AMAZÔNICO.", lideres: ["Danilo Cavalcante Braz"] },
    { nome: "NUPA", lideres: ["Eyner Godinho de Andrade", "Flávio Augusto Leão da Fonseca"] },
    { nome: "Observatório em Educação e Diversidade na Amazônia: Indígena, Quilombola e do Campo/Floresta - OEDIQCF", lideres: ["Claudina Azevedo Maximiano", "Alessandra de Souza Fonseca"] },
    { nome: "PRIANTAM - Grupo de Pesquisa em Processos Sociais, Direito, Território e Ambiente na Amazônia", lideres: ["Marcello Alves Pinheiro", "Eliane Oliveira da Costa"] },
    { nome: "Produção e Sustentabilidade na Amazônia", lideres: ["Rafael Augusto Ferraz", "Kaline Ziemniczak"] },
    { nome: "Produtos Naturais e Antimicrobianos", lideres: ["Juliana Mesquita Vidal Martinez de Lucena", "Ana Lúcia Mendes dos Santos"] },
    { nome: "Rede Amazônica de Saúde Única", lideres: ["Paulo Alex Machado Carneiro"] },
    { nome: "Rede Multidisciplinar em Ensino e Aprendizagem (REMEM)", lideres: ["Avelar de Jesus da Silva", "Harlon Lacerda da Silva"] },
    { nome: "Segurança Alimentar e Nutricional - Núcleo Integrado de Pesquisa na Amazônia (NIPA)", lideres: ["Lúcia Schuch Boeira"] },
    { nome: "SOCIEDADE, ECONOMIA, CULTURA E AMBIENTE NA AMAZÔNIA: interfaces e perspectivas", lideres: ["Paulo de Oliveira Nascimento"] },
    { nome: "Tecnologia, Educação e Meio Ambiente - TEMA", lideres: ["Julio Cesar Valente da Costa", "Alvatir Carolino da Silva"] },
    { nome: "Utilização de Recursos Naturais Amazônicos no processo de ensino e aprendizagem (URNAEA)", lideres: ["Lais Alves da Gama", "Edson Valente Chaves"] }
  ];

  console.log('\n--- Resolving Campus Locations ---');
  let matchedCount = 0;
  docxGroups.forEach(g => {
    let bestCampus = 'CMC';
    let maxMatch = 0;
    
    // Evaluate match score for each campus
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
        bestCampus = campus;
      }
    });

    if (maxMatch > 0) {
      matchedCount++;
      g.detectedCampus = bestCampus;
      console.log(`RESOLVED: "${g.nome}" -> Campus: ${bestCampus} (Score: ${maxMatch}, Leaders: ${g.lideres.join(', ')})`);
    } else {
      // Manual/fallbacks if no name match
      const nameLower = g.nome.toLowerCase();
      if (nameLower.includes('coari')) g.detectedCampus = 'COARI';
      else if (nameLower.includes('parintins')) g.detectedCampus = 'CPIN';
      else if (nameLower.includes('itacoatiara')) g.detectedCampus = 'CITA';
      else if (nameLower.includes('lábrea') || nameLower.includes('labrea')) g.detectedCampus = 'CLAB';
      else if (nameLower.includes('maués') || nameLower.includes('maues')) g.detectedCampus = 'CMA';
      else if (nameLower.includes('tabatinga')) g.detectedCampus = 'CTAB';
      else if (nameLower.includes('tefé') || nameLower.includes('tefe')) g.detectedCampus = 'CTEF';
      else if (nameLower.includes('humaitá') || nameLower.includes('humaita')) g.detectedCampus = 'CHUM';
      else if (nameLower.includes('são gabriel') || nameLower.includes('sao gabriel')) g.detectedCampus = 'CSGV';
      else if (nameLower.includes('presidente figueiredo')) g.detectedCampus = 'CPRF';
      else if (nameLower.includes('zona leste') || nameLower.includes('cmzl')) g.detectedCampus = 'CMZL';
      else if (nameLower.includes('distrito industrial') || nameLower.includes('cmdi')) g.detectedCampus = 'CMDI';
      else g.detectedCampus = 'CMC'; // default fallback
    }
  });

  console.log(`\nResolved ${matchedCount} groups via Excel sheet names search.`);
  
  const stats = {};
  docxGroups.forEach(g => {
    stats[g.detectedCampus] = (stats[g.detectedCampus] || 0) + 1;
  });
  console.log('\nFinal resolved distribution:');
  console.log(stats);
}

run().catch(console.error);
