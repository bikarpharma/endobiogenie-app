import type { QuestionConfig } from "../types";
import HistoriqueConfig from "./historique";
import ModeVieConfig from "./mode-de-vie";
import AxeNeuroConfig from "./axe-neuro";
import AxeAdaptatifConfig from "./axe-adaptatif";
import AxeThyroConfig from "./axe-thyro";
import AxeGonadoConfig, { type GonadoQuestion } from "./axe-gonado";
import AxeSomatoConfig from "./axe-somato";
import AxeDigestifConfig from "./axe-digestif";
import AxeImmunoConfig from "./axe-immuno";
import AxeCardioMetaboConfig from "./axe-cardio-metabo";
import AxeDermatoConfig from "./axe-dermato";

export type AxisKey =
  | "historique"
  | "modeVie"
  | "neuro"
  | "adaptatif"
  | "thyro"
  | "gonado"
  | "somato"
  | "digestif"
  | "immuno"
  | "cardioMetabo"
  | "dermato";

export type BlocKey = "terrain" | "gestionnaires" | "emonctoires";

export interface AxisDefinition {
  key: AxisKey;
  label: string;
  description: string;
  questions: QuestionConfig[] | GonadoQuestion[];
  bloc?: BlocKey; // Pour le groupement visuel
  icon?: string; // Emoji pour la navigation
}

export interface BlocDefinition {
  key: BlocKey;
  label: string;
  description: string;
  color: string; // Couleur du bloc (bg-blue-50, bg-purple-50, bg-green-50)
  icon: string;
  axes: AxisKey[];
}

// 🟦 BLOC 1 : TERRAIN & HISTOIRE
// 🟪 BLOC 2 : LES GESTIONNAIRES (Système Neuro-Endocrinien)
// 🟩 BLOC 3 : ÉMONCTOIRES & ORGANES

export const BLOCS_DEFINITION: BlocDefinition[] = [
  {
    key: "terrain",
    label: "Terrain & Histoire",
    description: "Les fondations : antécédents, mode de vie, contexte",
    color: "bg-blue-50 border-blue-200",
    icon: "🟦",
    axes: ["historique", "modeVie"]
  },
  {
    key: "gestionnaires",
    label: "Les Gestionnaires",
    description: "Le système neuro-endocrinien",
    color: "bg-purple-50 border-purple-200",
    icon: "🟪",
    axes: ["neuro", "adaptatif", "thyro", "gonado", "somato"]
  },
  {
    key: "emonctoires",
    label: "Émonctoires & Organes",
    description: "Les conséquences symptomatiques",
    color: "bg-green-50 border-green-200",
    icon: "🟩",
    axes: ["digestif", "immuno", "cardioMetabo", "dermato"]
  }
];

export const AXES_DEFINITION: AxisDefinition[] = [
  // 🟦 BLOC 1 : TERRAIN & HISTOIRE
  {
    key: "historique",
    label: "Antécédents & Ligne de Vie",
    description: "Chronologie, chocs, chirurgies, développement",
    questions: HistoriqueConfig,
    bloc: "terrain",
    icon: "📜"
  },
  {
    key: "modeVie",
    label: "Mode de Vie",
    description: "Alimentation, sommeil global, toxiques (alcool, tabac)",
    questions: ModeVieConfig,
    bloc: "terrain",
    icon: "🏃"
  },

  // 🟪 BLOC 2 : LES GESTIONNAIRES
  {
    key: "neuro",
    label: "Axe Neurovégétatif",
    description: "Sympathique (Alpha/Bêta), Parasympathique, Sommeil, Rythmes",
    questions: AxeNeuroConfig,
    bloc: "gestionnaires",
    icon: "🧠"
  },
  {
    key: "adaptatif",
    label: "Axe Corticotrope",
    description: "Stress, Adaptation, Inflammation, Psychisme Anxieux",
    questions: AxeAdaptatifConfig,
    bloc: "gestionnaires",
    icon: "😰"
  },
  {
    key: "thyro",
    label: "Axe Thyréotrope",
    description: "Métabolisme, Énergie, Psychisme Dépressif",
    questions: AxeThyroConfig,
    bloc: "gestionnaires",
    icon: "🦋"
  },
  {
    key: "gonado",
    label: "Axe Gonadotrope",
    description: "Reproduction, Cycles, Sexualité",
    questions: AxeGonadoConfig,
    bloc: "gestionnaires",
    icon: "🌸"
  },
  {
    key: "somato",
    label: "Axe Somatotrope",
    description: "Croissance, Réparation, Récupération",
    questions: AxeSomatoConfig,
    bloc: "gestionnaires",
    icon: "💪"
  },

  // 🟩 BLOC 3 : ÉMONCTOIRES & ORGANES
  {
    key: "digestif",
    label: "Sphère Digestive & Hépatique",
    description: "Estomac, Foie/VB, Intestins, Intolérances",
    questions: AxeDigestifConfig,
    bloc: "emonctoires",
    icon: "🍽️"
  },
  {
    key: "immuno",
    label: "Sphère Immuno-Inflammatoire",
    description: "ORL, Poumons, Auto-immunité, Allergies",
    questions: AxeImmunoConfig,
    bloc: "emonctoires",
    icon: "🛡️"
  },
  {
    key: "cardioMetabo",
    label: "Sphère Cardio-Métabolique",
    description: "Tension, Circulation, Lipides, Poids",
    questions: AxeCardioMetaboConfig,
    bloc: "emonctoires",
    icon: "❤️"
  },
  {
    key: "dermato",
    label: "Sphère Dermato & Muqueuses",
    description: "Peau, Cheveux, Ongles, Muqueuses",
    questions: AxeDermatoConfig,
    bloc: "emonctoires",
    icon: "🧴"
  }
];

export {
  HistoriqueConfig,
  ModeVieConfig,
  AxeNeuroConfig,
  AxeAdaptatifConfig,
  AxeThyroConfig,
  AxeGonadoConfig,
  AxeSomatoConfig,
  AxeDigestifConfig,
  AxeImmunoConfig,
  AxeCardioMetaboConfig,
  AxeDermatoConfig
};
