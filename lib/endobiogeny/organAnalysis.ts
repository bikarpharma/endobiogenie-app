/**
 * 🧠 CERVEAU MÉDICAL - Analyse Endobiogénique des Organes
 * 
 * Ce fichier centralise toute la logique d'interprétation clinique.
 * Basé sur la Théorie de l'Endobiogénie (Dr. Lapraz & Duraffourd)
 * 
 * Chaque organe est analysé selon:
 * - Son axe endocrinien principal
 * - Les données BdF (Biology of Functions)
 * - Les scores de l'interrogatoire clinique
 */

import type { UnifiedAnalysisOutput, EndocrineAxis, EmonctoireVS } from "@/types/clinical-engine";

// ============================================
// TYPES
// ============================================

export type OrganStatus = "OPTIMAL" | "HYPER" | "HYPO" | "CONGESTION" | "EPUISEMENT" | "DYSFONCTION" | "UNKNOWN";
export type SeverityLevel = "normal" | "warning" | "critical" | "exhausted";

export interface OrganAnalysis {
  id: string;
  label: string;
  status: OrganStatus;
  severity: SeverityLevel;
  color: string;
  glowColor: string;
  pulse: boolean;
  
  // Contenu pédagogique (basé sur l'endobiogénie)
  title: string;
  axisName: string;
  mechanism: string;        // Le POURQUOI (Physiologie)
  clinicalSigns: string[];  // Le QUOI (Observation)
  therapeuticHint?: string; // Le COMMENT (Stratégie)
  
  // Données brutes pour affichage
  score?: number;
  biomarkers?: string[];
}

export interface AxisFlowData {
  id: string;
  name: string;
  fromOrgan: string;
  toOrgans: string[];
  color: string;
  status: "active" | "hyper" | "hypo" | "normal";
  description: string;
}

// ============================================
// COULEURS MÉDICALES
// ============================================

const COLORS = {
  // États
  hyper: { main: "#ef4444", glow: "rgba(239, 68, 68, 0.6)" },      // Rouge - Hyperfonction
  hypo: { main: "#3b82f6", glow: "rgba(59, 130, 246, 0.6)" },      // Bleu - Hypofonction
  congestion: { main: "#f97316", glow: "rgba(249, 115, 22, 0.6)" }, // Orange - Congestion
  epuisement: { main: "#6366f1", glow: "rgba(99, 102, 241, 0.6)" }, // Indigo - Épuisement
  optimal: { main: "#10b981", glow: "rgba(16, 185, 129, 0.4)" },    // Vert - Normal
  unknown: { main: "#64748b", glow: "rgba(100, 116, 139, 0.3)" },   // Gris - Non évalué
  
  // Organes spéciaux
  brain: { main: "#a78bfa", glow: "rgba(167, 139, 250, 0.6)" },     // Violet - Cerveau
  gonad: { main: "#ec4899", glow: "rgba(236, 72, 153, 0.5)" },      // Rose - Gonades
  lung: { main: "#06b6d4", glow: "rgba(6, 182, 212, 0.5)" },        // Cyan - Poumons
};

// ============================================
// ANALYSE PAR ORGANE
// ============================================

/**
 * Analyse complète d'un organe basée sur la synthèse IA
 */
export function analyzeOrganFromSynthesis(
  organId: string,
  synthesis: UnifiedAnalysisOutput | null
): OrganAnalysis {
  
  if (!synthesis) {
    return createDefaultAnalysis(organId);
  }

  switch (organId.toLowerCase()) {
    // ══════════════════════════════════════════
    // CERVEAU - Centre de Commande Hypothalamique
    // ══════════════════════════════════════════
    case "cerveau":
      return analyzeBrain(synthesis);

    // ══════════════════════════════════════════
    // SURRÉNALES - Axe Corticotrope
    // ══════════════════════════════════════════
    case "surrenales":
      return analyzeAdrenals(synthesis);

    // ══════════════════════════════════════════
    // THYROÏDE - Axe Thyréotrope
    // ══════════════════════════════════════════
    case "thyroide":
      return analyzeThyroid(synthesis);

    // ══════════════════════════════════════════
    // GONADES - Axe Gonadotrope
    // ══════════════════════════════════════════
    case "gonades":
      return analyzeGonads(synthesis);

    // ══════════════════════════════════════════
    // CŒUR - Système Neurovégétatif
    // ══════════════════════════════════════════
    case "coeur":
      return analyzeHeart(synthesis);

    // ══════════════════════════════════════════
    // FOIE - Émonctoire Principal
    // ══════════════════════════════════════════
    case "foie":
      return analyzeLiver(synthesis);

    // ══════════════════════════════════════════
    // INTESTINS - Émonctoire Digestif
    // ══════════════════════════════════════════
    case "intestins":
      return analyzeIntestines(synthesis);

    // ══════════════════════════════════════════
    // REINS - Émonctoire Hydrique
    // ══════════════════════════════════════════
    case "reins":
      return analyzeKidneys(synthesis);

    // ══════════════════════════════════════════
    // POUMONS - Émonctoire Respiratoire
    // ══════════════════════════════════════════
    case "poumons":
      return analyzeLungs(synthesis);

    // ══════════════════════════════════════════
    // PANCRÉAS - Métabolisme Glucidique (Somatotrope)
    // ══════════════════════════════════════════
    case "pancreas":
      return analyzePancreas(synthesis);

    // ══════════════════════════════════════════
    // ESTOMAC - Digestion Haute
    // ══════════════════════════════════════════
    case "estomac":
      return analyzeStomach(synthesis);

    // ══════════════════════════════════════════
    // RATE - Système Lymphatique
    // ══════════════════════════════════════════
    case "rate":
      return analyzeSpleen(synthesis);

    default:
      return createDefaultAnalysis(organId);
  }
}

