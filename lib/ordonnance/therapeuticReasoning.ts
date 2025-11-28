// ========================================
// MOTEUR DE RAISONNEMENT THÉRAPEUTIQUE ENDOBIOGÉNIQUE
// Version 2.0 - Conforme aux 4 Volumes Lapraz & Hedayat
// ========================================
//
// HIÉRARCHIE THÉRAPEUTIQUE ENDOBIOGÉNIQUE (Volume 1, p.291-295):
// 1. Axe Corticotrope (Chef d'orchestre - PRIORITÉ ABSOLUE)
// 2. DRAINAGE des émonctoires (Foie → Rein → Lymphe → Intestin → Peau)
// 3. Axe Thyréotrope
// 4. Système Nerveux Autonome (SNA)
// 5. Autres axes (Gonadotrope, Somatotrope)
//
// PRINCIPES:
// - Primum non nocere (d'abord ne pas nuire)
// - Drainage AVANT traitement de fond
// - Évaluer la capacité tampon hépatique

import { v4 as uuidv4 } from "uuid";
import type {
  AxePerturbation,
  RecommandationTherapeutique,
  RaisonnementTherapeutique,
  TherapeuticScope,
  AlerteTherapeutique,
  ContextePedagogique,
  NiveauSecurite,
} from "./types";
import type { IndexResults, LabValues } from "@/lib/bdf/types";
import { SEUILS_BDF, PLANTES_PAR_AXE, VECTORSTORES } from "./constants";
import { getNomFrancais } from "./plantes-noms-francais";
import ragLocal from "./ragLocalSearch";

// ========================================
// TYPES SPÉCIFIQUES AU DRAINAGE
// ========================================

export type EvaluationDrainage = {
  necessaire: boolean;
  priorite: "urgent" | "modere" | "leger" | "non_necessaire";
  emonctoires: EmonctoireStatus[];
  capaciteTampon: number; // 0-100 (100 = saturé)
  recommandations: RecommandationTherapeutique[];
  justification: string;
};

export type EmonctoireStatus = {
  organe: "foie" | "rein" | "lymphe" | "intestin" | "peau";
  statut: "sature" | "sollicite" | "normal";
  score: number; // 0-10
  indicateurs: string[];
};

// ========================================
// TYPES SPASMOPHILIE (Volume 2, p.22-52)
// ========================================

export type TypeSpasmophilie = {
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  nom: string;
  description: string;
  mecanisme: string;
  indexCles: string[];
  traitement: string[];
};

export const TYPES_SPASMOPHILIE: TypeSpasmophilie[] = [
  {
    type: 1,
    nom: "Spasmophilie α-sympathique pure",
    description: "Hyper α-sympathique avec IML élevé, IMP normal",
    mecanisme: "Congestion hépato-splanchnique, flux adaptatif hépatique → splanchnique",
    indexCles: ["IML élevé", "IMP normal", "Starter > 1.2"],
    traitement: ["Drainage hépatique", "α-sympatholytiques (Lavandula, Passiflora)"]
  },
  {
    type: 2,
    nom: "Spasmophilie β-sympathique pure",
    description: "Hyper β-sympathique avec IMP élevé, IML normal",
    mecanisme: "Mobilisation splénique excessive, tachycardie, tremblements",
    indexCles: ["IMP élevé", "IML normal", "Starter < 0.8"],
    traitement: ["β-bloquants naturels (Leonurus)", "Magnésium"]
  },
  {
    type: 3,
    nom: "Spasmophilie mixte α+β",
    description: "Hyperactivité sympathique globale",
    mecanisme: "SNA en sur-régime, épuisement adaptatif",
    indexCles: ["IML élevé", "IMP élevé", "Starter variable"],
    traitement: ["Adaptogènes (Rhodiola)", "Drainage + Magnésium"]
  },
  {
    type: 4,
    nom: "Spasmophilie parasympathique",
    description: "Hypotonie parasympathique relative",
    mecanisme: "Déficit de frein vagal, sur-réactivité sympathique secondaire",
    indexCles: ["Lymphocytes bas", "Index parasympathique bas"],
    traitement: ["Toniques vagaux (Avena sativa)", "Omega-3"]
  },
  {
    type: 5,
    nom: "Spasmophilie corticotrope",
    description: "Épuisement surrénalien avec compensation sympathique",
    mecanisme: "Cortisol insuffisant → sur-compensation sympathique",
    indexCles: ["Index Adaptation bas", "Ratio Cortisol/Cortex < 2"],
    traitement: ["Adaptogènes surrénaliens (Glycyrrhiza)", "Ribes nigrum MG"]
  },
  {
    type: 6,
    nom: "Spasmophilie thyroïdienne",
    description: "Hypothyroïdie fonctionnelle avec compensation sympathique",
    mecanisme: "Index thyroïdien bas → SNA compense le métabolisme lent",
    indexCles: ["Index Thyroïdien < 2", "Rendement thyroïdien bas"],
    traitement: ["Soutien thyroïdien (Fucus)", "Sélénium"]
  },
  {
    type: 7,
    nom: "Spasmophilie gonadotrope (femme)",
    description: "Déséquilibre œstrogènes/progestérone",
    mecanisme: "Hyperoestrogénie relative → instabilité neuromusculaire",
    indexCles: ["Index Génital < 0.6", "SPM marqué"],
    traitement: ["Vitex agnus-castus", "Alchemilla vulgaris"]
  },
  {
    type: 8,
    nom: "Spasmophilie histaminique",
    description: "Terrain allergique avec hyper-réactivité",
    mecanisme: "Histamine élevée → spasmes, urticaire, bronchoconstriction",
    indexCles: ["Index Histamine élevé", "Index Adaptation élevé"],
    traitement: ["Ribes nigrum MG", "Plantago lanceolata"]
  }
];

// ========================================
// CLASSE PRINCIPALE
// ========================================

export class TherapeuticReasoningEngine {

  // ========================================
  // ÉTAPE 0: ÉVALUATION DRAINAGE (PRIORITAIRE)
  // Volume 2, p.169-181: "Ordre de priorité: Foie → Rein → Lymphe"
  // ========================================

