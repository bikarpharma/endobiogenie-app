// ========================================
// API GÉNÉRATION ORDONNANCE V5 - ASSISTANTS API + VECTORSTORE
// ========================================
// POST : Génère une ordonnance via :
// 1. Récupération du DiagnosticResponse depuis BDD (OBLIGATOIRE)
// 2. OpenAI Assistants API avec VectorStore 26MB (meilleure qualité)
// 3. Middleware Tunisie (adaptation formes galéniques)
//
// VERSION 5.0 - Utilise l'Assistant Expert Ordonnance avec file_search
// dans le VectorStore complet (phyto, gemmo, aroma, endobiogénie)
//
// PRÉREQUIS: La synthèse IA doit avoir été générée AVANT
// via /api/patient/unified-analysis

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
// V5: Assistants API avec VectorStore
import { callOrdonnanceAssistantV5, OrdonnanceError } from "@/lib/ai/assistantOrdonnanceV5";
import type { DiagnosticResponse } from "@/lib/ai/assistantDiagnostic";
import { v4 as uuidv4 } from "uuid";

// 🆕 IMPORT MIDDLEWARE TUNISIE
import { adaptPrescriptionToTunisia } from '@/lib/utils/tunisianAdapter';

// 🆕 IMPORT PROTOCOLES TUNISIE (Guide Galénique v1.0)
import { getBadgeVoieAroma, VOIES_AROMATHERAPIE, type VoieAromatherapie } from '@/lib/ordonnance/tunisianProtocols';

// 🆕 IMPORT TYPE JUSTIFICATION (v3.1)
import type { PlantJustification } from '@/lib/ordonnance/types';

export const runtime = "nodejs";

// ========================================
// VALIDATION RUNTIME - JUSTIFICATION OBLIGATOIRE (v3.1)
// ========================================

/**
 * Valide et complète la justification d'une plante.
 * Garantit que tous les champs obligatoires sont présents.
 * @param input Données brutes d'une plante depuis l'IA
 * @returns PlantJustification validée avec valeurs par défaut si nécessaire
 */
function validatePlantJustification(input: any): PlantJustification {
  return {
    symptome_cible: input.symptome_cible || input.indication || "Non spécifié",
    axe_endobiogenique: input.axe_endobiogenique || input.axe_cible || "À déterminer",
    mecanisme_action: input.mecanisme_action || input.mecanisme || "Action non documentée",
    synergies: Array.isArray(input.synergies) ? input.synergies : [],
    justification_terrain: input.justification_terrain || "Voir terrain global",
    justification_classique: input.justification_classique || input.justification || "Base traditionnelle",
    explication_patient: input.explication_patient || "Cette plante soutient votre organisme",
    // Champs optionnels
    precautions: input.precautions,
    confiance: input.confiance,
  };
}
export const maxDuration = 120; // 2 minutes max

