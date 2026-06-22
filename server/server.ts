import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Setup Multer for file uploads (spreadsheets + PDFs)
const upload = multer({ dest: 'uploads/' });

// ─── Backup automático do SQLite ──────────────────────────────────────────────
function autoBackupSQLite() {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) return;
  try {
    const dbPath = path.join(__dirname, '../prisma/dev.db');
    const backupDir = path.join(__dirname, '../prisma/backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(backupDir, `dev_${timestamp}.db`);
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
      // Manter apenas os 10 backups mais recentes
      const files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.db'))
        .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);
      if (files.length > 10) {
        files.slice(10).forEach(f => fs.unlinkSync(path.join(backupDir, f.name)));
      }
      console.log(`[Backup] SQLite backup criado: ${backupPath}`);
    }
  } catch (err) {
    console.error('[Backup] Falha ao criar backup do SQLite:', err);
  }
}

// Executar backup na inicialização do servidor
autoBackupSQLite();


// Seed default data if database is empty
function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^\w\s]/g, '')         // remove caracteres especiais
    .replace(/\s+/g, ' ')            // remove múltiplos espaços
    .trim();
}

async function autoMatchProjectsToGroups() {
  console.log('Executando associação automática de projetos a grupos de pesquisa...');
  try {
    const projects = await prisma.project.findMany();
    const groups = await prisma.researchGroup.findMany();

    let matchCount = 0;
    for (const proj of projects) {
      if (!proj.orientador) continue;
      const normOrientador = normalizeName(proj.orientador);
      
      let matchedGroup = null;
      let papel = 'PESQUISADOR';

      for (const group of groups) {
        const normLideres = normalizeName(group.lideres);
        const normMembros = normalizeName(group.membrosEquipe);

        if (normLideres.includes(normOrientador) || normOrientador.includes(normLideres)) {
          matchedGroup = group;
          papel = 'LIDER';
          break;
        }
        if (normMembros.includes(normOrientador)) {
          matchedGroup = group;
          papel = 'PESQUISADOR';
          break;
        }
      }

      if (matchedGroup) {
        await prisma.project.update({
          where: { id: proj.id },
          data: {
            researchGroupId: matchedGroup.id,
            orientadorGrupoNome: matchedGroup.nome,
            orientadorGrupoLink: matchedGroup.linkCnpq,
            orientadorPapel: papel
          }
        });
        matchCount++;
      } else {
        await prisma.project.update({
          where: { id: proj.id },
          data: {
            researchGroupId: null,
            orientadorGrupoNome: null,
            orientadorGrupoLink: null,
            orientadorPapel: null
          }
        });
      }
    }
    console.log(`Associação concluída: ${matchCount} de ${projects.length} projetos vinculados a grupos.`);
  } catch (err) {
    console.error('Erro na associação de projetos:', err);
  }
}