  evaluerBesoinDrainage(
    indexes: IndexResults,
    inputs: LabValues,
    autresBilans?: Record<string, number>
  ): EvaluationDrainage {
    const emonctoires: EmonctoireStatus[] = [];
    let capaciteTamponGlobal = 0;
    const justifications: string[] = [];

    // ==========================================
    // 1. ÉVALUATION HÉPATIQUE (Émonctoire principal)
    // ==========================================
    const foieStatus = this.evaluerFoie(indexes, inputs, autresBilans);
    emonctoires.push(foieStatus);
    capaciteTamponGlobal += foieStatus.score * 4; // Poids x4 pour le foie

    // ==========================================
    // 2. ÉVALUATION RÉNALE
    // ==========================================
    const reinStatus = this.evaluerRein(autresBilans);
    emonctoires.push(reinStatus);
    capaciteTamponGlobal += reinStatus.score * 2;

    // ==========================================
    // 3. ÉVALUATION LYMPHATIQUE
    // ==========================================
    const lympheStatus = this.evaluerLymphe(indexes, inputs);
    emonctoires.push(lympheStatus);
    capaciteTamponGlobal += lympheStatus.score * 1.5;

    // ==========================================
    // 4. ÉVALUATION INTESTINALE
    // ==========================================
    const intestinStatus = this.evaluerIntestin(inputs);
    emonctoires.push(intestinStatus);
    capaciteTamponGlobal += intestinStatus.score;

    // ==========================================
    // 5. ÉVALUATION CUTANÉE
    // ==========================================
    const peauStatus = this.evaluerPeau(indexes);
    emonctoires.push(peauStatus);
    capaciteTamponGlobal += peauStatus.score * 0.5;

    // Normaliser le score global sur 100
    capaciteTamponGlobal = Math.min(100, Math.round(capaciteTamponGlobal));

    // Déterminer la priorité du drainage
    let priorite: EvaluationDrainage["priorite"] = "non_necessaire";
    let necessaire = false;

    if (capaciteTamponGlobal >= 70) {
      priorite = "urgent";
      necessaire = true;
      justifications.push("⚠️ Capacité tampon SATURÉE - Drainage IMPÉRATIF avant tout traitement de fond");
    } else if (capaciteTamponGlobal >= 50) {
      priorite = "modere";
      necessaire = true;
      justifications.push("Capacité tampon sollicitée - Drainage recommandé en phase initiale");
    } else if (capaciteTamponGlobal >= 30) {
      priorite = "leger";
      necessaire = true;
      justifications.push("Drainage léger conseillé pour optimiser la réponse thérapeutique");
    } else {
      priorite = "non_necessaire";
      justifications.push("Émonctoires fonctionnels - Pas de drainage prioritaire");
    }

    // Générer les recommandations de drainage
    const recommandations = necessaire
      ? this.genererRecommandationsDrainage(emonctoires, priorite)
      : [];

    return {
      necessaire,
      priorite,
      emonctoires,
      capaciteTampon: capaciteTamponGlobal,
      recommandations,
      justification: justifications.join(" | ")
    };
  }

  private evaluerFoie(
    indexes: IndexResults,
    inputs: LabValues,
    autresBilans?: Record<string, number>
  ): EmonctoireStatus {
    let score = 0;
    const indicateurs: string[] = [];

    // Index Capacité Tampon Hépatique (GGT / (ALAT + ASAT))
    if (autresBilans?.GGT && autresBilans?.ALAT && autresBilans?.ASAT) {
      const indexCapacite = autresBilans.GGT / (autresBilans.ALAT + autresBilans.ASAT + 1);
      if (indexCapacite > SEUILS_BDF.capaciteTampon.high) {
        score += 4;
        indicateurs.push(`Index Capacité Tampon ${indexCapacite.toFixed(2)} > ${SEUILS_BDF.capaciteTampon.high} (saturé)`);
      } else if (indexCapacite > SEUILS_BDF.capaciteTampon.low) {
        score += 2;
        indicateurs.push(`Index Capacité Tampon ${indexCapacite.toFixed(2)} (sollicité)`);
      }
    }

    // Transaminases élevées
    if (autresBilans?.ALAT && autresBilans.ALAT > 40) {
      score += 2;
      indicateurs.push(`ALAT ${autresBilans.ALAT} U/L (élevé)`);
    }
    if (autresBilans?.ASAT && autresBilans.ASAT > 40) {
      score += 2;
      indicateurs.push(`ASAT ${autresBilans.ASAT} U/L (élevé)`);
    }

    // GGT élevé (induction enzymatique, cholestase)
    if (autresBilans?.GGT && autresBilans.GGT > 50) {
      score += 2;
      indicateurs.push(`GGT ${autresBilans.GGT} U/L (inducteur/cholestase)`);
    }

    // IML élevé (congestion hépato-splanchnique) - Volume 2, p.29-34
    const imlValue = (indexes as any)?.idx_mobilisation_leucocytes?.value;
    if (imlValue && imlValue > SEUILS_BDF.indexMobilisationLeucocytes.high) {
      score += 2;
      indicateurs.push(`IML ${imlValue.toFixed(2)} > 1.1 (congestion hépatique)`);
    }

    const statut: EmonctoireStatus["statut"] =
      score >= 6 ? "sature" : score >= 3 ? "sollicite" : "normal";

    return {
      organe: "foie",
      statut,
      score: Math.min(10, score),
      indicateurs
    };
  }

  private evaluerRein(autresBilans?: Record<string, number>): EmonctoireStatus {
    let score = 0;
    const indicateurs: string[] = [];

    if (autresBilans?.CREAT) {
      if (autresBilans.CREAT > 12) { // mg/L
        score += 3;
        indicateurs.push(`Créatinine ${autresBilans.CREAT} mg/L (élevée)`);
      }
    }

    if (autresBilans?.UREE) {
      if (autresBilans.UREE > 0.5) { // g/L
        score += 2;
        indicateurs.push(`Urée ${autresBilans.UREE} g/L (élevée)`);
      }
    }

    const statut: EmonctoireStatus["statut"] =
      score >= 4 ? "sature" : score >= 2 ? "sollicite" : "normal";

    return {
      organe: "rein",
      statut,
      score: Math.min(10, score),
      indicateurs
    };
  }

  private evaluerLymphe(indexes: IndexResults, inputs: LabValues): EmonctoireStatus {
    let score = 0;
    const indicateurs: string[] = [];

    // Lymphocytes élevés peuvent indiquer une sollicitation lymphatique
    const lymph = inputs.LYMPH;
    if (lymph && lymph > 40) {
      score += 2;
      indicateurs.push(`Lymphocytes ${lymph}% (terrain réactif)`);
    }

    // Monocytes élevés (nettoyage tissulaire)
    const mono = inputs.MONO;
    if (mono && mono > 10) {
      score += 2;
      indicateurs.push(`Monocytes ${mono}% (sollicitation nettoyage)`);
    }

    const statut: EmonctoireStatus["statut"] =
      score >= 4 ? "sature" : score >= 2 ? "sollicite" : "normal";

    return {
      organe: "lymphe",
      statut,
      score: Math.min(10, score),
      indicateurs
    };
  }

  private evaluerIntestin(inputs: LabValues): EmonctoireStatus {
    let score = 0;
    const indicateurs: string[] = [];

    // Éosinophiles élevés (terrain allergique/parasitaire = intestin sollicité)
    const eos = inputs.EOS;
    if (eos && eos > 5) {
      score += 3;
      indicateurs.push(`Éosinophiles ${eos}% (terrain allergique/parasitaire)`);
    }

    const statut: EmonctoireStatus["statut"] =
      score >= 3 ? "sature" : score >= 1 ? "sollicite" : "normal";

    return {
      organe: "intestin",
      statut,
      score: Math.min(10, score),
      indicateurs
    };
  }