// ============================================
// ANALYSES SPÉCIFIQUES PAR ORGANE
// ============================================

function analyzeBrain(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const terrain = synthesis.terrain;
  const neuroVeg = synthesis.neuroVegetative;
  const spasmophilie = synthesis.spasmophilie;

  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let mechanism = "L'hypothalamus intègre les stimuli limbiques et régule les axes hypothalamo-hypophysaires. Centre de commande de l'adaptation.";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;

  // Analyse du profil SNA
  if (neuroVeg?.status === "Sympathicotonia") {
    status = "HYPER";
    severity = "warning";
    mechanism = "Dominance sympathique : l'hypothalamus favorise la mobilisation énergétique et l'état d'alerte. Libération excessive de CRH.";
    clinicalSigns = ["Hypervigilance", "Difficultés d'endormissement", "Tension nerveuse", "Tachycardie de repos"];
    therapeuticHint = "Calmer le sympathique (Passiflora, Tilia). Soutenir la régénération nocturne.";
  } else if (neuroVeg?.status === "Parasympathicotonia") {
    status = "HYPO";
    severity = "warning";
    mechanism = "Dominance vagale : ralentissement des fonctions d'adaptation. Prédominance de la récupération sur l'action.";
    clinicalSigns = ["Fatigue matinale", "Hypotension", "Digestion lente", "Tendance dépressive"];
    therapeuticHint = "Stimuler le tonus (Rosmarinus, Mentha). Soutenir les surrénales.";
  } else if (neuroVeg?.status === "Dystonia") {
    status = "DYSFONCTION";
    severity = "critical";
    mechanism = "Dysrégulation du SNA : alternance anarchique entre phases sympathiques et parasympathiques. Perte de l'homéostasie.";
    clinicalSigns = ["Labilité émotionnelle", "Troubles du sommeil", "Variations tensionnelles", "Fatigue chronique"];
    therapeuticHint = "Rééquilibrer le SNA (Crataegus). Magnésium + B6. Cohérence cardiaque.";
  }

  // Spasmophilie
  if (spasmophilie && spasmophilie.severite !== "Absent" && spasmophilie.score > 50) {
    severity = spasmophilie.severite === "Sévère" ? "critical" : "warning";
    clinicalSigns.push("Terrain spasmophile", "Hyperexcitabilité neuromusculaire");
    therapeuticHint = (therapeuticHint || "") + " Magnésium marin + Taurine.";
  }

  return {
    id: "cerveau",
    label: "Cerveau",
    status,
    severity,
    color: COLORS.brain.main,
    glowColor: COLORS.brain.glow,
    pulse: severity === "critical",
    title: `Commande Centrale - ${neuroVeg?.status || "Équilibré"}`,
    axisName: "Centre Hypothalamique",
    mechanism,
    clinicalSigns,
    therapeuticHint,
    score: spasmophilie?.score,
  };
}