async function seedDefaultData() {
  const count = await prisma.project.count();
  if (count === 0) {
    console.log('Database empty. Seeding default projects from initialData.json...');
    try {
      // Force Vercel bundler to include the file by using require
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      const projectsData = require('../src/initialData.json');
      
      await prisma.project.createMany({
        data: projectsData.map((p: any) => ({
          codigo: p.codigo,
          campus: p.campus,
          titulo: p.titulo,
          orientador: p.orientador,
          fomento: p.fomento,
          discente: p.discente,
          status: p.status
        }))
      });
      console.log(`Successfully seeded ${projectsData.length} projects.`);
    } catch (e) {
      console.error('Failed to load or seed initialData.json:', e);
    }
  }

  const groupCount = await prisma.researchGroup.count();
  if (groupCount === 0) {
    console.log('Seeding default research groups...');
    await prisma.researchGroup.createMany({
      data: [
        {
          nome: 'Grupo de Estudo em Redes de Computadores e Sistemas Distribuídos (GERES)',
          lideres: 'Dr. Raimundo da Silva Neto',
          linhasPesquisa: 'Redes Sem Fio, IoT, Segurança em Nuvem',
          membrosEquipe: 'Dr. Raimundo Neto, Profa. Ana Costa, Profo. Carlos Souza, Lucas Silva (Discente)',
          campus: 'CMC',
          area: 'Ciências Tecnológicas',
          contatoEmail: 'raimundo.neto@ifam.edu.br',
          linkCnpq: 'http://dgp.cnpq.br/dgp/espelhogrupo/geres',
          status: 'ATIVO',
          lastActivity: new Date()
        },
        {
          nome: 'Núcleo de Tecnologia Agroecológica e Sustentabilidade no Amazonas',
          lideres: 'Dra. Maria das Graças Martins',
          linhasPesquisa: 'Sistemas Agroflorestais, Agricultura Familiar, Solos Tropicais',
          membrosEquipe: 'Dra. Maria Martins, Dr. Francisco Oliveira, Maria Cunha (Discente)',
          campus: 'COARI',
          area: 'Ciências Agrárias',
          contatoEmail: 'maria.martins@ifam.edu.br',
          linkCnpq: 'http://dgp.cnpq.br/dgp/espelhogrupo/agroeco',
          status: 'ALERTA',
          lastActivity: new Date(Date.now() - 370 * 24 * 60 * 60 * 1000) // 12+ months ago
        },
        {
          nome: 'Grupo de Pesquisa em Educação Científica e Tecnológica',
          lideres: 'Dr. José Roberto de Souza',
          linhasPesquisa: 'Ensino de Física, Robótica Educacional, Softwares Educacionais',
          membrosEquipe: 'Dr. José Roberto, Profa. Luciana Abreu, Pedro Santos (Discente)',
          campus: 'CPRF',
          area: 'Ciências Humanas',
          contatoEmail: 'jose.souza@ifam.edu.br',
          linkCnpq: 'http://dgp.cnpq.br/dgp/espelhogrupo/gpect',
          status: 'ATIVO',
          lastActivity: new Date()
        }
      ]
    });
  }

  // Executa o vínculo automático de grupos sempre no startup/seed
  await autoMatchProjectsToGroups();

  const fruitCount = await prisma.fruit.count();
  if (fruitCount === 0) {
    console.log('Seeding default fruits (scientific and technological products)...');
    const projectsList = await prisma.project.findMany();
    if (projectsList.length > 0) {
      const defaultFruits = [
        {
          tipo: 'PUBLICACAO',
          classificacao: 'REVISTA_EXTERNA',
          titulo: 'Análise Espacial de Contaminantes na Bacia do Rio Tarumã-Açu usando Sensores de IoT',
          linkUrl: 'https://doi.org/10.1016/j.envres.2026.110594',
          projectId: projectsList[0 % projectsList.length].id
        },
        {
          tipo: 'SOFTWARE',
          classificacao: 'NIT_IFAM',
          titulo: 'SisMonitor: Sistema Web de Monitoramento de Estufas Agroecológicas de Coari',
          linkUrl: 'https://github.com/ifam-coari/sismonitor-web',
          projectId: projectsList[1 % projectsList.length].id
        },
        {
          tipo: 'PATENTE',
          classificacao: 'NIT_IFAM',
          titulo: 'Dispositivo Automático de Irrigação por Gotejamento Baseado em Umidade do Solo para Regiões Tropicais',
          linkUrl: 'https://busca.inpi.gov.br/pePI/servlet/PatenteServletController',
          projectId: projectsList[2 % projectsList.length].id
        },
        {
          tipo: 'PUBLICACAO',
          classificacao: 'REVISTA_IFAM',
          titulo: 'Manual Prático de Robótica de Baixo Custo para Escolas Públicas do Interior do Amazonas',
          linkUrl: 'https://repositorio.ifam.edu.br/jspui/handle/123456789/452',
          projectId: projectsList[3 % projectsList.length].id
        },
        {
          tipo: 'PUBLICACAO',
          classificacao: 'NAO_PUBLICADO',
          titulo: 'Desenvolvimento e Avaliação de Aplicativos Móveis no Ensino de Química: Uma Abordagem Lúdica',
          linkUrl: '',
          projectId: projectsList[4 % projectsList.length].id
        },
        {
          tipo: 'SOFTWARE',
          classificacao: 'SERVIDOR_DIRETO',
          titulo: 'AppPatrulha: Aplicativo para Registro e Mapeamento de Ocorrências no Campus Manaus Centro',
          linkUrl: 'https://github.com/ifam-cmc/app-patrulha',
          projectId: projectsList[5 % projectsList.length].id
        },
        {
          tipo: 'PATENTE',
          classificacao: 'NAO_REGISTRADO',
          titulo: 'Formulação Nutracêutica à Base de Polpa de Tucumã Estabilizada por Liofilização',
          linkUrl: '',
          projectId: projectsList[6 % projectsList.length].id
        },
        {
          tipo: 'EVENTO',
          classificacao: 'ORGANIZACAO_GRUPO',
          titulo: 'I Simpósio de Agroecologia e Sustentabilidade do Médio Solimões',
          linkUrl: 'https://even3.com.br/agroeco-coari-2026',
          projectId: projectsList[7 % projectsList.length].id
        },
        {
          tipo: 'EVENTO',
          classificacao: 'EVENTO_EXTERNO',
          titulo: 'Apresentação de Artigo no Congresso Brasileiro de Computação (CBC 2026)',
          linkUrl: 'https://cbc2026.org.br',
          projectId: projectsList[0 % projectsList.length].id
        }
      ];

      for (const item of defaultFruits) {
        await prisma.fruit.create({
          data: item
        });
      }
      console.log('Successfully seeded default fruits.');
    }
  }

  const campusCount = await prisma.campus.count();
  if (campusCount === 0) {
    console.log('Seeding default campuses...');
    const defaultCampuses = [
      { sigla: 'CMC', nome: 'Campus Manaus Centro' },
      { sigla: 'CMZL', nome: 'Campus Manaus Zona Leste' },
      { sigla: 'CMDI', nome: 'Campus Manaus Distrito Industrial' },
      { sigla: 'CPRF', nome: 'Campus Presidente Figueiredo' },
      { sigla: 'CPIN', nome: 'Campus Parintins' },
      { sigla: 'CITA', nome: 'Campus Itacoatiara' },
      { sigla: 'CLAB', nome: 'Campus Lábrea' },
      { sigla: 'COARI', nome: 'Campus Coari' },
      { sigla: 'CMA', nome: 'Campus Maués' }
    ];

    for (const c of defaultCampuses) {
      await prisma.campus.create({
        data: {
          sigla: c.sigla,
          nome: c.nome,
          cursos: {
            create: [
              { nome: 'Técnico em Informática', nivel: 'Integrado' },
              { nome: 'Análise e Desenvolvimento de Sistemas', nivel: 'Graduação' },
              { nome: 'Licenciatura em Química', nivel: 'Graduação' }
            ]
          }
        }
      });
    }
    console.log('Successfully seeded default campuses and courses.');
  }

  const editalCount = await prisma.edital.count();
  if (editalCount === 0) {
    console.log('Seeding default edital and quotas...');
    const edital = await prisma.edital.create({
      data: {
        titulo: 'Edital PIBIC-AC/IFAM nº 01/2026',
        descricao: 'Edital de Iniciação Científica e Tecnológica para todos os campi do IFAM.',
        ano: '2026/2027',
        status: 'ATIVO',
        valorBolsaFAPEAM: 600,
        valorBolsaCNPq: 700,
        valorBolsaIFAM: 400,
        duracaoMeses: 12,
        modalidade: 'PIBIC',
        niveis: 'Graduação',
        inscricaoInicio: '2026-06-02',
        inscricaoFim: '2026-06-09',
        quotas: {
          create: [
            { campus: 'CMC', quantidade: 53, valorTotalCampus: 53 * 700 * 12 },
            { campus: 'CMZL', quantidade: 30, valorTotalCampus: 30 * 700 * 12 },
            { campus: 'CMDI', quantidade: 28, valorTotalCampus: 28 * 700 * 12 },
            { campus: 'CPRF', quantidade: 6, valorTotalCampus: 6 * 700 * 12 },
            { campus: 'CPIN', quantidade: 8, valorTotalCampus: 8 * 700 * 12 },
            { campus: 'CITA', quantidade: 1, valorTotalCampus: 1 * 700 * 12 },
            { campus: 'CLAB', quantidade: 3, valorTotalCampus: 3 * 700 * 12 },
            { campus: 'COARI', quantidade: 2, valorTotalCampus: 2 * 700 * 12 },
            { campus: 'CMA', quantidade: 1, valorTotalCampus: 1 * 700 * 12 }
          ]
        },
        criteria: {
          create: [
            { nome: 'Qualidade do Projeto de Pesquisa', pontosMax: 50 },
            { nome: 'Produção Científica do Orientador', pontosMax: 30 },
            { nome: 'Plano de Trabalho e Viabilidade', pontosMax: 20 }
          ]
        },
        inscriptionReqs: {
          create: [
            { nome: 'Projeto Detalhado (PDF)', obrigatorio: true },
            { nome: 'Link do Lattes (PDF de comprovante)', obrigatorio: true }
          ]
        },
        requirements: {
          create: [
            { nome: 'Termo de Outorga / Aceite', obrigatorio: true },
            { nome: 'Comprovante de Matrícula Regular', obrigatorio: true },
            { nome: 'Dados Bancários do Bolsista', obrigatorio: true }
          ]
        }
      }
    });

    // Update all projects to link to this edital
    await prisma.project.updateMany({
      data: {
        editalId: edital.id
      }
    });
    console.log('Seeded default edital, quotas, and linked projects.');
  } else {
    // If edital exists, make sure quotas are seeded if they are empty
    const edital = await prisma.edital.findFirst({
      include: { quotas: true }
    });
    if (edital && edital.quotas.length === 0) {
      console.log('Default edital exists but has no quotas. Seeding quotas...');
      await prisma.editalCampusQuota.createMany({
        data: [
          { editalId: edital.id, campus: 'CMC', quantidade: 53, valorTotalCampus: 53 * 700 * 12 },
          { editalId: edital.id, campus: 'CMZL', quantidade: 30, valorTotalCampus: 30 * 700 * 12 },
          { editalId: edital.id, campus: 'CMDI', quantidade: 28, valorTotalCampus: 28 * 700 * 12 },
          { editalId: edital.id, campus: 'CPRF', quantidade: 6, valorTotalCampus: 6 * 700 * 12 },
          { editalId: edital.id, campus: 'CPIN', quantidade: 8, valorTotalCampus: 8 * 700 * 12 },
          { editalId: edital.id, campus: 'CITA', quantidade: 1, valorTotalCampus: 1 * 700 * 12 },
          { editalId: edital.id, campus: 'CLAB', quantidade: 3, valorTotalCampus: 3 * 700 * 12 },
          { editalId: edital.id, campus: 'COARI', quantidade: 2, valorTotalCampus: 2 * 700 * 12 },
          { editalId: edital.id, campus: 'CMA', quantidade: 1, valorTotalCampus: 1 * 700 * 12 }
        ]
      });
      // Link all projects that don't have editalId
      await prisma.project.updateMany({
        where: { editalId: null },
        data: { editalId: edital.id }
      });
      console.log('Successfully seeded quotas for existing edital and linked projects.');
    }
  }
}

