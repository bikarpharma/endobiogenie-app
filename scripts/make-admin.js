// ========================================
// SCRIPT : Transformer un utilisateur en ADMIN
// ========================================
// Ce script met à jour le rôle d'un utilisateur de USER à ADMIN

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    // Lister tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    console.log('\n📋 Liste des utilisateurs :');
    console.log('========================================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Rôle actuel: ${user.role}`);
    });

    // Si un seul utilisateur, le mettre automatiquement en ADMIN
    if (users.length === 1) {
      const user = users[0];
      console.log(`\n✅ Un seul utilisateur trouvé: ${user.email}`);
      console.log('🔄 Mise à jour du rôle vers ADMIN...\n');

      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });

      console.log('✅ Rôle mis à jour avec succès !');
      console.log(`👤 ${user.email} est maintenant ADMIN\n`);
    } else if (users.length > 1) {
      console.log('\n⚠️  Plusieurs utilisateurs trouvés.');
      console.log('Modifiez ce script pour spécifier l\'email exact.\n');
    } else {
      console.log('\n❌ Aucun utilisateur trouvé dans la base de données.\n');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
