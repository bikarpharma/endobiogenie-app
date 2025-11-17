import type { QuestionConfig } from "../types";

/**
 * Axe Gonadique
 * -----------------------------------------------------
 * Regroupe femmes + hommes, avec filtrage dynamique via
 * la propriété "gender" : "female" | "male" | "both".
 *
 * Structure :
 * - Cycles et symptômes féminins
 * - Sexualité féminine
 * - Grossesse / post-partum / ménopause
 * - Sexualité masculine
 * - Expression androgénique (homme)
 * - Signes généraux gonadiques (both)
 */

export type GonadoQuestion = QuestionConfig & {
  gender: "female" | "male" | "both";
};

export const AxeGonadoConfig: GonadoQuestion[] = [

  // ---------------------------------------------------
  // 1. CYCLES MENSTRUELS (FEMME)
  // ---------------------------------------------------
  {
    id: "gonado_cycles_reguliers",
    section: "Cycles menstruels",
    question: "[Femme] Vos cycles sont-ils réguliers ?",
    type: "select",
    options: ["Réguliers", "Irréguliers", "Absents"],
    gender: "female",
    tooltip:
      "Évalue la stabilité de l'axe gonadotrope et le rapport estrogènes/progestérone."
  },
  {
    id: "gonado_regles_douloureuses",
    section: "Cycles menstruels",
    question: "[Femme] Avez-vous des règles douloureuses (dysménorrhées) ?",
    type: "select",
    options: ["Non", "Oui légères", "Oui modérées", "Oui intenses"],
    gender: "female",
    tooltip:
      "Indique une tension estrogénique, une hyperprostaglandinémie ou une dominance relative des estrogènes."
  },
  {
    id: "gonado_flux",
    section: "Cycles menstruels",
    question: "[Femme] Comment décririez-vous votre flux menstruel ?",
    type: "select",
    options: ["Faible", "Normal", "Abondant", "Très abondant"],
    gender: "female",
    tooltip:
      "Le flux reflète l'équilibre estrogénique, la tonicité utérine et la dominance relative d'hormones sexuelles."
  },
  {
    id: "gonado_syndrome_pre_menstruel",
    section: "Cycles menstruels",
    question: "[Femme] Présentez-vous un syndrome prémenstruel (PMS) ?",
    type: "select",
    options: ["Non", "Léger", "Modéré", "Sévère"],
    gender: "female",
    tooltip:
      "Le PMS est un signe classique d'insuffisance progestative relative ou d'hypersensibilité oestrogénique."
  },
  {
    id: "gonado_mucus_variations",
    section: "Cycles menstruels",
    question: "[Femme] Avez-vous remarqué des variations de mucus cervical ?",
    type: "select",
    options: ["Oui", "Non", "Inconnu"],
    gender: "female",
    tooltip:
      "Élément utile pour comprendre la fertilité, l'ovulation et la balance estro-progestative."
  },

  // ---------------------------------------------------
  // 2. SEXUALITÉ FÉMININE
  // ---------------------------------------------------
  {
    id: "gonado_secheresse_vaginale",
    section: "Sexualité féminine",
    question: "[Femme] Avez-vous une sécheresse vaginale ?",
    type: "boolean",
    gender: "female",
    tooltip:
      "La sécheresse traduit un manque d'estrogènes ou une dysrégulation du terrain muqueux."
  },
  {
    id: "gonado_libido_femme",
    section: "Sexualité féminine",
    question: "[Femme] Comment évaluez-vous votre libido ?",
    type: "select",
    options: ["Normale", "Basse", "Très basse"],
    gender: "female",
    tooltip:
      "La libido féminine dépend des estrogènes, de la progestérone et des androgènes surrénaliens."
  },

  // ---------------------------------------------------
  // 3. GROSSESSES / POST-PARTUM / MÉNOPAUSE (FEMME)
  // ---------------------------------------------------
  {
    id: "gonado_grossesses_nb",
    section: "Grossesse & Ménopause",
    question: "[Femme] Combien de grossesses avez-vous eues ?",
    type: "select",
    options: ["Aucune", "1", "2+", "Complications"],
    gender: "female",
    tooltip:
      "Les grossesses modifient durablement l'équilibre gonadique, thyroïdien et adaptatif."
  },
  {
    id: "gonado_postpartum",
    section: "Grossesse & Ménopause",
    question: "[Femme] Avez-vous eu des troubles après un accouchement (post-partum) ?",
    type: "select",
    options: ["Non", "Oui légers", "Oui modérés", "Oui importants"],
    gender: "female",
    tooltip:
      "Le post-partum est un moment de grande vulnérabilité endocrine (thyroïde, cortisol, estrogènes)."
  },
  {
    id: "gonado_menopause",
    section: "Grossesse & Ménopause",
    question: "[Femme] Êtes-vous ménopausée ?",
    type: "select",
    options: ["Non", "Oui récente", "Oui installée"],
    gender: "female",
    tooltip:
      "La ménopause modifie profondément la physiologie estrogénique, les muqueuses et le sommeil."
  },

  // ---------------------------------------------------
  // 4. SEXUALITÉ MASCULINE
  // ---------------------------------------------------
  {
    id: "gonado_libido_homme",
    section: "Sexualité masculine",
    question: "[Homme] Comment évaluez-vous votre libido ?",
    type: "select",
    options: ["Normale", "Basse", "Très basse"],
    gender: "male",
    tooltip:
      "La libido masculine reflète l'équilibre androgénique et la dynamique cortisol/testostérone."
  },
  {
    id: "gonado_erections_qualite",
    section: "Sexualité masculine",
    question: "[Homme] La qualité de vos érections a-t-elle changé ?",
    type: "select",
    options: ["Non", "Oui légère baisse", "Oui baisse importante"],
    gender: "male",
    tooltip:
      "L'érection dépend du tonus parasympathique et du niveau d'androgènes circulants."
  },
  {
    id: "gonado_pilosite",
    section: "Sexualité masculine",
    question: "[Homme] Avez-vous noté des changements de pilosité ?",
    type: "select",
    options: ["Non", "Augmentation", "Diminution"],
    gender: "male",
    tooltip:
      "La pilosité est un reflet direct de l'activité androgénique périphérique."
  },

  // ---------------------------------------------------
  // 5. SIGNES GÉNÉRAUX GONADIQUES (BOTH)
  // ---------------------------------------------------
  {
    id: "gonado_humeur",
    section: "Signes généraux",
    question: "Avez-vous des variations d'humeur liées au cycle ou au stress ?",
    type: "boolean",
    gender: "both",
    tooltip:
      "Les hormones sexuelles modulent la sérotonine, la sensibilité au stress et l'anxiété."
  },
  {
    id: "gonado_peau_modifications",
    section: "Signes généraux",
    question: "Avez-vous des variations de peau (acné, sébum, sécheresse) ?",
    type: "boolean",
    gender: "both",
    tooltip:
      "La peau reflète la balance estrogènes/androgènes et l'activité surrénalienne."
  },
  {
    id: "gonado_sommeil_variations",
    section: "Signes généraux",
    question: "Votre sommeil varie-t-il en fonction de votre cycle ou du stress ?",
    type: "boolean",
    gender: "both",
    tooltip:
      "Le sommeil dépend fortement des hormones sexuelles (progestérone apaisante, estrogènes stimulants, androgènes stabilisants)."
  }
];

export default AxeGonadoConfig;