function analyzeAdrenals(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const corticoAxis = findAxis(synthesis.endocrineAxes, "Corticotrope");
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = COLORS.optimal.main;
  let glowColor = COLORS.optimal.glow;
  let mechanism = "Les surrénales assurent l'adaptation au stress par la production de cortisol (mobilisation énergétique) et DHEA (protection structurelle).";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  if (corticoAxis) {
    const axisStatus = corticoAxis.status?.toLowerCase();
    
    if (axisStatus?.includes("hyper")) {
      status = "HYPER";
      severity = "critical";
      color = COLORS.hyper.main;
      glowColor = COLORS.hyper.glow;
      pulse = true;
      mechanism = "Sollicitation excessive de l'axe ACTH-Cortisol. L'organisme mobilise ses réserves structurelles pour répondre à une agression perçue (phase d'ALARME).";
      clinicalSigns = [
        "Agitation, irritabilité",
        "Insomnie d'endormissement",
        "Hypertension",
        "Catabolisme protéique",
        "Glycémie instable"
      ];
      therapeuticHint = "Ne PAS stimuler ! Soutenir la capacité tampon (Ficus carica Bg). Calmer le sympathique (Tilia, Passiflora). Protéger la structure (Ribes nigrum).";
    } else if (axisStatus?.includes("hypo") || axisStatus?.includes("dysfonctionnel")) {
      status = "EPUISEMENT";
      severity = "exhausted";
      color = COLORS.epuisement.main;
      glowColor = COLORS.epuisement.glow;
      mechanism = "Inertie métabolique surrénalienne. La glande ne répond plus aux stimuli hypothalamiques (résistance à l'ACTH ou effondrement des réserves). Phase d'ÉPUISEMENT.";
      clinicalSigns = [
        "Asthénie matinale profonde",
        "Hypotension orthostatique",
        "Terrain allergique/atopique",
        "Inflammations chroniques",
        "Hypoglycémies réactionnelles"
      ];
      therapeuticHint = "Relance DOUCE nécessaire. Adaptogènes (Eleutherococcus, Rhodiola). Gemmothérapie : Quercus robur + Ribes nigrum. Vitamine C + Pantothénate.";
    }
  }

  return {
    id: "surrenales",
    label: "Surrénales",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: corticoAxis ? `Axe Corticotrope - ${corticoAxis.status}` : "Axe Corticotrope",
    axisName: "Corticotrope",
    mechanism,
    clinicalSigns,
    therapeuticHint,
    score: corticoAxis?.score,
    biomarkers: corticoAxis?.biomarkers,
  };
}

function analyzeThyroid(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const thyroAxis = findAxis(synthesis.endocrineAxes, "Thyréotrope");
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = COLORS.optimal.main;
  let glowColor = COLORS.optimal.glow;
  let mechanism = "La thyroïde gère le rendement énergétique cellulaire (T3/T4). Elle régule le temps métabolique : oxydation du glucose et production d'ATP.";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  if (thyroAxis) {
    const axisStatus = thyroAxis.status?.toLowerCase();
    
    if (axisStatus?.includes("hyper")) {
      status = "HYPER";
      severity = "critical";
      color = COLORS.hyper.main;
      glowColor = COLORS.hyper.glow;
      pulse = true;
      mechanism = "Passage en force de l'axe TRH-TSH. Accélération du rendement métabolique cellulaire et de la consommation d'oxygène. Catabolisme excessif.";
      clinicalSigns = [
        "Tachycardie, palpitations",
        "Thermophobie (intolérance chaleur)",
        "Anxiété, nervosité",
        "Perte de poids avec appétit conservé",
        "Transit accéléré"
      ];
      therapeuticHint = "Freiner l'axe (Lycopus europaeus). Calmer (Crataegus). Vérifier le freinage gonadotrope. Éviter les stimulants.";
    } else if (axisStatus?.includes("hypo") || axisStatus?.includes("blocage")) {
      status = "HYPO";
      severity = "warning";
      color = COLORS.hypo.main;
      glowColor = COLORS.hypo.glow;
      mechanism = "Réduction adaptative des échanges cellulaires pour préserver la structure. Mécanisme de survie en cas de carence ou stress chronique.";
      clinicalSigns = [
        "Frilosité",
        "Constipation",
        "Rétention hydrique (mucinose)",
        "Bradycardie",
        "Fatigue, ralentissement psychique"
      ];
      therapeuticHint = "Soutenir la conversion T4→T3 (Sélénium, Zinc). Fucus vesiculosus (iode naturel). Vérifier fer et B12.";
    }
  }

  return {
    id: "thyroide",
    label: "Thyroïde",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: thyroAxis ? `Axe Thyréotrope - ${thyroAxis.status}` : "Axe Thyréotrope - Euthyroïdie",
    axisName: "Thyréotrope",
    mechanism,
    clinicalSigns,
    therapeuticHint,
    score: thyroAxis?.score,
    biomarkers: thyroAxis?.biomarkers,
  };
}

