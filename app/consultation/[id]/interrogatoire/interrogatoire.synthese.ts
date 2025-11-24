export type AxisLevel = "low" | "medium" | "high";

interface AxisSummary {
  score: number;
  level: AxisLevel;
  summary: string;
}

interface InterrogatoireSummary {
  axes: Record<string, AxisSummary>;
  globalSummary: string;
}

export function computeAxisLevel(score: number): AxisLevel {
  if (score < 30) return "low";
  if (score <= 70) return "medium";
  return "high";
}

export function computeAxisSummary(axisId: string, score: number): string {
  const level = computeAxisLevel(score);

  const summaries: Record<string, Record<AxisLevel, string>> = {
    neurovegetatif: {
      low: "Tonus neurovégétatif faible avec dominance parasympathique marquée.",
      medium: "Équilibre neurovégétatif relatif avec oscillations physiologiques adaptatives.",
      high: "Tonus sympathique prédominant avec réactivité neurovégétative élevée.",
    },
    corticotrope: {
      low: "Demande corticotrope basse suggérant un terrain en économie surrénalienne.",
      medium: "Demande corticotrope modérée dans les limites physiologiques adaptatives.",
      high: "Demande corticotrope élevée suggérant un terrain en surmenage adaptatif.",
    },
    thyroidien: {
      low: "Profil thyroïdien fonctionnellement ralenti avec métabolisme basal abaissé.",
      medium: "Fonction thyroïdienne équilibrée avec activité métabolique physiologique.",
      high: "Profil thyroïdien hyperfonctionnel avec demande métabolique accrue.",
    },
    gonadique: {
      low: "Tonus gonadique faible avec imprégnation hormonale réduite.",
      medium: "Équilibre gonadique physiologique avec régulation hormonale adaptée.",
      high: "Tonus gonadique élevé avec imprégnation hormonale marquée.",
    },
    somatotrope: {
      low: "Activité somatotrope réduite suggérant un ralentissement anabolique.",
      medium: "Fonction somatotrope équilibrée avec dynamique anabolique physiologique.",
      high: "Activité somatotrope élevée avec demande anabolique accrue.",
    },
    structure: {
      low: "Tonus structurel faible avec tendance à l'hypotonie tissulaire.",
      medium: "Équilibre structurel physiologique avec tonus tissulaire adapté.",
      high: "Tonus structurel élevé avec tendance à l'hypertonie tissulaire.",
    },
    detoxification: {
      low: "Capacité de détoxification réduite nécessitant un soutien émonctoriel.",
      medium: "Fonction de détoxification équilibrée avec élimination physiologique.",
      high: "Demande détoxifiante élevée suggérant une surcharge métabolique.",
    },
    immunitaire: {
      low: "Réactivité immunitaire faible avec terrain hyporéactif.",
      medium: "Équilibre immunitaire physiologique avec réponse adaptée aux sollicitations.",
      high: "Réactivité immunitaire élevée avec tendance à l'hyperréactivité.",
    },
  };

  return summaries[axisId]?.[level] || `Score de ${score} pour l'axe ${axisId}.`;
}

export function computeGlobalInterrogatoireSummary(
  allAxes: Record<string, { score: number; level: AxisLevel }>
): string {
  const levels = Object.values(allAxes).map((a) => a.level);
  const highCount = levels.filter((l) => l === "high").length;
  const lowCount = levels.filter((l) => l === "low").length;

  if (highCount >= 4) {
    return "Profil global en hyperactivité neurovégétative et métabolique. Terrain mobilisant fortement ses systèmes de régulation avec demande adaptative élevée sur plusieurs axes. Orientation vers un soutien global de l'équilibre fonctionnel.";
  }

  if (lowCount >= 4) {
    return "Profil global en hypofonctionnement avec ralentissement de plusieurs axes de régulation. Terrain en économie fonctionnelle nécessitant un soutien pour stimuler les capacités adaptatives. Approche axée sur la revitalisation progressive.";
  }

  const dominantAxis = Object.entries(allAxes)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 2)
    .map(([axis]) => axis);

  return `Profil mixte avec prédominance sur les axes ${dominantAxis[0]} et ${dominantAxis[1]}. Équilibre global relatif avec variations physiologiques selon les sollicitations environnementales. Adaptation personnalisée recommandée selon les priorités cliniques.`;
}

export function generateInterrogatoireSummary(
  axesScores: Record<string, number>
): InterrogatoireSummary {
  const axes: Record<string, AxisSummary> = {};

  for (const [axisId, score] of Object.entries(axesScores)) {
    const level = computeAxisLevel(score);
    const summary = computeAxisSummary(axisId, score);

    axes[axisId] = {
      score,
      level,
      summary,
    };
  }

  const globalSummary = computeGlobalInterrogatoireSummary(axes);

  return {
    axes,
    globalSummary,
  };
}
