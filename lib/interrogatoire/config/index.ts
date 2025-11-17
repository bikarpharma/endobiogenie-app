import type { QuestionConfig } from "../types";
import HistoriquePatientConfig from "./historique";
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
  | "neuro"
  | "adaptatif"
  | "thyro"
  | "gonado"
  | "somato"
  | "digestif"
  | "immuno"
  | "cardioMetabo"
  | "dermato";

export interface AxisDefinition {
  key: AxisKey;
  label: string;
  description: string;
  questions: QuestionConfig[] | GonadoQuestion[];
}

export const AXES_DEFINITION: AxisDefinition[] = [
  {
    key: "historique",
    label: "Historique",
    description: "Contexte de vie, naissance, développement, antécédents et mode de vie.",
    questions: HistoriquePatientConfig
  },
  {
    key: "neuro",
    label: "Neurovégétatif",
    description: "Sommeil, rythmes, faim, thermorégulation, palpitations et énergie.",
    questions: AxeNeuroConfig
  },
  {
    key: "adaptatif",
    label: "Adaptatif (Corticotrope)",
    description: "Stress aigu/chronique, charge mentale, hypoglycémies fonctionnelles.",
    questions: AxeAdaptatifConfig
  },
  {
    key: "thyro",
    label: "Thyroïdien",
    description: "Thermorégulation, peau, transit lié à la thyroïde, énergie et rythme.",
    questions: AxeThyroConfig
  },
  {
    key: "gonado",
    label: "Gonado (H/F)",
    description: "Cycles, sexualité, ménopause, androgènes, humeur et muqueuses.",
    questions: AxeGonadoConfig
  },
  {
    key: "somato",
    label: "Somatotrope",
    description: "GH/IGF1 : énergie matinale, récupération, croissance, masse musculaire.",
    questions: AxeSomatoConfig
  },
  {
    key: "digestif",
    label: "Digestif",
    description: "Estomac, foie/VB, intestin grêle, côlon et intolérances.",
    questions: AxeDigestifConfig
  },
  {
    key: "immuno",
    label: "Immuno-inflammatoire",
    description: "Allergies, infections répétées, inflammations cutanées et douleurs.",
    questions: AxeImmunoConfig
  },
  {
    key: "cardioMetabo",
    label: "Cardio-métabolique",
    description: "Tension, circulation veineuse, œdèmes, lipides et poids.",
    questions: AxeCardioMetaboConfig
  },
  {
    key: "dermato",
    label: "Dermato & Muqueux",
    description: "Peau, cheveux, ongles, muqueuses et hypersensibilités cutanées.",
    questions: AxeDermatoConfig
  }
];

export {
  HistoriquePatientConfig,
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
