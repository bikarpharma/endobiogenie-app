import type { PanelDefinition } from "./panel-types";

/**
 * PANELS BIOLOGIQUES - LES 7 AXES DE L'ENDOBIOGÉNIE
 * -------------------------------------------------
 * Organisation des index par fonction physiologique pour l'affichage UI.
 * Chaque panel regroupe les index permettant d'évaluer un axe spécifique
 * du système neuro-endocrinien.
 *
 * Structure endobiogénique
 */

export const PANELS: PanelDefinition[] = [
  {
    id: "panel_neuro",
    label: "1. NEUROVÉGÉTATIF",
    description: "Équilibre du Système Nerveux Autonome (Terrain)",
    indexes: ["idx_genital", "idx_parasympa"],
    color: "blue"
  },
  {
    id: "panel_adaptation",
    label: "2. ADAPTATION",
    description: "Capacité de réponse au stress (Axe Corticotrope)",
    indexes: ["idx_adaptation", "idx_mineralo"],
    color: "purple"
  },
  {
    id: "panel_thyroid",
    label: "3. THYRÉOTROPE",
    description: "Gestion de l'énergie et du métabolisme basal",
    indexes: ["idx_thyroid_yield", "idx_metabolic_activity"],
    color: "amber"
  },
  {
    id: "panel_gonado",
    label: "4. GONADOTROPE",
    description: "Construction, reproduction et expansion",
    indexes: ["idx_androgenic", "idx_genito_thyroid"],
    color: "rose"
  },
  {
    id: "panel_somato",
    label: "5. SOMATOTROPE",
    description: "Structure, réparation et croissance",
    indexes: ["idx_growth"],
    color: "emerald"
  },
  {
    id: "panel_metabo",
    label: "6. MÉTABOLIQUE",
    description: "Rendement cellulaire et oxydation",
    indexes: ["idx_metabolic_activity"],
    color: "orange"
  },
  {
    id: "panel_immuno",
    label: "7. IMMUNITAIRE",
    description: "Inflammation et défense (Th1/Th2)",
    indexes: ["idx_genital"], // Le N/L ratio sert aussi pour l'immunité
    color: "red"
  }
];

/**
 * HELPER : Récupère un panel par son ID
 */
export function getPanelById(id: string): PanelDefinition | undefined {
  return PANELS.find(panel => panel.id === id);
}

/**
 * HELPER : Récupère tous les index utilisés dans tous les panels
 */
export function getAllPanelIndexes(): string[] {
  const indexSet = new Set<string>();
  PANELS.forEach(panel => {
    panel.indexes.forEach(idx => indexSet.add(idx));
  });
  return Array.from(indexSet);
}

/**
 * HELPER : Trouve les panels qui contiennent un index spécifique
 */
export function getPanelsForIndex(indexId: string): PanelDefinition[] {
  return PANELS.filter(panel => panel.indexes.includes(indexId));
}
