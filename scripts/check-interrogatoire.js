const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const patient = await prisma.patient.findFirst({
    where: { nom: 'BENZARTI', prenom: 'Sonia' },
    select: { interrogatoire: true }
  });

  const interro = patient?.interrogatoire;
  console.log('Structure top-level:', Object.keys(interro || {}));

  if (interro?.v2?.answersByAxis) {
    const axes = interro.v2.answersByAxis;
    console.log('\nAxes présents:', Object.keys(axes));

    // Vérifier modeVie
    const modeVie = axes.modeVie || {};
    console.log('\n=== modeVie ===');
    console.log('Nombre de réponses:', Object.keys(modeVie).length);
    console.log('Clés:', Object.keys(modeVie).slice(0, 10));
    console.log('Exemples de valeurs:');
    Object.entries(modeVie).slice(0, 5).forEach(([k, v]) => {
      console.log(`  ${k}: ${JSON.stringify(v)}`);
    });

    // Vérifier adaptatif
    const adaptatif = axes.adaptatif || {};
    console.log('\n=== adaptatif ===');
    console.log('Nombre de réponses:', Object.keys(adaptatif).length);
    console.log('Clés:', Object.keys(adaptatif).slice(0, 10));
  } else {
    console.log('Pas de structure v2.answersByAxis!');
    console.log('Contenu:', JSON.stringify(interro, null, 2).slice(0, 1000));
  }

  await prisma.$disconnect();
}
check();