function analyzeGonads(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const gonadoAxis = findAxis(synthesis.endocrineAxes, "Gonadotrope");
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = COLORS.optimal.main;
  let glowColor = COLORS.optimal.glow;
  let mechanism = "L'axe gonadotrope initie le métabolisme protéique. FSH/LH régulent œstrogènes, progestérone et androgènes : construction et maintien de la structure.";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  if (gonadoAxis) {
    const axisStatus = gonadoAxis.status?.toLowerCase();
    
    if (axisStatus?.includes("hyper")) {
      status = "HYPER";
      severity = "warning";
      color = COLORS.gonad.main;
      glowColor = COLORS.gonad.glow;
      pulse = true;
      mechanism = "Hyperstimulation gonadotrope. Déséquilibre FSH/LH avec dominance œstrogénique ou androgénique excessive.";
      clinicalSigns = [
        "SPM marqué",
        "Mastodynie",
        "Hyperandrogénie (acné, hirsutisme)",
        "Cycles irréguliers",
        "Irritabilité prémenstruelle"
      ];
      therapeuticHint = "Moduler (Vitex agnus-castus). Soutenir la progestérone en 2ème partie de cycle. Drainer le foie (métabolisme œstrogènes).";
    } else if (axisStatus?.includes("hypo")) {
      status = "HYPO";
      severity = "warning";
      color = COLORS.hypo.main;
      glowColor = COLORS.hypo.glow;
      mechanism = "Insuffisance gonadotrope. Déficit en initiation du métabolisme protéique. Impact sur la structure (os, muscles, muqueuses).";
      clinicalSigns = [
        "Aménorrhée ou oligoménorrhée",
        "Sécheresse des muqueuses",
        "Baisse de libido",
        "Fatigue structurelle",
        "Ostéopénie"
      ];
      therapeuticHint = "Soutenir l'axe (Tribulus, Maca). Gemmothérapie : Rubus idaeus (F) ou Sequoia (H). Vérifier les surrénales.";
    }
  }

  return {
    id: "gonades",
    label: "Gonades",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: gonadoAxis ? `Axe Gonadotrope - ${gonadoAxis.status}` : "Axe Gonadotrope",
    axisName: "Gonadotrope",
    mechanism,
    clinicalSigns,
    therapeuticHint,
    score: gonadoAxis?.score,
    biomarkers: gonadoAxis?.biomarkers,
  };
}

function analyzeHeart(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const neuroVeg = synthesis.neuroVegetative;
  const terrain = synthesis.terrain;
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = COLORS.optimal.main;
  let glowColor = COLORS.optimal.glow;
  let mechanism = "Le cœur est le reflet de l'équilibre neurovégétatif. Il intègre les influences sympathiques (accélération) et parasympathiques (ralentissement).";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  if (neuroVeg?.status === "Sympathicotonia" || terrain?.profilSNA === "Sympathicotonique") {
    status = "HYPER";
    severity = "warning";
    color = COLORS.hyper.main;
    glowColor = COLORS.hyper.glow;
    pulse = true;
    mechanism = "Dominance sympathique cardiaque. Augmentation de la fréquence et de la force de contraction. Risque d'épuisement myocardique.";
    clinicalSigns = [
      "Tachycardie de repos",
      "Palpitations",
      "HTA systolique",
      "Extrasystoles de stress",
      "Oppression thoracique"
    ];
    therapeuticHint = "Crataegus (régulateur). Passiflora + Tilia (sédatifs). Magnésium (relaxant). Cohérence cardiaque.";
  } else if (neuroVeg?.status === "Parasympathicotonia" || terrain?.profilSNA === "Vagotonique") {
    status = "HYPO";
    severity = "warning";
    color = COLORS.hypo.main;
    glowColor = COLORS.hypo.glow;
    mechanism = "Dominance vagale cardiaque. Ralentissement du rythme. Risque de malaises vagaux et hypotension.";
    clinicalSigns = [
      "Bradycardie",
      "Hypotension",
      "Lipothymies",
      "Fatigue à l'effort",
      "Extrémités froides"
    ];
    therapeuticHint = "Stimuler le tonus (Rosmarinus). Gingembre. Éviter les positions prolongées. Hydratation + sel si hypotension.";
  }

  return {
    id: "coeur",
    label: "Cœur",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: `Équilibre Neurovégétatif - ${neuroVeg?.status || "Eutonie"}`,
    axisName: "Système Nerveux Autonome",
    mechanism,
    clinicalSigns,
    therapeuticHint,
  };
}

