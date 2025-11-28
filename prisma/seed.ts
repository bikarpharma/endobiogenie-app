// Fichier: prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du protocole de seeding (Inoculation)...')

  // 1. CRÉATION DU MÉDECIN (Utilisateur)
  // ------------------------------------
  const passwordHash = await bcrypt.hash('medecine', 10)
  
  const doctor = await prisma.user.upsert({
    where: { email: 'docteur@test.com' },
    update: {},
    create: {
      email: 'docteur@test.com',
      name: 'Dr. Testeur',
      password: passwordHash,
      role: 'USER',
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Médecin créé : ${doctor.email} (Mdp: medecine)`)

  // 2. CRÉATION DU PATIENT "CAS CLINIQUE" - KARIM KARIM
  // ----------------------------------------------------
  // Cas : Homme 35 ans, Surmenage professionnel, Épuisement surrénalien
  const patient = await prisma.patient.create({
    data: {
      userId: doctor.id,
      numeroPatient: 'PAT-KARIM-2025',
      nom: 'KARIM',
      prenom: 'Karim',
      dateNaissance: new Date('1990-03-20'), // 35 ans
      sexe: 'M',
      email: 'karim.karim@email.com',
      telephone: '06 12 34 56 78',
      notes: 'Patient entrepreneur, travaille 12h/jour, sommeil insuffisant. Consulte pour fatigue chronique et baisse de performances.',
      allergies: 'Aucune',
      atcdMedicaux: 'Rien à signaler',
      atcdChirurgicaux: 'Appendicectomie (2008)',
      traitementActuel: 'Aucun traitement en cours',
      tags: ["Stress", "Fatigue", "Burnout"],
      // 3. INTERROGATOIRE CLINIQUE (stocké en JSON)
      // -------------------------------------------
      interrogatoire: {
        // Fatigue et Énergie
        "fatigue_matinale": "Oui, très difficile de me lever",
        "fatigue_horaire": "Surtout le matin et après 15h",
        "sommeil_qualite": "Non réparateur, réveils à 3h du matin",
        "sommeil_duree": "5-6h par nuit",

        // Stress et Nervosité
        "stress_niveau": "8/10 - Constant",
        "anxiete": "Oui, notamment le soir",
        "irritabilite": "Oui, facilement agacé",
        "concentration": "Difficultés à se concentrer",

        // Digestif
        "appetit": "Diminué",
        "digestion": "Ballonnements après repas",
        "transit": "Alternance diarrhée/constipation",
        "reveil_3h": "Oui, presque toutes les nuits",

        // Cardiovasculaire
        "palpitations": "Occasionnelles",
        "tension": "Normale aux dernières mesures",

        // Température et Métabolisme
        "frilosite": "Extrémités froides",
        "transpiration": "Sueurs nocturnes parfois",
        "poids": "Perte de 3kg en 6 mois",

        // Douleurs
        "douleurs_musculaires": "Courbatures fréquentes",
        "maux_tete": "Céphalées de tension",

        // Libido et Hormones
        "libido": "En baisse",
        "erection": "Qualité diminuée",

        // Scores synthétiques par axe
        "scores": {
          corticotrope: 85, // Axe surrénalien très sollicité
          thyroide: 65,
          digestif: 70,
          cardiovasculaire: 45,
          genital: 60,
        }
      },
    },
  })

  console.log(`✅ Patient créé : ${patient.nom} ${patient.prenom}`)
  console.log(`✅ Interrogatoire inclus pour ${patient.nom}`)

  // 3. INJECTION DE LA BIOLOGIE DES FONCTIONS (BdF)
  // ----------------------------------------------
  // Profil : Épuisement surrénalien avec hypercatabolisme
  await prisma.bdfAnalysis.create({
    data: {
      patientId: patient.id,
      date: new Date(),
      // Données brutes (NFS + Biochimie)
      inputs: {
        // Hémogramme
        GR: 4.8,
        HB: 14.5,
        HCT: 43,
        VGM: 89,
        CCMH: 33,
        GB: 6200,
        NEUT: 62,      // Neutrophiles %
        LYMPH: 28,     // Lymphocytes %
        MONO: 8,
        EOS: 2,        // Éosinophiles %
        BASO: 0,
        PLAQUETTES: 245,

        // Biochimie
        LDH: 420,      // Élevé (catabolisme)
        CPK: 95,       // Normal
        TSH: 2.1,      // Normal
        NA: 142,       // Sodium
        K: 4.2,        // Potassium
        CA: 9.5,       // Calcium
        P: 3.8,        // Phosphore
        PAL: 85,       // Phosphatases alcalines

        // Hormones (si disponibles)
        T4L: 14,
        T3L: 3.2,
        Cortisol_8h: 380, // Élevé (stress chronique)
      },
      // Index calculés seront générés automatiquement
      indexes: [],
      summary: "PROFIL ENDOBIOGÉNIQUE : Épuisement surrénalien en phase de compensation. Index Génital élevé (2.21) témoignant d'une sympathicotonie. Hypercatabolisme (LDH/CPK = 4.42). Index d'Adaptation limite (14) suggérant une réserve adaptative faible.",
      axes: ["Corticotrope", "Sympathique", "Métabolique"],
      ragText: "Terrain de stress chronique avec sollicitation excessive de l'axe corticotrope. Nécessité de soutenir les surrénales sans les stimuler.",
    }
  })

  console.log(`✅ Analyse BdF injectée pour ${patient.nom}`)

  // 4. CRÉATION D'UNE ORDONNANCE ENDOBIOGÉNIQUE (Brouillon)
  // --------------------------------------------------------
  await prisma.ordonnance.create({
    data: {
      patientId: patient.id,
      statut: "brouillon",
      syntheseClinique: "Nécessité de calmer l'axe Alpha (Sympathique) et de soutenir la loge Surrénale sans la stimuler excessivement.",
      // Volet 1 : Phyto/Gemmo
      voletEndobiogenique: [
        {
          type: "PLANTE",
          nom: "Aubépine (Crataegus oxyacantha)",
          forme: "TM",
          posologie: "50 gouttes matin et soir",
          duree: "3 mois",
          justification: "Sédatif du système nerveux sympathique, régulateur cardiaque."
        },
        {
          type: "GEMMO",
          nom: "Figuier (Ficus carica)",
          forme: "Macérat Glycériné 1D",
          posologie: "15 gouttes le soir",
          duree: "3 mois",
          justification: "Régulateur de l'axe Cortico-Hypothalamique, anxiolytique profond."
        }
      ],
      conseilsAssocies: ["Cohérence cardiaque 3x/jour", "Éviter les excitants après 14h"],
    }
  })

  console.log(`✅ Ordonnance démo créée`)
  console.log('🚀 SEEDING TERMINÉ AVEC SUCCÈS.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })