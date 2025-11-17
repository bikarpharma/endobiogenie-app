import type { QuestionConfig } from "../types";

/**
 * Axe Digestif
 * -----------------------------------------------------
 * Explore la digestion haute (estomac), le foie/VB,
 * l'intestin grêle, le côlon et les intolérances.
 * Structure validée et non redondante.
 */

export const AxeDigestifConfig: QuestionConfig[] = [

  // ---------------------------------------------------
  // 1. ESTOMAC & DIGESTION HAUTE
  // ---------------------------------------------------
  {
    id: "digestif_lourdeurs_haut",
    section: "Estomac",
    question: "Ressentez-vous des lourdeurs ou un ralentissement après le repas ?",
    type: "boolean",
    tooltip:
      "Signe d'hypochlorhydrie fonctionnelle ou de lenteur gastrique (axe estomac)."
  },
  {
    id: "digestif_reflux",
    section: "Estomac",
    question: "Avez-vous des brûlures d'estomac ou du reflux ?",
    type: "boolean",
    tooltip:
      "Indique une irritation gastrique ou une faiblesse du sphincter œsophagien inférieur."
  },
  {
    id: "digestif_naussees",
    section: "Estomac",
    question: "Avez-vous des nausées en dehors de causes identifiées ?",
    type: "boolean",
    tooltip:
      "Les nausées reflètent un déséquilibre entre estomac, stress et fonction biliaire."
  },

  // ---------------------------------------------------
  // 2. FOIE / VÉSICULE BILIAIRE
  // ---------------------------------------------------
  {
    id: "digestif_mauvaise_digest_graisses",
    section: "Foie / Vésicule biliaire",
    question: "Tolérez-vous mal les repas gras (lourdeur, inconfort) ?",
    type: "boolean",
    tooltip:
      "Indique un ralentissement de la vésicule biliaire ou un déficit de sécrétion biliaire."
  },
  {
    id: "digestif_amertume",
    section: "Foie / Vésicule biliaire",
    question: "Avez-vous parfois un goût amer ou métallique dans la bouche ?",
    type: "boolean",
    tooltip:
      "Signe classique de stagnation hépatobiliaire ou de reflux biliaire."
  },
  {
    id: "digestif_ballonnements_postprandiaux",
    section: "Foie / Vésicule biliaire",
    question: "Avez-vous des ballonnements après les repas ?",
    type: "boolean",
    tooltip:
      "Peut refléter un trouble biliaire modéré ou une fermentation haute."
  },

  // ---------------------------------------------------
  // 3. INTESTIN GRÊLE (assimilation, fermentation haute)
  // ---------------------------------------------------
  {
    id: "digestif_digestion_lente",
    section: "Intestin grêle",
    question: "Avez-vous l'impression que votre digestion est lente ?",
    type: "boolean",
    tooltip:
      "Indique une faiblesse enzymatique ou un ralentissement de l'intestin grêle."
  },
  {
    id: "digestif_sensibilite_graisses",
    section: "Intestin grêle",
    question: "Vous sentez-vous vite 'lourd' après un plat riche ?",
    type: "boolean",
    tooltip:
      "Lourdeur = faible assimilation grasse → corrélation hépatobiliaire."
  },
  {
    id: "digestif_meteorisme",
    section: "Intestin grêle",
    question: "Avez-vous du météorisme (gonflement abdominal, gaz) ?",
    type: "boolean",
    tooltip:
      "La fermentation haute indique un déséquilibre du microbiote ou une mauvaise digestion initiale."
  },

  // ---------------------------------------------------
  // 4. CÔLON (hors transit basique)
  // ---------------------------------------------------
  {
    id: "digestif_douleurs_coliques",
    section: "Côlon",
    question: "Avez-vous des douleurs abdominales de type coliques ?",
    type: "boolean",
    tooltip:
      "Évalue les spasmes coliques, souvent liés au couplage stress–intestin."
  },
  {
    id: "digestif_selles_irregulieres",
    section: "Côlon",
    question: "Vos selles sont-elles irrégulières (hors transit simple) ?",
    type: "select",
    options: ["Non", "Selles molles", "Selles dures", "Alternance"],
    tooltip:
      "Renseigne sur la motricité colique, indépendamment du transit thyro/parasy."
  },
  {
    id: "digestif_mucus_selles",
    section: "Côlon",
    question: "Avez-vous remarqué du mucus dans vos selles ?",
    type: "boolean",
    tooltip:
      "Peut indiquer une irritation colique, inflammation douce ou dysbiose."
  },

  // ---------------------------------------------------
  // 5. INTOLÉRANCES & SENSIBILITÉS
  // ---------------------------------------------------
  {
    id: "digestif_sensibilite_lactose",
    section: "Intolérances",
    question: "Avez-vous une sensibilité au lactose ?",
    type: "boolean",
    tooltip:
      "Les intolérances alimentaires orientent sur l'activité enzymatique et la perméabilité intestinale."
  },
  {
    id: "digestif_sensibilite_gluten",
    section: "Intolérances",
    question: "Avez-vous une sensibilité au gluten (hors maladie coeliaque) ?",
    type: "boolean",
    tooltip:
      "La sensibilité au gluten reflète souvent une hyperréactivité colique ou un terrain inflammatoire bas grade."
  },
  {
    id: "digestif_reactions_aliments",
    section: "Intolérances",
    question: "Réagissez-vous à certains aliments (ballonnements, gaz, lourdeur) ?",
    type: "text",
    tooltip:
      "Les réactions alimentaires sont essentielles pour comprendre la perméabilité intestinale et la dysbiose."
  }
];

export default AxeDigestifConfig;