// ========================================
// ADAPTATEUR DE STRUCTURE : Ancien → Nouveau format
// ========================================
// L'Assistant génère volet_* mais le middleware attend prescription.*
function adaptToNewStructure(oldResponse: any) {
  // Extraire les prescriptions de chaque volet
  const drainagePrescriptions = oldResponse.volet_drainage?.prescriptions || [];
  const canonPrescriptions = oldResponse.volet_canon_endobiogenique?.prescriptions || [];
  const phytoElargiPrescriptions = oldResponse.volet_phyto_elargi?.prescriptions || [];
  const microPrescriptions = oldResponse.volet_micronutrition?.prescriptions || [];

  // 🔧 Fonction de déduplication pour éviter les doublons dans le middleware Tunisie
  const deduplicateByKey = (items: any[], keyFn: (item: any) => string) => {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Transformer en format attendu par le middleware
  // NOUVEAU FORMAT v3.1: L'IA génère name_latin et name_fr + Justification validée

  // 🔧 Identifier les plantes ANS/SNA pour les exclure du neuro_endocrine (éviter doublons)
  const isAnsPlant = (p: any) => {
    const planteLower = (p.name_latin || p.plante || '').toLowerCase();
    const axeLower = (p.axe_cible || '').toLowerCase();
    return axeLower.includes('sna') ||
           axeLower.includes('nerveux') ||
           planteLower.includes('tilia') ||
           planteLower.includes('passiflora') ||
           planteLower.includes('crataegus') ||
           planteLower.includes('valeriana') ||
           planteLower.includes('ficus');  // Figuier = stress/SNA
  };

  // 🆕 v3.1: Fonction helper pour créer une plante avec justification validée
  const createPlantWithValidation = (p: any, endoCovered: boolean, priority: number = 1, axeCible?: string) => {
    const validatedJustification = validatePlantJustification(p);
    return {
      plant_id: (p.name_latin || p.plante || '')?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '') || 'unknown',
      name_latin: p.name_latin || p.plante || '',
      name_fr: p.name_fr || p.plante || '',
      form: p.forme || 'EPS',
      dosage: p.posologie || '',
      // Champs simples pour compatibilité
      justification: validatedJustification.justification_classique,
      justification_terrain: validatedJustification.justification_terrain,
      justification_classique: validatedJustification.justification_classique,
      explication_patient: validatedJustification.explication_patient,
      // Métadonnées
      priority: p.priority || priority,
      endo_covered: endoCovered,
      axe_cible: axeCible || p.axe_cible || validatedJustification.axe_endobiogenique,
      // 🆕 Justification structurée complète (OBLIGATOIRE v3.1)
      justification_complete: validatedJustification,
    };
  };

  return {
    global_strategy_summary: oldResponse.meta?.strategie || "Ordonnance générée par Assistant IA",
    priority_axis: oldResponse.axe_prioritaire || "Corticotrope",

    prescription: {
      // Symptomatic = volet_phyto_elargi (symptômes)
      symptomatic: phytoElargiPrescriptions.map((p: any) =>
        createPlantWithValidation(p, false, 1)
      ),

      // Neuro-endocrine = volet_canon (SANS les plantes ANS pour éviter doublons)
      neuro_endocrine: canonPrescriptions
        .filter((p: any) => !isAnsPlant(p))
        .map((p: any) => createPlantWithValidation(p, true, 2, p.axe_cible)),

      // ANS = extraire du canon les plantes SNA (uniquement celles-ci)
      ans: canonPrescriptions
        .filter(isAnsPlant)
        .map((p: any) => createPlantWithValidation(p, true, 2, 'SNA')),

      // Drainage = volet_drainage (avec justification scientifique détaillée)
      drainage: drainagePrescriptions.map((p: any) => {
        const base = createPlantWithValidation(p, true, 3, 'Drainage');
        return {
          ...base,
          emonctoire: p.emonctoire || 'Foie',
          duree: p.duree || '15-21 jours',
        };
      }),

      // Oligos = volet_micronutrition (format OligoInput - pas de justification structurée)
      oligos: microPrescriptions.map((p: any) => ({
        oligo_id: (p.substance || 'oligo')?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '') || 'oligo',
        name: p.substance || '',
        form: p.forme || 'gélule',
        dosage: p.posologie || '',
        justification: p.indication || '',
      })),
    },
  };
}

/**
 * POST /api/ordonnances/generate
 * Génère une ordonnance via Assistant OpenAI + Middleware Tunisie
 * SANS SCOPE - L'IA choisit la meilleure forme selon l'indication
 *
 * PRÉREQUIS: Une synthèse diagnostic doit exister pour ce patient
 */