  private evaluerPeau(indexes: IndexResults): EmonctoireStatus {
    let score = 0;
    const indicateurs: string[] = [];

    // Basophiles élevés (histamine, manifestations cutanées)
    const histamineIndex = (indexes as any)?.idx_histamine?.value;
    if (histamineIndex && histamineIndex > 2) {
      score += 2;
      indicateurs.push(`Index Histamine ${histamineIndex.toFixed(2)} (terrain réactif cutané)`);
    }

    const statut: EmonctoireStatus["statut"] =
      score >= 3 ? "sature" : score >= 1 ? "sollicite" : "normal";

    return {
      organe: "peau",
      statut,
      score: Math.min(10, score),
      indicateurs
    };
  }

  private genererRecommandationsDrainage(
    emonctoires: EmonctoireStatus[],
    priorite: EvaluationDrainage["priorite"]
  ): RecommandationTherapeutique[] {
    const recommandations: RecommandationTherapeutique[] = [];

    // Trier par score décroissant
    const emonctoiresTries = [...emonctoires].sort((a, b) => b.score - a.score);

    for (const emonctoire of emonctoiresTries) {
      if (emonctoire.statut === "normal") continue;

      switch (emonctoire.organe) {
        case "foie":
          recommandations.push({
            id: uuidv4(),
            substance: "Taraxacum officinale",
            nomFrancais: "Pissenlit",
            type: "plante",
            forme: "EPS",
            posologie: "5 mL matin à jeun",
            duree: priorite === "urgent" ? "21 jours avant traitement" : "14 jours",
            axeCible: "Drainage hépatique",
            mecanisme: "Cholérétique, cholagogue, stimule la bile et l'élimination hépatique",
            sourceVectorstore: "code",
            niveauPreuve: 1,
            CI: ["obstruction biliaire"],
            interactions: [],
            priorite: 0, // Priorité 0 = AVANT tout traitement
          });

          if (emonctoire.statut === "sature") {
            recommandations.push({
              id: uuidv4(),
              substance: "Carduus marianus",
              nomFrancais: "Chardon-Marie",
              type: "plante",
              forme: "EPS",
              posologie: "5 mL matin et soir",
              duree: "21 jours",
              axeCible: "Protection hépatocyte",
              mecanisme: "Silymarine hépatoprotectrice, régénération hépatocyte",
              sourceVectorstore: "code",
              niveauPreuve: 1,
              CI: [],
              interactions: [],
              priorite: 0,
            });
          }
          break;

        case "rein":
          recommandations.push({
            id: uuidv4(),
            substance: "Betula pubescens",
            nomFrancais: "Bouleau (bourgeons)",
            type: "gemmo",
            forme: "MG",
            posologie: "10 gouttes matin",
            duree: "21 jours",
            axeCible: "Drainage hépato-rénal",
            mecanisme: "Dépuratif, diurétique doux, élimine acide urique et urée",
            sourceVectorstore: "code",
            niveauPreuve: 1,
            CI: ["insuffisance rénale sévère"],
            interactions: [],
            priorite: 0,
          });
          break;

        case "lymphe":
          recommandations.push({
            id: uuidv4(),
            substance: "Juglans regia",
            nomFrancais: "Noyer (bourgeons)",
            type: "gemmo",
            forme: "MG",
            posologie: "10 gouttes matin",
            duree: "21 jours",
            axeCible: "Drainage lymphatique",
            mecanisme: "Draine la lymphe, anti-infectieux, régule flore intestinale",
            sourceVectorstore: "code",
            niveauPreuve: 1,
            CI: [],
            interactions: [],
            priorite: 0,
          });
          break;

        case "intestin":
          recommandations.push({
            id: uuidv4(),
            substance: "Vaccinium vitis-idaea",
            nomFrancais: "Airelle rouge (bourgeons)",
            type: "gemmo",
            forme: "MG",
            posologie: "10 gouttes matin",
            duree: "21 jours",
            axeCible: "Drainage intestinal",
            mecanisme: "Régule transit, anti-inflammatoire intestinal, soutien flore",
            sourceVectorstore: "code",
            niveauPreuve: 1,
            CI: [],
            interactions: [],
            priorite: 0,
          });
          break;

        case "peau":
          recommandations.push({
            id: uuidv4(),
            substance: "Viola tricolor",
            nomFrancais: "Pensée sauvage",
            type: "plante",
            forme: "TM",
            posologie: "30 gouttes 3 fois par jour",
            duree: "21 jours",
            axeCible: "Drainage cutané",
            mecanisme: "Dépuratif cutané, anti-inflammatoire, favorise élimination par la peau",
            sourceVectorstore: "code",
            niveauPreuve: 1,
            CI: [],
            interactions: [],
            priorite: 0,
          });
          break;
      }
    }

    return recommandations.slice(0, 3); // Maximum 3 draineurs
  }

  // ========================================
  // ÉTAPE 1: ANALYSE DES AXES PERTURBÉS (CORRIGÉE)
  // Avec nouveaux index (IML, IMP, Starter, etc.)
  // ========================================

