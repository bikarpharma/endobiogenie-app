/**
 * 📦 EXPORTS - Visual Report Premium
 *
 * Point d'entrée unique pour tous les composants du rapport visuel premium.
 */

// Composant principal
export { default as PatientVisualReportPremium } from "./PatientVisualReportPremium";

// Composants internes (si besoin d'utilisation séparée)
export { default as BodyMapPremium } from "./BodyMapPremium";
export { default as LearningPanel } from "./LearningPanel";
export { default as AxisFlowLines, ORGAN_POSITIONS } from "./AxisFlowLines";

// Types et utilitaires
export * from "@/lib/endobiogeny/organAnalysis";