export async function POST(req: NextRequest) {
  try {
    // ==========================================
    // AUTHENTIFICATION
    // ==========================================
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // ==========================================
    // VALIDATION REQUEST
    // ==========================================
    const body = await req.json();

    if (!body.patientId) {
      return NextResponse.json(
        { error: "patientId requis" },
        { status: 400 }
      );
    }

    // ==========================================
    // RÉCUPÉRATION PATIENT
    // ==========================================
    const patient = await prisma.patient.findFirst({
      where: {
        id: body.patientId,
        userId: session.user.id,
      },
      include: {
        bdfAnalyses: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient non trouvé" }, { status: 404 });
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("🧬 GÉNÉRATION ORDONNANCE V5 (Assistants API + VectorStore)");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`📋 Patient: ${patient.prenom} ${patient.nom}`);

    // ==========================================
    // ÉTAPE 1: RÉCUPÉRER LE DIAGNOSTIC DEPUIS BDD
    // ==========================================
    console.log("\n📊 Étape 1: Récupération du diagnostic depuis BDD...");

    const latestSynthesis = await prisma.unifiedSynthesis.findFirst({
      where: {
        patientId: body.patientId,
        isLatest: true
      },
      orderBy: { createdAt: "desc" },
    });

    if (!latestSynthesis) {
      console.error("❌ Aucune synthèse diagnostic trouvée pour ce patient");
      return NextResponse.json(
        {
          error: "Aucune synthèse diagnostic disponible. Veuillez d'abord générer la synthèse IA depuis l'onglet Interrogatoire.",
          code: "NO_DIAGNOSIS",
          action: "Générez la synthèse IA avant de créer une ordonnance"
        },
        { status: 400 }
      );
    }

    // Vérifier l'âge du diagnostic (warning si > 24h)
    const diagnosisAgeMs = Date.now() - latestSynthesis.createdAt.getTime();
    const diagnosisAgeHours = Math.round(diagnosisAgeMs / 3600000);
    const MAX_AGE_HOURS = 24;

    if (diagnosisAgeHours > MAX_AGE_HOURS) {
      console.warn(`⚠️ Diagnostic ancien (${diagnosisAgeHours}h) - recommandation: régénérer la synthèse`);
    }

    const diagnosticResponse = latestSynthesis.content as unknown as DiagnosticResponse;

    console.log(`✅ Diagnostic récupéré (ID: ${latestSynthesis.id})`);
    console.log(`   - Généré le: ${latestSynthesis.createdAt.toISOString()}`);
    console.log(`   - Âge: ${diagnosisAgeHours}h`);
    console.log(`   - Confiance: ${diagnosticResponse.confidenceScore}`);
    console.log(`   - Axe dominant: ${diagnosticResponse.terrain?.axeDominant || "Non défini"}`);

    // ==========================================
    // ÉTAPE 2: PRÉPARER LES DONNÉES PATIENT
    // ==========================================
    console.log("\n📋 Étape 2: Préparation des données patient...");

    const patientData = patient as any;
    const derniereBdf = patient.bdfAnalyses?.[0];

    // Calculer l'âge
    const patientAge = patient.dateNaissance
      ? Math.floor((Date.now() - new Date(patient.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    // Allergies
    let allergiesArray: string[] = [];
    if (patientData.allergies) {
      if (Array.isArray(patientData.allergies)) {
        allergiesArray = patientData.allergies;
      } else if (typeof patientData.allergies === "string") {
        allergiesArray = patientData.allergies.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }

    // Traitements actuels
    let traitementsArray: string[] = [];
    if (patientData.traitements || patientData.traitementActuel) {
      const src = patientData.traitements || patientData.traitementActuel;
      if (Array.isArray(src)) {
        traitementsArray = src;
      } else if (typeof src === "string") {
        traitementsArray = src.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }

    // Antécédents
    let antecedentsArray: string[] = [];
    if (patientData.antecedents || patientData.atcdMedicaux) {
      const src = patientData.antecedents || patientData.atcdMedicaux;
      if (Array.isArray(src)) {
        antecedentsArray = src;
      } else if (typeof src === "string") {
        antecedentsArray = src.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }

    // ==========================================
    // ÉTAPE 3: APPELER L'ASSISTANT ORDONNANCE (V5 - Assistants API)
    // ==========================================
    console.log("\n🤖 Étape 3: Appel Assistant OpenAI Ordonnance V5...");
    console.log("   📌 Mode: ASSISTANTS API avec VectorStore 26MB");
    console.log("   📌 MUST_FORMS passés dans le contexte");

    let ordonnanceResponse;
    try {
      ordonnanceResponse = await callOrdonnanceAssistantV5({
        patient: {
          id: patient.id,
          nom: patient.nom || undefined,
          prenom: patient.prenom || undefined,
          age: patientAge,
          sexe: (patient.sexe === "F" ? "F" : "H") as "H" | "F",
          allergies: allergiesArray,
          medicaments_actuels: traitementsArray,
          antecedents: antecedentsArray,
          grossesse: patientData.grossesse || false,
          allaitement: patientData.allaitement || false,
        },
        diagnostic: diagnosticResponse,
        // V5: L'Assistant utilise file_search dans VectorStore + MUST_FORMS dans contexte
      });
      console.log("✅ Assistant Ordonnance V5 a généré l'ordonnance (avec VectorStore)");
    } catch (error) {
      if (error instanceof OrdonnanceError) {
        console.error(`❌ Erreur Assistant: ${error.code} - ${error.message}`);
        return NextResponse.json(
          {
            error: "Erreur génération ordonnance",
            code: error.code,
            details: error.details,
          },
          { status: 500 }
        );
      }
      throw error;
    }

    // ==========================================
    // ÉTAPE 3.5: ADAPTATION TUNISIE
    // ==========================================
    console.log("\n🇹🇳 Étape 3.5: Adaptation pour le contexte tunisien...");

    // Convertir l'ancienne structure vers la nouvelle pour le middleware
    const prescriptionFormatted = adaptToNewStructure(ordonnanceResponse);
    
    // Appeler le middleware de conversion Tunisie
    const ordonnanceTunisie = adaptPrescriptionToTunisia(prescriptionFormatted);

    console.log("✅ Ordonnance adaptée pour la Tunisie:");
    console.log(`   - Total plantes: ${ordonnanceTunisie.meta?.total_plants || 0}`);
    console.log(`   - Disponibles: ${ordonnanceTunisie.meta?.available_count || 0}`);
    console.log(`   - Warnings: ${ordonnanceTunisie.meta?.warnings_count || 0}`);
    console.log(`   - Critiques: ${ordonnanceTunisie.meta?.critical_count || 0}`);

    // Afficher les conversions effectuées
    if (ordonnanceTunisie.meta?.conversions_applied?.length) {
      ordonnanceTunisie.meta.conversions_applied.forEach((detail: string) => {
        console.log(`   🔄 ${detail}`);
      });
    }

    // ==========================================
    // ÉTAPE 4: TRANSFORMER EN FORMAT BDD
    // ==========================================
    console.log("\n💾 Étape 4: Sauvegarde en base de données...");

    // DEBUG: Afficher la structure de la réponse de l'Assistant
    console.log("\n📦 Structure réponse Assistant:");
    console.log("   volet_drainage:", ordonnanceResponse.volet_drainage?.prescriptions?.length || 0, "prescriptions");
    console.log("   volet_canon_endobiogenique:", ordonnanceResponse.volet_canon_endobiogenique?.prescriptions?.length || 0, "prescriptions");
    console.log("   volet_phyto_elargi:", ordonnanceResponse.volet_phyto_elargi?.prescriptions?.length || 0, "prescriptions");
    console.log("   volet_aromatherapie:", ordonnanceResponse.volet_aromatherapie?.prescriptions?.length || 0, "prescriptions HE");
    console.log("   volet_micronutrition:", ordonnanceResponse.volet_micronutrition?.prescriptions?.length || 0, "prescriptions");

    // Afficher le détail si présent (nouveau format avec name_latin/name_fr)
    if (ordonnanceResponse.volet_canon_endobiogenique?.prescriptions) {
      console.log("   Canon détail:", ordonnanceResponse.volet_canon_endobiogenique.prescriptions.map((p: any) =>
        `${p.name_fr || p.plante || 'N/A'} (${p.forme || 'N/A'})`
      ).join(", "));
    }
    if (ordonnanceResponse.volet_phyto_elargi?.prescriptions) {
      console.log("   Phyto élargi détail:", ordonnanceResponse.volet_phyto_elargi.prescriptions.map((p: any) =>
        `${p.name_fr || p.plante || 'N/A'} (${p.forme || 'N/A'})`
      ).join(", "));
    }
    if (ordonnanceResponse.volet_aromatherapie?.prescriptions) {
      console.log("   Aromathérapie détail:", ordonnanceResponse.volet_aromatherapie.prescriptions.map((p: any) =>
        `${p.huile_essentielle || p.name_latin || 'N/A'} (${p.voie || 'N/A'})`
      ).join(", "));
    }

    // 🔧 Fonction de déduplication par substance (nom latin normalisé)
    const deduplicatePrescriptions = (prescriptions: any[]) => {
      const seen = new Map<string, any>();
      for (const p of prescriptions) {
        // Clé unique = nom latin normalisé + forme
        const key = `${(p.substance || '').toLowerCase().trim()}_${(p.forme || '').toLowerCase().trim()}`;
        if (!seen.has(key)) {
          seen.set(key, p);
        }
      }
      return Array.from(seen.values());
    };

    // Volet Endobiogénique (drainage + canon) - AVEC DÉDUPLICATION + PlantJustification
    const voletEndobiogeniqueRaw = [
      ...(ordonnanceResponse.volet_drainage?.prescriptions || []).map((p: any, idx: number) => ({
        id: `drainage-${idx}`,
        substance: p.name_latin || p.plante,
        nomFrancais: p.name_fr || p.plante,
        type: "plante",
        forme: p.forme,
        posologie: p.posologie,
        duree: p.duree,
        axeCible: "Drainage - " + (p.action || p.emonctoire || ""),
        mecanisme: p.action || "",
        // 🆕 Justification structurée (PlantJustification)
        justification: {
          symptome_cible: p.justification?.symptome_cible || `Drainage ${p.emonctoire || 'hépatique'}`,
          axe_endobiogenique: p.justification?.axe_endobiogenique || "Préparation terrain",
          mecanisme_action: p.justification?.mecanisme_action || p.action || "",
          synergies: p.justification?.synergies || [],
          justification_terrain: p.justification?.justification_terrain || "",
          justification_classique: p.justification?.justification_classique || p.action || "",
          explication_patient: p.justification?.explication_patient || p.explication_patient || "",
          precautions: p.justification?.precautions || [],
          confiance: p.justification?.confiance || null,
        },
        priorite: p.priority || 3,
        CI: [],
      })),
      ...(ordonnanceResponse.volet_canon_endobiogenique?.prescriptions || []).map((p: any, idx: number) => ({
        id: `canon-${idx}`,
        substance: p.name_latin || p.plante,
        nomFrancais: p.name_fr || p.plante,
        type: p.forme?.includes("MG") || p.forme?.includes("Bgs") ? "gemmo" : "plante",
        forme: p.forme,
        posologie: p.posologie,
        duree: p.duree || "2 mois",
        axeCible: p.axe_cible || "Terrain",
        mecanisme: p.mecanisme || "",
        // 🆕 Justification structurée (PlantJustification)
        justification: {
          symptome_cible: p.justification?.symptome_cible || p.indication || "",
          axe_endobiogenique: p.justification?.axe_endobiogenique || p.axe_cible || "",
          mecanisme_action: p.justification?.mecanisme_action || p.mecanisme || "",
          synergies: p.justification?.synergies || [],
          justification_terrain: p.justification?.justification_terrain || p.justification_terrain || "",
          justification_classique: p.justification?.justification_classique || p.justification_classique || "",
          explication_patient: p.justification?.explication_patient || p.explication_patient || "",
          precautions: p.justification?.precautions || [],
          confiance: p.justification?.confiance || null,
        },
        priorite: p.priority || 2,
        CI: [],
      })),
    ];
    const voletEndobiogenique = deduplicatePrescriptions(voletEndobiogeniqueRaw);

    // Volet Phyto Élargi - AVEC DÉDUPLICATION + PlantJustification
    const voletPhytoElargiRaw = (ordonnanceResponse.volet_phyto_elargi?.prescriptions || []).map((p: any, idx: number) => ({
      id: `phyto-${idx}`,
      substance: p.name_latin || p.plante,
      nomFrancais: p.name_fr || p.plante,
      type: p.forme === "HE" ? "HE" : "plante",
      forme: p.forme,
      posologie: p.posologie,
      duree: p.duree || "21 jours",
      axeCible: p.axe_cible || p.indication || "Symptomatique",
      mecanisme: p.mecanisme || "",
      // 🆕 Justification structurée (PlantJustification)
      justification: {
        symptome_cible: p.justification?.symptome_cible || p.indication || "",
        axe_endobiogenique: p.justification?.axe_endobiogenique || p.axe_cible || "",
        mecanisme_action: p.justification?.mecanisme_action || p.mecanisme || "",
        synergies: p.justification?.synergies || [],
        justification_terrain: p.justification?.justification_terrain || p.justification_terrain || "",
        justification_classique: p.justification?.justification_classique || p.justification_classique || "",
        explication_patient: p.justification?.explication_patient || p.explication_patient || "",
        precautions: p.justification?.precautions || [],
        confiance: p.justification?.confiance || null,
      },
      priorite: p.priority || 1,
    }));
    const voletPhytoElargi = deduplicatePrescriptions(voletPhytoElargiRaw);

    // Volet Aromathérapie (HE dédiées) - ENRICHI avec 4 voies Tunisie
    const voletAromatherapie = (ordonnanceResponse.volet_aromatherapie?.prescriptions || []).map((p: any, idx: number) => {
      // Normaliser la voie vers le format Tunisien
      const voieRaw = (p.voie || "CUTANEE").toUpperCase() as VoieAromatherapie;
      const voieNormalized: VoieAromatherapie =
        ["SOLUTION_ORALE", "SUPPOSITOIRE", "CUTANEE", "INHALATION"].includes(voieRaw)
          ? voieRaw
          : "CUTANEE"; // Fallback

      // Récupérer badge et couleur depuis tunisianProtocols
      const { badge: voie_badge, couleur: voie_couleur } = getBadgeVoieAroma(voieNormalized);

      return {
        id: `he-${idx}`,
        substance: p.name_latin || p.huile_essentielle,
        nomFrancais: p.huile_essentielle,
        type: "HE",
        chemotype: p.chemotype || null,
        // 🆕 Voie tunisienne avec badge/couleur
        voie: voieNormalized,
        voie_badge,
        voie_couleur,
        forme: "HE",
        posologie: p.posologie,
        dilution: p.dilution || null,
        huileVegetale: p.huile_vegetale || null,
        zoneApplication: p.zone_application || null,
        duree: p.duree || "7-10 jours",
        axeCible: p.axe_cible || "Symptomatique",
        mecanisme: p.mecanisme || "",
        // 🆕 Justification structurée complète (PlantJustification)
        justification: {
          symptome_cible: p.justification?.symptome_cible || p.indication || "",
          axe_endobiogenique: p.justification?.axe_endobiogenique || p.axe_cible || "",
          mecanisme_action: p.justification?.mecanisme_action || p.mecanisme || "",
          synergies: p.justification?.synergies || [],
          justification_terrain: p.justification?.justification_terrain || p.justification_terrain || "",
          justification_classique: p.justification?.justification_classique || p.justification_classique || "",
          explication_patient: p.justification?.explication_patient || p.explication_patient || "",
          precautions: p.justification?.precautions || p.precautions || [],
          confiance: p.justification?.confiance || null, // Saisi par l'IA
        },
        contreIndications: p.contre_indications || [],
        precautions: p.precautions || [],
        priorite: p.priority || 1,
      };
    });

    // Précautions générales aromathérapie
    const aromatherapiePrecautionsGenerales = ordonnanceResponse.volet_aromatherapie?.precautions_generales || [];

    // Volet Compléments
    const voletComplements = (ordonnanceResponse.volet_micronutrition?.prescriptions || []).map((p: any, idx: number) => ({
      id: `micro-${idx}`,
      substance: p.substance,
      type: "mineral",
      forme: "gélule",
      posologie: p.posologie,
      duree: p.duree || "3 mois",
      axeCible: p.indication,
      priorite: 2,
    }));

    // ==========================================
    // SYNTHÈSE CLINIQUE ENRICHIE (sans calendrier de prise)
    // ==========================================
    // Le calendrier de prise est affiché dans l'ordonnance adaptée TN
    // pour éviter l'incohérence avec les posologies françaises

    let syntheseClinique = "";

    // 1. Description du terrain
    syntheseClinique += "## Synthèse du Terrain Endobiogénique\n\n";
    syntheseClinique += diagnosticResponse.terrain?.description || "Analyse du terrain en cours.";

    // 2. Axe dominant et profil SNA
    syntheseClinique += "\n\n### Axe Neuro-Endocrinien Dominant\n";
    syntheseClinique += `**${diagnosticResponse.terrain?.axeDominant || "Non défini"}**`;
    if (diagnosticResponse.terrain?.justification) {
      syntheseClinique += `\n\n_${diagnosticResponse.terrain.justification}_`;
    }

    syntheseClinique += "\n\n### Profil du Système Nerveux Autonome\n";
    syntheseClinique += `**${diagnosticResponse.terrain?.profilSNA || "Non défini"}**`;

    // 3. Terrains principaux identifiés
    if (diagnosticResponse.terrain?.terrainsPrincipaux?.length) {
      syntheseClinique += "\n\n### Terrains Pathologiques Identifiés\n";
      diagnosticResponse.terrain.terrainsPrincipaux.forEach((t: string) => {
        syntheseClinique += `- ${t}\n`;
      });
    }

    // 4. Axes endocriniens perturbés (top 3)
    if (diagnosticResponse.axesEndocriniens?.length) {
      syntheseClinique += "\n\n### Analyse des Axes Endocriniens\n\n";
      const topAxes = diagnosticResponse.axesEndocriniens
        .filter((a: any) => a.score_perturbation > 0.3)
        .slice(0, 3);

      topAxes.forEach((axe: any) => {
        const statusIcon = axe.status === "Hyper" ? "↑" : axe.status === "Hypo" ? "↓" : "→";
        syntheseClinique += `**${axe.axe}** ${statusIcon} (${axe.status})\n`;
        if (axe.mecanisme) syntheseClinique += `  _Mécanisme:_ ${axe.mecanisme}\n`;
        if (axe.implication_therapeutique) syntheseClinique += `  _Implication:_ ${axe.implication_therapeutique}\n`;
        syntheseClinique += "\n";
      });
    }

    // 5. Spasmophilie (si détectée)
    if (diagnosticResponse.spasmophilie?.detectee) {
      syntheseClinique += "\n### Terrain Spasmophile\n";
      syntheseClinique += `⚠️ **Spasmophilie détectée** (probabilité: ${Math.round((diagnosticResponse.spasmophilie.probabilite || 0) * 100)}%)\n`;
      if (diagnosticResponse.spasmophilie.type_probable) {
        syntheseClinique += `Type probable: ${diagnosticResponse.spasmophilie.type_probable}\n`;
      }
      if (diagnosticResponse.spasmophilie.arguments?.length) {
        syntheseClinique += "Arguments:\n";
        diagnosticResponse.spasmophilie.arguments.forEach((arg: string) => {
          syntheseClinique += `- ${arg}\n`;
        });
      }
    }

    // 6. Drainage (si nécessaire)
    if (diagnosticResponse.drainage?.necessaire) {
      syntheseClinique += "\n### Nécessité de Drainage\n";
      syntheseClinique += `Priorité: **${diagnosticResponse.drainage.priorite}**\n`;
      if (diagnosticResponse.drainage.emonctoires_prioritaires?.length) {
        syntheseClinique += "Émonctoires à drainer:\n";
        diagnosticResponse.drainage.emonctoires_prioritaires.forEach((e: any) => {
          syntheseClinique += `- **${e.emonctoire}**: ${e.justification}\n`;
        });
      }
      if (diagnosticResponse.drainage.duree_recommandee) {
        syntheseClinique += `Durée recommandée: ${diagnosticResponse.drainage.duree_recommandee}\n`;
      }
    }

    // 7. Synthèse pour praticien (si disponible)
    if (diagnosticResponse.synthese_pour_praticien) {
      syntheseClinique += "\n\n### Synthèse Clinique\n";
      syntheseClinique += diagnosticResponse.synthese_pour_praticien;
    }

    // 8. Score de confiance
    if (diagnosticResponse.confidenceScore) {
      syntheseClinique += `\n\n---\n_Score de confiance de l'analyse: ${Math.round(diagnosticResponse.confidenceScore * 100)}%_`;
    }

    // NOTE: Le calendrier de prise est affiché dans l'ordonnance avec les posologies tunisiennes adaptées

    // Conseils
    const conseilsAssocies = ordonnanceResponse.conseils_hygiene_vie || [];

    // Surveillance
    const surveillanceBiologique = ordonnanceResponse.suivi?.parametres_surveiller || [];

    // Créer l'ordonnance
    const ordonnanceId = uuidv4();

    const ordonnance = await prisma.ordonnance.create({
      data: {
        id: ordonnanceId,
        patientId: patient.id,
        bdfAnalysisId: derniereBdf?.id || null,

        // 🇫🇷 Version France (originale) - 4 volets
        voletEndobiogenique,
        voletPhytoElargi,
        voletAromatherapie,  // 🆕 Volet HE dédié
        voletComplements,

        // 🇹🇳 Version Tunisie (adaptée)
        adaptedContent: ordonnanceTunisie as any,

        // PAS DE SCOPE - supprimé

        syntheseClinique,
        conseilsAssocies,
        surveillanceBiologique,

        statut: "brouillon",
      },
    });

    console.log("✅ Ordonnance créée:", ordonnance.id);

    // ==========================================
    // RÉPONSE
    // ==========================================
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("📋 RÉSULTATS");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`Volet Endobiogénique: ${voletEndobiogenique.length} prescriptions`);
    console.log(`Volet Phyto élargi: ${voletPhytoElargi.length} prescriptions`);
    console.log(`Volet Aromathérapie: ${voletAromatherapie.length} HE`);
    console.log(`Volet Compléments: ${voletComplements.length} prescriptions`);
    console.log(`Coût estimé: ${ordonnanceResponse.cout_estime?.mensuel || "N/A"}`);
    console.log(`🇹🇳 Adaptations Tunisie: ${ordonnanceTunisie.meta?.conversions_applied?.length || 0}`);

    return NextResponse.json(
      {
        success: true,
        ordonnance: {
          id: ordonnance.id,
          patientId: ordonnance.patientId,

          // 🇫🇷 Version France - 4 volets
          voletEndobiogenique,
          voletPhytoElargi,
          voletAromatherapie,  // 🆕 HE dédiées
          aromatherapiePrecautionsGenerales,  // Précautions globales HE
          voletComplements,

          // 🇹🇳 Version Tunisie
          adaptedContent: ordonnanceTunisie,

          syntheseClinique,
          conseilsAssocies,
          surveillanceBiologique,
          statut: ordonnance.statut,
          createdAt: ordonnance.createdAt.toISOString(),
        },
        
        // Alertes Tunisie
        alertesTunisie: {
          total: ordonnanceTunisie.meta?.total_plants || 0,
          disponibles: ordonnanceTunisie.meta?.available_count || 0,
          warnings: ordonnanceTunisie.meta?.warnings_count || 0,
          critiques: ordonnanceTunisie.meta?.critical_count || 0,
          conversions: ordonnanceTunisie.meta?.conversions_applied || [],
        },
        
        // Alertes de l'Assistant
        alertes: (ordonnanceResponse.alertes_securite || []).map((a: any) => ({
          niveau: a.severite,
          type: a.type,
          message: a.message,
          action: a.action,
        })),
        
        // Suivi
        suivi: ordonnanceResponse.suivi,
        
        // Coût
        coutEstime: ordonnanceResponse.cout_estime,
        
        // Sources
        sourcesUtilisees: {
          diagnosticId: latestSynthesis.id,
          diagnosticDate: latestSynthesis.createdAt.toISOString(),
          diagnosticAge: `${diagnosisAgeHours}h`,
          assistantOrdonnance: true,
          middlewareTunisie: true,
          adaptationsTunisie: ordonnanceTunisie.meta?.conversions_applied?.length || 0,
          bdf: !!derniereBdf,
          bdfDate: derniereBdf?.date || null,
        },

        // Warning si diagnostic ancien
        ...(diagnosisAgeHours > MAX_AGE_HOURS && {
          warning: `Le diagnostic date de ${diagnosisAgeHours}h. Considérez régénérer la synthèse IA pour des données à jour.`
        }),
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("❌ Erreur génération ordonnance:", e);
    return NextResponse.json(
      {
        error: e?.message ?? "Erreur serveur",
        details: process.env.NODE_ENV === "development" ? e?.stack : undefined,
      },
      { status: 500 }
    );
  }
}