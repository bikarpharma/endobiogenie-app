import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  console.log("=== VÉRIFICATION BASE DE DONNÉES ===\n");

  // Vérifier le patient TEST
  const patient = await prisma.patient.findFirst({
    where: { nom: "TEST", prenom: "TEST" },
  });
  console.log("Patient TEST:", patient ? {
    id: patient.id,
    nom: patient.nom,
    prenom: patient.prenom,
    userId: patient.userId,
    numeroPatient: patient.numeroPatient,
  } : "NON TROUVÉ");

  // Lister tous les utilisateurs
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });
  console.log("\nUtilisateurs en base:", users);

  // Lister tous les patients
  const allPatients = await prisma.patient.findMany({
    select: { id: true, nom: true, prenom: true, userId: true, numeroPatient: true },
  });
  console.log("\nTous les patients:", allPatients);

  // Si le patient TEST existe mais sans userId, on le met à jour
  if (patient && !patient.userId && users.length > 0) {
    console.log("\n⚠️ Patient TEST n'a pas de userId, mise à jour...");
    const updated = await prisma.patient.update({
      where: { id: patient.id },
      data: { userId: users[0].id },
    });
    console.log("✅ Patient mis à jour avec userId:", updated.userId);
  }

  await prisma.$disconnect();
}

check().catch(console.error);
