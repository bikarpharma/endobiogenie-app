// ========================================
// API GÉNÉRATION ORDONNANCE IA - /api/patients/[id]/ordonnances/generate
// ========================================
// POST : Générer une nouvelle ordonnance phyto basée sur la synthèse unifiée IA
//
// NOUVEAU FLUX:
// 1. Récupérer ou générer la synthèse unifiée (clinical-engine.ts)
// 2. Transformer suggestedPrescription en format ordonnance
// 3. Sauvegarder l'ordonnance

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPatientClinicalContext } from "@/lib/clinical-data-aggregator";
import { generateClinicalSynthesis } from "@/app/actions/clinical-engine";
import type { TherapeuticScope } from "@/lib/ordonnance/types";

export const runtime = "nodejs";
export const maxDuration = 120; // 2 minutes max pour la génération IA

/**
 * POST /api/patients/[id]/ordonnances/generate
 * Générer une ordonnance phyto personnalisée basée sur la synthèse unifiée IA
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Récupérer userId depuis les headers (auth)
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id: patientId } = await params;
    const body = await req.json();

    // Options de génération
    const scope: TherapeuticScope = {
      planteMedicinale: body.scope?.planteMedicinale ?? true,
      gemmotherapie: body.scope?.gemmotherapie ?? true,
      aromatherapie: body.scope?.aromatherapie ?? false,
      micronutrition: body.scope?.micronutrition ?? true,
    };

    // Récupérer le patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId, userId },
      include: {
        bdfAnalyses: {
          orderBy: { date: "desc" },
          take: 1,
        },
        syntheseGlobale: {
          where: { isLatest: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Patient non trouvé" },
        { status: 404 }
      );
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("🧬 GÉNÉRATION ORDONNANCE DEPUIS SYNTHÈSE UNIFIÉE");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`📋 Patient: ${patient.prenom} ${patient.nom}`);

    // ==========================================
    // ÉTAPE 1: RÉCUPÉRER OU GÉNÉRER LA SYNTHÈSE UNIFIÉE
    // ==========================================
    let synthesis: any = null;
    const existingSynthesis = patient.syntheseGlobale[0];

    // Utiliser la synthèse existante si elle date de moins de 24h
    const synthesisFresh = existingSynthesis &&
      (Date.now() - new Date(existingSynthesis.createdAt).getTime()) < 24 * 60 * 60 * 1000;

    if (synthesisFresh && existingSynthesis.content) {
      console.log("📊 Utilisation de la synthèse existante...");
      synthesis = existingSynthesis.content as any;
    } else {
      console.log("🤖 Génération d'une nouvelle synthèse IA...");
      try {
        const context = await getPatientClinicalContext(patientId);
        synthesis = await generateClinicalSynthesis(context);

        // Sauvegarder la nouvelle synthèse
        await prisma.unifiedSynthesis.create({
          data: {
            patientId,
            content: synthesis as any,
            confiance: synthesis.meta?.confidenceScore || 0.8,
            modelUsed: synthesis.meta?.modelUsed || "gpt-4o",
            isLatest: true,
          },
        });
        console.log("✅ Nouvelle synthèse générée et sauvegardée");
      } catch (error) {
        console.error("❌ Erreur génération synthèse:", error);
        return NextResponse.json(
          { error: "Impossible de générer la synthèse clinique" },
          { status: 500 }
        );
      }
    }

    if (!synthesis || !synthesis.suggestedPrescription) {
      return NextResponse.json(
        { error: "Aucune prescription suggérée dans la synthèse" },
        { status: 400 }
      );
    }

    // ==========================================
    // ÉTAPE 2: TRANSFORMER LA PRESCRIPTION EN ORDONNANCE
    // ==========================================
    console.log("\n💊 Transformation de la prescription suggérée...");

    const prescription = synthesis.suggestedPrescription;
    const drainage = synthesis.drainage;
    const spasmophilie = synthesis.spasmophilie;

    // Construire les recommandations depuis la synthèse
    const voletEndobiogenique: any[] = [];
    const voletPhytoElargi: any[] = [];
    const voletComplements: any[] = [];

    // Phase drainage (si présente)
    if (prescription.phaseDrainage?.formule) {
      prescription.phaseDrainage.formule.forEach((p: any, idx: number) => {
        voletEndobiogenique.push({
          id: `drainage-${idx}`,
          substance: p.nomLatin || p.nom,
          nomFrancais: p.nom,
          type: "plante",
          forme: p.forme || "EPS",
          posologie: p.posologie,
          duree: prescription.phaseDrainage.duree || "3 semaines",
          axeCible: "Drainage - " + p.indication,
          mecanisme: p.indication,
          priorite: 0, // Priorité maximale pour le drainage
        });
      });
    }

    // Phytothérapie
    if (scope.planteMedicinale && prescription.phytotherapie) {
      prescription.phytotherapie.forEach((p: any, idx: number) => {
        voletEndobiogenique.push({
          id: `phyto-${idx}`,
          substance: p.nomLatin || p.nom,
          nomFrancais: p.nom,
          type: "plante",
          forme: p.forme || "EPS",
          posologie: p.posologie,
          duree: p.duree,
          axeCible: p.indication,
          mecanisme: p.pedagogicalHint || p.indication,
          priorite: 1,
        });
      });
    }

    // Gemmothérapie
    if (scope.gemmotherapie && prescription.gemmotherapie) {
      prescription.gemmotherapie.forEach((g: any, idx: number) => {
        voletEndobiogenique.push({
          id: `gemmo-${idx}`,
          substance: g.nomLatin || g.nom,
          nomFrancais: g.nom,
          type: "gemmo",
          forme: "MG",
          posologie: g.posologie,
          duree: g.duree,
          axeCible: g.indication,
          mecanisme: g.pedagogicalHint || g.indication,
          priorite: 1,
        });
      });
    }

    // Aromathérapie
    if (scope.aromatherapie && prescription.aromatherapie) {
      prescription.aromatherapie.forEach((a: any, idx: number) => {
        voletPhytoElargi.push({
          id: `aroma-${idx}`,
          substance: a.nomLatin || a.huile,
          nomFrancais: a.huile,
          type: "HE",
          forme: `HE - ${a.voie}`,
          posologie: a.posologie,
          duree: a.duree,
          axeCible: a.indication,
          mecanisme: a.pedagogicalHint || a.indication,
          precautions: a.precautions,
          priorite: 2,
        });
      });
    }

    // Oligo-éléments et supplémentation
    if (scope.micronutrition) {
      // Depuis la prescription
      if (prescription.oligoElements) {
        prescription.oligoElements.forEach((o: any, idx: number) => {
          voletComplements.push({
            id: `oligo-${idx}`,
            substance: o.element,
            type: "mineral",
            forme: o.forme || "gélule",
            posologie: o.posologie,
            duree: "3 mois",
            axeCible: o.indication,
            priorite: 2,
          });
        });
      }

      // Depuis la spasmophilie (supplémentation spécifique)
      if (spasmophilie?.supplementation) {
        const supp = spasmophilie.supplementation;
        if (supp.magnesium) {
          voletComplements.push({
            id: "spasmophilie-mg",
            substance: "Magnésium",
            type: "mineral",
            forme: supp.magnesium.forme,
            posologie: supp.magnesium.posologie,
            duree: supp.magnesium.duree,
            axeCible: "Terrain spasmophile",
            priorite: 1,
          });
        }
        if (supp.vitamineD) {
          voletComplements.push({
            id: "spasmophilie-vitd",
            substance: "Vitamine D3",
            type: "vitamine",
            forme: supp.vitamineD.forme,
            posologie: supp.vitamineD.posologie,
            duree: supp.vitamineD.duree,
            axeCible: "Terrain spasmophile",
            priorite: 1,
          });
        }
        if (supp.calcium) {
          voletComplements.push({
            id: "spasmophilie-ca",
            substance: "Calcium",
            type: "mineral",
            forme: supp.calcium.forme,
            posologie: supp.calcium.posologie,
            duree: supp.calcium.duree,
            axeCible: "Terrain spasmophile",
            priorite: 2,
          });
        }
        if (supp.vitamineB6) {
          voletComplements.push({
            id: "spasmophilie-b6",
            substance: "Vitamine B6",
            type: "vitamine",
            forme: "gélule",
            posologie: supp.vitamineB6.posologie,
            duree: supp.vitamineB6.duree,
            axeCible: "Terrain spasmophile",
            priorite: 2,
          });
        }
      }
    }

    // ==========================================
    // ÉTAPE 3: CONSTRUIRE LA SYNTHÈSE CLINIQUE
    // ==========================================
    let syntheseClinique = `## Synthèse Clinique Endobiogénique\n\n`;
    syntheseClinique += `**Terrain**: ${synthesis.terrain?.type} - ${synthesis.terrain?.justification}\n\n`;
    syntheseClinique += `**Équilibre neuro-végétatif**: ${synthesis.neuroVegetative?.status} (${synthesis.neuroVegetative?.dominance})\n\n`;

    if (drainage?.necessite) {
      syntheseClinique += `### Drainage\n`;
      syntheseClinique += `Priorité: ${drainage.priorite} - ${drainage.strategieDrainage}\n\n`;
    }

    if (spasmophilie && spasmophilie.severite !== 'Absent') {
      syntheseClinique += `### Spasmophilie\n`;
      syntheseClinique += `Score: ${spasmophilie.score}/100 - ${spasmophilie.severite}\n`;
      syntheseClinique += `${spasmophilie.pedagogicalHint}\n\n`;
    }

    syntheseClinique += `### Stratégie thérapeutique\n`;
    if (synthesis.therapeuticStrategy?.priorites) {
      synthesis.therapeuticStrategy.priorites.forEach((p: string) => {
        syntheseClinique += `- ${p}\n`;
      });
    }

    // Conseils
    const conseilsAssocies = [
      ...(prescription.conseilsHygiene || []),
      ...(prescription.conseilsAlimentaires || []),
      ...(spasmophilie?.conseilsSpecifiques || []),
    ];

    // Surveillance
    const surveillanceBiologique = synthesis.warnings || [];

    // ==========================================
    // ÉTAPE 4: SAUVEGARDER L'ORDONNANCE
    // ==========================================
    console.log("\n💾 Sauvegarde en base de données...");

    const derniereBdf = patient.bdfAnalyses[0];

    const ordonnance = await prisma.ordonnance.create({
      data: {
        patientId: patient.id,
        bdfAnalysisId: derniereBdf?.id || null,

        // Structure en 3 volets
        voletEndobiogenique,
        voletPhytoElargi,
        voletComplements,

        // Métadonnées
        scope: scope,
        syntheseClinique,
        conseilsAssocies,
        surveillanceBiologique,

        statut: "brouillon",
      },
    });

    console.log("✅ Ordonnance créée:", ordonnance.id);

    // ==========================================
    // ÉTAPE 5: CONSTRUIRE LES AXES PERTURBÉS POUR LA RÉPONSE
    // ==========================================
    const axesPerturbés = synthesis.endocrineAxes
      ?.filter((a: any) => a.status !== 'Normo')
      .map((a: any) => ({
        axe: a.axis.toLowerCase(),
        niveau: a.status.toLowerCase(),
        score: 7,
        justification: a.mechanism,
      })) || [];

    // Ajouter drainage comme "axe" si nécessaire
    if (drainage?.necessite) {
      axesPerturbés.unshift({
        axe: "drainage",
        niveau: drainage.priorite,
        score: 8,
        justification: drainage.strategieDrainage,
      });
    }

    // Ajouter spasmophilie comme "axe" si présente
    if (spasmophilie && spasmophilie.severite !== 'Absent') {
      axesPerturbés.push({
        axe: "spasmophilie",
        niveau: spasmophilie.severite.toLowerCase(),
        score: Math.round(spasmophilie.score / 10),
        justification: spasmophilie.pedagogicalHint,
      });
    }

    // ==========================================
    // ÉTAPE 6: LOG ET RETOURNER LA RÉPONSE
    // ==========================================
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("📋 RÉSULTATS");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`Volet Endobiogénique: ${voletEndobiogenique.length} recommandations`);
    console.log(`Volet Phyto élargi: ${voletPhytoElargi.length} recommandations`);
    console.log(`Volet Compléments: ${voletComplements.length} recommandations`);
    console.log(`Conseils: ${conseilsAssocies.length}`);

    return NextResponse.json(
      {
        ordonnance: {
          id: ordonnance.id,
          voletEndobiogenique: ordonnance.voletEndobiogenique,
          voletPhytoElargi: ordonnance.voletPhytoElargi,
          voletComplements: ordonnance.voletComplements,
          syntheseClinique: ordonnance.syntheseClinique,
          conseilsAssocies: ordonnance.conseilsAssocies,
          surveillanceBiologique: ordonnance.surveillanceBiologique,
          statut: ordonnance.statut,
          createdAt: ordonnance.createdAt.toISOString(),
        },
        // Métadonnées du raisonnement
        raisonnement: {
          axesPerturbés,
          hypothesesRegulatrices: synthesis.therapeuticStrategy?.priorites || [],
          alertes: synthesis.warnings?.map((w: string) => ({
            niveau: "info",
            type: "terrain",
            message: w,
          })) || [],
          terrain: synthesis.terrain,
          drainage: drainage,
          spasmophilie: spasmophilie,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Erreur génération ordonnance:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
