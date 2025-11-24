import type { QuestionConfig } from "../types";

/**
 * AXE SOMATOTROPE (GH/IGF-1) - NIVEAU EXPERT
 * -------------------------------------------------
 * Évalue l'axe de croissance et de réparation tissulaire :
 * - Récupération nocturne et anabolisme
 * - Structure tissulaire (muscles, tendons, peau)
 * - Métabolisme glucidique (régulation GH/Insuline)
 *
 * SPÉCIFICITÉ : La GH est l'hormone de la structure, de la nuit et du "relais" métabolique
 */

const AxeSomatoConfig: QuestionConfig[] = [
  // ==========================================
  // 1. RÉCUPÉRATION & SOMMEIL (L'Anabolisme)
  // ==========================================
  {
    id: "soma_reveil_lourd",
    question: "Au réveil, avez-vous une sensation de corps 'lourd' ou 'cotonneux' (comme du plomb) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe pathognomonique d'un déficit de GH nocturne (manque de réparation structurelle). Différent de la fatigue mentale.",
    weight: 3,
    scoreDirection: "hypo",
    section: "Récupération & Sommeil"
  },
  {
    id: "soma_recuperation_lente",
    question: "Mettez-vous beaucoup de temps à récupérer après un effort physique (courbatures durables) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'IGF-1 est nécessaire pour réparer les micro-lésions musculaires. Une lenteur signe un déficit.",
    weight: 2,
    scoreDirection: "hypo",
    section: "Récupération & Sommeil"
  },
  {
    id: "soma_sommeil_agite",
    question: "Votre sommeil est-il agité (beaucoup de mouvements, draps défaits) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'agitation nocturne peut traduire une lutte hypoglycémique par manque de soutien de la GH.",
    weight: 2,
    scoreDirection: "hypo",
    section: "Récupération & Sommeil"
  },

  // ==========================================
  // 2. STRUCTURE & TISSUS (Le Bâtisseur)
  // ==========================================
  {
    id: "soma_tendinites",
    question: "Souffrez-vous de tendinites à répétition ou de douleurs ligamentaires ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le tissu conjonctif (tendons) dépend exclusivement de l'axe somatotrope pour se renouveler.",
    weight: 2,
    scoreDirection: "hypo",
    section: "Structure & Tissus"
  },
  {
    id: "soma_force_musculaire",
    question: "Avez-vous l'impression de manquer de force musculaire (faiblesse de prise en main) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La sarcopénie fonctionnelle est un marqueur direct de l'activité GH/Testostérone.",
    weight: 2,
    scoreDirection: "hypo",
    section: "Structure & Tissus"
  },
  {
    id: "soma_peau_fine",
    question: "Votre peau est-elle très fine, manquant de densité (papier à cigarette) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le derme (collagène) est sous contrôle somatotrope.",
    weight: 1,
    scoreDirection: "hypo",
    section: "Structure & Tissus"
  },

  // ==========================================
  // 3. MÉTABOLISME GLUCIDIQUE (Le Régulateur)
  // ==========================================
  {
    id: "soma_faim_matin",
    question: "Avez-vous une faim impérieuse le matin (besoin de manger tout de suite) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "La GH est hyperglycémiante la nuit. Si elle manque, l'insuline domine et crée une hypoglycémie au réveil.",
    weight: 3,
    scoreDirection: "hypo",
    section: "Métabolisme Glucidique"
  },
  {
    id: "soma_coup_pompe_repas",
    question: "Avez-vous un coup de pompe 2-3h APRÈS le repas (pas tout de suite) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "C'est le moment où l'insuline devrait baisser et la GH prendre le relais. Si la GH rate le relais = Hypo tardive.",
    weight: 2,
    scoreDirection: "hypo",
    section: "Métabolisme Glucidique"
  },
  {
    id: "soma_graisse_abdo",
    question: "Avez-vous tendance à stocker du gras principalement au niveau abdominal ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Le déficit en GH favorise l'adiposité viscérale (résistance à l'insuline).",
    weight: 2,
    scoreDirection: "hypo",
    section: "Métabolisme Glucidique"
  }
];

export default AxeSomatoConfig;
