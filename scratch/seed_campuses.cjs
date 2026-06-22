const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const campuses = [
    { sigla: 'CMC', nome: 'Campus Manaus Centro', cursos: ['Engenharia Civil', 'Engenharia Mecânica', 'Engenharia de Controle e Automação', 'Tecnologia em Análise e Desenvolvimento de Sistemas', 'Licenciatura em Química', 'Licenciatura em Matemática'] },
    { sigla: 'CMZL', nome: 'Campus Manaus Zona Leste', cursos: ['Engenharia de Software', 'Bacharelado em Medicina Veterinária', 'Tecnologia em Agroecologia'] },
    { sigla: 'CMDI', nome: 'Campus Manaus Distrito Industrial', cursos: ['Engenharia de Computação', 'Engenharia Mecatrônica', 'Tecnologia em Eletrônica Industrial'] },
    { sigla: 'CPRF', nome: 'Campus Presidente Figueiredo', cursos: ['Tecnologia em Aquicultura', 'Licenciatura em Biologia'] },
    { sigla: 'CPIN', nome: 'Campus Parintins', cursos: ['Tecnologia em Design de Produto', 'Licenciatura em Biologia', 'Licenciatura em Química'] },
    { sigla: 'CITA', nome: 'Campus Itacoatiara', cursos: ['Tecnologia em Saneamento Ambiental', 'Licenciatura em Química'] },
    { sigla: 'CLAB', nome: 'Campus Lábrea', cursos: ['Licenciatura em Ciências Biológicas'] },
    { sigla: 'COARI', nome: 'Campus Coari', cursos: ['Tecnologia em Alimentos', 'Licenciatura em Química'] },
    { sigla: 'CMA', nome: 'Campus Maués', cursos: ['Tecnologia em Agroecologia'] },
    { sigla: 'CMN', nome: 'Campus Manacapuru', cursos: ['Licenciatura em Ciências Biológicas'] },
    { sigla: 'CTF', nome: 'Campus Tefé', cursos: ['Licenciatura em Química', 'Tecnologia em Produção Pesqueira'] },
    { sigla: 'CHSL', nome: 'Campus Humaitá', cursos: ['Licenciatura em Ciências Biológicas', 'Tecnologia em Agroecologia'] },
    { sigla: 'CSGC', nome: 'Campus São Gabriel da Cachoeira', cursos: ['Licenciatura em Ciências Biológicas', 'Tecnologia em Agroecologia'] },
    { sigla: 'CAN', nome: 'Campus Anori', cursos: ['Tecnologia em Gestão Ambiental'] }
  ];

  for (const c of campuses) {
    const campus = await prisma.campus.upsert({
      where: { sigla: c.sigla },
      update: { nome: c.nome },
      create: { sigla: c.sigla, nome: c.nome }
    });
    
    // Clean old courses and rebuild them
    await prisma.course.deleteMany({ where: { campusId: campus.id } });
    for (const curso of c.cursos) {
      await prisma.course.create({
        data: {
          nome: curso,
          campusId: campus.id
        }
      });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