function analyzeLiver(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const drainage = synthesis.drainage;
  const foieData = findEmonctoire(drainage?.emonctoires, "foie");
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = COLORS.optimal.main;
  let glowColor = COLORS.optimal.glow;
  let mechanism = "Le foie est le carrefour métabolique central. Il assure la détoxification (Phase I/II), le métabolisme hormonal et la production de bile.";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  if (foieData?.statut === "sature") {
    status = "CONGESTION";
    severity = "critical";
    color = COLORS.congestion.main;
    glowColor = COLORS.congestion.glow;
    pulse = true;
    mechanism = "Saturation des capacités de conjugaison hépatique. Stase veineuse portale. Impact sur le retour veineux au cœur droit et sur le métabolisme hormonal.";
    clinicalSigns = [
      "Réveils nocturnes (1h-3h)",
      "Dyspepsie, nausées matinales",
      "Céphalées, migraines",
      "Fatigue post-prandiale",
      "Langue chargée"
    ];
    therapeuticHint = "Drainage PRIORITAIRE : Rosmarinus + Cynara + Taraxacum. Cholagogues (Chelidonium). Diète hypotoxique. Drainage 3 semaines avant toute relance hormonale.";
  } else if (foieData?.statut === "sollicite") {
    status = "CONGESTION";
    severity = "warning";
    color = COLORS.congestion.main;
    glowColor = COLORS.congestion.glow;
    mechanism = "Sollicitation accrue du foie. Signes de ralentissement de la fonction de détoxification. Risque de saturation si non traité.";
    clinicalSigns = [
      "Digestion lente",
      "Inconfort post-prandial",
      "Teint brouillé",
      "Sensibilité aux odeurs"
    ];
    therapeuticHint = "Drainage préventif : Desmodium + Chardon-Marie. Artichaut avant les repas. Réduire alcool et graisses saturées.";
  }

  return {
    id: "foie",
    label: "Foie",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: foieData ? `Émonctoire Hépatique - ${foieData.statut === "sature" ? "Saturé" : foieData.statut === "sollicite" ? "Sollicité" : "Fonctionnel"}` : "Émonctoire Hépatique",
    axisName: "Drainage / Métabolisme",
    mechanism,
    clinicalSigns,
    therapeuticHint,
    score: foieData?.score,
  };
}

function analyzeIntestines(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const drainage = synthesis.drainage;
  const intestinData = findEmonctoire(drainage?.emonctoires, "intestin");
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = COLORS.optimal.main;
  let glowColor = COLORS.optimal.glow;
  let mechanism = "L'intestin assure l'absorption des nutriments et constitue le siège du microbiote. Interface majeure entre l'extérieur et l'intérieur.";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  if (intestinData?.statut === "sature") {
    status = "DYSFONCTION";
    severity = "critical";
    color = COLORS.congestion.main;
    glowColor = COLORS.congestion.glow;
    pulse = true;
    mechanism = "Dysbiose intestinale majeure. Hyperperméabilité probable. Inflammation locale avec répercussions systémiques (foie, immunité, cerveau).";
    clinicalSigns = [
      "Ballonnements, gaz",
      "Alternance diarrhée/constipation",
      "Fatigue chronique",
      "Intolérances alimentaires",
      "Troubles de l'humeur"
    ];
    therapeuticHint = "Restaurer la barrière : Glutamine + Zinc. Probiotiques ciblés. Bouillon d'os. Éviction temporaire gluten/lactose. Gemmothérapie : Juglans regia.";
  } else if (intestinData?.statut === "sollicite") {
    status = "CONGESTION";
    severity = "warning";
    color = COLORS.congestion.main;
    glowColor = COLORS.congestion.glow;
    mechanism = "Déséquilibre du microbiote en cours. Transit perturbé. Fermentation excessive ou putréfaction.";
    clinicalSigns = [
      "Inconfort digestif",
      "Transit irrégulier",
      "Flatulences"
    ];
    therapeuticHint = "Prébiotiques (inuline). Fibres douces. Mastication prolongée. Gestion du stress (axe intestin-cerveau).";
  }

  return {
    id: "intestins",
    label: "Intestins",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: intestinData ? `Microbiote - ${intestinData.statut === "sature" ? "Dysbiose" : intestinData.statut === "sollicite" ? "Déséquilibre" : "Équilibré"}` : "Microbiote Intestinal",
    axisName: "Émonctoire Digestif",
    mechanism,
    clinicalSigns,
    therapeuticHint,
    score: intestinData?.score,
  };
}

