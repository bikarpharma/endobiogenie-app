/**
 * TYPES DE PANELS - ENDOBIOGÉNIE
 * -------------------------------------------------
 * Définit les interfaces pour les panels d'affichage
 * des index biologiques fonctionnels.
 */

/**
 * Panel UI - Interface simplifiée pour l'affichage
 * Utilisée pour organiser les index par fonction physiologique
 */
export interface PanelDefinition {
  id: string;
  label: string;
  description?: string;
  indexes: string[];  // Liste des IDs d'index à afficher
  color: string;      // Couleur Tailwind (sans préfixe: "blue", "purple", etc.)
}

/**
 * Panel Legacy - Ancienne interface (deprecated)
 * Conservée pour compatibilité avec le code existant
 * @deprecated Utilisez PanelDefinition à la place
 */
export interface LegacyPanelDefinition {
  id: string;
  label: string;
  fasting: boolean;
  biomarkers: string[];
  direct_indexes: string[] | "ALL";
  indirect_indexes: string[] | "ALL";
}
