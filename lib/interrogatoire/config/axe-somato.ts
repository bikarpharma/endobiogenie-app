import type { QuestionConfig } from "../types";

/**
 * Axe Somatotrope (GH / IGF1)
 * -----------------------------------------------------
 * Explore l'énergie matinale, le sommeil profond,
 * la récupération musculaire, le métabolisme glucidique,
 * la croissance et la masse maigre.
 * Cohérent avec Vol.1, Vol.2 et Vol.4.
 */

export const AxeSomatoConfig: QuestionConfig[] = [

  // ---------------------------------------------------
  // 1. ÉNERGIE MATINALE & SOMMEIL PROFOND
  // ---------------------------------------------------
  {
    id: "somato_fatigue_matin",
    section: "Sommeil & Énergie",
    question: "Vous sentez-vous fatigué(e) le matin, au réveil ?",
    type: "boolean",
    tooltip:
      "Indique un déficit de sommeil profond ou une faiblesse de l'axe somatotrope (GH nocturne)."
  },
  {
    id: "somato_sommeil_profond",
    section: "Sommeil & Énergie",
    question: "Avez-vous l'impression de manquer de sommeil profond ou réparateur ?",
    type: "boolean",
    tooltip:
      "Le sommeil profond est la période clé de sécrétion de GH et de reconstruction tissulaire."
  },

  // ---------------------------------------------------
  // 2. PERFORMANCE & RÉCUPÉRATION
  // ---------------------------------------------------
  {
    id: "somato_effort_fatigue",
    section: "Performance & Récupération",
    question: "Êtes-vous rapidement fatigué(e) lors d'un effort physique ?",
    type: "boolean",
    tooltip:
      "Indique un faible tonus somatotrope ou une mauvaise gestion GH/IGF1."
  },
  {
    id: "somato_recuperation_lente",
    section: "Performance & Récupération",
    question: "Récupérez-vous lentement après un effort ?",
    type: "boolean",
    tooltip:
      "Un temps de récupération long est associé à une activité somatotrope insuffisante."
  },
  {
    id: "somato_douleurs_tendineuses",
    section: "Performance & Récupération",
    question: "Avez-vous des douleurs tendineuses ou ligamentaires récurrentes ?",
    type: "boolean",
    tooltip:
      "Les tendons sont très dépendants de l'activité GH/IGF-1, surtout chez les sportifs."
  },

  // ---------------------------------------------------
  // 3. MÉTABOLISME GLUCIDIQUE (non corticotrope)
  // ---------------------------------------------------
  {
    id: "somato_fringale_matinale",
    section: "Métabolisme glucidique",
    question: "Avez-vous souvent faim le matin (besoin de manger rapidement) ?",
    type: "boolean",
    tooltip:
      "La GH régule la glycémie nocturne. Une faim pressante peut traduire un déficit fonctionnel."
  },
  {
    id: "somato_coup_de_barre",
    section: "Métabolisme glucidique",
    question: "Avez-vous des 'coups de barre' dans la journée hors stress ?",
    type: "boolean",
    tooltip:
      "Permet de distinguer fatigue somatotrope d'une chute cortisolique (axe adaptatif)."
  },
  {
    id: "somato_tolerance_jeune",
    section: "Métabolisme glucidique",
    question: "Tenez-vous facilement un jeûne de 10–12 heures ?",
    type: "select",
    options: ["Oui", "Non", "Parfois"],
    tooltip:
      "La GH permet d'assurer l'homéostasie glucidique prolongée. Une faible tolérance suggère une faiblesse somatotrope."
  },

  // ---------------------------------------------------
  // 4. CROISSANCE & DÉVELOPPEMENT (enfant/adolescent)
  // ---------------------------------------------------
  {
    id: "somato_croissance",
    section: "Croissance & Développement",
    question: "Dans votre enfance/adolescence, votre croissance était-elle normale ?",
    type: "select",
    options: ["Normale", "Lente", "Accélérée", "Inégale"],
    tooltip:
      "La croissance reflète directement l'activité GH/IGF1. Indicateur très utile chez l'adulte pour comprendre l'histoire endocrine."
  },
  {
    id: "somato_puberte",
    section: "Croissance & Développement",
    question: "Votre puberté était-elle dans les temps ?",
    type: "select",
    options: ["Normale", "Précoce", "Retardée"],
    tooltip:
      "La GH interagit avec le gonadotrope au moment de la puberté. Pertinent pour comprendre le terrain adolescent."
  },

  // ---------------------------------------------------
  // 5. MASSE MUSCULAIRE & TONUS
  // ---------------------------------------------------
  {
    id: "somato_muscles_faibles",
    section: "Masse musculaire",
    question: "Avez-vous la sensation d'un manque de force musculaire ?",
    type: "boolean",
    tooltip:
      "La masse maigre dépend en grande partie de l'activité GH. Un manque de force est un marqueur d'insuffisance fonctionnelle."
  },
  {
    id: "somato_perte_musculaire",
    section: "Masse musculaire",
    question: "Avez-vous perdu de la masse musculaire récemment ?",
    type: "select",
    options: ["Non", "Oui légère", "Oui importante"],
    tooltip:
      "La sarcopénie fonctionnelle est fortement liée au déficit somatotrope."
  },
  {
    id: "somato_difficulte_reveil",
    section: "Masse musculaire",
    question: "Avez-vous des difficultés à 'démarrer' le matin (lenteur physique) ?",
    type: "boolean",
    tooltip:
      "La GH prépare l'organisme pour le matin. Une lenteur marquée suggère un déficit de reconstruction nocturne."
  }
];

export default AxeSomatoConfig;