  analyzeAxesPerturbations(
    indexes: IndexResults,
    inputs: LabValues
  ): {
    axes: AxePerturbation[];
    hypotheses: string[];
    typeSpasmophilie?: TypeSpasmophilie;
  } {
    const axes: AxePerturbation[] = [];

    // ==========================================
    // 1. ANALYSE CORTICOTROPE (PRIORITÉ 1)
    // Index d'Adaptation = EOS / MONO
    // ==========================================
    const idxAdaptation = (indexes as any)?.idx_adaptation?.value;
    if (idxAdaptation != null) {
      if (idxAdaptation < SEUILS_BDF.indexAdaptation.low) {
        axes.push({
          axe: "corticotrope",
          niveau: "desequilibre",
          score: Math.min(10, Math.round((SEUILS_BDF.indexAdaptation.low - idxAdaptation) * 15)),
          justification: `Index Adaptation ${idxAdaptation.toFixed(2)} < ${SEUILS_BDF.indexAdaptation.low} = Risque auto-immun (FSH/œstrogènes dominant, cortisol insuffisant)`,
        });
      } else if (idxAdaptation > SEUILS_BDF.indexAdaptation.high) {
        axes.push({
          axe: "corticotrope",
          niveau: "hyper",
          score: Math.min(10, Math.round((idxAdaptation - SEUILS_BDF.indexAdaptation.high) * 10)),
          justification: `Index Adaptation ${idxAdaptation.toFixed(2)} > ${SEUILS_BDF.indexAdaptation.high} = Risque atopique/allergique (ACTH/cortisol hyperactif)`,
        });
      }
    }

    // Ratio Cortisol/Cortex Surrénalien
    const ratioCortisol = (indexes as any)?.idx_cortisol_ratio?.value;
    if (ratioCortisol != null) {
      if (ratioCortisol < SEUILS_BDF.ratioCortisol.low) {
        const axeCortico = axes.find(a => a.axe === "corticotrope");
        if (axeCortico) {
          axeCortico.score = Math.min(10, axeCortico.score + 2);
          axeCortico.justification += ` | Ratio Cortisol/Cortex ${ratioCortisol.toFixed(2)} < 2 (androgènes surrénaliens prédominants)`;
        } else {
          axes.push({
            axe: "corticotrope",
            niveau: "desequilibre",
            score: 5,
            justification: `Ratio Cortisol/Cortex ${ratioCortisol.toFixed(2)} < 2 = Androgènes surrénaliens prédominants`,
          });
        }
      }
    }

    // ==========================================
    // 2. ANALYSE SNA - SPASMOPHILIE (PRIORITÉ 2)
    // Index Starter = IML / IMP
    // ==========================================
    const idxStarter = (indexes as any)?.idx_starter?.value;
    const idxIML = (indexes as any)?.idx_mobilisation_leucocytes?.value;
    const idxIMP = (indexes as any)?.idx_mobilisation_plaquettes?.value;

    let typeSpasmophilie: TypeSpasmophilie | undefined;

    if (idxStarter != null || (idxIML != null && idxIMP != null)) {
      // Déterminer le type de spasmophilie
      if (idxIML != null && idxIMP != null) {
        if (idxIML > 1.1 && idxIMP < 0.9) {
          typeSpasmophilie = TYPES_SPASMOPHILIE[0]; // Type 1: α-sympathique pure
          axes.push({
            axe: "sna_alpha",
            niveau: "hyper",
            score: 7,
            justification: `Spasmophilie Type 1 - IML ${idxIML.toFixed(2)} élevé, IMP ${idxIMP.toFixed(2)} bas = Hyper α-sympathique`,
          });
        } else if (idxIMP > 1.2 && idxIML < 1.0) {
          typeSpasmophilie = TYPES_SPASMOPHILIE[1]; // Type 2: β-sympathique pure
          axes.push({
            axe: "sna_beta",
            niveau: "hyper",
            score: 7,
            justification: `Spasmophilie Type 2 - IMP ${idxIMP.toFixed(2)} élevé, IML ${idxIML.toFixed(2)} normal = Hyper β-sympathique`,
          });
        } else if (idxIML > 1.1 && idxIMP > 1.2) {
          typeSpasmophilie = TYPES_SPASMOPHILIE[2]; // Type 3: mixte
          axes.push({
            axe: "sna_mixte",
            niveau: "hyper",
            score: 8,
            justification: `Spasmophilie Type 3 - IML ${idxIML.toFixed(2)} et IMP ${idxIMP.toFixed(2)} tous deux élevés = Mixte α+β`,
          });
        }
      }

      // Ajouter axe SNA générique si Starter anormal
      if (idxStarter != null) {
        if (idxStarter < SEUILS_BDF.indexStarter.low) {
          if (!typeSpasmophilie) {
            axes.push({
              axe: "sna",
              niveau: "desequilibre",
              score: 6,
              justification: `Index Starter ${idxStarter.toFixed(2)} < ${SEUILS_BDF.indexStarter.low} = Hyper α-adaptatif + β bloqué (terrain spasmophile)`,
            });
          }
        } else if (idxStarter > SEUILS_BDF.indexStarter.high) {
          if (!typeSpasmophilie) {
            axes.push({
              axe: "sna",
              niveau: "hyper",
              score: 6,
              justification: `Index Starter ${idxStarter.toFixed(2)} > ${SEUILS_BDF.indexStarter.high} = Sympathique général hyperactif`,
            });
          }
        }
      }
    }

    // ==========================================
    // 3. ANALYSE THYRÉOTROPE (PRIORITÉ 3)
    // Index Thyroïdien = LDH / CPK
    // ==========================================
    const idxThyroidien = (indexes as any)?.idx_thyroidien?.value;
    if (idxThyroidien != null) {
      if (idxThyroidien < SEUILS_BDF.indexThyroidien.low) {
        axes.push({
          axe: "thyroidien",
          niveau: "hypo",
          score: Math.min(10, Math.round((SEUILS_BDF.indexThyroidien.low - idxThyroidien) * 4)),
          justification: `Index Thyroïdien ${idxThyroidien.toFixed(2)} < ${SEUILS_BDF.indexThyroidien.low} = Hypothyroïdie fonctionnelle (métabolisme ralenti)`,
        });

        // Vérifier si c'est une spasmophilie thyroïdienne
        if (!typeSpasmophilie && idxThyroidien < 1.5) {
          typeSpasmophilie = TYPES_SPASMOPHILIE[5]; // Type 6: thyroïdienne
        }
      } else if (idxThyroidien > SEUILS_BDF.indexThyroidien.high) {
        axes.push({
          axe: "thyroidien",
          niveau: "hyper",
          score: Math.min(10, Math.round((idxThyroidien - SEUILS_BDF.indexThyroidien.high) * 3)),
          justification: `Index Thyroïdien ${idxThyroidien.toFixed(2)} > ${SEUILS_BDF.indexThyroidien.high} = Hyperthyroïdie fonctionnelle (hypermétabolisme)`,
        });
      }
    }

    // Rendement thyroïdien
    const rendementThyro = (indexes as any)?.idx_rendement_thyroidien?.value;
    if (rendementThyro != null) {
      const axeThyro = axes.find(a => a.axe === "thyroidien");
      if (rendementThyro < SEUILS_BDF.rendementThyroidien.low) {
        if (axeThyro) {
          axeThyro.score = Math.min(10, axeThyro.score + 1);
          axeThyro.justification += ` | Rendement ${rendementThyro.toFixed(2)} bas (risque hypertrophie)`;
        }
      }
    }

    // ==========================================
    // 4. ANALYSE GONADOTROPE (PRIORITÉ 4)
    // Index Génital = GR / GB (CORRIGÉ!)
    // ==========================================
    const idxGenital = (indexes as any)?.idx_genital?.value;
    if (idxGenital != null) {
      if (idxGenital > SEUILS_BDF.indexGenital.high) {
        axes.push({
          axe: "gonadotrope",
          niveau: "hyper",
          score: Math.min(10, Math.round((idxGenital - SEUILS_BDF.indexGenital.high) * 8)),
          justification: `Index Génital ${idxGenital.toFixed(2)} > ${SEUILS_BDF.indexGenital.high} = Dominance androgénique tissulaire`,
        });
      } else if (idxGenital < SEUILS_BDF.indexGenital.low) {
        axes.push({
          axe: "gonadotrope",
          niveau: "desequilibre",
          score: Math.min(10, Math.round((SEUILS_BDF.indexGenital.low - idxGenital) * 8)),
          justification: `Index Génital ${idxGenital.toFixed(2)} < ${SEUILS_BDF.indexGenital.low} = Dominance œstrogénique tissulaire`,
        });

        // Vérifier si c'est une spasmophilie gonadotrope
        if (!typeSpasmophilie) {
          typeSpasmophilie = TYPES_SPASMOPHILIE[6]; // Type 7: gonadotrope
        }
      }
    }

    // Index Génito-Thyroïdien = NEUT / LYMPH
    const idxGenitoThyro = (indexes as any)?.idx_genito_thyroidien?.value;
    if (idxGenitoThyro != null) {
      if (idxGenitoThyro < SEUILS_BDF.indexGenitoThyroidien.low) {
        // Déjà capturé ailleurs mais on peut enrichir
      } else if (idxGenitoThyro > SEUILS_BDF.indexGenitoThyroidien.high) {
        const axeGonado = axes.find(a => a.axe === "gonadotrope");
        if (axeGonado) {
          axeGonado.score = Math.min(10, axeGonado.score + 1);
          axeGonado.justification += ` | Génito-Thyroïdien ${idxGenitoThyro.toFixed(2)} élevé (auto-immunité)`;
        }
      }
    }

    // ==========================================
    // 5. ANALYSE SOMATOTROPE (PRIORITÉ 5)
    // ==========================================
    const idxTurnover = (indexes as any)?.idx_turnover?.value;
    if (idxTurnover != null && idxTurnover > SEUILS_BDF.turnover.high) {
      axes.push({
        axe: "somatotrope",
        niveau: "hyper",
        score: Math.min(10, Math.round((idxTurnover - SEUILS_BDF.turnover.high) / 15)),
        justification: `Turn-over ${idxTurnover.toFixed(0)} > ${SEUILS_BDF.turnover.high} = Renouvellement tissulaire accéléré`,
      });
    }

    // ==========================================
    // 6. ANALYSE HISTAMINIQUE
    // ==========================================
    const idxHistamine = (indexes as any)?.idx_histamine?.value;
    if (idxHistamine != null && idxHistamine > 2) {
      if (!typeSpasmophilie) {
        typeSpasmophilie = TYPES_SPASMOPHILIE[7]; // Type 8: histaminique
      }
      axes.push({
        axe: "histamine",
        niveau: "hyper",
        score: Math.min(10, Math.round(idxHistamine * 2)),
        justification: `Index Histamine ${idxHistamine.toFixed(2)} élevé = Terrain allergique actif`,
      });
    }

    // ==========================================
    // TRIER PAR HIÉRARCHIE ENDOBIOGÉNIQUE
    // ==========================================
    const hierarchie = ["corticotrope", "sna", "sna_alpha", "sna_beta", "sna_mixte", "thyroidien", "gonadotrope", "somatotrope", "histamine"];
    axes.sort((a, b) => {
      const orderA = hierarchie.indexOf(a.axe);
      const orderB = hierarchie.indexOf(b.axe);
      if (orderA !== orderB) return orderA - orderB;
      return b.score - a.score; // À hiérarchie égale, trier par score
    });

    // ==========================================
    // GÉNÉRER HYPOTHÈSES RÉGULATRICES
    // ==========================================
    const hypotheses = this.generateHypotheses(axes, typeSpasmophilie);

    return { axes, hypotheses, typeSpasmophilie };
  }

