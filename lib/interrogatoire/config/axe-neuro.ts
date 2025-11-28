import type { QuestionConfig } from "../types";

/**
 * AXE NEUROVÉGÉTATIF (ANS - SYSTÈME NERVEUX AUTONOME)
 * -------------------------------------------------
 * Discrimine les 3 branches du système nerveux autonome :
 * - PARASYMPATHIQUE (Anabolisme, Sécrétion, Congestion)
 * - SYMPATHIQUE ALPHA (Vasoconstriction, Rétention, Vigilance)
 * - SYMPATHIQUE BÊTA (Cardio, Spasme, Émotivité)
 *
 * SPÉCIFICITÉ : C'est l'axe central qui régule tous les autres axes
 */

const AxeNeuroConfig: QuestionConfig[] = [
  // ==========================================
  // 1. PARASYMPATHIQUE (Anabolisme, Sécrétion, Congestion)
  // ==========================================
  {
    id: "neuro_para_salivation",
    question: "Avez-vous tendance à l'hypersalivation (bave sur l'oreiller, besoin d'avaler souvent) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'hypertonie vagale haute. Le parasympathique stimule les sécrétions digestives.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    section: "Parasympathique"
  },
  {
    id: "neuro_para_nausee",
    question: "Avez-vous le mal des transports ou des nausées faciles (odeurs fortes) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hyper-réflexivité vagale. Indique un système parasympathique très réactif.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    section: "Parasympathique"
  },
  {
    id: "neuro_para_nez_bouche",
    question: "Avez-vous souvent le nez bouché (congestion) après les repas ou le soir, sans rhume ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Vasodilatation muqueuse passive sous l'effet du vague post-prandial.",
    weight: 2,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    section: "Parasympathique"
  },
  {
    id: "neuro_para_memoire",
    question: "Avez-vous une excellente mémoire des faits anciens (nostalgie) mais tendance à ruminer ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le parasympathique favorise l'intériorisation, la mémorisation et le repli sur soi.",
    weight: 1,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    section: "Parasympathique"
  },

  // ==========================================
  // 2. SYMPATHIQUE ALPHA (Vasoconstriction, Rétention)
  // ==========================================
  {
    id: "neuro_alpha_froid",
    question: "Avez-vous souvent les mains et les pieds glacés (alors que le reste du corps est chaud) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Vasoconstriction périphérique excessive. Le sang est chassé vers les muscles profonds.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    section: "Sympathique Alpha"
  },
  {
    id: "neuro_alpha_peau_seche",
    question: "Votre peau est-elle sèche, ou vos yeux secs, malgré une bonne hydratation ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'Alpha ferme les capillaires et assèche les muqueuses (inhibition des sécrétions).",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    section: "Sympathique Alpha"
  },
  {
    id: "neuro_alpha_constipation",
    question: "Êtes-vous constipé avec des selles sèches (type crottes de bique) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Spasme tonique des sphincters et assèchement colique.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    section: "Sympathique Alpha"
  },
  {
    id: "neuro_alpha_mental",
    question: "Avez-vous du mal à 'débrancher' le soir (pensées qui tournent en boucle) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hypervigilance cérébrale médiée par la noradrénaline.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    section: "Sympathique Alpha"
  },

  // ==========================================
  // 3. SYMPATHIQUE BÊTA (Cardio, Spasme, Émotion)
  // ==========================================
  {
    id: "neuro_beta_palpitations",
    question: "Avez-vous des palpitations (cœur qui bat fort/vite) au repos ou au moindre stress ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Hypersensibilité des récepteurs Bêta-1 cardiaques à l'adrénaline.",
    weight: 3,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    section: "Sympathique Bêta"
  },
  {
    id: "neuro_beta_emotivite",
    question: "Êtes-vous hyper-émotif (rougissement, larmes faciles, gorge serrée) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Réactivité vasomotrice de surface et spasme laryngé.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    section: "Sympathique Bêta"
  },
  {
    id: "neuro_beta_tremblements",
    question: "Avez-vous des tremblements fins des mains quand vous êtes énervé ou à jeun ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Excitation neuromusculaire périphérique.",
    weight: 2,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    section: "Sympathique Bêta"
  },
  {
    id: "neuro_beta_spasmes",
    question: "Avez-vous des spasmes douloureux (ventre, règles) qui sont soulagés par la chaleur ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le Bêta provoque des spasmes cinétiques (mouvements désordonnés des muscles lisses).",
    weight: 2,
    priority: 3, // OPTIONNEL
    scoreDirection: "hyper",
    section: "Sympathique Bêta"
  },

  // ==========================================
  // 4. ÉQUILIBRE & SOMMEIL (Synthèse)
  // ==========================================
  {
    id: "neuro_sommeil_endormissement",
    question: "Mettez-vous plus de 30 minutes à vous endormir ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Indique souvent une dominance Sympathique Alpha au moment du coucher (incapacité à lâcher prise).",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    section: "Équilibre & Sommeil"
  },
  {
    id: "neuro_reveil_nocturne",
    question: "Vous réveillez-vous vers 3h-4h du matin avec anxiété ou transpiration ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Décharge d'adrénaline nocturne (réactionnelle à une hypoglycémie ou stress).",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    section: "Équilibre & Sommeil"
  },
  {
    id: "neuro_reveil_1h_3h",
    question: "Vous réveillez-vous entre 1h et 3h du matin ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'heure du foie en chronobiologie. Signe de congestion hépatobiliaire nocturne.",
    weight: 2,
    priority: 1, // ESSENTIEL
    scoreDirection: "hyper",
    section: "Équilibre & Sommeil",
    tags: ["congestion_hepatique", "chronobiologie"]
  },
  {
    id: "neuro_reves",
    question: "Avez-vous des rêves très vifs ou des cauchemars fréquents ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Rêves vifs = TRH élevé. Cauchemars = décharge adrénergique nocturne.",
    weight: 2,
    priority: 2, // IMPORTANT
    scoreDirection: "hyper",
    section: "Équilibre & Sommeil",
    tags: ["trh_eleve", "sommeil_rem"]
  }
];

export default AxeNeuroConfig;
