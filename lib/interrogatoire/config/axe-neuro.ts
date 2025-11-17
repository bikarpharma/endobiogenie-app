import type { QuestionConfig } from "../types";

/**
 * Axe Neurovégétatif
 * -----------------------------------------------------
 * Axe fondamental en endobiogénie.
 * Explore l'équilibre para / alpha / bêta, ainsi que
 * les rythmes, la régulation glucidique, la
 * thermorégulation et la réactivité périphérique.
 */

export const AxeNeuroConfig: QuestionConfig[] = [

  // ---------------------------------------------------
  // 1. SOMMEIL & RYTHMICITÉ (para / bêta central)
  // ---------------------------------------------------
  {
    id: "neuro_sommeil_endormissement",
    section: "Sommeil & Rythmes",
    question: "Avez-vous des difficultés d'endormissement ?",
    type: "boolean",
    tooltip:
      "Évalue le tonus parasympathique central et la charge bêta centrale (TRH, noradrénaline)."
  },
  {
    id: "neuro_sommeil_reveils_nocturnes",
    section: "Sommeil & Rythmes",
    question: "Avez-vous des réveils nocturnes ?",
    type: "boolean",
    tooltip:
      "Indicateur de déséquilibre para/bêta, souvent lié à des pics cortisoliques nocturnes."
  },
  {
    id: "neuro_sommeil_reveil_horaire",
    section: "Sommeil & Rythmes",
    question: "Si oui, à quelle heure vous réveillez-vous en général ?",
    type: "text",
    tooltip:
      "L'horaire des réveils oriente vers une signature de dérégulation (cortisol 2–4h, glycémie 4–6h…)."
  },
  {
    id: "neuro_sommeil_reveil_fatigue",
    section: "Sommeil & Rythmes",
    question: "Vous réveillez-vous fatigué(e) ?",
    type: "boolean",
    tooltip:
      "Évalue la qualité réelle du sommeil et le fonctionnement GH/cortisol pendant la nuit."
  },

  // ---------------------------------------------------
  // 2. RÉGULATION GLUCIDIQUE / FAIM (αΣ / GH / cortisol)
  // ---------------------------------------------------
  {
    id: "neuro_faim_matinale",
    section: "Régulation glucidique",
    question: "Avez-vous faim le matin ?",
    type: "boolean",
    tooltip:
      "La faim matinale reflète le tonus somatotrope et la stabilité glucidique nocturne."
  },
  {
    id: "neuro_fringales",
    section: "Régulation glucidique",
    question: "Avez-vous des fringales dans la journée ?",
    type: "boolean",
    tooltip:
      "Indicateur de variations glycémiques et d'activité alpha-sympathique."
  },
  {
    id: "neuro_faim_sucre",
    section: "Régulation glucidique",
    question: "Avez-vous envie de sucre entre les repas ?",
    type: "boolean",
    tooltip:
      "Évalue l'équilibre glucagon–insuline–cortisol et la régulation GH."
  },

  // ---------------------------------------------------
  // 3. THERMORÉGULATION / SUDATION (thyroïde ↔ αΣ)
  // ---------------------------------------------------
  {
    id: "neuro_thermo_transpiration",
    section: "Thermorégulation",
    question: "Avez-vous tendance à transpirer facilement ?",
    type: "select",
    options: ["Non", "Oui légère", "Oui abondamment"],
    tooltip:
      "Indicateur d'activité alpha-sympathique et du couplage thyroïdien périphérique."
  },
  {
    id: "neuro_thermo_frilosite",
    section: "Thermorégulation",
    question: "Ressentez-vous souvent de la frilosité ?",
    type: "boolean",
    tooltip:
      "Signale une possible hypofonction thyroïdienne fonctionnelle ou un déséquilibre αΣ."
  },
  {
    id: "neuro_thermo_chaleur",
    section: "Thermorégulation",
    question: "Avez-vous du mal à supporter la chaleur ?",
    type: "boolean",
    tooltip:
      "Indique une hyperréactivité alpha-sympathique et une instabilité thermorégulatrice."
  },

  // ---------------------------------------------------
  // 4. TRANSIT (vagalité périphérique)
  // ---------------------------------------------------
  {
    id: "neuro_transit",
    section: "Transit",
    question: "Quel est votre type de transit ?",
    type: "select",
    options: ["Lent", "Normal", "Rapide"],
    tooltip:
      "Le transit reflète la tonicité vagale, élément majeur du parasympathique périphérique."
  },

  // ---------------------------------------------------
  // 5. ACTIVATION CARDIORESPIRATOIRE (βΣ périphérique)
  // ---------------------------------------------------
  {
    id: "neuro_palpitations",
    section: "Réactivité cardiovasculaire",
    question: "Avez-vous des palpitations ?",
    type: "boolean",
    tooltip:
      "Évalue l'activité bêta-sympathique périphérique et la sensibilité adrénergique."
  },
  {
    id: "neuro_respiration_oppression",
    section: "Réactivité cardiovasculaire",
    question: "Avez-vous parfois une sensation d'oppression ou de souffle court lié au stress ?",
    type: "boolean",
    tooltip:
      "Indicateur d'hyperactivation cortico-sympathique ou de déficit vagal."
  },

  // ---------------------------------------------------
  // 6. ÉNERGIE JOURNALIÈRE (GH / cortisol)
  // ---------------------------------------------------
  {
    id: "neuro_energie_matin",
    section: "Rythme énergétique",
    question: "Comment est votre énergie le matin ?",
    type: "select",
    options: ["Bonne", "Moyenne", "Mauvaise"],
    tooltip:
      "Reflète l'activité somatotrope nocturne et la synchronisation du cortisol."
  },
  {
    id: "neuro_energie_apresmidi",
    section: "Rythme énergétique",
    question: "Comment est votre énergie en après-midi ?",
    type: "select",
    options: ["Bonne", "Moyenne", "Mauvaise"],
    tooltip:
      "Permet d'évaluer la régulation GH/cortisol et les chutes glycémiques."
  },
  {
    id: "neuro_energie_soir",
    section: "Rythme énergétique",
    question: "Comment est votre énergie le soir ?",
    type: "select",
    options: ["Bonne", "Moyenne", "Mauvaise"],
    tooltip:
      "Indicateur de la dérégulation circadienne et de la fatigue de l'axe adaptatif."
  }
];

export default AxeNeuroConfig;