  private generateHypotheses(
    axes: AxePerturbation[],
    typeSpasmophilie?: TypeSpasmophilie
  ): string[] {
    const hypotheses: string[] = [];

    // Hypothèse spasmophilie si détectée
    if (typeSpasmophilie) {
      hypotheses.push(`${typeSpasmophilie.nom}: ${typeSpasmophilie.description}`);
    }

    for (const axe of axes) {
      switch (axe.axe) {
        case "corticotrope":
          if (axe.niveau === "hyper") {
            hypotheses.push("Réguler l'axe corticotrope hyperactif (adaptogènes + α-sympatholytiques)");
          } else {
            hypotheses.push("Soutenir l'axe corticotrope insuffisant (Ribes nigrum MG, Glycyrrhiza)");
          }
          break;

        case "sna":
        case "sna_alpha":
          hypotheses.push("Réguler l'hyperactivité α-sympathique (Lavandula, Passiflora) + Drainage hépatique");
          break;

        case "sna_beta":
          hypotheses.push("Moduler l'hyperactivité β-sympathique (Leonurus cardiaca) + Magnésium");
          break;

        case "sna_mixte":
          hypotheses.push("Traiter la dysfonction sympathique globale: Adaptogènes + Drainage + Magnésium");
          break;

        case "thyroidien":
          if (axe.niveau === "hypo") {
            hypotheses.push("Soutenir le rendement thyroïdien (Fucus, Avena) + Sélénium");
          } else {
            hypotheses.push("Modérer l'hypermétabolisme thyroïdien (Leonurus, Melissa)");
          }
          break;

        case "gonadotrope":
          if (axe.justification.includes("androgénique")) {
            hypotheses.push("Moduler l'excès androgénique (Serenoa repens, Zinc)");
          } else {
            hypotheses.push("Rééquilibrer œstrogènes/progestérone (Vitex, Alchemilla)");
          }
          break;

        case "somatotrope":
          hypotheses.push("Accompagner le turn-over tissulaire sans l'épuiser (antioxydants)");
          break;

        case "histamine":
          hypotheses.push("Stabiliser le terrain histaminique (Ribes nigrum MG, Plantago)");
          break;
      }
    }

    return Array.from(new Set(hypotheses));
  }

  // ========================================
  // ÉTAPE 2: RECHERCHE ENDOBIOGÉNIE (HYBRIDE)
  // ========================================
  // 1. RAG Local d'abord (instantané, gratuit)
  // 2. VectorStore OpenAI pour enrichissement si besoin

