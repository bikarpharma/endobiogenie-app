import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const plants = await prisma.phytodexPlant.findMany({
    where: { region: 'Nord Tunisie' },
    take: 8,
    select: {
      latinName: true,
      mainVernacularName: true,
      otherVernacularNames: true,
      arabicName: true,
      partUsed: true
    }
  });

  console.log('=== STRUCTURE ACTUELLE DU PHYTODEX ===\n');

  for (const p of plants) {
    console.log(p.latinName);
    console.log('  Français:     ' + (p.mainVernacularName || '—'));
    console.log('  Vernaculaire: ' + (p.otherVernacularNames || '—'));
    console.log('  Arabe:        ' + (p.arabicName || '—'));
    console.log('  Drogue:       ' + (p.partUsed || '—'));
    console.log('');
  }

  const total = await prisma.phytodexPlant.count({ where: { region: 'Nord Tunisie' } });
  const withArabic = await prisma.phytodexPlant.count({ where: { region: 'Nord Tunisie', arabicName: { not: null } } });
  const withVernacular = await prisma.phytodexPlant.count({ where: { region: 'Nord Tunisie', otherVernacularNames: { not: null } } });

  console.log('=== STATISTIQUES ===');
  console.log('Total plantes Nord Tunisie: ' + total);
  console.log('Avec nom arabe:            ' + withArabic);
  console.log('Avec nom vernaculaire:     ' + withVernacular);

  await prisma.$disconnect();
}

check();