function analyzeKidneys(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const drainage = synthesis.drainage;
  const reinData = findEmonctoire(drainage?.emonctoires, "rein");
  const corticoAxis = findAxis(synthesis.endocrineAxes, "Corticotrope");
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = COLORS.optimal.main;
  let glowColor = COLORS.optimal.glow;
  let mechanism = "Les reins filtrent le sang et éliminent les déchets azotés. Régulation hydro-électrolytique en lien avec les minéralocorticoïdes (aldostérone).";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  // Lien avec l'épuisement surrénalien
  if (corticoAxis?.status?.toLowerCase().includes("hypo")) {
    status = "HYPO";
    severity = "warning";
    color = COLORS.hypo.main;
    glowColor = COLORS.hypo.glow;
    mechanism = "Filtration rénale ralentie en contexte d'épuisement surrénalien. Déficit en aldostérone = rétention potassique, fuite sodée.";
    clinicalSigns = [
      "Œdèmes discrets",
      "Urines peu concentrées",
      "Fatigue rénale",
      "Hypotension"
    ];
    therapeuticHint = "Soutenir les surrénales d'abord. Solidago + Orthosiphon. Hydratation adéquate.";
  } else if (reinData?.statut === "sature" || reinData?.statut === "sollicite") {
    status = "CONGESTION";
    severity = reinData.statut === "sature" ? "critical" : "warning";
    color = COLORS.congestion.main;
    glowColor = COLORS.congestion.glow;
    mechanism = "Surcharge de filtration rénale. Accumulation de déchets azotés. Risque d'insuffisance fonctionnelle.";
    clinicalSigns = [
      "Urines troubles",
      "Lombalgie sourde",
      "Rétention hydrique",
      "Cernes marqués"
    ];
    therapeuticHint = "Drainage rénal : Piloselle + Orthosiphon. Réduire protéines animales. Hydratation ++.";
  }

  return {
    id: "reins",
    label: "Reins",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: "Émonctoire Rénal",
    axisName: "Filtration / Corticotrope",
    mechanism,
    clinicalSigns,
    therapeuticHint,
    score: reinData?.score,
  };
}

function analyzeLungs(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const drainage = synthesis.drainage;
  const poumonData = findEmonctoire(drainage?.emonctoires, "poumon");
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = COLORS.lung.main;
  let glowColor = COLORS.lung.glow;
  let mechanism = "Les poumons éliminent le CO2 issu de l'oxydation cellulaire. Lien direct avec l'axe thyréotrope (taux métabolique) et l'immunité muqueuse.";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  // Vérifier si saturation pulmonaire
  if (poumonData?.statut === "sature" || poumonData?.statut === "sollicite") {
    status = "CONGESTION";
    severity = poumonData.statut === "sature" ? "critical" : "warning";
    color = COLORS.congestion.main;
    glowColor = COLORS.congestion.glow;
    pulse = poumonData.statut === "sature";
    mechanism = "Surcharge de l'émonctoire pulmonaire. Excès de mucus ou inflammation chronique. Terrain allergique ou infectieux récurrent.";
    clinicalSigns = [
      "Toux chronique",
      "Encombrement bronchique",
      "Infections ORL récidivantes",
      "Dyspnée d'effort"
    ];
    therapeuticHint = "Drainage pulmonaire : Plantago + Eucalyptus. Immunité : Échinacée. Gemmothérapie : Viburnum lantana (antispasmodique bronchique).";
  }

  return {
    id: "poumons",
    label: "Poumons",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: "Émonctoire Pulmonaire",
    axisName: "Thyréotrope / Immunité",
    mechanism,
    clinicalSigns,
    therapeuticHint,
    score: poumonData?.score,
  };
}

function analyzePancreas(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const somatoAxis = findAxis(synthesis.endocrineAxes, "Somatotrope");
  const drainage = synthesis.drainage;
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = COLORS.optimal.main;
  let glowColor = COLORS.optimal.glow;
  let mechanism = "Le pancréas endocrine régule la glycémie (insuline/glucagon). Il appartient à l'axe somatotrope qui gère la croissance et l'utilisation finale des métabolites.";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  // Vérifier résistance insulinique
  if (somatoAxis?.status?.toLowerCase().includes("dysfonctionnel") || 
      (drainage?.emonctoires?.some(e => e.organe === "foie" && e.statut === "sature"))) {
    status = "DYSFONCTION";
    severity = "warning";
    color = COLORS.congestion.main;
    glowColor = COLORS.congestion.glow;
    mechanism = "Déséquilibre insuline/glucagon. Résistance insulinique périphérique probable. Lien avec la surcharge hépatique et le stress chronique.";
    clinicalSigns = [
      "Fringales sucrées",
      "Coups de fatigue post-prandiaux",
      "Prise de poids abdominale",
      "Glycémie à jeun limite haute"
    ];
    therapeuticHint = "Cannelle + Chrome + Berbérine. Réduire index glycémique. Activité physique régulière. Gérer le stress (cortisol → insulino-résistance).";
  }

  return {
    id: "pancreas",
    label: "Pancréas",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: somatoAxis ? `Métabolisme Glucidique - ${somatoAxis.status}` : "Métabolisme Glucidique",
    axisName: "Somatotrope",
    mechanism,
    clinicalSigns,
    therapeuticHint,
    score: somatoAxis?.score,
  };
}

