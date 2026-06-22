const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    select: {
      orientador: true,
      campus: true
    }
  });
  
  const campusCounts = {};
  projects.forEach(p => {
    campusCounts[p.campus] = (campusCounts[p.campus] || 0) + 1;
  });
  console.log('Projects per campus in DB:', campusCounts);

  // Let's print first 15 projects coordinators and campus
  console.log('Sample project coordinators and campus:');
  console.log(projects.slice(0, 15));
}

main().catch(console.error).finally(() => prisma.$disconnect());
