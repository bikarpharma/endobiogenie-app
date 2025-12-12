import type { QuestionConfig } from "../types";

// ==========================================
// IMPORTS DES MODULES DE CONFIGURATION
// (Adaptés à votre nomenclature)
// ==========================================

// 🟦 BLOC 1 : TERRAIN & HISTOIRE
import HistoriqueConfig from "./historique";
import ModeVieConfig from "./axe-mode-de-vie";
import TerrainsPathologiquesConfig from "./axe-terrains-pathologiques";

// 🟪 BLOC 2 : LES GESTIONNAIRES (Système Neuro-Endocrinien)
import AxeNeuroConfig from "./axe-neuro";
import AxeAdaptatifConfig from "./axe-adaptatif";
import AxeThyroConfig from "./axe-thyro";
import AxeGonadoConfig, { type GonadoQuestion } from "./axe-gonado";
import AxeSomatoConfig from "./axe-somato";

// 🟩 BLOC 3 : ÉMONCTOIRES & ORGANES
import AxeDigestifConfig from "./axe-digestif";
import AxeImmunoConfig from "./axe-immuno";
import AxeORLRespiratoireConfig from "./axe-orl-respiratoire";
import AxeCardioMetaboConfig from "./axe-cardio-metabo";
import AxeUrorenalConfig from "./axe-urorenal";
import AxeDermatoConfig from "./axe-dermato";

// ==========================================
// TYPES
// ==========================================

export type AxisKey =
  | "historique"
  | "modeVie"
  | "terrains"
  | "neuro"
  | "adaptatif"
  | "thyro"
  | "gonado"
  | "somato"
  | "digestif"
  | "immuno"
  | "cardioMetabo"
  | "dermato"
  | "urorenal"
  | "orlRespiratoire";

export type BlocKey = "terrain" | "gestionnaires" | "emonctoires";

export interface AxisDefinition {
  key: AxisKey;
  label: string;
  description: string;
  questions: QuestionConfig[] | GonadoQuestion[];
  bloc?: BlocKey;
  icon?: string;
}

export interface BlocDefinition {
  key: BlocKey;
  label: string;
  description: string;
  color: string;
  icon: string;
  axes: AxisKey[];
}

// ==========================================
// DÉFINITION DES BLOCS
// ==========================================

export const BLOCS_DEFINITION: BlocDefinition[] = [
  {
    key: "terrain",
    label: "Terrain & Histoire",
    description: "Les fondations : antécédents, mode de vie, contexte, terrains pathologiques",
    color: "bg-blue-50 border-blue-200",
    icon: "🟦",
    axes: ["historique", "modeVie", "terrains"]
  },
  {
    key: "gestionnaires",
    label: "Les Gestionnaires",
    description: "Le système neuro-endocrinien : SNA et axes hormonaux",
    color: "bg-purple-50 border-purple-200",
    icon: "🟪",
    axes: ["neuro", "adaptatif", "thyro", "gonado", "somato"]
  },
  {
    key: "emonctoires",
    label: "Émonctoires & Organes",
    description: "Les conséquences symptomatiques par système",
    color: "bg-green-50 border-green-200",
    icon: "🟩",
    axes: ["digestif", "immuno", "orlRespiratoire", "cardioMetabo", "urorenal", "dermato"]
  }
];

// ==========================================
// DÉFINITION DES AXES
// ==========================================