function analyzeStomach(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const neuroVeg = synthesis.neuroVegetative;
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = COLORS.optimal.main;
  let glowColor = COLORS.optimal.glow;
  let mechanism = "L'estomac assure la digestion protéique (HCl + pepsine). Son fonctionnement est sous contrôle vagal (parasympathique).";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  if (neuroVeg?.status === "Sympathicotonia") {
    status = "HYPO";
    severity = "warning";
    color = COLORS.hypo.main;
    glowColor = COLORS.hypo.glow;
    mechanism = "Hypochlorhydrie fonctionnelle par inhibition vagale (stress sympathique). Mauvaise digestion des protéines et stérilisation gastrique déficiente.";
    clinicalSigns = [
      "Digestion lente",
      "Pesanteur post-prandiale",
      "Reflux paradoxal (par fermentation)",
      "Ballonnements hauts"
    ];
    therapeuticHint = "Stimuler la sécrétion : Gentiane + Artichaut avant repas. Éviter de boire pendant les repas. Gestion du stress.";
  } else if (neuroVeg?.status === "Parasympathicotonia") {
    status = "HYPER";
    severity = "warning";
    color = COLORS.hyper.main;
    glowColor = COLORS.hyper.glow;
    mechanism = "Hypersécrétion gastrique par dominance vagale. Risque d'ulcération si terrain anxieux associé.";
    clinicalSigns = [
      "Acidité, brûlures",
      "Faim excessive",
      "Nausées matinales",
      "Gastrite"
    ];
    therapeuticHint = "Protecteurs : Réglisse DGL + Aloe vera. Alcaliniser : jus de pomme de terre. Lithothamne.";
  }

  return {
    id: "estomac",
    label: "Estomac",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: "Digestion Gastrique",
    axisName: "Neurovégétatif / Vagal",
    mechanism,
    clinicalSigns,
    therapeuticHint,
  };
}

function analyzeSpleen(synthesis: UnifiedAnalysisOutput): OrganAnalysis {
  const drainage = synthesis.drainage;
  const lympheData = findEmonctoire(drainage?.emonctoires, "lymphe");
  
  let status: OrganStatus = "OPTIMAL";
  let severity: SeverityLevel = "normal";
  let color = "#8b5cf6"; // Violet pour la rate
  let glowColor = "rgba(139, 92, 246, 0.5)";
  let mechanism = "La rate filtre le sang et participe à l'immunité. Le système lymphatique draine les toxines tissulaires.";
  let clinicalSigns: string[] = [];
  let therapeuticHint: string | undefined;
  let pulse = false;

  if (lympheData?.statut === "sature" || lympheData?.statut === "sollicite") {
    status = "CONGESTION";
    severity = lympheData.statut === "sature" ? "critical" : "warning";
    color = COLORS.congestion.main;
    glowColor = COLORS.congestion.glow;
    mechanism = "Stase lymphatique. Accumulation de toxines dans les tissus. Déficit de drainage et d'immunité tissulaire.";
    clinicalSigns = [
      "Ganglions palpables",
      "Cellulite, rétention",
      "Infections récidivantes",
      "Fatigue immunitaire"
    ];
    therapeuticHint = "Drainage lymphatique : Calendula + Phytolacca. Gemmothérapie : Castanea vesca. Activité physique douce. Brossage à sec.";
  }

  return {
    id: "rate",
    label: "Rate / Lymphe",
    status,
    severity,
    color,
    glowColor,
    pulse,
    title: "Système Lymphatique",
    axisName: "Immunité / Drainage",
    mechanism,
    clinicalSigns,
    therapeuticHint,
    score: lympheData?.score,
  };
}

// ============================================
// FLUX DES AXES (pour les lignes animées)
// ============================================

/**
 * Génère les données de flux pour les axes endocriniens
 */
