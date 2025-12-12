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
    id: "panel_sna",
    label: "1. SNA - SYSTÈME NERVEUX AUTONOME",
    description: "Équilibre sympathique/parasympathique et mobilisation",
    // CORRIGÉ: idx_histamine → idx_histamine_potentielle (nom correct dans indexes.config.ts)
    indexes: ["idx_starter", "idx_mobilisation_leucocytes", "idx_mobilisation_plaquettes", "idx_histamine_potentielle"],
    color: "blue"
  },
  {
    id: "panel_adaptation",
    label: "2. CORTICOTROPE (Adaptation)",
    description: "Capacité de réponse au stress - Axe HPA",
    // CORRIGÉ: idx_cortisol_ratio → idx_cortisol_cortex (nom correct dans indexes.config.ts)
    indexes: ["idx_adaptation", "idx_cortisol_cortex", "idx_mineralo"],
    color: "purple"
  },
  {
    id: "panel_thyroid",
    label: "3. THYRÉOTROPE",
    description: "Gestion de l'énergie et métabolisme basal",
    indexes: ["idx_thyroidien", "idx_rendement_thyroidien", "idx_pth"],
    color: "amber"
  },
  {
    id: "panel_gonado",
    label: "4. GONADOTROPE",
    description: "Équilibre Androgènes/Œstrogènes",
    indexes: ["idx_genital", "idx_genital_corrige", "idx_genito_thyroidien", "idx_oestrogenes"],
    color: "rose"
  },
  {
    id: "panel_somato",
    label: "5. SOMATOTROPE",
    description: "Structure, croissance et réparation tissulaire",
    // CORRIGÉ: idx_turnover → idx_remodelage_osseux (idx_turnover n'existe pas)
    // Ajouté idx_osteomusculaire pour compléter le panel
    indexes: ["idx_croissance", "idx_remodelage_osseux", "idx_osteomusculaire", "idx_insuline"],
    color: "emerald"
  },
  {
    id: "panel_metabo",
    label: "6. MÉTABOLIQUE",
    description: "Catabolisme/Anabolisme et rendement cellulaire",
    // CORRIGÉ: idx_rendement_metabolique → supprimé (n'existe pas)
    // idx_catabolisme et idx_cata_ana dépendent de idx_cortisol et idx_anabolisme (orphelins)
    indexes: ["idx_catabolisme", "idx_cata_ana", "idx_hepatique", "idx_capacite_tampon"],
    color: "orange"
  },
  {
    id: "panel_immuno",
    label: "7. IMMUNITAIRE / INFLAMMATOIRE",
    description: "Inflammation systémique et terrain immunitaire",
    indexes: ["idx_inflammation", "idx_genito_thyroidien"],
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
