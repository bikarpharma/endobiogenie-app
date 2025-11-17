// lib/ordonnance/fusionClinique.ts

import { InterrogatoireEndobiogenique } from "../interrogatoire/types";
import { ClinicalAxeScores } from "../interrogatoire/clinicalScoring";
import { AxePerturbation } from "../ordonnance/types";
import { SEUILS_BDF } from "../ordonnance/constants";

// Types pour représenter la BdF et le RAG pour la fusion

export interface BdfIndexes {
  indexThyroidien?: number;
  indexAdaptation?: number;
  indexGenital?: number;
  indexGenitoThyroidien?: number;
  indexOestrogenique?: number;
  indexTurnover?: number;
  indexRendementThyroidien?: number;
  indexRemodelageOsseux?: number;
  [key: string]: number | undefined;
}

export interface RagAxeInsight {
  axe: "thyroidien" | "corticotrope" | "gonadique" | "digestif" | "immunitaire" | "neurovegetatif";
  niveau?: string;      // ex: "hypo", "hyper", "hyperreactif"
  commentaire?: string; // texte RAG
}

export interface RagContext {
  axes?: RagAxeInsight[];
  resume?: string;
}

// Type pour les interprétations IA stockées
export interface StoredInterpretation {
  orientation: string;
  mecanismes: string[];
  prudences: string[];
  modulateurs: string[];
  resumeClinique: string;
  confiance: number;
}

// Axe fusionné = extension d'AxePerturbation
export interface FusedAxePerturbation extends AxePerturbation {
  sources: {
    clinique: boolean;
    bdf: boolean;
    rag: boolean;
    ia: boolean; // Nouvelle source : interprétation IA stockée
  };
  confiance: "faible" | "moderee" | "elevee";
  commentaireFusion?: string;
  interpretationIA?: StoredInterpretation; // Référence à l'interprétation IA si disponible
}

// Helper : récupérer info RAG pour un axe
function getRagForAxe(rag: RagContext | undefined, axe: RagAxeInsight["axe"]): RagAxeInsight | undefined {
  if (!rag?.axes) return undefined;
  return rag.axes.find(a => a.axe === axe);
}

// Helper : analyser l'orientation IA pour détecter hypo/hyper
function analyzeAIOrientation(aiInterpretation: StoredInterpretation | undefined): { hasHypo: boolean; hasHyper: boolean } {
  if (!aiInterpretation) return { hasHypo: false, hasHyper: false };

  const orientationLower = aiInterpretation.orientation.toLowerCase();
  const hasHypo = orientationLower.includes("hypo") || orientationLower.includes("déficit") || orientationLower.includes("insuffisance");
  const hasHyper = orientationLower.includes("hyper") || orientationLower.includes("excès") || orientationLower.includes("suractivité");

  return { hasHypo, hasHyper };
}

/**
 * Fusionne interrogatoire (scores cliniques) + BdF + RAG + Interprétations IA
 * pour produire une liste d'axes perturbés avec niveau et confiance.
 *
 * NIVEAU 2 DE LA FUSION : utilise les interprétations IA pré-calculées (Niveau 1)
 * comme source supplémentaire pour affiner le raisonnement thérapeutique
 *
 * PARAMÈTRES OPTIONNELS :
 * - inter et clinical peuvent être null (BdF seule)
 * - bdf peut être vide {} (interrogatoire seul)
 * - Au moins une source doit être disponible
 */
