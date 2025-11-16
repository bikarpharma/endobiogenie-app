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

// Axe fusionné = extension d'AxePerturbation
export interface FusedAxePerturbation extends AxePerturbation {
  sources: {
    clinique: boolean;
    bdf: boolean;
    rag: boolean;
  };
  confiance: "faible" | "moderee" | "elevee";
  commentaireFusion?: string;
}

// Helper : récupérer info RAG pour un axe
function getRagForAxe(rag: RagContext | undefined, axe: RagAxeInsight["axe"]): RagAxeInsight | undefined {
  if (!rag?.axes) return undefined;
  return rag.axes.find(a => a.axe === axe);
}

/**
 * Fusionne interrogatoire (scores cliniques) + BdF + RAG
 * pour produire une liste d'axes perturbés avec niveau et confiance.
 */
export function fuseClinicalBdfRag(
  inter: InterrogatoireEndobiogenique,
  clinical: ClinicalAxeScores,
  bdf: BdfIndexes,
  rag?: RagContext
): FusedAxePerturbation[] {
  const result: FusedAxePerturbation[] = [];

  // --------------------------
  // AXE THYROÏDIEN
  // --------------------------

  const bdfThy = bdf.indexThyroidien;
  let bdfThyNiveau: "hypo" | "hyper" | "normal" = "normal";
  if (typeof bdfThy === "number") {
    if (bdfThy < SEUILS_BDF.indexThyroidien.hypo) bdfThyNiveau = "hypo";
    else if (bdfThy > SEUILS_BDF.indexThyroidien.hyper) bdfThyNiveau = "hyper";
  }

  const clinThy = clinical.thyroidien.orientation; // "hypometabolisme" | "hypermetabolisme" | "normal"

  const ragThy = getRagForAxe(rag, "thyroidien");

  // Décision thyroïdienne
  if (clinThy !== "normal" || bdfThyNiveau !== "normal" || ragThy) {
    let niveau: "hypo" | "hyper" = "hypo";
    const votes: string[] = [];

    if (clinThy === "hypometabolisme") votes.push("hypo");
    if (clinThy === "hypermetabolisme") votes.push("hyper");
    if (bdfThyNiveau === "hypo" || bdfThyNiveau === "hyper") votes.push(bdfThyNiveau);
    if (ragThy?.niveau === "hypo" || ragThy?.niveau === "hyper") votes.push(ragThy.niveau);

    // vote majoritaire simple
    const hypoCount = votes.filter(v => v === "hypo").length;
    const hyperCount = votes.filter(v => v === "hyper").length;
    if (hyperCount > hypoCount) niveau = "hyper";

    // score & confiance
    const nbSources =
      (clinThy !== "normal" ? 1 : 0) +
      (bdfThyNiveau !== "normal" ? 1 : 0) +
      (ragThy ? 1 : 0);

    let score = 4;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    } else if (nbSources === 3) {
      score = 8;
      confiance = "elevee";
    }

    const justifications: string[] = [];
    if (clinThy !== "normal") justifications.push(`Clinique: ${clinThy}`);
    if (bdfThyNiveau !== "normal" && typeof bdfThy === "number") justifications.push(`BdF: Index thyroïdien ${bdfThy.toFixed(2)} (${bdfThyNiveau})`);
    if (ragThy) justifications.push(`RAG: ${ragThy.niveau || 'détecté'}`);

    result.push({
      axe: "thyroidien",
      niveau,
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinThy !== "normal",
        bdf: bdfThyNiveau !== "normal",
        rag: !!ragThy,
      },
      confiance,
      commentaireFusion: ragThy?.commentaire,
    });
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

  const clinAdapt = clinical.adaptatif.orientation; // "hyperadaptatif" | "hypoadaptatif" | "equilibre"
  const ragAdapt = getRagForAxe(rag, "corticotrope");

  if (clinAdapt !== "equilibre" || bdfAdaptNiveau !== "normal" || ragAdapt) {
    let niveau: "hyper" | "hypo" = "hyper";
    const votes: string[] = [];

    if (clinAdapt === "hyperadaptatif") votes.push("hyper");
    if (clinAdapt === "hypoadaptatif") votes.push("hypo");
    if (bdfAdaptNiveau === "hyper" || bdfAdaptNiveau === "hypo") votes.push(bdfAdaptNiveau);
    if (ragAdapt?.niveau === "hyper" || ragAdapt?.niveau === "hypo") votes.push(ragAdapt.niveau);

    const hyperCount = votes.filter(v => v === "hyper").length;
    const hypoCount = votes.filter(v => v === "hypo").length;
    if (hypoCount > hyperCount) niveau = "hypo";

    const nbSources =
      (clinAdapt !== "equilibre" ? 1 : 0) +
      (bdfAdaptNiveau !== "normal" ? 1 : 0) +
      (ragAdapt ? 1 : 0);

    let score = 4;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    } else if (nbSources === 3) {
      score = 8;
      confiance = "elevee";
    }

    const justifications: string[] = [];
    if (clinAdapt !== "equilibre") justifications.push(`Clinique: ${clinAdapt}`);
    if (bdfAdaptNiveau !== "normal" && typeof bdfAdapt === "number") justifications.push(`BdF: Index adaptation ${bdfAdapt.toFixed(2)} (${bdfAdaptNiveau})`);
    if (ragAdapt) justifications.push(`RAG: ${ragAdapt.niveau || 'détecté'}`);

    result.push({
      axe: "corticotrope",
      niveau,
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinAdapt !== "equilibre",
        bdf: bdfAdaptNiveau !== "normal",
        rag: !!ragAdapt,
      },
      confiance,
      commentaireFusion: ragAdapt?.commentaire,
    });
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

  const clinGon = clinical.gonadique.orientation; // hypo/hyper/normal/...

  const ragGon = getRagForAxe(rag, "gonadique");

  if (clinGon !== "normal" || bdfGenNiveau !== "normal" || ragGon) {
    let niveau: "hypo" | "hyper" = "hypo";
    const votes: string[] = [];

    if (clinGon === "hypogonadisme") votes.push("hypo");
    if (clinGon === "hypergonadisme") votes.push("hyper");
    if (bdfGenNiveau === "hypo" || bdfGenNiveau === "hyper") votes.push(bdfGenNiveau);
    if (ragGon?.niveau === "hypo" || ragGon?.niveau === "hyper") votes.push(ragGon.niveau);

    const hypoCount = votes.filter(v => v === "hypo").length;
    const hyperCount = votes.filter(v => v === "hyper").length;
    if (hyperCount > hypoCount) niveau = "hyper";

    const nbSources =
      (clinGon !== "normal" ? 1 : 0) +
      (bdfGenNiveau !== "normal" ? 1 : 0) +
      (ragGon ? 1 : 0);

    let score = 4;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    } else if (nbSources === 3) {
      score = 8;
      confiance = "elevee";
    }

    const justifications: string[] = [];
    if (clinGon !== "normal") justifications.push(`Clinique: ${clinGon}`);
    if (bdfGenNiveau !== "normal" && typeof bdfGen === "number") justifications.push(`BdF: Index génital ${bdfGen.toFixed(0)} (${bdfGenNiveau})`);
    if (ragGon) justifications.push(`RAG: ${ragGon.niveau || 'détecté'}`);

    result.push({
      axe: "gonadotrope",
      niveau,
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinGon !== "normal",
        bdf: bdfGenNiveau !== "normal",
        rag: !!ragGon,
      },
      confiance,
      commentaireFusion: ragGon?.commentaire,
    });
  }

  // --------------------------
  // AXE DIGESTIF
  // --------------------------

  const ragDig = getRagForAxe(rag, "digestif");

  if (clinical.digestif.dysbiose >= 2 || clinical.digestif.lenteur >= 2 || clinical.digestif.inflammation >= 1 || ragDig) {
    const nbSources =
      (clinical.digestif.dysbiose >= 2 || clinical.digestif.lenteur >= 2 || clinical.digestif.inflammation >= 1 ? 1 : 0) +
      (ragDig ? 1 : 0);

    let score = 5;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    }

    const justifications: string[] = [];
    if (clinical.digestif.dysbiose >= 2) justifications.push(`Dysbiose clinique (score ${clinical.digestif.dysbiose})`);
    if (clinical.digestif.lenteur >= 2) justifications.push(`Lenteur digestive (score ${clinical.digestif.lenteur})`);
    if (clinical.digestif.inflammation >= 1) justifications.push(`Inflammation digestive`);
    if (ragDig) justifications.push(`RAG: ${ragDig.niveau || 'détecté'}`);

    result.push({
      axe: "somatotrope", // ou créer un type "digestif" selon votre modèle
      niveau: "hyper", // hyperréactivité digestive
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinical.digestif.dysbiose >= 2 || clinical.digestif.lenteur >= 2,
        bdf: false,
        rag: !!ragDig,
      },
      confiance,
      commentaireFusion: ragDig?.commentaire,
    });
  }

  // --------------------------
  // AXE IMMUNO-INFLAMMATOIRE
  // --------------------------

  const ragImmuno = getRagForAxe(rag, "immunitaire");

  if (clinical.immunoInflammatoire.hyper >= 2 || clinical.immunoInflammatoire.hypo >= 1 || ragImmuno) {
    let niveau: "hyper" | "hypo" = "hyper";
    if (clinical.immunoInflammatoire.hypo > clinical.immunoInflammatoire.hyper) niveau = "hypo";

    const nbSources =
      (clinical.immunoInflammatoire.hyper >= 2 || clinical.immunoInflammatoire.hypo >= 1 ? 1 : 0) +
      (ragImmuno ? 1 : 0);

    let score = 5;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    }

    const justifications: string[] = [];
    if (clinical.immunoInflammatoire.hyper >= 2) justifications.push(`Hyperréactivité immune (score ${clinical.immunoInflammatoire.hyper})`);
    if (clinical.immunoInflammatoire.hypo >= 1) justifications.push(`Hyporéactivité immune (infections récidivantes)`);
    if (ragImmuno) justifications.push(`RAG: ${ragImmuno.niveau || 'détecté'}`);

    result.push({
      axe: "somatotrope", // ou créer axe spécifique "immunitaire"
      niveau,
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinical.immunoInflammatoire.hyper >= 2 || clinical.immunoInflammatoire.hypo >= 1,
        bdf: false,
        rag: !!ragImmuno,
      },
      confiance,
      commentaireFusion: ragImmuno?.commentaire,
    });
  }

  // --------------------------
  // AXE NEUROVÉGÉTATIF
  // --------------------------

  const ragNV = getRagForAxe(rag, "neurovegetatif");

  if (clinical.neuroVegetatif.orientation !== "equilibre" || ragNV) {
    let niveau: "hyper" | "hypo" = "hyper";
    if (clinical.neuroVegetatif.orientation === "parasympathicotonique") niveau = "hypo";

    const nbSources =
      (clinical.neuroVegetatif.orientation !== "equilibre" ? 1 : 0) +
      (ragNV ? 1 : 0);

    let score = 5;
    let confiance: FusedAxePerturbation["confiance"] = "faible";
    if (nbSources === 1) {
      score = 4;
      confiance = "faible";
    } else if (nbSources === 2) {
      score = 6;
      confiance = "moderee";
    }

    const justifications: string[] = [];
    if (clinical.neuroVegetatif.orientation === "sympathicotonique") {
      justifications.push(`Sympathicotonie (score ${clinical.neuroVegetatif.sympathetic})`);
    } else if (clinical.neuroVegetatif.orientation === "parasympathicotonique") {
      justifications.push(`Parasympathicotonie (score ${clinical.neuroVegetatif.parasympathetic})`);
    }
    if (ragNV) justifications.push(`RAG: ${ragNV.niveau || 'détecté'}`);

    result.push({
      axe: "somatotrope", // ou créer axe "neurovegetatif"
      niveau,
      score,
      justification: justifications.join(" | "),
      sources: {
        clinique: clinical.neuroVegetatif.orientation !== "equilibre",
        bdf: false,
        rag: !!ragNV,
      },
      confiance,
      commentaireFusion: ragNV?.commentaire,
    });
  }

  // --------------------------
  // AXES DE VIE (STRESS CHRONIQUE / RYTHMES)
  // --------------------------

  if (clinical.axesVie.stressChronique >= 1 || clinical.axesVie.traumatismes >= 1 || clinical.rythmes.desynchronisation >= 1) {
    const score =
      clinical.axesVie.stressChronique * 2 +
      clinical.axesVie.traumatismes * 2 +
      clinical.rythmes.desynchronisation +
      clinical.axesVie.sommeil;

    const justifications: string[] = [];
    if (clinical.axesVie.stressChronique >= 1) justifications.push("Traumatisme majeur historique");
    if (clinical.axesVie.traumatismes >= 1) justifications.push("Burnout passé");
    if (clinical.rythmes.desynchronisation >= 1) justifications.push("Désynchronisation circadienne");
    if (clinical.axesVie.sommeil >= 1) justifications.push("Qualité de sommeil mauvaise");

    result.push({
      axe: "corticotrope", // Le stress chronique impacte principalement l'axe corticotrope
      niveau: "hyper",
      score: Math.min(score, 10),
      justification: `Contexte de vie: ${justifications.join(" | ")}`,
      sources: {
        clinique: true,
        bdf: false,
        rag: false,
      },
      confiance: "moderee",
      commentaireFusion: "Perturbation liée au contexte de vie et aux rythmes",
    });
  }

  // Retour final
  return result;
}