export const AXES_DEFINITION: AxisDefinition[] = [
  // ═══════════════════════════════════════════════════
  // 🟦 BLOC 1 : TERRAIN & HISTOIRE
  // ═══════════════════════════════════════════════════
  {
    key: "historique",
    label: "Antécédents & Ligne de Vie",
    description: "Chronologie, chocs, chirurgies, développement, hérédité",
    questions: HistoriqueConfig,
    bloc: "terrain",
    icon: "📜"
  },
  {
    key: "modeVie",
    label: "Mode de Vie",
    description: "Alimentation, sommeil, activité physique, toxiques, stress quotidien",
    questions: ModeVieConfig,
    bloc: "terrain",
    icon: "🏃"
  },
  {
    key: "terrains",
    label: "Terrains Pathologiques",
    description: "Spasmophile, Atopique, Auto-immun, Congestif, Métabolique, Dégénératif, Oxydatif",
    questions: TerrainsPathologiquesConfig,
    bloc: "terrain",
    icon: "🎯"
  },

  // ═══════════════════════════════════════════════════
  // 🟪 BLOC 2 : LES GESTIONNAIRES
  // ═══════════════════════════════════════════════════
  {
    key: "neuro",
    label: "Axe Neurovégétatif (SNA)",
    description: "Parasympathique, Alpha-sympathique, Bêta-sympathique, Autacoïdes, Spasmophilie",
    questions: AxeNeuroConfig,
    bloc: "gestionnaires",
    icon: "🧠"
  },
  {
    key: "adaptatif",
    label: "Axe Corticotrope (Adaptatif)",
    description: "Cortisol, DHEA, Aldostérone, Stress, Adaptation, Inflammation",
    questions: AxeAdaptatifConfig,
    bloc: "gestionnaires",
    icon: "😰"
  },
  {
    key: "thyro",
    label: "Axe Thyréotrope",
    description: "TRH, TSH, T4, T3, Métabolisme, Énergie, Thermorégulation, Psychisme",
    questions: AxeThyroConfig,
    bloc: "gestionnaires",
    icon: "🦋"
  },
  {
    key: "gonado",
    label: "Axe Gonadotrope",
    description: "FSH, LH, Œstrogènes, Progestérone, Testostérone, Cycles, Fertilité",
    questions: AxeGonadoConfig,
    bloc: "gestionnaires",
    icon: "🌸"
  },
  {
    key: "somato",
    label: "Axe Somatotrope",
    description: "GH, IGF-1, Prolactine, Insuline, Croissance, Réparation, Récupération",
    questions: AxeSomatoConfig,
    bloc: "gestionnaires",
    icon: "💪"
  },

  // ═══════════════════════════════════════════════════
  // 🟩 BLOC 3 : ÉMONCTOIRES & ORGANES
  // ═══════════════════════════════════════════════════
  {
    key: "digestif",
    label: "Sphère Digestive & Hépatique",
    description: "Estomac, Foie/Vésicule, Pancréas, Intestins, Transit, Intolérances",
    questions: AxeDigestifConfig,
    bloc: "emonctoires",
    icon: "🍽️"
  },
  {
    key: "immuno",
    label: "Sphère Immuno-Inflammatoire",
    description: "Immunité, Inflammation, Infections, Auto-immunité, Allergies",
    questions: AxeImmunoConfig,
    bloc: "emonctoires",
    icon: "🛡️"
  },
  {
    key: "orlRespiratoire",
    label: "Sphère ORL & Respiratoire",
    description: "Nez, Sinus, Gorge, Oreilles, Bronches, Poumons, Allergies respiratoires",
    questions: AxeORLRespiratoireConfig,
    bloc: "emonctoires",
    icon: "🫁"
  },
  {
    key: "cardioMetabo",
    label: "Sphère Cardio-Métabolique",
    description: "Cœur, Tension, Circulation, Lipides, Glycémie, Poids",
    questions: AxeCardioMetaboConfig,
    bloc: "emonctoires",
    icon: "❤️"
  },
  {
    key: "urorenal",
    label: "Sphère Uro-Rénale",
    description: "Reins, Vessie, Prostate, Infections urinaires, Lithiases",
    questions: AxeUrorenalConfig,
    bloc: "emonctoires",
    icon: "💧"
  },
  {
    key: "dermato",
    label: "Sphère Dermato & Phanères",
    description: "Peau, Cheveux, Ongles, Muqueuses, Cicatrisation",
    questions: AxeDermatoConfig,
    bloc: "emonctoires",
    icon: "🧴"
  }
];

// ==========================================
// EXPORTS
// ==========================================

export {
  // Bloc 1 : Terrain
  HistoriqueConfig,
  ModeVieConfig,
  TerrainsPathologiquesConfig,
  
  // Bloc 2 : Gestionnaires
  AxeNeuroConfig,
  AxeAdaptatifConfig,
  AxeThyroConfig,
  AxeGonadoConfig,
  AxeSomatoConfig,
  
  // Bloc 3 : Émonctoires
  AxeDigestifConfig,
  AxeImmunoConfig,
  AxeORLRespiratoireConfig,
  AxeCardioMetaboConfig,
  AxeUrorenalConfig,
  AxeDermatoConfig
};

// ==========================================
// HELPERS
// ==========================================

/**
 * Récupère toutes les questions d'un bloc
 */
export function getQuestionsByBloc(blocKey: BlocKey): QuestionConfig[] {
  const bloc = BLOCS_DEFINITION.find(b => b.key === blocKey);
  if (!bloc) return [];
  
  return bloc.axes.flatMap(axisKey => {
    const axis = AXES_DEFINITION.find(a => a.key === axisKey);
    return axis ? (axis.questions as QuestionConfig[]) : [];
  });
}

/**
 * Récupère un axe par sa clé
 */
export function getAxisByKey(key: AxisKey): AxisDefinition | undefined {
  return AXES_DEFINITION.find(a => a.key === key);
}

/**
 * Compte le total de questions
 */
export function getTotalQuestionCount(): number {
  return AXES_DEFINITION.reduce((total, axis) => total + axis.questions.length, 0);
}

/**
 * Récupère les questions du pack essentiel (priority 1 avec tag pack_essentiel)
 */
export function getEssentialQuestions(): QuestionConfig[] {
  return AXES_DEFINITION.flatMap(axis => 
    (axis.questions as QuestionConfig[]).filter(q => 
      q.priority === 1 && q.tags?.includes("pack_essentiel")
    )
  );
}