export function fuseClinicalBdfRag(
  inter: InterrogatoireEndobiogenique | null,
  clinical: ClinicalAxeScores | null,
  bdf: BdfIndexes,
  rag?: RagContext,
  aiInterpretations?: Record<string, StoredInterpretation> // Nouvelle source : interprétations IA stockées
): FusedAxePerturbation[] {
  const result: FusedAxePerturbation[] = [];

  const hasInterrogatoire = !!(inter && clinical);
  const hasBdf = Object.values(bdf).some(v => v !== undefined && v !== null);
  const hasIA = Object.keys(aiInterpretations || {}).length > 0;

  console.log(`📊 [Fusion Niveau 2] Sources disponibles:`)
  console.log(`   - Interrogatoire: ${hasInterrogatoire ? '✅' : '❌'}`);
  console.log(`   - BdF: ${hasBdf ? '✅' : '❌'}`);
  console.log(`   - IA: ${hasIA ? `✅ (${Object.keys(aiInterpretations || {}).length} axes)` : '❌'}`);
  console.log(`   - RAG: ${rag?.resume ? '✅' : '❌'}`);

  // --------------------------
  // AXE THYROÏDIEN
  // --------------------------

  const bdfThy = bdf.indexThyroidien;
  let bdfThyNiveau: "hypo" | "hyper" | "normal" = "normal";
  if (typeof bdfThy === "number") {
    if (bdfThy < SEUILS_BDF.indexThyroidien.hypo) bdfThyNiveau = "hypo";
    else if (bdfThy > SEUILS_BDF.indexThyroidien.hyper) bdfThyNiveau = "hyper";
  }

  const clinThy = clinical?.thyroidien.orientation || "normal"; // "hypometabolisme" | "hypermetabolisme" | "normal"

  const ragThy = getRagForAxe(rag, "thyroidien");

  // Nouvelle source : Interprétation IA stockée
  const aiThy = aiInterpretations?.["thyroidien"];

  // Décision thyroïdienne
  if (clinThy !== "normal" || bdfThyNiveau !== "normal" || ragThy || aiThy) {
    let niveau: "hypo" | "hyper" = "hypo";
    const votes: string[] = [];

    if (clinThy === "hypometabolisme") votes.push("hypo");
    if (clinThy === "hypermetabolisme") votes.push("hyper");
    if (bdfThyNiveau === "hypo" || bdfThyNiveau === "hyper") votes.push(bdfThyNiveau);
    if (ragThy?.niveau === "hypo" || ragThy?.niveau === "hyper") votes.push(ragThy.niveau);

    // Intégrer l'IA : analyse de l'orientation pour détecter hypo/hyper
    if (aiThy) {
      const orientationLower = aiThy.orientation.toLowerCase();
      if (orientationLower.includes("hypo") || orientationLower.includes("hypothyroid")) votes.push("hypo");
      if (orientationLower.includes("hyper") || orientationLower.includes("hyperthyroid")) votes.push("hyper");
    }

    // vote majoritaire simple
    const hypoCount = votes.filter(v => v === "hypo").length;
    const hyperCount = votes.filter(v => v === "hyper").length;
    if (hyperCount > hypoCount) niveau = "hyper";

    // score & confiance
    const nbSources =
      (clinThy !== "normal" ? 1 : 0) +
      (bdfThyNiveau !== "normal" ? 1 : 0) +
      (ragThy ? 1 : 0) +
      (aiThy ? 1 : 0);

    let score = 4;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    } else if (nbSources >= 3) {
      score = 8;
      confiance = "elevee";
    }

    // Booster score si IA très confiante (>0.85)
    if (aiThy && aiThy.confiance > 0.85) {
      score = Math.min(10, score + 1);
      confiance = "elevee";
    }

    const justifications: string[] = [];
    if (clinThy !== "normal") justifications.push(`Clinique: ${clinThy}`);
    if (bdfThyNiveau !== "normal" && typeof bdfThy === "number") justifications.push(`BdF: Index thyroïdien ${bdfThy.toFixed(2)} (${bdfThyNiveau})`);
    if (ragThy) justifications.push(`RAG: ${ragThy.niveau || 'détecté'}`);
    if (aiThy) justifications.push(`IA: ${aiThy.orientation.substring(0, 60)}...`);

    result.push({
      axe: "thyroidien",
      niveau,
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinThy !== "normal",
        bdf: bdfThyNiveau !== "normal",
        rag: !!ragThy,
        ia: !!aiThy,
      },
      confiance,
      commentaireFusion: ragThy?.commentaire,
      interpretationIA: aiThy,
    });

    if (aiThy) {
      console.log(`  ✅ Thyroïdien: Interprétation IA intégrée (confiance: ${aiThy.confiance})`);
    }
  }

  // --------------------------
  // AXE ADAPTATIF / CORTICOTROPE
  // --------------------------

  const bdfAdapt = bdf.indexAdaptation;
  let bdfAdaptNiveau: "hyper" | "hypo" | "normal" = "normal";
  if (typeof bdfAdapt === "number") {
    if (bdfAdapt < SEUILS_BDF.indexAdaptation.hyper) bdfAdaptNiveau = "hyper"; // < 0.4 = orientation ACTH forte
    else if (bdfAdapt > SEUILS_BDF.indexAdaptation.hypo) bdfAdaptNiveau = "hypo"; // > 0.7 = orientation FSH
  }

  const clinAdapt = clinical?.adaptatif.orientation || "equilibre"; // "hyperadaptatif" | "hypoadaptatif" | "equilibre"
  const ragAdapt = getRagForAxe(rag, "corticotrope");
  const aiAdapt = aiInterpretations?.["adaptatif"];

  if (clinAdapt !== "equilibre" || bdfAdaptNiveau !== "normal" || ragAdapt || aiAdapt) {
    let niveau: "hyper" | "hypo" = "hyper";
    const votes: string[] = [];

    if (clinAdapt === "hyperadaptatif") votes.push("hyper");
    if (clinAdapt === "hypoadaptatif") votes.push("hypo");
    if (bdfAdaptNiveau === "hyper" || bdfAdaptNiveau === "hypo") votes.push(bdfAdaptNiveau);
    if (ragAdapt?.niveau === "hyper" || ragAdapt?.niveau === "hypo") votes.push(ragAdapt.niveau);

    // Intégrer l'IA
    if (aiAdapt) {
      const aiOrientation = analyzeAIOrientation(aiAdapt);
      if (aiOrientation.hasHypo) votes.push("hypo");
      if (aiOrientation.hasHyper) votes.push("hyper");
    }

    const hyperCount = votes.filter(v => v === "hyper").length;
    const hypoCount = votes.filter(v => v === "hypo").length;
    if (hypoCount > hyperCount) niveau = "hypo";

    const nbSources =
      (clinAdapt !== "equilibre" ? 1 : 0) +
      (bdfAdaptNiveau !== "normal" ? 1 : 0) +
      (ragAdapt ? 1 : 0) +
      (aiAdapt ? 1 : 0);

    let score = 4;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    } else if (nbSources >= 3) {
      score = 8;
      confiance = "elevee";
    }

    // Booster score si IA très confiante
    if (aiAdapt && aiAdapt.confiance > 0.85) {
      score = Math.min(10, score + 1);
      confiance = "elevee";
    }

    const justifications: string[] = [];
    if (clinAdapt !== "equilibre") justifications.push(`Clinique: ${clinAdapt}`);
    if (bdfAdaptNiveau !== "normal" && typeof bdfAdapt === "number") justifications.push(`BdF: Index adaptation ${bdfAdapt.toFixed(2)} (${bdfAdaptNiveau})`);
    if (ragAdapt) justifications.push(`RAG: ${ragAdapt.niveau || 'détecté'}`);
    if (aiAdapt) justifications.push(`IA: ${aiAdapt.orientation.substring(0, 60)}...`);

    result.push({
      axe: "corticotrope",
      niveau,
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinAdapt !== "equilibre",
        bdf: bdfAdaptNiveau !== "normal",
        rag: !!ragAdapt,
        ia: !!aiAdapt,
      },
      confiance,
      commentaireFusion: ragAdapt?.commentaire,
      interpretationIA: aiAdapt,
    });

    if (aiAdapt) {
      console.log(`  ✅ Adaptatif: Interprétation IA intégrée (confiance: ${aiAdapt.confiance})`);
    }
  }

  // --------------------------
  // AXE GONADIQUE
  // --------------------------

  const bdfGen = bdf.indexGenital;
  let bdfGenNiveau: "hypo" | "hyper" | "normal" = "normal";
  if (typeof bdfGen === "number") {
    if (bdfGen < SEUILS_BDF.indexGenital.hypo) bdfGenNiveau = "hypo";
    else if (bdfGen > SEUILS_BDF.indexGenital.hyper) bdfGenNiveau = "hyper";
  }

  const clinGon = clinical?.gonadique.orientation || "normal";
  const ragGon = getRagForAxe(rag, "gonadique");
  const aiGonad = aiInterpretations?.["gonadique"];

  if (clinGon !== "normal" || bdfGenNiveau !== "normal" || ragGon || aiGonad) {
    let niveau: "hypo" | "hyper" = "hypo";
    const votes: string[] = [];

    if (clinGon === "hypogonadisme") votes.push("hypo");
    if (clinGon === "hypergonadisme") votes.push("hyper");
    if (bdfGenNiveau === "hypo" || bdfGenNiveau === "hyper") votes.push(bdfGenNiveau);
    if (ragGon?.niveau === "hypo" || ragGon?.niveau === "hyper") votes.push(ragGon.niveau);

    // Intégrer l'IA
    if (aiGonad) {
      const aiOrientation = analyzeAIOrientation(aiGonad);
      if (aiOrientation.hasHypo) votes.push("hypo");
      if (aiOrientation.hasHyper) votes.push("hyper");
    }

    const hypoCount = votes.filter(v => v === "hypo").length;
    const hyperCount = votes.filter(v => v === "hyper").length;
    if (hyperCount > hypoCount) niveau = "hyper";

    const nbSources =
      (clinGon !== "normal" ? 1 : 0) +
      (bdfGenNiveau !== "normal" ? 1 : 0) +
      (ragGon ? 1 : 0) +
      (aiGonad ? 1 : 0);

    let score = 4;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    } else if (nbSources >= 3) {
      score = 8;
      confiance = "elevee";
    }

    // Booster score si IA très confiante
    if (aiGonad && aiGonad.confiance > 0.85) {
      score = Math.min(10, score + 1);
      confiance = "elevee";
    }

    const justifications: string[] = [];
    if (clinGon !== "normal") justifications.push(`Clinique: ${clinGon}`);
    if (bdfGenNiveau !== "normal" && typeof bdfGen === "number") justifications.push(`BdF: Index génital ${bdfGen.toFixed(0)} (${bdfGenNiveau})`);
    if (ragGon) justifications.push(`RAG: ${ragGon.niveau || 'détecté'}`);
    if (aiGonad) justifications.push(`IA: ${aiGonad.orientation.substring(0, 60)}...`);

    result.push({
      axe: "gonadotrope",
      niveau,
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinGon !== "normal",
        bdf: bdfGenNiveau !== "normal",
        rag: !!ragGon,
        ia: !!aiGonad,
      },
      confiance,
      commentaireFusion: ragGon?.commentaire,
      interpretationIA: aiGonad,
    });

    if (aiGonad) {
      console.log(`  ✅ Gonadique: Interprétation IA intégrée (confiance: ${aiGonad.confiance})`);
    }
  }

  // --------------------------
  // AXE DIGESTIF
  // --------------------------

  const ragDig = getRagForAxe(rag, "digestif");
  const aiDigestif = aiInterpretations?.["digestif"];

  const clinDigestifPerturbé = clinical ? (clinical.digestif.dysbiose >= 2 || clinical.digestif.lenteur >= 2 || clinical.digestif.inflammation >= 1) : false;

  if (clinDigestifPerturbé || ragDig || aiDigestif) {
    const nbSources =
      (clinDigestifPerturbé ? 1 : 0) +
      (ragDig ? 1 : 0) +
      (aiDigestif ? 1 : 0);

    let score = 5;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    } else if (nbSources >= 3) {
      score = 8;
      confiance = "elevee";
    }

    // Booster score si IA très confiante
    if (aiDigestif && aiDigestif.confiance > 0.85) {
      score = Math.min(10, score + 1);
      confiance = "elevee";
    }

    const justifications: string[] = [];
    if (clinical && clinical.digestif.dysbiose >= 2) justifications.push(`Dysbiose clinique (score ${clinical.digestif.dysbiose})`);
    if (clinical && clinical.digestif.lenteur >= 2) justifications.push(`Lenteur digestive (score ${clinical.digestif.lenteur})`);
    if (clinical && clinical.digestif.inflammation >= 1) justifications.push(`Inflammation digestive`);
    if (ragDig) justifications.push(`RAG: ${ragDig.niveau || 'détecté'}`);
    if (aiDigestif) justifications.push(`IA: ${aiDigestif.orientation.substring(0, 60)}...`);

    result.push({
      axe: "somatotrope",
      niveau: "hyper",
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinDigestifPerturbé,
        bdf: false,
        rag: !!ragDig,
        ia: !!aiDigestif,
      },
      confiance,
      commentaireFusion: ragDig?.commentaire,
      interpretationIA: aiDigestif,
    });

    if (aiDigestif) {
      console.log(`  ✅ Digestif: Interprétation IA intégrée (confiance: ${aiDigestif.confiance})`);
    }
  }

  // --------------------------
  // AXE IMMUNO-INFLAMMATOIRE
  // --------------------------

  const ragImmuno = getRagForAxe(rag, "immunitaire");
  const aiImmuno = aiInterpretations?.["immuno"];

  const clinImmunoPerturbé = clinical ? (clinical.immunoInflammatoire.hyper >= 2 || clinical.immunoInflammatoire.hypo >= 1) : false;

  if (clinImmunoPerturbé || ragImmuno || aiImmuno) {
    let niveau: "hyper" | "hypo" = "hyper";
    const votes: string[] = [];

    if (clinical && clinical.immunoInflammatoire.hyper >= 2) votes.push("hyper");
    if (clinical && clinical.immunoInflammatoire.hypo >= 1) votes.push("hypo");
    if (ragImmuno?.niveau === "hyper" || ragImmuno?.niveau === "hypo") votes.push(ragImmuno.niveau);

    // Intégrer l'IA
    if (aiImmuno) {
      const aiOrientation = analyzeAIOrientation(aiImmuno);
      if (aiOrientation.hasHypo) votes.push("hypo");
      if (aiOrientation.hasHyper) votes.push("hyper");
    }

    const hypoCount = votes.filter(v => v === "hypo").length;
    const hyperCount = votes.filter(v => v === "hyper").length;
    if (hypoCount > hyperCount) niveau = "hypo";

    const nbSources =
      (clinImmunoPerturbé ? 1 : 0) +
      (ragImmuno ? 1 : 0) +
      (aiImmuno ? 1 : 0);

    let score = 5;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    } else if (nbSources >= 3) {
      score = 8;
      confiance = "elevee";
    }

    // Booster score si IA très confiante
    if (aiImmuno && aiImmuno.confiance > 0.85) {
      score = Math.min(10, score + 1);
      confiance = "elevee";
    }

    const justifications: string[] = [];
    if (clinical && clinical.immunoInflammatoire.hyper >= 2) justifications.push(`Hyperréactivité immune (score ${clinical.immunoInflammatoire.hyper})`);
    if (clinical && clinical.immunoInflammatoire.hypo >= 1) justifications.push(`Hyporéactivité immune (infections récidivantes)`);
    if (ragImmuno) justifications.push(`RAG: ${ragImmuno.niveau || 'détecté'}`);
    if (aiImmuno) justifications.push(`IA: ${aiImmuno.orientation.substring(0, 60)}...`);

    result.push({
      axe: "somatotrope",
      niveau,
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinImmunoPerturbé,
        bdf: false,
        rag: !!ragImmuno,
        ia: !!aiImmuno,
      },
      confiance,
      commentaireFusion: ragImmuno?.commentaire,
      interpretationIA: aiImmuno,
    });

    if (aiImmuno) {
      console.log(`  ✅ Immuno: Interprétation IA intégrée (confiance: ${aiImmuno.confiance})`);
    }
  }

  // --------------------------
  // AXE NEUROVÉGÉTATIF
  // --------------------------

  const ragNV = getRagForAxe(rag, "neurovegetatif");
  const aiNeuro = aiInterpretations?.["neurovegetatif"];

  const clinNVOrientation = clinical?.neuroVegetatif.orientation || "equilibre";

  if (clinNVOrientation !== "equilibre" || ragNV || aiNeuro) {
    let niveau: "hyper" | "hypo" = "hyper";
    const votes: string[] = [];

    if (clinNVOrientation === "sympathicotonique") votes.push("hyper");
    if (clinNVOrientation === "parasympathicotonique") votes.push("hypo");
    if (ragNV?.niveau === "hyper" || ragNV?.niveau === "hypo") votes.push(ragNV.niveau);

    // Intégrer l'IA
    if (aiNeuro) {
      const aiOrientation = analyzeAIOrientation(aiNeuro);
      if (aiOrientation.hasHypo) votes.push("hypo");
      if (aiOrientation.hasHyper) votes.push("hyper");
    }

    const hypoCount = votes.filter(v => v === "hypo").length;
    const hyperCount = votes.filter(v => v === "hyper").length;
    if (hypoCount > hyperCount) niveau = "hypo";

    const nbSources =
      (clinNVOrientation !== "equilibre" ? 1 : 0) +
      (ragNV ? 1 : 0) +
      (aiNeuro ? 1 : 0);

    let score = 5;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    } else if (nbSources >= 3) {
      score = 8;
      confiance = "elevee";
    }

    // Booster score si IA très confiante
    if (aiNeuro && aiNeuro.confiance > 0.85) {
      score = Math.min(10, score + 1);
      confiance = "elevee";
    }

    const justifications: string[] = [];
    if (clinical && clinNVOrientation === "sympathicotonique") {
      justifications.push(`Sympathicotonie (score ${clinical.neuroVegetatif.sympathetic})`);
    } else if (clinical && clinNVOrientation === "parasympathicotonique") {
      justifications.push(`Parasympathicotonie (score ${clinical.neuroVegetatif.parasympathetic})`);
    }
    if (ragNV) justifications.push(`RAG: ${ragNV.niveau || 'détecté'}`);
    if (aiNeuro) justifications.push(`IA: ${aiNeuro.orientation.substring(0, 60)}...`);

    result.push({
      axe: "somatotrope",
      niveau,
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinNVOrientation !== "equilibre",
        bdf: false,
        rag: !!ragNV,
        ia: !!aiNeuro,
      },
      confiance,
      commentaireFusion: ragNV?.commentaire,
      interpretationIA: aiNeuro,
    });

    if (aiNeuro) {
      console.log(`  ✅ Neurovégétatif: Interprétation IA intégrée (confiance: ${aiNeuro.confiance})`);
    }
  }

  // --------------------------
  // AXES DE VIE (STRESS CHRONIQUE / RYTHMES)
  // --------------------------

  const aiRythmes = aiInterpretations?.["rythmes"];
  const aiAxesVie = aiInterpretations?.["axesdevie"];

  const clinAxesViePerturbé = clinical ? (clinical.axesVie.stressChronique >= 1 || clinical.axesVie.traumatismes >= 1 || clinical.rythmes.desynchronisation >= 1) : false;

  if (clinAxesViePerturbé || aiRythmes || aiAxesVie) {
    let score = clinical ? (
      clinical.axesVie.stressChronique * 2 +
      clinical.axesVie.traumatismes * 2 +
      clinical.rythmes.desynchronisation +
      clinical.axesVie.sommeil
    ) : 4;

    // Boost score si IA présente et très confiante
    if ((aiRythmes && aiRythmes.confiance > 0.85) || (aiAxesVie && aiAxesVie.confiance > 0.85)) {
      score = Math.min(10, score + 1);
    }

    const justifications: string[] = [];
    if (clinical && clinical.axesVie.stressChronique >= 1) justifications.push("Traumatisme majeur historique");
    if (clinical && clinical.axesVie.traumatismes >= 1) justifications.push("Burnout passé");
    if (clinical && clinical.rythmes.desynchronisation >= 1) justifications.push("Désynchronisation circadienne");
    if (clinical && clinical.axesVie.sommeil >= 1) justifications.push("Qualité de sommeil mauvaise");
    if (aiRythmes) justifications.push(`IA Rythmes: ${aiRythmes.orientation.substring(0, 40)}...`);
    if (aiAxesVie) justifications.push(`IA Axes vie: ${aiAxesVie.orientation.substring(0, 40)}...`);

    result.push({
      axe: "corticotrope",
      niveau: "hyper",
      score: Math.min(score, 10),
      justification: `Contexte de vie: ${justifications.join(" | ")}`,
      sources: {
        clinique: true,
        bdf: false,
        rag: false,
        ia: !!(aiRythmes || aiAxesVie),
      },
      confiance: (aiRythmes || aiAxesVie) ? "elevee" : "moderee",
      commentaireFusion: "Perturbation liée au contexte de vie et aux rythmes",
      interpretationIA: aiAxesVie || aiRythmes,
    });

    if (aiRythmes) {
      console.log(`  ✅ Rythmes: Interprétation IA intégrée (confiance: ${aiRythmes.confiance})`);
    }
    if (aiAxesVie) {
      console.log(`  ✅ Axes de vie: Interprétation IA intégrée (confiance: ${aiAxesVie.confiance})`);
    }
  }

  // Retour final
  return result;
}
