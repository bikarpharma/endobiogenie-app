// ========================================
// API GÉNÉRATION ORDONNANCE - /api/ordonnances/generate
// ========================================
// POST : Génère une ordonnance intelligente via raisonnement IA en 4 étapes

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TherapeuticReasoningEngine } from "@/lib/ordonnance/therapeuticReasoning";
import type {
  GenerateOrdonnanceRequest,
  OrdonnanceStructuree,
  TherapeuticScope,
  RecommandationTherapeutique,
} from "@/lib/ordonnance/types";
import type { IndexResults, LabValues } from "@/lib/bdf/types";
import { v4 as uuidv4 } from "uuid";
import { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";
import { scoreInterrogatoire, ClinicalAxeScores } from "@/lib/interrogatoire/clinicalScoring";
import { fuseClinicalBdfRag, BdfIndexes, RagContext, FusedAxePerturbation } from "@/lib/ordonnance/fusionClinique";

export const runtime = "nodejs";
export const maxDuration = 60; // Peut prendre du temps avec vectorstores

/**
 * POST /api/ordonnances/generate
 * Génère une ordonnance structurée en 3 volets via raisonnement IA
 */
export async function POST(req: NextRequest) {
  try {
    // ==========================================
    // AUTHENTIFICATION
    // ==========================================
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // ==========================================
    // VALIDATION REQUEST
    // ==========================================
    const body: GenerateOrdonnanceRequest = await req.json();

    if (!body.patientId || !body.scope) {
      return NextResponse.json(
        { error: "Données incomplètes : patientId et scope requis" },
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
          take: 1, // Plus récente par défaut
        },
        axeInterpretations: true, // Charger les interprétations IA des axes
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    // ==========================================
    // RÉCUPÉRATION ANALYSE BdF
    // ==========================================
    let bdfAnalysis = null;
    let indexes: IndexResults | null = null;
    let inputs: LabValues | null = null;

    if (body.bdfAnalysisId) {
      // BdF spécifique fournie
      bdfAnalysis = await prisma.bdfAnalysis.findFirst({
        where: {
          id: body.bdfAnalysisId,
          patientId: body.patientId,
        },
      });
    } else if (patient.bdfAnalyses.length > 0) {
      // Prendre la plus récente
      bdfAnalysis = patient.bdfAnalyses[0];
    }

    if (bdfAnalysis) {
      // Reconstituer indexes et inputs
      const indexesArray = bdfAnalysis.indexes as any[];
      indexes = {
        indexGenital: indexesArray.find((i: any) => i.name === "indexGenital") || { value: null, comment: "" },
        indexThyroidien: indexesArray.find((i: any) => i.name === "indexThyroidien") || { value: null, comment: "" },
        gT: indexesArray.find((i: any) => i.name === "gT") || { value: null, comment: "" },
        indexAdaptation: indexesArray.find((i: any) => i.name === "indexAdaptation") || { value: null, comment: "" },
        indexOestrogenique: indexesArray.find((i: any) => i.name === "indexOestrogenique") || { value: null, comment: "" },
        turnover: indexesArray.find((i: any) => i.name === "turnover") || { value: null, comment: "" },
        rendementThyroidien: indexesArray.find((i: any) => i.name === "rendementThyroidien") || { value: null, comment: "" },
        remodelageOsseux: indexesArray.find((i: any) => i.name === "remodelageOsseux") || { value: null, comment: "" },
      };
      inputs = bdfAnalysis.inputs as LabValues;
    } else if (body.inputs) {
      // Pas de BdF, mais inputs fournis directement (cas rare)
      inputs = body.inputs;
      // TODO: Calculer indexes à la volée si nécessaire
    }

    // Note: BdF n'est plus obligatoire - on peut générer avec interrogatoire seul
    // Vérifier qu'on a au moins une source (BdF OU interrogatoire)
    const interrogatoireExists = patient.interrogatoire !== null;
    if (!bdfAnalysis && !interrogatoireExists) {
      return NextResponse.json(
        { error: "Aucune donnée clinique disponible - Le patient doit avoir au minimum un interrogatoire ou une analyse BdF" },
        { status: 400 }
      );
    }

    // ==========================================
    // CONTEXTE PATIENT ENRICHI
    // ==========================================
    const age = patient.dateNaissance
      ? new Date().getFullYear() - new Date(patient.dateNaissance).getFullYear()
      : 0;

    const CI = Array.isArray(patient.contreindicationsMajeures)
      ? patient.contreindicationsMajeures as string[]
      : [];

    const traitements = [];
    if (patient.traitementActuel) traitements.push(patient.traitementActuel);
    if (patient.traitements) traitements.push(patient.traitements);

    const symptomes = body.symptomes || [];
    // Ajouter les symptômes actuels du patient
    if (Array.isArray(patient.symptomesActuels)) {
      symptomes.push(...(patient.symptomesActuels as string[]));
    }

    const patientContext = {
      age,
      sexe: patient.sexe as "M" | "F",
      CI,
      traitements,
      symptomes,
      // Nouveaux champs pour contexte enrichi
      pathologies: Array.isArray(patient.pathologiesAssociees) ? patient.pathologiesAssociees as string[] : [],
      autresBilans: typeof patient.autresBilans === "object" ? patient.autresBilans as Record<string, number> : {},
    };

    // ==========================================
    // FUSION CLINIQUE : INTERROGATOIRE + BDF + RAG
    // ==========================================
    console.log(`🧠 Démarrage raisonnement IA fusionné pour patient ${patient.nom} ${patient.prenom}`);

    // 1. Charger l'interrogatoire endobiogénique
    const interrogatoire = patient.interrogatoire as InterrogatoireEndobiogenique | null;

    let clinicalScores: ClinicalAxeScores | null = null;
    let axesFusionnes: FusedAxePerturbation[] = [];

    if (interrogatoire) {
      console.log("📋 Interrogatoire endobiogénique trouvé, calcul des scores cliniques...");
      clinicalScores = scoreInterrogatoire(interrogatoire);
      console.log(`✅ Scores cliniques calculés:
  - Neurovégétatif: ${clinicalScores.neuroVegetatif.orientation}
  - Adaptatif: ${clinicalScores.adaptatif.orientation}
  - Thyroïdien: ${clinicalScores.thyroidien.orientation}
  - Gonadique: ${clinicalScores.gonadique.orientation}`);
    } else {
      console.log("⚠️ Aucun interrogatoire trouvé, utilisation BdF seule");
    }

    // 2. Construire BdfIndexes pour la fusion
    const bdfIndexes: BdfIndexes = {
      indexThyroidien: indexes?.indexThyroidien.value ?? undefined,
      indexAdaptation: indexes?.indexAdaptation.value ?? undefined,
      indexGenital: indexes?.indexGenital.value ?? undefined,
      indexGenitoThyroidien: indexes?.gT.value ?? undefined,
      indexOestrogenique: indexes?.indexOestrogenique.value ?? undefined,
      indexTurnover: indexes?.turnover.value ?? undefined,
      indexRendementThyroidien: indexes?.rendementThyroidien.value ?? undefined,
      indexRemodelageOsseux: indexes?.remodelageOsseux.value ?? undefined,
    };

    // 3. Construire RagContext
    const ragAxes = bdfAnalysis?.axes as string[] || [];
    const ragSummary = bdfAnalysis?.summary || "";
    const ragContext: RagContext = {
      axes: [], // TODO: parser ragAxes pour extraire structure
      resume: ragSummary,
    };

    console.log(`📊 RAG Enrichment: ${ragAxes.length} axes identifiés: ${ragAxes.join(", ")}`);

    // 3.5. Charger les interprétations IA stockées (Niveau 1)
    const storedInterpretations = patient.axeInterpretations || [];
    console.log(`🤖 Interprétations IA stockées: ${storedInterpretations.length} axes interprétés`);

    // Convertir au format attendu par la fusion
    const interpretationsMap: Record<string, any> = {};
    storedInterpretations.forEach((interp: any) => {
      interpretationsMap[interp.axe] = {
        orientation: interp.orientation,
        mecanismes: interp.mecanismes as string[],
        prudences: interp.prudences as string[],
        modulateurs: interp.modulateurs as string[],
        resumeClinique: interp.resumeClinique,
        confiance: interp.confiance,
      };
    });

    // 4. FUSION : Interrogatoire + BdF + RAG + Interprétations IA (Niveau 2)
    if (interrogatoire && clinicalScores) {
      axesFusionnes = fuseClinicalBdfRag(
        interrogatoire,
        clinicalScores,
        bdfIndexes,
        ragContext,
        interpretationsMap // Passer les interprétations IA stockées
      );

      console.log(`🔀 Fusion complète : ${axesFusionnes.length} axes perturbés fusionnés`);
      axesFusionnes.forEach(axe => {
        console.log(`  - ${axe.axe} (${axe.niveau}) : score ${axe.score}/10 | confiance: ${axe.confiance}`);
        console.log(`    Sources: Clinique=${axe.sources.clinique}, BdF=${axe.sources.bdf}, RAG=${axe.sources.rag}, IA=${axe.sources.ia || false}`);
      });
    } else {
      console.log("⚠️ Pas de fusion possible, fallback vers BdF seule");
    }

    // ==========================================
    // RAISONNEMENT THÉRAPEUTIQUE (4 ÉTAPES)
    // ==========================================

    const engine = new TherapeuticReasoningEngine();

    // Si pas de BdF, créer des indexes vides pour le moteur
    // Le moteur utilisera les axes fusionnés dans tous les cas
    const finalIndexes = indexes || {
      indexGenital: { value: null, comment: "" },
      indexThyroidien: { value: null, comment: "" },
      gT: { value: null, comment: "" },
      indexAdaptation: { value: null, comment: "" },
      indexOestrogenique: { value: null, comment: "" },
      turnover: { value: null, comment: "" },
      rendementThyroidien: { value: null, comment: "" },
      remodelageOsseux: { value: null, comment: "" },
    };

    const finalInputs = inputs || {} as LabValues;

    if (!indexes || !inputs) {
      console.log("⚠️ Génération sans BdF - utilisation des axes fusionnés et interprétations IA uniquement");
    }

    const raisonnement = await engine.executeFullReasoning(
      finalIndexes,
      finalInputs,
      body.scope,
      patientContext,
      { ragAxes, ragSummary, axesFusionnes } // Passer axes fusionnés
    );

    console.log(`✅ Raisonnement terminé : ${raisonnement.axesPerturbés.length} axes perturbés, ${raisonnement.recommandationsEndobiogenie.length} recommandations endobiogénie`);

    // ==========================================
    // SYNTHÈSE CLINIQUE OPTIMISÉE (API directe)
    // ==========================================
    console.log("📝 Génération synthèse clinique optimisée...");

    const { generateClinicalSynthesis } = await import("@/lib/ordonnance/openaiDirect");

    const allRecommendations = [
      ...raisonnement.recommandationsEndobiogenie,
      ...raisonnement.recommandationsElargies,
      ...raisonnement.recommandationsMicronutrition,
    ];

    let syntheseClinique = raisonnement.raisonnementDetaille;

    try {
      // Utiliser les axes fusionnés si disponibles, sinon fallback vers axes BdF
      const axesForSynthesis = axesFusionnes.length > 0 ? axesFusionnes : raisonnement.axesPerturbés;

      // Ajouter un préfixe explicatif si fusion utilisée
      let contexteSynthese = "";
      if (axesFusionnes.length > 0) {
        contexteSynthese = `[ANALYSE INTÉGRÉE]\nCette ordonnance est basée sur une analyse fusionnée combinant :\n- Interrogatoire clinique endobiogénique (${interrogatoire ? '✓' : '✗'})\n- Biologie de fonction (BdF) (${bdfAnalysis ? '✓' : '✗'})\n- Enrichissement RAG endobiogénie (${ragAxes.length > 0 ? '✓' : '✗'})\n\n`;
      }

      const synthese = await generateClinicalSynthesis(
        axesForSynthesis as any,
        patientContext,
        allRecommendations
      );

      syntheseClinique = contexteSynthese + synthese;
      console.log("✅ Synthèse clinique fusionnée générée via API directe");
    } catch (error) {
      console.error("⚠️ Erreur synthèse clinique, fallback vers basique:", error);
      // Garder la synthèse de base si erreur
    }

    // ==========================================
    // STRUCTURATION ORDONNANCE SELON SCOPE
    // ==========================================
    const ordonnanceId = uuidv4();

    // Construire les volets en fonction du scope sélectionné
    // Logique: Toujours VOLET 1 Endobiogénie, puis volets selon scope, puis optionnellement micro-nutrition

    let voletEndobiogenique = raisonnement.recommandationsEndobiogenie;
    let voletPhytoElargi: RecommandationTherapeutique[] = [];
    let voletComplements = raisonnement.recommandationsMicronutrition;

    // Si AUCUN scope élargi n'est sélectionné → 3 volets classiques
    const hasExtendedScope = body.scope.planteMedicinale || body.scope.gemmotherapie || body.scope.aromatherapie;

    if (hasExtendedScope) {
      // Utiliser les recommandations élargies obtenues depuis les vectorstores
      voletPhytoElargi = raisonnement.recommandationsElargies;
    } else {
      // Pas de scope élargi → volet phyto vide
      voletPhytoElargi = [];
    }

    const ordonnance: OrdonnanceStructuree = {
      id: ordonnanceId,
      patientId: patient.id,
      bdfAnalysisId: bdfAnalysis?.id || undefined,

      // VOLET 1 : Endobiogénie canon
      voletEndobiogenique,

      // VOLET 2 : Phyto/Gemmo/Aroma élargi (selon scope)
      voletPhytoElargi,

      // VOLET 3 : Micro-nutrition
      voletComplements,

      // Scope utilisé (pour affichage dynamique des titres)
      scope: body.scope,

      // Métadonnées
      syntheseClinique,
      conseilsAssocies: [
        "Maintenir une alimentation équilibrée",
        "Respecter les horaires de prise",
        "Signaler tout effet indésirable",
      ],
      surveillanceBiologique: [],
      dateRevaluation: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // +3 semaines

      statut: "brouillon",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ==========================================
    // SAUVEGARDE EN BASE DE DONNÉES
    // ==========================================
    await prisma.ordonnance.create({
      data: {
        id: ordonnance.id,
        patientId: ordonnance.patientId,
        bdfAnalysisId: ordonnance.bdfAnalysisId || null,
        voletEndobiogenique: ordonnance.voletEndobiogenique as any,
        voletPhytoElargi: ordonnance.voletPhytoElargi as any,
        voletComplements: ordonnance.voletComplements as any,
        scope: ordonnance.scope as any,
        syntheseClinique: ordonnance.syntheseClinique,
        conseilsAssocies: ordonnance.conseilsAssocies,
        surveillanceBiologique: ordonnance.surveillanceBiologique,
        dateRevaluation: ordonnance.dateRevaluation || null,
        statut: ordonnance.statut,
        createdAt: ordonnance.createdAt,
        updatedAt: ordonnance.updatedAt,
      },
    });

    console.log(`💾 Ordonnance sauvegardée : ${ordonnanceId}`);

    // ==========================================
    // RÉPONSE
    // ==========================================
    return NextResponse.json(
      {
        success: true,
        ordonnance,
        alertes: raisonnement.alertes,
        coutEstime: raisonnement.coutEstime,
        sourcesUtilisees: {
          interrogatoire: !!interrogatoire,
          bdf: !!bdfAnalysis,
          interpretationsIA: storedInterpretations.length,
          rag: ragAxes.length > 0,
        },
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