seedDefaultData();


// Endpoints

// 1. Get all projects
app.get('/api/projects', async (req, res) => {
  const { campus } = req.query;
  try {
    const filter: any = {};
    if (campus && campus !== 'ALL') {
      filter.campus = String(campus);
    }
    const projects = await prisma.project.findMany({
      where: filter,
      orderBy: { codigo: 'asc' }
    });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.5 Assign student to project
app.put('/api/projects/:id/assign-student', async (req, res) => {
  const { id } = req.params;
  const { studentName } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { discente: studentName || null }
    });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.6 Update project onboarding profile (for teacher or student)
app.put('/api/projects/:id/perfil', async (req, res) => {
  const { id } = req.params;
  const {
    researchGroupId,
    orientadorGrupoNome,
    orientadorGrupoLink,
    orientadorPapel,
    discenteParticipaGrupo,
    discenteGrupoNome,
    discenteGrupoLink,
    discentePapel
  } = req.body;

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        researchGroupId: researchGroupId !== undefined ? researchGroupId : undefined,
        orientadorGrupoNome: orientadorGrupoNome !== undefined ? orientadorGrupoNome : undefined,
        orientadorGrupoLink: orientadorGrupoLink !== undefined ? orientadorGrupoLink : undefined,
        orientadorPapel: orientadorPapel !== undefined ? orientadorPapel : undefined,
        discenteParticipaGrupo: discenteParticipaGrupo !== undefined ? Boolean(discenteParticipaGrupo) : undefined,
        discenteGrupoNome: discenteGrupoNome !== undefined ? discenteGrupoNome : undefined,
        discenteGrupoLink: discenteGrupoLink !== undefined ? discenteGrupoLink : undefined,
        discentePapel: discentePapel !== undefined ? discentePapel : undefined
      }
    });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1.7 Run automatic project to research group matching manually
app.post('/api/projects/auto-match', async (req, res) => {
  try {
    await autoMatchProjectsToGroups();
    res.json({ message: 'Vínculos de grupos reavaliados automaticamente com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function sanitizeDiscente(name: any): string | null {
  if (!name) return null;
  const clean = String(name).trim().toUpperCase();
  const invalidNames = [
    'NAO', 'NÃO', 'NÃO SE APLICA', 'NÃO SE APLICA (DESCLASSIFICADO)', 
    'NÃO HÁ', 'DESCLASSIFICADO', 'REPROVADO', 'REPROVADA', 'PENDENTE', 
    '-', 'OK', 'SIM', 'N/A', 'NÃO HOUVE', 'NÃO INDIQUEI', 'NÃO HOUVE INDICAÇÃO'
  ];
  if (invalidNames.includes(clean) || clean.length <= 3) {
    return null;
  }
  return String(name).trim();
}

// 2. Upload Excel / Import projects
app.post('/api/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    return;
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const importedProjects: any[] = [];

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);
      
      rows.forEach((row: any) => {
        const norm: any = {};
        Object.keys(row).forEach(k => {
          norm[k.trim().toUpperCase()] = row[k];
        });

        const codigo = norm['CÓDIGO'] || norm['CODIGO'];
        const campus = norm['CAMPUS'] || sheetName;
        const titulo = norm['TÍTULO'] || norm['TITULO'];
        const orientador = norm['COORDENADOR'] || norm['ORIENTADOR'];
        const fomento = norm['FINANCIAMENTO'] || norm['FOMENTO'];
        const discenteRaw = norm['INDICAÇÃO ESTUDANTES'] || norm['INDICAÇÃO ESTUDANTE'] || norm['INDICACAO ESTUDANTE'] || norm['BOLSISTA'];

        if (codigo && titulo && orientador) {
          importedProjects.push({
            codigo: String(codigo).trim(),
            campus: String(campus).trim(),
            titulo: String(titulo).trim(),
            orientador: String(orientador).trim(),
            fomento: String(fomento || 'Voluntário').trim().toUpperCase(),
            discente: sanitizeDiscente(discenteRaw),
            status: norm['STATUS'] ? String(norm['STATUS']).trim() : 'APROVADO'
          });
        }
      });
    });

    // Delete uploaded temp file
    fs.unlinkSync(req.file.path);

    if (importedProjects.length > 0) {
      // Clear current projects
      await prisma.project.deleteMany({});
      
      // Load new ones
      await prisma.project.createMany({
        data: importedProjects
      });

      // Executa o vínculo automático após importação de projetos
      await autoMatchProjectsToGroups();
      
      try {
        await prisma.systemUpdate.upsert({
          where: { key: 'last_update' },
          update: { updatedAt: new Date() },
          create: { key: 'last_update', updatedAt: new Date() }
        });
      } catch (err) {
        console.error('Error updating system update timestamp:', err);
      }
      
      res.json({ message: `Sucesso! Importados ${importedProjects.length} projetos.` });
    } else {
      res.status(400).json({ error: 'Nenhum projeto válido encontrado na planilha.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Reset database to default seed
app.post('/api/import/reset', async (req, res) => {
  try {
    await prisma.project.deleteMany({});
    await prisma.frequency.deleteMany({});
    
    const seedPath = path.join(__dirname, '../src/initialData.json');
    const projectsData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    await prisma.project.createMany({
      data: projectsData.map((p: any) => ({
        codigo: p.codigo,
        campus: p.campus,
        titulo: p.titulo,
        orientador: p.orientador,
        fomento: p.fomento,
        discente: p.discente,
        status: p.status
      }))
    });

    // Auto-match projects on database reset
    await autoMatchProjectsToGroups();

    try {
      await prisma.systemUpdate.upsert({
        where: { key: 'last_update' },
        update: { updatedAt: new Date() },
        create: { key: 'last_update', updatedAt: new Date() }
      });
    } catch (err) {
      console.error('Error updating system update timestamp:', err);
    }

    res.json({ message: 'Banco de dados restaurado com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Get all frequencies
app.get('/api/frequencies', async (req, res) => {
  try {
    const frequencies = await prisma.frequency.findMany({
      include: { project: true }
    });
    res.json(frequencies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Submit frequency log
app.post('/api/frequencies', async (req, res) => {
  const { projectId, studentName, month, hours, activityType, description, banco, agencia, conta, dailyLogs } = req.body;
  
  if (!month) {
    res.status(400).json({ error: 'O campo mês de referência é obrigatório.' });
    return;
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      res.status(400).json({ error: 'Projeto não encontrado.' });
      return;
    }

    // FAPEAM bank account validation check
    if (project.fomento === 'FAPEAM') {
      const allowedBanks = ['bradesco', 'next'];
      const isValid = allowedBanks.some(b => banco && banco.toLowerCase().includes(b));
      if (!isValid) {
        res.status(400).json({ error: 'Erro de validação: Para cotas FAPEAM/PAIC, a conta deve ser obrigatoriamente Bradesco ou Next.' });
        return;
      }
    }

    // Delete existing submission for same project and month to prevent duplicates
    await prisma.frequency.deleteMany({
      where: { projectId, month }
    });

    const frequency = await prisma.frequency.create({
      data: {
        projectId,
        studentName,
        month,
        hours: Number(hours),
        activityType,
        description,
        status: 'SUBMETIDO',
        banco,
        agencia,
        conta,
        dailyLogs: dailyLogs ? String(dailyLogs) : null
      }
    });

    res.json(frequency);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Homologar / Devolver Frequência
app.put('/api/frequencies/:id/evaluate', async (req, res) => {
  const { id } = req.params;
  const { approved, comment } = req.body;

  try {
    const freq = await prisma.frequency.update({
      where: { id },
      data: {
        status: approved ? 'APROVADO' : 'CORRECAO',
        feedback: approved ? null : comment
      }
    });
    res.json(freq);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Update triagem status for a project
app.put('/api/projects/:id/triagem', async (req, res) => {
  const { id } = req.params;
  const { 
    matriculaRegular, 
    lattesUrl, 
    rgUploaded, 
    cpfUploaded, 
    residenciaUploaded, 
    declaracaoPeriodo, 
    termoFapeam, 
    contaBancoValida,
    triagemStatus,
    triagemFeedback,
    rgFeedback,
    cpfFeedback,
    residenciaFeedback,
    matriculaFeedback,
    lattesFeedback,
    termoFapeamFeedback
  } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        matriculaRegular: matriculaRegular !== undefined ? Boolean(matriculaRegular) : undefined,
        lattesUrl: lattesUrl !== undefined ? String(lattesUrl) : undefined,
        rgUploaded: rgUploaded !== undefined ? Boolean(rgUploaded) : undefined,
        cpfUploaded: cpfUploaded !== undefined ? Boolean(cpfUploaded) : undefined,
        residenciaUploaded: residenciaUploaded !== undefined ? Boolean(residenciaUploaded) : undefined,
        declaracaoPeriodo: declaracaoPeriodo !== undefined ? String(declaracaoPeriodo) : undefined,
        termoFapeam: termoFapeam !== undefined ? String(termoFapeam) : undefined,
        contaBancoValida: contaBancoValida !== undefined ? Boolean(contaBancoValida) : undefined,
        triagemStatus: triagemStatus !== undefined ? String(triagemStatus) : undefined,
        triagemFeedback: triagemFeedback !== undefined ? (triagemFeedback ? String(triagemFeedback) : null) : undefined,
        rgFeedback: rgFeedback !== undefined ? (rgFeedback ? String(rgFeedback) : null) : undefined,
        cpfFeedback: cpfFeedback !== undefined ? (cpfFeedback ? String(cpfFeedback) : null) : undefined,
        residenciaFeedback: residenciaFeedback !== undefined ? (residenciaFeedback ? String(residenciaFeedback) : null) : undefined,
        matriculaFeedback: matriculaFeedback !== undefined ? (matriculaFeedback ? String(matriculaFeedback) : null) : undefined,
        lattesFeedback: lattesFeedback !== undefined ? (lattesFeedback ? String(lattesFeedback) : null) : undefined,
        termoFapeamFeedback: termoFapeamFeedback !== undefined ? (termoFapeamFeedback ? String(termoFapeamFeedback) : null) : undefined,
      }
    });
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Fruits Endpoints
app.get('/api/fruits', async (req, res) => {
  try {
    const fruits = await prisma.fruit.findMany({
      include: { project: true }
    });
    res.json(fruits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fruits', async (req, res) => {
  const { projectId, tipo, titulo, linkUrl, classificacao } = req.body;
  try {
    const fruit = await prisma.fruit.create({
      data: {
        projectId,
        tipo,
        titulo,
        linkUrl,
        classificacao
      }
    });
    res.json(fruit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Substitutions Endpoints
app.get('/api/substitutions', async (req, res) => {
  try {
    const substitutions = await prisma.substitution.findMany({
      include: { project: true }
    });
    res.json(substitutions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/substitutions', async (req, res) => {
  const { projectId, estudanteSainte, estudanteEntrante, justificativa, relatorioParcialUrl } = req.body;
  try {
    const substitution = await prisma.substitution.create({
      data: {
        projectId,
        estudanteSainte,
        estudanteEntrante,
        justificativa,
        relatorioParcialUrl
      }
    });
    await prisma.project.update({
      where: { id: projectId },
      data: { discente: estudanteEntrante }
    });
    res.json(substitution);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Research Groups Endpoints
app.get('/api/research-groups', async (req, res) => {
  try {
    const groups = await prisma.researchGroup.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/research-groups', async (req, res) => {
  const { nome, area, lideres, campus, endereco, contatoEmail, linhasPesquisa, membrosEquipe, status, linkCnpq } = req.body;
  
  // Auto-detect campus from address if not provided
  let detectedCampus = campus || 'CMC';
  if (endereco) {
    const addr = String(endereco).toLowerCase();
    if (addr.includes('sete de setembro') || addr.includes('centro')) detectedCampus = 'CMC';
    else if (addr.includes('ruy gama') || addr.includes('raiz') || addr.includes('zona leste') || addr.includes('grande circular')) detectedCampus = 'CMZL';
    else if (addr.includes('danilo de mattos') || addr.includes('distrito industrial') || addr.includes('cosme ferreira')) detectedCampus = 'CMDI';
    else if (addr.includes('coari') || addr.includes('mami')) detectedCampus = 'COARI';
    else if (addr.includes('figueiredo')) detectedCampus = 'CPRF';
    else if (addr.includes('parintins') || addr.includes('pinheiro')) detectedCampus = 'CPIN';
    else if (addr.includes('itacoatiara')) detectedCampus = 'CITA';
    else if (addr.includes('lábrea') || addr.includes('labrea')) detectedCampus = 'CLAB';
    else if (addr.includes('maués') || addr.includes('maues') || addr.includes('moraes')) detectedCampus = 'CMA';
  }

  try {
    const group = await prisma.researchGroup.create({
      data: {
        nome,
        area,
        lideres,
        campus: detectedCampus,
        endereco,
        contatoEmail,
        linhasPesquisa,
        membrosEquipe,
        status: status || 'ATIVO',
        linkCnpq,
        lastActivity: new Date()
      }
    });
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/research-groups/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, area, lideres, campus, endereco, contatoEmail, linhasPesquisa, membrosEquipe, status, linkCnpq, lastActivity } = req.body;
  
  let detectedCampus = campus;
  if (endereco && !campus) {
    const addr = String(endereco).toLowerCase();
    if (addr.includes('sete de setembro') || addr.includes('centro')) detectedCampus = 'CMC';
    else if (addr.includes('ruy gama') || addr.includes('raiz') || addr.includes('zona leste') || addr.includes('grande circular')) detectedCampus = 'CMZL';
    else if (addr.includes('danilo de mattos') || addr.includes('distrito industrial') || addr.includes('cosme ferreira')) detectedCampus = 'CMDI';
    else if (addr.includes('coari') || addr.includes('mami')) detectedCampus = 'COARI';
    else if (addr.includes('figueiredo')) detectedCampus = 'CPRF';
    else if (addr.includes('parintins') || addr.includes('pinheiro')) detectedCampus = 'CPIN';
    else if (addr.includes('itacoatiara')) detectedCampus = 'CITA';
    else if (addr.includes('lábrea') || addr.includes('labrea')) detectedCampus = 'CLAB';
    else if (addr.includes('maués') || addr.includes('maues') || addr.includes('moraes')) detectedCampus = 'CMA';
  }

  try {
    const group = await prisma.researchGroup.update({
      where: { id },
      data: {
        nome,
        area,
        lideres,
        campus: detectedCampus,
        endereco,
        contatoEmail,
        linhasPesquisa,
        membrosEquipe,
        status,
        linkCnpq,
        lastActivity: lastActivity ? new Date(lastActivity) : undefined
      }
    });
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Certificates Endpoints
app.get('/api/certificates', async (req, res) => {
  try {
    const certs = await prisma.certificate.findMany({
      include: { project: true }
    });
    res.json(certs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/certificates/validate/:hash', async (req, res) => {
  const { hash } = req.params;
  try {
    const cert = await prisma.certificate.findUnique({
      where: { hash },
      include: { project: true }
    });
    if (!cert) {
      res.status(404).json({ error: 'Certificado não encontrado ou inválido.' });
      return;
    }
    res.json(cert);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/certificates', async (req, res) => {
  const { projectId, studentName, role, cargaHoraria } = req.body;
  try {
    const rand = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const hash = `IFAM-${rand()}-${rand()}-${rand()}`;
    const cert = await prisma.certificate.create({
      data: {
        projectId,
        studentName,
        role,
        cargaHoraria: Number(cargaHoraria),
        hash
      }
    });
    res.json(cert);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
// 12. Import Research Groups Spreadsheet
app.post('/api/import/groups', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'Nenhum arquivo de planilha de grupos enviado.' });
    return;
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const importedGroups: any[] = [];

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet);
      
      rows.forEach((row: any) => {
        const norm: any = {};
        Object.keys(row).forEach(k => {
          norm[k.trim().toUpperCase()] = row[k];
        });

        const nome = norm['NOME'] || norm['GRUPO'] || norm['GRUPO DE PESQUISA'];
        const lideres = norm['LÍDER'] || norm['LIDER'] || norm['LÍDERES'] || norm['LIDERES'] || norm['ORIENTADOR'];
        const campus = norm['CAMPUS'] || sheetName;
        const area = norm['ÁREA'] || norm['AREA'] || norm['ÁREA DE CONHECIMENTO'];
        const contatoEmail = norm['EMAIL'] || norm['E-MAIL'] || norm['CONTATO'];
        const linhasPesquisa = norm['LINHAS'] || norm['LINHAS DE PESQUISA'] || norm['LINHAS_PESQUISA'];
        const membrosEquipe = norm['MEMBROS'] || norm['EQUIPE'] || norm['INTEGRANTES'];
        const linkCnpq = norm['LINK'] || norm['LINK CNPQ'] || norm['CNPQ'];

        if (nome && lideres) {
          importedGroups.push({
            nome: String(nome).trim(),
            lideres: String(lideres).trim(),
            campus: String(campus).trim().toUpperCase().slice(0, 10),
            area: area ? String(area).trim() : 'Ciências Tecnológicas',
            contatoEmail: contatoEmail ? String(contatoEmail).trim() : `${String(lideres).toLowerCase().replace(/\s+/g, '.')}@ifam.edu.br`,
            linhasPesquisa: linhasPesquisa ? String(linhasPesquisa).trim() : 'Pesquisa Aplicada',
            membrosEquipe: membrosEquipe ? String(membrosEquipe).trim() : String(lideres),
            status: norm['STATUS'] ? String(norm['STATUS']).trim() : 'ATIVO',
            linkCnpq: linkCnpq ? String(linkCnpq).trim() : 'http://dgp.cnpq.br/dgp'
          });
        }
      });
    });

    fs.unlinkSync(req.file.path);

    if (importedGroups.length > 0) {
      await prisma.researchGroup.deleteMany({});
      await prisma.researchGroup.createMany({
        data: importedGroups
      });

      // Auto-match projects to groups now that groups are imported
      await autoMatchProjectsToGroups();
      
      // Update last update timestamp
      try {
        await prisma.systemUpdate.upsert({
          where: { key: 'last_update' },
          update: { updatedAt: new Date() },
          create: { key: 'last_update', updatedAt: new Date() }
        });
      } catch (err) {
        console.error('Error updating system update timestamp:', err);
      }

      res.json({ message: `Sucesso! Importados ${importedGroups.length} grupos de pesquisa.` });
    } else {
      res.status(400).json({ error: 'Nenhum grupo de pesquisa válido encontrado na planilha.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 13. Editais and Evaluation Workflow

app.get('/api/editais', async (req, res) => {
  try {
    const editais = await prisma.edital.findMany({
      include: {
        quotas: true,
        criteria: true,
        requirements: true,
        inscriptionReqs: true,
        projects: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(editais);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/editais', async (req, res) => {
  const { 
    titulo, descricao, ano, quotas, criteria, requirements, inscriptionReqs,
    inscricaoInicio, inscricaoFim, avaliacaoInicio, avaliacaoFim,
    resultadoParcial, resultadoFinal, onboardingInicio, onboardingFim, niveis,
    valorBolsaFAPEAM, valorBolsaCNPq, valorBolsaIFAM, duracaoMeses, modalidade, documentoEditalUrl
  } = req.body;
  try {
    // Calcular valorTotalCampus para cada quota
    const vFAPEAM = Number(valorBolsaFAPEAM) || 600;
    const vCNPq = Number(valorBolsaCNPq) || 700;
    const vIFAM = Number(valorBolsaIFAM) || 400;
    const dur = Number(duracaoMeses) || 12;

    const quotasWithValue = (quotas || []).map((q: any) => ({
      campus: q.campus,
      quantidade: q.quantidade,
      valorTotalCampus: q.quantidade * Math.max(vFAPEAM, vCNPq, vIFAM) * dur
    }));

    const edital = await prisma.edital.create({
      data: {
        titulo,
        descricao,
        ano,
        inscricaoInicio,
        inscricaoFim,
        avaliacaoInicio,
        avaliacaoFim,
        resultadoParcial,
        resultadoFinal,
        onboardingInicio,
        onboardingFim,
        niveis,
        valorBolsaFAPEAM: vFAPEAM,
        valorBolsaCNPq: vCNPq,
        valorBolsaIFAM: vIFAM,
        duracaoMeses: dur,
        modalidade,
        documentoEditalUrl,
        quotas: { create: quotasWithValue },
        criteria: { create: criteria || [] },
        requirements: { create: requirements || [] },
        inscriptionReqs: { create: inscriptionReqs || [] }
      }
    });
    res.json(edital);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/editais/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    titulo, descricao, ano, quotas, criteria, requirements, inscriptionReqs,
    inscricaoInicio, inscricaoFim, avaliacaoInicio, avaliacaoFim,
    resultadoParcial, resultadoFinal, onboardingInicio, onboardingFim, niveis,
    valorBolsaFAPEAM, valorBolsaCNPq, valorBolsaIFAM, duracaoMeses, modalidade, documentoEditalUrl
  } = req.body;
  try {
    const vFAPEAM = Number(valorBolsaFAPEAM) || 600;
    const vCNPq = Number(valorBolsaCNPq) || 700;
    const vIFAM = Number(valorBolsaIFAM) || 400;
    const dur = Number(duracaoMeses) || 12;

    // Clean old sub-relations to avoid dups
    await prisma.editalCampusQuota.deleteMany({ where: { editalId: id } });
    await prisma.editalCriterion.deleteMany({ where: { editalId: id } });
    await prisma.editalRequirement.deleteMany({ where: { editalId: id } });
    await prisma.inscriptionRequirement.deleteMany({ where: { editalId: id } });

    const quotasWithValue = (quotas || []).map((q: any) => ({
      campus: q.campus,
      quantidade: q.quantidade,
      valorTotalCampus: q.quantidade * Math.max(vFAPEAM, vCNPq, vIFAM) * dur
    }));

    const edital = await prisma.edital.update({
      where: { id },
      data: {
        titulo,
        descricao,
        ano,
        inscricaoInicio,
        inscricaoFim,
        avaliacaoInicio,
        avaliacaoFim,
        resultadoParcial,
        resultadoFinal,
        onboardingInicio,
        onboardingFim,
        niveis,
        valorBolsaFAPEAM: vFAPEAM,
        valorBolsaCNPq: vCNPq,
        valorBolsaIFAM: vIFAM,
        duracaoMeses: dur,
        modalidade,
        documentoEditalUrl,
        quotas: { create: quotasWithValue },
        criteria: { create: criteria || [] },
        requirements: { create: requirements || [] },
        inscriptionReqs: { create: inscriptionReqs || [] }
      },
      include: {
        quotas: true,
        criteria: true,
        requirements: true,
        inscriptionReqs: true,
        projects: true
      }
    });
    res.json(edital);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/editais/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.edital.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Campuses and Courses endpoints
app.get('/api/campuses', async (req, res) => {
  try {
    const campuses = await prisma.campus.findMany({
      include: { cursos: true },
      orderBy: { sigla: 'asc' }
    });
    res.json(campuses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campuses', async (req, res) => {
  const { nome, sigla } = req.body;
  try {
    const campus = await prisma.campus.create({
      data: { nome, sigla: sigla.toUpperCase() },
      include: { cursos: true }
    });
    res.json(campus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/campuses/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, sigla } = req.body;
  try {
    const campus = await prisma.campus.update({
      where: { id },
      data: { nome, sigla: sigla.toUpperCase() },
      include: { cursos: true }
    });
    res.json(campus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/campuses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.campus.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/courses', async (req, res) => {
  const { nome, nivel, campusId } = req.body;
  try {
    const course = await prisma.course.create({
      data: { nome, nivel: nivel || "Graduação", campusId }
    });
    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.course.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/editais/:id/consolidar', async (req, res) => {
  const { id } = req.params;
  try {
    const edital = await prisma.edital.findUnique({
      where: { id },
      include: { quotas: true }
    });
    if (!edital) return res.status(404).json({ error: 'Edital não encontrado' });
    
    const projects = await prisma.project.findMany({
      where: { editalId: id },
      include: { evaluations: true }
    });

    for (const p of projects) {
      let notaProjeto = 0;
      if (p.evaluations.length > 0) {
        notaProjeto = p.evaluations.reduce((acc, ev) => acc + ev.notaProjeto, 0) / p.evaluations.length;
      }
      const notaCurriculo = p.notaCurriculo || 0;
      const notaFinal = (notaProjeto + notaCurriculo) / 2;
      
      let situacao = p.situacao;
      if (notaFinal < 50) {
        situacao = 'DESCLASSIFICADO';
      }

      await prisma.project.update({
        where: { id: p.id },
        data: { notaFinal, situacao: situacao === 'DESCLASSIFICADO' ? situacao : 'CLASSIFICACAO_PENDENTE' }
      });
    }

    const updatedProjects = await prisma.project.findMany({ where: { editalId: id } });
    const byCampus: Record<string, any[]> = {};
    for (const p of updatedProjects) {
      if (p.situacao === 'DESCLASSIFICADO') continue;
      if (!byCampus[p.campus]) byCampus[p.campus] = [];
      byCampus[p.campus].push(p);
    }
    
    for (const campus of Object.keys(byCampus)) {
      byCampus[campus].sort((a, b) => (b.notaFinal || 0) - (a.notaFinal || 0));
      const quota = edital.quotas.find(q => q.campus === campus)?.quantidade || 0;
      for (let i = 0; i < byCampus[campus].length; i++) {
        const proj = byCampus[campus][i];
        const novaSituacao = i < quota ? 'APROVADO COM BOLSA' : 'APROVADO VOLUNTÁRIO';
        await prisma.project.update({
          where: { id: proj.id },
          data: { situacao: novaSituacao }
        });
      }
    }
    res.json({ message: 'Edital consolidado com sucesso!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects/:id/evaluate', async (req, res) => {
  const { id } = req.params;
  const { evaluatorEmail, scores, parecer } = req.body;
  try {
    let evaluator = await prisma.evaluator.findUnique({ where: { email: evaluatorEmail } });
    if (!evaluator) {
      evaluator = await prisma.evaluator.create({ data: { nome: 'Avaliador', email: evaluatorEmail } });
    }
    const notaProjeto = scores.reduce((acc: number, curr: any) => acc + Number(curr.score), 0);
    const evaluation = await prisma.projectEvaluation.create({
      data: {
        projectId: id,
        evaluatorId: evaluator.id,
        notaProjeto,
        parecer,
        scores: {
          create: scores.map((s: any) => ({
            criterionId: s.criterionId,
            score: Number(s.score)
          }))
        }
      }
    });
    res.json(evaluation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:projectId/documents/:documentId/evaluate', async (req, res) => {
  const { projectId, documentId } = req.params;
  const { approved, motivoRecusa, detalhesRecusa } = req.body;
  try {
    const doc = await prisma.projectDocument.update({
      where: { id: documentId },
      data: {
        status: approved ? 'APROVADO' : 'REPROVADO',
        motivoRecusa: approved ? null : motivoRecusa,
        detalhesRecusa: approved ? null : detalhesRecusa
      }
    });
    const allDocs = await prisma.projectDocument.findMany({ where: { projectId } });
    if (!approved) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'CORRECAO_DOCUMENTAL' }
      });
    } else {
      const allApproved = allDocs.every(d => d.status === 'APROVADO');
      if (allApproved && allDocs.length > 0) {
         await prisma.project.update({
           where: { id: projectId },
           data: { status: 'ATIVO' }
         });
      }
    }
    res.json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to retrieve the last update date
app.get('/api/last-update', async (req, res) => {
  try {
    const update = await prisma.systemUpdate.findUnique({
      where: { key: 'last_update' }
    });
    res.json({ updatedAt: update ? update.updatedAt : new Date() });
  } catch (error: any) {
    res.json({ updatedAt: new Date() });
  }
});

// ─── 15. Relatórios Técnicos ─────────────────────────────────────────────────

app.get('/api/reports', async (req, res) => {
  try {
    const { projectId } = req.query;
    const where: any = {};
    if (projectId) where.projectId = String(projectId);
    const reports = await prisma.report.findMany({
      where,
      include: { project: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reports', upload.single('file'), async (req, res) => {
  const { projectId, tipo, periodo } = req.body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    if (!projectId || !tipo || !periodo) {
      res.status(400).json({ error: 'Campos obrigatórios: projectId, tipo, periodo.' });
      return;
    }
    const report = await prisma.report.create({
      data: {
        projectId,
        tipo,
        periodo,
        fileUrl,
        status: 'ENVIADO',
        submittedAt: new Date()
      }
    });
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reports/:id/evaluate', async (req, res) => {
  const { id } = req.params;
  const { approved, feedback } = req.body;
  try {
    const report = await prisma.report.update({
      where: { id },
      data: {
        status: approved ? 'APROVADO' : 'CORRECAO',
        feedback: approved ? null : feedback,
        approvedAt: approved ? new Date() : null
      }
    });
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.report.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Servir arquivos de uploads (relatórios PDF)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── 16. Infraestrutura de Autenticação (endpoints construídos, inativa na UI) ──
// Ativados futuramente com Google SSO

app.post('/api/auth/request-otp', async (req, res) => {
  // Stub — será implementado com Google OAuth2
  res.status(503).json({ message: 'Autenticação via Google SSO: em implantação.' });
});

app.post('/api/auth/verify-otp', async (req, res) => {
  // Stub — será implementado com JWT + Google
  res.status(503).json({ message: 'Autenticação via Google SSO: em implantação.' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