  async searchEndobiogenie(
    axes: AxePerturbation[],
    patientContext: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      traitements: string[];
      symptomes?: string[];
      pathologies?: string[];
      autresBilans?: Record<string, number>;
    }
  ): Promise<RecommandationTherapeutique[]> {
    if (axes.length === 0) {
      return [];
    }

    console.log(`🔍 ÉTAPE 2 : Recherche endobiogénie HYBRIDE pour ${axes.length} axe(s)`);

    // ==========================================
    // PHASE 1: RAG LOCAL (instantané)
    // ==========================================
    console.log("   📚 Phase 1: RAG Local...");
    const startLocal = Date.now();

    const ragResult = ragLocal.searchPlantesHybride(
      axes,
      patientContext.symptomes || [],
      {
        maxResults: 8,
        excludeCI: patientContext.CI,
        sexe: patientContext.sexe
      }
    );

    const durationLocal = Date.now() - startLocal;
    console.log(`   ✅ RAG Local: ${ragResult.plantes.length} plantes en ${durationLocal}ms`);

    // Convertir les plantes RAG en recommandations
    const recommandationsLocales = this.convertRAGToRecommandations(
      ragResult,
      axes,
      patientContext
    );

    // Si on a assez de résultats avec le RAG local, pas besoin d'OpenAI
    if (recommandationsLocales.length >= 3) {
      console.log(`   ⏭️ Suffisant avec RAG Local, skip VectorStore`);
      return recommandationsLocales.slice(0, 4);
    }

    // ==========================================
    // PHASE 2: VECTORSTORE OPENAI (enrichissement)
    // ==========================================
    console.log("   🌐 Phase 2: VectorStore OpenAI (enrichissement)...");

    try {
      const { Agent, fileSearchTool, Runner } = await import("@openai/agents");

      // Construire une query enrichie avec les résultats RAG
      const query = this.buildHybridQuery(axes, patientContext, ragResult);

      const fileSearch = fileSearchTool([VECTORSTORES.endobiogenie]);

      const agent = new Agent({
        name: "endobiogenie-agent",
        model: "gpt-4o-mini",
        instructions: `Tu es un expert en endobiogénie (méthode Lapraz & Hedayat).

CONTEXTE: Le RAG local a déjà identifié ces plantes candidates:
${ragResult.plantes.map(p => `- ${p.nomLatin} (${p.nomCommun}): ${p.axes.join(", ")}`).join("\n")}

TON RÔLE: Valider et compléter cette sélection avec le VectorStore.

RÈGLES:
1. Privilégier les plantes déjà identifiées par le RAG si pertinentes
2. Ajouter 1-2 plantes complémentaires si nécessaire
3. Maximum 4 recommandations PIVOTS
4. Respecter le sexe (M/F) - PAS d'œstrogéniques pour hommes
5. Respecter TOUTES les CI

FORMAT JSON STRICT:
[{
  "substance": "Nom latin",
  "forme": "TM|EPS|MG",
  "posologie": "dose par prise",
  "duree": "durée",
  "axeCible": "axe neuroendocrinien",
  "mecanisme": "mécanisme précis",
  "CI": [],
  "interactions": []
}]`,
        tools: [fileSearch],
      });

      const runner = new Runner();
      const result = await runner.run(agent, [
        { role: "user", content: [{ type: "input_text", text: query }] },
      ]);

      const recommandationsOpenAI = this.parseEndobiogenieResponse(
        result.finalOutput || "",
        patientContext
      );

      console.log(`   ✅ VectorStore: ${recommandationsOpenAI.length} recommandation(s)`);

      // Fusionner les résultats (RAG local prioritaire)
      return this.mergeRecommandations(recommandationsLocales, recommandationsOpenAI);

    } catch (error) {
      console.warn("   ⚠️ VectorStore indisponible, utilisation RAG Local seul");
      // En cas d'erreur OpenAI, retourner les résultats RAG local
      if (recommandationsLocales.length > 0) {
        return recommandationsLocales;
      }
      return this.getFallbackRecommendations(axes, patientContext);
    }
  }

  /**
   * Convertit les résultats RAG en RecommandationTherapeutique
   */
  private convertRAGToRecommandations(
    ragResult: ReturnType<typeof ragLocal.searchPlantesHybride>,
    axes: AxePerturbation[],
    context: { sexe: "M" | "F"; CI: string[] }
  ): RecommandationTherapeutique[] {
    const recommandations: RecommandationTherapeutique[] = [];

    for (const plante of ragResult.plantes.slice(0, 5)) {
      // Déterminer la forme galénique
      let forme = "EPS";
      if (plante.galenique) {
        if (plante.galenique.includes("MG")) forme = "MG";
        else if (plante.galenique.includes("TM")) forme = "TM";
        else if (plante.galenique.includes("HE")) forme = "HE";
      }

      // Déterminer l'axe cible principal
      const axeCible = plante.axes.length > 0
        ? `Axe ${plante.axes[0]}`
        : axes[0]?.axe || "Régulation terrain";

      // Construire le mécanisme à partir de l'essence et du résumé
      let mecanisme = "";
      if (plante.essence) {
        mecanisme = plante.essence.replace(/\s+/g, " ").substring(0, 150);
      }
      if (plante.resume && !mecanisme) {
        mecanisme = plante.resume.replace(/\s+/g, " ").substring(0, 150);
      }

      recommandations.push({
        id: uuidv4(),
        substance: plante.nomLatin,
        nomFrancais: plante.nomCommun || getNomFrancais(plante.nomLatin),
        type: forme === "MG" ? "gemmo" : forme === "HE" ? "HE" : "plante",
        forme,
        posologie: this.inferPosologie(forme),
        duree: "21 jours",
        axeCible,
        mecanisme,
        sourceVectorstore: "rag_local" as any,
        niveauPreuve: 1,
        CI: plante.precautions ? [plante.precautions] : [],
        interactions: [],
        priorite: 1,
      });
    }

    return recommandations;
  }

  /**
   * Construit une query enrichie pour le VectorStore
   */
  private buildHybridQuery(
    axes: AxePerturbation[],
    context: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      traitements: string[];
      symptomes?: string[];
      pathologies?: string[];
    },
    ragResult: ReturnType<typeof ragLocal.searchPlantesHybride>
  ): string {
    let query = `PATIENT: ${context.sexe}, ${context.age} ans\n`;

    if (context.pathologies?.length) {
      query += `Pathologies: ${context.pathologies.join(", ")}\n`;
    }
    if (context.symptomes?.length) {
      query += `Symptômes: ${context.symptomes.join(", ")}\n`;
    }
    if (context.CI.length) {
      query += `Contre-indications: ${context.CI.join(", ")}\n`;
    }

    query += `\nAXES PERTURBÉS:\n`;
    for (const axe of axes) {
      query += `- ${axe.axe.toUpperCase()} (${axe.niveau}): score ${axe.score}/10\n`;
    }

    // Ajouter les plantes candidates du RAG local
    if (ragResult.plantes.length > 0) {
      query += `\nPLANTES CANDIDATES (RAG Local):\n`;
      for (const p of ragResult.plantes.slice(0, 5)) {
        query += `- ${p.nomLatin}: axes ${p.axes.join(", ")}\n`;
      }
    }

    // Ajouter les conseils cliniques
    if (ragResult.conseilsCliniques.length > 0) {
      query += `\nCONSEILS CLINIQUES:\n`;
      for (const c of ragResult.conseilsCliniques) {
        query += `- ${c}\n`;
      }
    }

    query += `\nValide et complète cette sélection. Retourne JSON array.`;
    return query;
  }

  /**
   * Fusionne les recommandations RAG local et VectorStore
   */
  private mergeRecommandations(
    ragLocal: RecommandationTherapeutique[],
    openAI: RecommandationTherapeutique[]
  ): RecommandationTherapeutique[] {
    const merged = new Map<string, RecommandationTherapeutique>();

    // RAG local en priorité
    for (const rec of ragLocal) {
      merged.set(rec.substance.toLowerCase(), rec);
    }

    // Compléter avec OpenAI (sans doublons)
    for (const rec of openAI) {
      const key = rec.substance.toLowerCase();
      if (!merged.has(key)) {
        merged.set(key, rec);
      } else {
        // Enrichir le mécanisme si celui d'OpenAI est meilleur
        const existing = merged.get(key)!;
        if (rec.mecanisme && rec.mecanisme.length > (existing.mecanisme?.length || 0)) {
          existing.mecanisme = rec.mecanisme;
        }
      }
    }

    // Trier par priorité et limiter à 4
    return Array.from(merged.values())
      .sort((a, b) => (a.priorite || 1) - (b.priorite || 1))
      .slice(0, 4);
  }

  /**
   * Infère la posologie selon la forme galénique
   */
  private inferPosologie(forme: string): string {
    switch (forme) {
      case "EPS": return "5 mL matin et soir";
      case "TM": return "50 gouttes 3 fois par jour";
      case "MG": return "10 gouttes matin à jeun";
      case "HE": return "2 gouttes 2 fois par jour (voie orale ou cutanée)";
      default: return "Selon prescription";
    }
  }

  private buildEndobiogenieQuery(
    axes: AxePerturbation[],
    context: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      traitements: string[];
      symptomes?: string[];
      pathologies?: string[];
    }
  ): string {
    let query = `PATIENT: ${context.sexe}, ${context.age} ans\n`;

    if (context.pathologies?.length) {
      query += `Pathologies: ${context.pathologies.join(", ")}\n`;
    }
    if (context.symptomes?.length) {
      query += `Symptômes: ${context.symptomes.join(", ")}\n`;
    }
    if (context.CI.length) {
      query += `Contre-indications: ${context.CI.join(", ")}\n`;
    }
    if (context.traitements.length) {
      query += `Traitements actuels: ${context.traitements.join(", ")}\n`;
    }

    query += `\nAXES PERTURBÉS (par ordre de priorité endobiogénique):\n`;
    for (const axe of axes) {
      query += `- ${axe.axe.toUpperCase()} (${axe.niveau}): score ${axe.score}/10\n`;
      query += `  ${axe.justification}\n`;
    }

    query += `\nRetourne JSON array avec max 4 recommandations prioritaires.`;
    return query;
  }

  private parseEndobiogenieResponse(
    content: string,
    context: { sexe: "M" | "F"; CI: string[] }
  ): RecommandationTherapeutique[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const rawRecs = JSON.parse(jsonMatch[0]);
      return rawRecs.map((raw: any) => ({
        id: uuidv4(),
        substance: raw.substance || "Substance inconnue",
        nomFrancais: getNomFrancais(raw.substance),
        type: this.inferSubstanceType(raw.forme),
        forme: raw.forme || "EPS",
        posologie: raw.posologie || "À définir",
        duree: raw.duree || "21 jours",
        axeCible: raw.axeCible || "Régulation terrain",
        mecanisme: raw.mecanisme || "",
        sourceVectorstore: "endobiogenie" as const,
        niveauPreuve: 1 as const,
        CI: Array.isArray(raw.CI) ? raw.CI : [],
        interactions: Array.isArray(raw.interactions) ? raw.interactions : [],
        priorite: 1,
      }));
    } catch (error) {
      console.error("❌ Erreur parsing:", error);
      return [];
    }
  }

  private getFallbackRecommendations(
    axes: AxePerturbation[],
    context: { sexe: "M" | "F"; CI: string[] }
  ): RecommandationTherapeutique[] {
    const recs: RecommandationTherapeutique[] = [];
    const isGrossesse = context.CI.some(ci => ci.toLowerCase().includes("grossesse"));

    for (const axe of axes.slice(0, 3)) {
      if (axe.axe === "corticotrope" && !isGrossesse) {
        recs.push({
          id: uuidv4(),
          substance: "Rhodiola rosea",
          nomFrancais: "Rhodiole",
          type: "plante",
          forme: "EPS",
          posologie: "5 mL le matin",
          duree: "21 jours",
          axeCible: "Axe corticotrope",
          mecanisme: "Adaptogène, régule cortisol",
          sourceVectorstore: "code",
          niveauPreuve: 1,
          CI: ["grossesse"],
          interactions: ["IMAO"],
          priorite: 1,
        });
      }

      if (axe.axe === "thyroidien" && axe.niveau === "hypo") {
        recs.push({
          id: uuidv4(),
          substance: "Avena sativa",
          nomFrancais: "Avoine",
          type: "plante",
          forme: "TM",
          posologie: "50 gouttes matin et midi",
          duree: "21 jours",
          axeCible: "Soutien thyroïdien",
          mecanisme: "Tonique général, soutien métabolisme",
          sourceVectorstore: "code",
          niveauPreuve: 1,
          CI: [],
          interactions: [],
          priorite: 1,
        });
      }

      if ((axe.axe === "sna" || axe.axe === "sna_alpha") && !isGrossesse) {
        recs.push({
          id: uuidv4(),
          substance: "Passiflora incarnata",
          nomFrancais: "Passiflore",
          type: "plante",
          forme: "EPS",
          posologie: "5 mL le soir",
          duree: "21 jours",
          axeCible: "Régulation SNA",
          mecanisme: "α-sympatholytique, anxiolytique naturel",
          sourceVectorstore: "code",
          niveauPreuve: 1,
          CI: [],
          interactions: [],
          priorite: 1,
        });
      }
    }

    return recs;
  }

  private inferSubstanceType(forme: string): "plante" | "gemmo" | "HE" | "autre" {
    const f = (forme || "").toUpperCase();
    if (f.includes("MG") || f.includes("GEMMO")) return "gemmo";
    if (f.includes("HE") || f.includes("HUILE")) return "HE";
    return "plante";
  }

  // ========================================
  // ÉTAPE 3: EXTENSION THÉRAPEUTIQUE
  // ========================================

  async searchExtendedTherapy(
    axes: AxePerturbation[],
    recommandationsEndobiogenie: RecommandationTherapeutique[],
    scope: TherapeuticScope,
    patientContext: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      symptomes: string[];
      pathologies?: string[];
    }
  ): Promise<RecommandationTherapeutique[]> {
    const needsExtension = scope.planteMedicinale || scope.gemmotherapie || scope.aromatherapie;
    if (!needsExtension || axes.length === 0) return [];

    console.log(`🔍 ÉTAPE 3 : Extension thérapeutique`);

    // Pour l'instant, retourner des recommandations vides
    // L'implémentation complète utilise les vectorstores
    return [];
  }

  // ========================================
  // ÉTAPE 4: MICRONUTRITION
  // ========================================

  async searchMicronutrition(
    axes: AxePerturbation[],
    patientContext: { age: number; sexe: "M" | "F"; CI: string[]; traitements: string[] }
  ): Promise<RecommandationTherapeutique[]> {
    if (axes.length === 0) return [];

    console.log(`🔍 ÉTAPE 4 : Micro-nutrition`);
    const recs: RecommandationTherapeutique[] = [];

    for (const axe of axes) {
      if (axe.score < 5) continue;

      switch (axe.axe) {
        case "thyroidien":
          if (axe.niveau === "hypo") {
            recs.push({
              id: uuidv4(),
              substance: "Sélénium",
              type: "mineral",
              forme: "gélule",
              posologie: "100-200 µg/jour",
              duree: "3 mois",
              axeCible: "Conversion T4→T3",
              mecanisme: "Cofacteur déiodinase",
              sourceVectorstore: "code",
              niveauPreuve: 3,
              CI: [],
              interactions: [],
              priorite: 2,
            });
          }
          break;

        case "corticotrope":
        case "sna":
        case "sna_alpha":
        case "sna_beta":
        case "sna_mixte":
          recs.push({
            id: uuidv4(),
            substance: "Magnésium bisglycinate",
            type: "mineral",
            forme: "gélule",
            posologie: "300-400 mg/jour",
            duree: "3 mois",
            axeCible: "Régulation SNA + Corticotrope",
            mecanisme: "Modulation NMDA, détente neuromusculaire",
            sourceVectorstore: "code",
            niveauPreuve: 3,
            CI: [],
            interactions: [],
            priorite: 2,
          });
          break;
      }
    }

    // Dédupliquer
    const unique = recs.filter((r, i, self) =>
      i === self.findIndex(x => x.substance === r.substance)
    );

    console.log(`✅ ÉTAPE 4 : ${unique.length} micro-nutriments`);
    return unique.slice(0, 3);
  }

  // ========================================
  // ORCHESTRATION COMPLÈTE
  // ========================================

  async executeFullReasoning(
    indexes: IndexResults,
    inputs: LabValues,
    scope: TherapeuticScope,
    patientContext: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      traitements: string[];
      symptomes: string[];
      pathologies?: string[];
      autresBilans?: Record<string, number>;
    },
    ragContext?: { ragAxes: string[]; ragSummary: string; axesFusionnes?: any[] }
  ): Promise<RaisonnementTherapeutique> {

    // ==========================================
    // ÉTAPE 0: ÉVALUATION DRAINAGE (NOUVEAU!)
    // ==========================================
    console.log("🚿 ÉTAPE 0 : Évaluation besoin drainage...");
    const evaluationDrainage = this.evaluerBesoinDrainage(
      indexes,
      inputs,
      patientContext.autresBilans
    );

    if (evaluationDrainage.necessaire) {
      console.log(`⚠️ Drainage ${evaluationDrainage.priorite.toUpperCase()} requis (capacité tampon: ${evaluationDrainage.capaciteTampon}%)`);
    } else {
      console.log("✅ Émonctoires fonctionnels, pas de drainage prioritaire");
    }

    // ==========================================
    // ÉTAPE 1: ANALYSE AXES AVEC HIÉRARCHIE
    // ==========================================
    console.log("📊 ÉTAPE 1 : Analyse des axes perturbés...");
    const { axes, hypotheses, typeSpasmophilie } = this.analyzeAxesPerturbations(indexes, inputs);

    if (typeSpasmophilie) {
      console.log(`🔔 Spasmophilie Type ${typeSpasmophilie.type} détectée: ${typeSpasmophilie.nom}`);
    }

    // ==========================================
    // ÉTAPE 2: ENDOBIOGÉNIE
    // ==========================================
    const recommandationsEndobiogenie = await this.searchEndobiogenie(axes, patientContext);

    // ==========================================
    // ÉTAPE 3: EXTENSION
    // ==========================================
    const recommandationsElargies = await this.searchExtendedTherapy(
      axes,
      recommandationsEndobiogenie,
      scope,
      patientContext
    );

    // ==========================================
    // ÉTAPE 4: MICRONUTRITION
    // ==========================================
    const recommandationsMicronutrition = scope.micronutrition
      ? await this.searchMicronutrition(axes, patientContext)
      : [];

    // ==========================================
    // COMBINER DRAINAGE + RECOMMANDATIONS
    // ==========================================
    const toutesRecommandationsEndo = [
      ...evaluationDrainage.recommandations, // Drainage en PREMIER
      ...recommandationsEndobiogenie,
    ];

    // ==========================================
    // ALERTES
    // ==========================================
    const alertes: AlerteTherapeutique[] = [];

    // Alerte drainage si urgent
    if (evaluationDrainage.priorite === "urgent") {
      alertes.push({
        niveau: "warning",
        type: "terrain",
        message: evaluationDrainage.justification,
        substancesConcernees: [],
        recommandation: "Commencer par 2-3 semaines de drainage avant traitement de fond"
      });
    }

    // Alerte spasmophilie
    if (typeSpasmophilie) {
      alertes.push({
        niveau: "info",
        type: "terrain",
        message: `${typeSpasmophilie.nom} détectée - ${typeSpasmophilie.description}`,
        substancesConcernees: [],
        recommandation: typeSpasmophilie.traitement.join(" + ")
      });
    }

    // ==========================================
    // GÉNÉRER EXPLICATION
    // ==========================================
    let explication = "## Analyse du terrain fonctionnel endobiogénique\n\n";

    explication += "### Évaluation Drainage\n";
    explication += `Capacité tampon: ${evaluationDrainage.capaciteTampon}% - ${evaluationDrainage.justification}\n\n`;

    if (typeSpasmophilie) {
      explication += `### Spasmophilie détectée\n`;
      explication += `**Type ${typeSpasmophilie.type}**: ${typeSpasmophilie.nom}\n`;
      explication += `${typeSpasmophilie.description}\n`;
      explication += `Mécanisme: ${typeSpasmophilie.mecanisme}\n\n`;
    }

    explication += "### Axes perturbés (hiérarchie endobiogénique)\n";
    for (const axe of axes) {
      explication += `- **${axe.axe}** (${axe.niveau}): ${axe.justification}\n`;
    }

    explication += "\n### Hypothèses régulatrices\n";
    for (const hyp of hypotheses) {
      explication += `- ${hyp}\n`;
    }

    return {
      axesPerturbés: axes,
      hypothesesRegulatrices: hypotheses,
      recommandationsEndobiogenie: toutesRecommandationsEndo,
      recommandationsElargies,
      recommandationsMicronutrition,
      raisonnementDetaille: explication,
      alertes,
      coutEstime: toutesRecommandationsEndo.reduce((t, r) => t + (r.cout || 15), 0),
      dateGeneration: new Date(),
    };
  }
}