export function getAxisFlows(synthesis: UnifiedAnalysisOutput | null): AxisFlowData[] {
  const flows: AxisFlowData[] = [];

  if (!synthesis) return flows;

  // Axe Corticotrope : Cerveau → Surrénales
  const cortico = findAxis(synthesis.endocrineAxes, "Corticotrope");
  if (cortico) {
    flows.push({
      id: "corticotrope",
      name: "Axe Corticotrope",
      fromOrgan: "cerveau",
      toOrgans: ["surrenales"],
      color: cortico.status?.includes("Hyper") ? COLORS.hyper.main : 
             cortico.status?.includes("Hypo") ? COLORS.hypo.main : COLORS.optimal.main,
      status: cortico.status?.includes("Hyper") ? "hyper" : 
              cortico.status?.includes("Hypo") ? "hypo" : "normal",
      description: "CRH → ACTH → Cortisol/DHEA",
    });
  }

  // Axe Thyréotrope : Cerveau → Thyroïde
  const thyreo = findAxis(synthesis.endocrineAxes, "Thyréotrope");
  if (thyreo) {
    flows.push({
      id: "thyreotrope",
      name: "Axe Thyréotrope",
      fromOrgan: "cerveau",
      toOrgans: ["thyroide"],
      color: thyreo.status?.includes("Hyper") ? COLORS.hyper.main : 
             thyreo.status?.includes("Hypo") ? COLORS.hypo.main : COLORS.optimal.main,
      status: thyreo.status?.includes("Hyper") ? "hyper" : 
              thyreo.status?.includes("Hypo") ? "hypo" : "normal",
      description: "TRH → TSH → T3/T4",
    });
  }

  // Axe Gonadotrope : Cerveau → Gonades
  const gonado = findAxis(synthesis.endocrineAxes, "Gonadotrope");
  if (gonado) {
    flows.push({
      id: "gonadotrope",
      name: "Axe Gonadotrope",
      fromOrgan: "cerveau",
      toOrgans: ["gonades"],
      color: gonado.status?.includes("Hyper") ? COLORS.gonad.main : 
             gonado.status?.includes("Hypo") ? COLORS.hypo.main : COLORS.optimal.main,
      status: gonado.status?.includes("Hyper") ? "hyper" : 
              gonado.status?.includes("Hypo") ? "hypo" : "normal",
      description: "GnRH → FSH/LH → Œstrogènes/Progestérone/Androgènes",
    });
  }

  // Axe Somatotrope : Cerveau → Pancréas (+ Foie pour IGF)
  const somato = findAxis(synthesis.endocrineAxes, "Somatotrope");
  if (somato) {
    flows.push({
      id: "somatotrope",
      name: "Axe Somatotrope",
      fromOrgan: "cerveau",
      toOrgans: ["pancreas", "foie"],
      color: COLORS.optimal.main,
      status: "normal",
      description: "GHRH → GH → IGF-1 + Insuline/Glucagon",
    });
  }

  // Flux neurovégétatif : Cerveau → Cœur
  if (synthesis.neuroVegetative) {
    flows.push({
      id: "neurovegetatif",
      name: "Système Nerveux Autonome",
      fromOrgan: "cerveau",
      toOrgans: ["coeur"],
      color: synthesis.neuroVegetative.status === "Sympathicotonia" ? COLORS.hyper.main :
             synthesis.neuroVegetative.status === "Parasympathicotonia" ? COLORS.hypo.main : COLORS.optimal.main,
      status: synthesis.neuroVegetative.status === "Sympathicotonia" ? "hyper" :
              synthesis.neuroVegetative.status === "Parasympathicotonia" ? "hypo" : "normal",
      description: "Sympathique ↔ Parasympathique",
    });
  }

  return flows;
}

// ============================================
// HELPERS
// ============================================

function findAxis(axes: EndocrineAxis[] | undefined, name: string): EndocrineAxis | undefined {
  if (!axes) return undefined;
  return axes.find(a => a.axis?.toLowerCase().includes(name.toLowerCase()));
}

function findEmonctoire(emonctoires: EmonctoireVS[] | undefined, name: string): EmonctoireVS | undefined {
  if (!emonctoires) return undefined;
  return emonctoires.find(e => e.organe?.toLowerCase().includes(name.toLowerCase()));
}

function createDefaultAnalysis(organId: string): OrganAnalysis {
  const labelMap: Record<string, string> = {
    cerveau: "Cerveau",
    surrenales: "Surrénales",
    thyroide: "Thyroïde",
    gonades: "Gonades",
    coeur: "Cœur",
    foie: "Foie",
    intestins: "Intestins",
    reins: "Reins",
    poumons: "Poumons",
    pancreas: "Pancréas",
    estomac: "Estomac",
    rate: "Rate",
  };

  return {
    id: organId,
    label: labelMap[organId.toLowerCase()] || organId,
    status: "UNKNOWN",
    severity: "normal",
    color: COLORS.unknown.main,
    glowColor: COLORS.unknown.glow,
    pulse: false,
    title: labelMap[organId.toLowerCase()] || organId,
    axisName: "Non évalué",
    mechanism: "Données insuffisantes pour l'analyse. Complétez l'interrogatoire ou les analyses biologiques.",
    clinicalSigns: [],
  };
}

// ============================================
// EXPORTS SUPPLÉMENTAIRES
// ============================================

export { COLORS };
