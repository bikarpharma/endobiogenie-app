// lib/galaxy-data.ts
// 🎯 DONNÉES DE L'AXE CORTICOTROPE - Layout CONCENTRIQUE
// Basé sur "La Théorie de l'Endobiogénie" Vol. 1 & 2

export type NodeGroup = 
  | "Cerveau"      // Hypothalamus, Hypophyse
  | "SNA"          // Système Nerveux Autonome
  | "Boucle1"      // Hormones de la 1ère boucle (catabolisme)
  | "Boucle2"      // Hormones de la 2ème boucle (anabolisme)
  | "Glande"       // Organes producteurs
  | "Liaison"      // Globulines de liaison (CBG, SHBG)
  | "Metabolisme"  // Effets métaboliques
  | "Clinique"     // Signes cliniques
  | "Couplage"     // Liens inter-axiaux
  | "Plante";      // Phytothérapie

export interface GalaxyNode {
  id: string;
  group: NodeGroup;
  val: number;
  boucle?: 1 | 2;
  emoji?: string;
  subgroup?: string;
  // Positions fixes pour layout concentrique
  fx?: number;
  fy?: number;
  ring?: number;  // Anneau (0 = centre)
}

export interface GalaxyLink {
  source: string;
  target: string;
  name: string;
  type?: "stimule" | "inhibe" | "produit" | "retrocontrole" | "couplage" | "lie";
  boucle?: 1 | 2;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 CALCUL DES POSITIONS CONCENTRIQUES
// ═══════════════════════════════════════════════════════════════

const CENTER_X = 0;
const CENTER_Y = 0;

// Rayons des anneaux
const RINGS = {
  0: 0,      // Centre absolu
  1: 100,    // Anneau 1 : Commande centrale
  2: 180,    // Anneau 2 : Hormones hypothalamiques + POMC
  3: 280,    // Anneau 3 : Hormones principales
  4: 380,    // Anneau 4 : Glandes + Liaison
  5: 480,    // Anneau 5 : Métabolisme + Couplages
  6: 580,    // Anneau 6 : Clinique
  7: 680,    // Anneau 7 : Phytothérapie (extérieur)
};

// Fonction pour calculer position sur un anneau
function posOnRing(ring: number, index: number, total: number, offsetAngle: number = 0): { fx: number; fy: number } {
  const radius = RINGS[ring as keyof typeof RINGS] || 100;
  const angle = offsetAngle + (index * 2 * Math.PI) / total;
  return {
    fx: CENTER_X + radius * Math.cos(angle - Math.PI / 2), // Commence en haut
    fy: CENTER_Y + radius * Math.sin(angle - Math.PI / 2),
  };
}

// ═══════════════════════════════════════════════════════════════
// 📊 DÉFINITION DES NŒUDS AVEC POSITIONS
// ═══════════════════════════════════════════════════════════════

export const CORTICO_DATA: { nodes: GalaxyNode[]; links: GalaxyLink[] } = {
  nodes: [
    // ═══════════════════════════════════════════════════════════════
    // 🎯 ANNEAU 0 : CENTRE ABSOLU - Hypothalamus
    // ═══════════════════════════════════════════════════════════════
    { 
      id: "Hypothalamus", 
      group: "Cerveau", 
      val: 50, 
      emoji: "🧠",
      ring: 0,
      fx: CENTER_X,
      fy: CENTER_Y,
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔵 ANNEAU 1 : COMMANDE CENTRALE (3 éléments)
    // ═══════════════════════════════════════════════════════════════
    { 
      id: "Alpha_Sympathique", 
      group: "SNA", 
      val: 40, 
      emoji: "⚡",
      ring: 1,
      ...posOnRing(1, 0, 3, 0),  // Haut
    },
    { 
      id: "Hypophyse_Ant", 
      group: "Cerveau", 
      val: 35, 
      emoji: "🎯",
      ring: 1,
      ...posOnRing(1, 1, 3, 0),  // Droite-bas
    },
    { 
      id: "Hypophyse_Post", 
      group: "Cerveau", 
      val: 30, 
      emoji: "💧",
      ring: 1,
      ...posOnRing(1, 2, 3, 0),  // Gauche-bas
    },

    // ═══════════════════════════════════════════════════════════════
    // 🟠 ANNEAU 2 : HORMONES HYPOTHALAMIQUES + POMC (4 éléments)
    // ═══════════════════════════════════════════════════════════════
    { 
      id: "CRH", 
      group: "Boucle1", 
      val: 28, 
      boucle: 1, 
      emoji: "🚀",
      ring: 2,
      ...posOnRing(2, 0, 4, Math.PI/4),
    },
    { 
      id: "POMC", 
      group: "Boucle1", 
      val: 25, 
      boucle: 1, 
      emoji: "🧬",
      ring: 2,
      ...posOnRing(2, 1, 4, Math.PI/4),
    },
    { 
      id: "Vasopressine", 
      group: "Boucle2", 
      val: 25, 
      boucle: 2, 
      emoji: "💦",
      ring: 2,
      ...posOnRing(2, 2, 4, Math.PI/4),
    },
    { 
      id: "Prolactine", 
      group: "Boucle2", 
      val: 22, 
      boucle: 2, 
      emoji: "🤱",
      ring: 2,
      ...posOnRing(2, 3, 4, Math.PI/4),
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔴 ANNEAU 3 : HORMONES PRINCIPALES (6 éléments)
    // ═══════════════════════════════════════════════════════════════
    { 
      id: "ACTH", 
      group: "Boucle1", 
      val: 35, 
      boucle: 1, 
      emoji: "📢",
      ring: 3,
      ...posOnRing(3, 0, 6, 0),
    },
    { 
      id: "Alpha_MSH", 
      group: "Boucle1", 
      val: 22, 
      boucle: 1, 
      emoji: "🎨",
      ring: 3,
      ...posOnRing(3, 1, 6, 0),
    },
    { 
      id: "Beta_Endorphine", 
      group: "Boucle1", 
      val: 22, 
      boucle: 1, 
      emoji: "😌",
      ring: 3,
      ...posOnRing(3, 2, 6, 0),
    },
    { 
      id: "Cortisol", 
      group: "Boucle1", 
      val: 42, 
      boucle: 1, 
      emoji: "🌅",
      ring: 3,
      ...posOnRing(3, 3, 6, 0),
    },
    { 
      id: "DHEA", 
      group: "Boucle1", 
      val: 30, 
      boucle: 1, 
      emoji: "💪",
      ring: 3,
      ...posOnRing(3, 4, 6, 0),
    },
    { 
      id: "Aldosterone", 
      group: "Boucle2", 
      val: 28, 
      boucle: 2, 
      emoji: "🧂",
      ring: 3,
      ...posOnRing(3, 5, 6, 0),
    },

    // ═══════════════════════════════════════════════════════════════
    // 🏭 ANNEAU 4 : GLANDES + LIAISON (6 éléments)
    // ═══════════════════════════════════════════════════════════════
    { 
      id: "Cortex_Surrenal", 
      group: "Glande", 
      val: 32, 
      emoji: "🏭",
      ring: 4,
      ...posOnRing(4, 0, 6, Math.PI/6),
    },
    { 
      id: "Medullosurrenale", 
      group: "Glande", 
      val: 25, 
      emoji: "⚡",
      ring: 4,
      ...posOnRing(4, 1, 6, Math.PI/6),
    },
    { 
      id: "Adrenaline", 
      group: "Glande", 
      val: 24, 
      emoji: "🔥",
      ring: 4,
      ...posOnRing(4, 2, 6, Math.PI/6),
    },
    { 
      id: "CBG", 
      group: "Liaison", 
      val: 22, 
      emoji: "🔐",
      ring: 4,
      ...posOnRing(4, 3, 6, Math.PI/6),
    },
    { 
      id: "SHBG", 
      group: "Liaison", 
      val: 22, 
      emoji: "🔒",
      ring: 4,
      ...posOnRing(4, 4, 6, Math.PI/6),
    },
    { 
      id: "Albumine", 
      group: "Liaison", 
      val: 20, 
      emoji: "📦",
      ring: 4,
      ...posOnRing(4, 5, 6, Math.PI/6),
    },

    // ═══════════════════════════════════════════════════════════════
    // 🔄 ANNEAU 5 : MÉTABOLISME + COUPLAGES (8 éléments)
    // ═══════════════════════════════════════════════════════════════
    { 
      id: "Glucose", 
      group: "Metabolisme", 
      val: 20, 
      emoji: "🍬",
      ring: 5,
      ...posOnRing(5, 0, 8, 0),
    },
    { 
      id: "Proteines", 
      group: "Metabolisme", 
      val: 20, 
      emoji: "🥩",
      ring: 5,
      ...posOnRing(5, 1, 8, 0),
    },
    { 
      id: "Lipides", 
      group: "Metabolisme", 
      val: 20, 
      emoji: "🧈",
      ring: 5,
      ...posOnRing(5, 2, 8, 0),
    },
    { 
      id: "Immunite", 
      group: "Metabolisme", 
      val: 22, 
      emoji: "🛡️",
      ring: 5,
      ...posOnRing(5, 3, 8, 0),
    },
    { 
      id: "Inflammation", 
      group: "Metabolisme", 
      val: 22, 
      emoji: "🔥",
      ring: 5,
      ...posOnRing(5, 4, 8, 0),
    },
    { 
      id: "Axe_Gonadotrope", 
      group: "Couplage", 
      val: 24, 
      emoji: "♀️",
      ring: 5,
      ...posOnRing(5, 5, 8, 0),
    },
    { 
      id: "Axe_Thyreotrope", 
      group: "Couplage", 
      val: 24, 
      emoji: "🦋",
      ring: 5,
      ...posOnRing(5, 6, 8, 0),
    },
    { 
      id: "Axe_Somatotrope", 
      group: "Couplage", 
      val: 24, 
      emoji: "📈",
      ring: 5,
      ...posOnRing(5, 7, 8, 0),
    },

    // ═══════════════════════════════════════════════════════════════
    // 🩺 ANNEAU 6 : SIGNES CLINIQUES (7 éléments)
    // ═══════════════════════════════════════════════════════════════
    { 
      id: "Anxiete", 
      group: "Clinique", 
      val: 18, 
      emoji: "😰",
      ring: 6,
      ...posOnRing(6, 0, 7, Math.PI/7),
    },
    { 
      id: "Insomnie", 
      group: "Clinique", 
      val: 18, 
      emoji: "🌙",
      ring: 6,
      ...posOnRing(6, 1, 7, Math.PI/7),
    },
    { 
      id: "Depression", 
      group: "Clinique", 
      val: 18, 
      emoji: "😔",
      ring: 6,
      ...posOnRing(6, 2, 7, Math.PI/7),
    },
    { 
      id: "Fatigue", 
      group: "Clinique", 
      val: 18, 
      emoji: "😴",
      ring: 6,
      ...posOnRing(6, 3, 7, Math.PI/7),
    },
    { 
      id: "Hypoglycemie", 
      group: "Clinique", 
      val: 16, 
      emoji: "📉",
      ring: 6,
      ...posOnRing(6, 4, 7, Math.PI/7),
    },
    { 
      id: "Reveil_Nocturne", 
      group: "Clinique", 
      val: 16, 
      emoji: "⏰",
      ring: 6,
      ...posOnRing(6, 5, 7, Math.PI/7),
    },
    { 
      id: "Mains_Froides", 
      group: "Clinique", 
      val: 14, 
      emoji: "🥶",
      ring: 6,
      ...posOnRing(6, 6, 7, Math.PI/7),
    },

    // ═══════════════════════════════════════════════════════════════
    // 🌿 ANNEAU 7 : PHYTOTHÉRAPIE (6 éléments)
    // ═══════════════════════════════════════════════════════════════
    { 
      id: "Ribes_nigrum", 
      group: "Plante", 
      val: 22, 
      emoji: "🫐",
      ring: 7,
      ...posOnRing(7, 0, 6, 0),
    },
    { 
      id: "Rhodiola_rosea", 
      group: "Plante", 
      val: 22, 
      emoji: "🌸",
      ring: 7,
      ...posOnRing(7, 1, 6, 0),
    },
    { 
      id: "Passiflora", 
      group: "Plante", 
      val: 22, 
      emoji: "🌺",
      ring: 7,
      ...posOnRing(7, 2, 6, 0),
    },
    { 
      id: "Glycyrrhiza", 
      group: "Plante", 
      val: 20, 
      emoji: "🌱",
      ring: 7,
      ...posOnRing(7, 3, 6, 0),
    },
    { 
      id: "Eleutherococcus", 
      group: "Plante", 
      val: 20, 
      emoji: "🌲",
      ring: 7,
      ...posOnRing(7, 4, 6, 0),
    },
    { 
      id: "Quercus_bg", 
      group: "Plante", 
      val: 20, 
      emoji: "🌳",
      ring: 7,
      ...posOnRing(7, 5, 6, 0),
    },
  ],

  // ═══════════════════════════════════════════════════════════════
  // 🔗 LIENS
  // ═══════════════════════════════════════════════════════════════
  links: [
    // INITIATION PAR LE SNA
    { source: "Alpha_Sympathique", target: "Hypothalamus", name: "Active", type: "stimule" },
    { source: "Alpha_Sympathique", target: "CRH", name: "Stimule", type: "stimule", boucle: 1 },
    { source: "Alpha_Sympathique", target: "ACTH", name: "Stimule", type: "stimule", boucle: 1 },
    { source: "Alpha_Sympathique", target: "Cortex_Surrenal", name: "Active", type: "stimule" },
    { source: "Alpha_Sympathique", target: "Medullosurrenale", name: "Active", type: "stimule" },
    { source: "Alpha_Sympathique", target: "Mains_Froides", name: "Provoque", type: "stimule" },

    // PREMIÈRE BOUCLE
    { source: "Hypothalamus", target: "CRH", name: "Produit", type: "produit", boucle: 1 },
    { source: "CRH", target: "Hypophyse_Ant", name: "Stimule", type: "stimule", boucle: 1 },
    { source: "Hypophyse_Ant", target: "POMC", name: "Produit", type: "produit", boucle: 1 },
    
    { source: "POMC", target: "ACTH", name: "Clive en", type: "produit", boucle: 1 },
    { source: "POMC", target: "Alpha_MSH", name: "Clive en", type: "produit", boucle: 1 },
    { source: "POMC", target: "Beta_Endorphine", name: "Clive en", type: "produit", boucle: 1 },
    
    { source: "Alpha_MSH", target: "ACTH", name: "Amplifie", type: "stimule", boucle: 1 },
    { source: "Alpha_MSH", target: "Cortex_Surrenal", name: "↑ Récepteurs", type: "stimule", boucle: 1 },
    
    { source: "Beta_Endorphine", target: "Cortisol", name: "Freine", type: "inhibe", boucle: 1 },
    { source: "Beta_Endorphine", target: "Aldosterone", name: "Favorise", type: "stimule", boucle: 2 },
    
    { source: "ACTH", target: "Cortex_Surrenal", name: "Stimule", type: "stimule", boucle: 1 },
    
    { source: "Cortex_Surrenal", target: "Cortisol", name: "Sécrète", type: "produit", boucle: 1 },
    { source: "Cortex_Surrenal", target: "DHEA", name: "Sécrète", type: "produit", boucle: 1 },
    { source: "Cortex_Surrenal", target: "Aldosterone", name: "Sécrète", type: "produit", boucle: 2 },
    
    { source: "Medullosurrenale", target: "Adrenaline", name: "Libère", type: "produit" },

    // RÉTROCONTRÔLE
    { source: "Cortisol", target: "CRH", name: "Rétrocontrôle ⊖", type: "retrocontrole" },
    { source: "Cortisol", target: "ACTH", name: "Rétrocontrôle ⊖", type: "retrocontrole" },
    { source: "Cortisol", target: "Hypothalamus", name: "Feedback ⊖", type: "retrocontrole" },

    // DEUXIÈME BOUCLE
    { source: "Hypophyse_Post", target: "Vasopressine", name: "Sécrète", type: "produit", boucle: 2 },
    { source: "Vasopressine", target: "ACTH", name: "Stimule", type: "stimule", boucle: 2 },
    { source: "Vasopressine", target: "Aldosterone", name: "Stimule", type: "stimule", boucle: 2 },
    { source: "Prolactine", target: "CRH", name: "Relance", type: "stimule", boucle: 2 },
    { source: "Hypophyse_Ant", target: "Prolactine", name: "Produit", type: "produit", boucle: 2 },

    // GLOBULINES DE LIAISON
    { source: "CBG", target: "Cortisol", name: "Lie 94%", type: "lie" },
    { source: "SHBG", target: "DHEA", name: "Lie", type: "lie" },
    { source: "Albumine", target: "Cortisol", name: "Transport", type: "lie" },
    { source: "Axe_Gonadotrope", target: "CBG", name: "Œstrogènes ↑", type: "stimule" },
    { source: "Cortisol", target: "SHBG", name: "Stimule", type: "stimule" },

    // EFFETS MÉTABOLIQUES
    { source: "Cortisol", target: "Glucose", name: "Mobilise", type: "stimule" },
    { source: "Cortisol", target: "Proteines", name: "Catabolise", type: "stimule" },
    { source: "Cortisol", target: "Lipides", name: "Mobilise", type: "stimule" },
    { source: "Cortisol", target: "Immunite", name: "Inhibe", type: "inhibe" },
    { source: "Cortisol", target: "Inflammation", name: "Freine", type: "inhibe" },
    { source: "DHEA", target: "Proteines", name: "Anabolise", type: "stimule" },
    { source: "DHEA", target: "Immunite", name: "Soutient", type: "stimule" },

    // SIGNES CLINIQUES
    { source: "Cortisol", target: "Anxiete", name: "Excès →", type: "stimule" },
    { source: "Cortisol", target: "Insomnie", name: "Excès →", type: "stimule" },
    { source: "Cortisol", target: "Reveil_Nocturne", name: "Inversion", type: "stimule" },
    { source: "ACTH", target: "Reveil_Nocturne", name: "↑ Matinal", type: "stimule" },
    { source: "Cortisol", target: "Hypoglycemie", name: "Insuffisant →", type: "stimule" },
    { source: "Cortisol", target: "Fatigue", name: "Dysrégulation", type: "stimule" },
    { source: "Cortisol", target: "Depression", name: "Insuffisant →", type: "stimule" },
    { source: "Alpha_Sympathique", target: "Anxiete", name: "Hyperactivité", type: "stimule" },
    { source: "Adrenaline", target: "Anxiete", name: "Pics →", type: "stimule" },

    // COUPLAGES INTER-AXIAUX
    { source: "CRH", target: "Axe_Gonadotrope", name: "Calibre GnRH", type: "couplage" },
    { source: "ACTH", target: "Axe_Gonadotrope", name: "Calibre FSH", type: "couplage" },
    { source: "Cortisol", target: "Axe_Gonadotrope", name: "Retarde FSH", type: "couplage" },
    { source: "Alpha_Sympathique", target: "Axe_Thyreotrope", name: "Co-stimule TRH", type: "couplage" },
    { source: "Cortisol", target: "Axe_Thyreotrope", name: "Sensibilise T4", type: "couplage" },
    { source: "Prolactine", target: "Axe_Somatotrope", name: "Lien GH", type: "couplage" },
    { source: "Cortisol", target: "Axe_Somatotrope", name: "Calibre GH", type: "couplage" },

    // PHYTOTHÉRAPIE
    { source: "Ribes_nigrum", target: "Cortex_Surrenal", name: "Stimule", type: "stimule" },
    { source: "Ribes_nigrum", target: "Inflammation", name: "Anti-inflam.", type: "inhibe" },
    { source: "Rhodiola_rosea", target: "Cortex_Surrenal", name: "Adapte", type: "stimule" },
    { source: "Rhodiola_rosea", target: "Fatigue", name: "Réduit", type: "inhibe" },
    { source: "Passiflora", target: "Alpha_Sympathique", name: "Freine", type: "inhibe" },
    { source: "Passiflora", target: "Anxiete", name: "Apaise", type: "inhibe" },
    { source: "Passiflora", target: "Insomnie", name: "Favorise sommeil", type: "inhibe" },
    { source: "Glycyrrhiza", target: "Cortisol", name: "↑ Demi-vie", type: "stimule" },
    { source: "Eleutherococcus", target: "Cortex_Surrenal", name: "Soutient", type: "stimule" },
    { source: "Eleutherococcus", target: "DHEA", name: "Favorise", type: "stimule" },
    { source: "Quercus_bg", target: "Cortex_Surrenal", name: "Tonifie", type: "stimule" },
    { source: "Quercus_bg", target: "Axe_Gonadotrope", name: "Soutient", type: "stimule" },
  ]
};

// ═══════════════════════════════════════════════════════════════
// 🎨 CONFIGURATION VISUELLE
// ═══════════════════════════════════════════════════════════════

export const GROUP_CONFIG: Record<NodeGroup, {
  color: string;
  gradient: [string, string];
  shape: "circle" | "rect" | "hexagon" | "octagon" | "diamond" | "triangle";
  glow: string;
  label: string;
  icon: string;
}> = {
  Cerveau: {
    color: "#8b5cf6",
    gradient: ["#a78bfa", "#7c3aed"],
    shape: "octagon",
    glow: "rgba(139, 92, 246, 0.6)",
    label: "Centre Nerveux",
    icon: "🧠"
  },
  SNA: {
    color: "#ef4444",
    gradient: ["#f87171", "#dc2626"],
    shape: "diamond",
    glow: "rgba(239, 68, 68, 0.6)",
    label: "Système Autonome",
    icon: "⚡"
  },
  Boucle1: {
    color: "#f97316",
    gradient: ["#fb923c", "#ea580c"],
    shape: "circle",
    glow: "rgba(249, 115, 22, 0.5)",
    label: "1ère Boucle",
    icon: "🔴"
  },
  Boucle2: {
    color: "#3b82f6",
    gradient: ["#60a5fa", "#2563eb"],
    shape: "circle",
    glow: "rgba(59, 130, 246, 0.5)",
    label: "2ème Boucle",
    icon: "🔵"
  },
  Glande: {
    color: "#ec4899",
    gradient: ["#f472b6", "#db2777"],
    shape: "rect",
    glow: "rgba(236, 72, 153, 0.5)",
    label: "Glande",
    icon: "🏭"
  },
  Liaison: {
    color: "#14b8a6",
    gradient: ["#2dd4bf", "#0d9488"],
    shape: "hexagon",
    glow: "rgba(20, 184, 166, 0.5)",
    label: "Liaison",
    icon: "🔗"
  },
  Metabolisme: {
    color: "#eab308",
    gradient: ["#facc15", "#ca8a04"],
    shape: "rect",
    glow: "rgba(234, 179, 8, 0.5)",
    label: "Métabolisme",
    icon: "🔄"
  },
  Clinique: {
    color: "#f43f5e",
    gradient: ["#fb7185", "#e11d48"],
    shape: "triangle",
    glow: "rgba(244, 63, 94, 0.5)",
    label: "Signe Clinique",
    icon: "⚠️"
  },
  Couplage: {
    color: "#6366f1",
    gradient: ["#818cf8", "#4f46e5"],
    shape: "hexagon",
    glow: "rgba(99, 102, 241, 0.5)",
    label: "Couplage Axial",
    icon: "🔀"
  },
  Plante: {
    color: "#22c55e",
    gradient: ["#4ade80", "#16a34a"],
    shape: "hexagon",
    glow: "rgba(34, 197, 94, 0.6)",
    label: "Phytothérapie",
    icon: "🌿"
  }
};

export const LINK_STYLES: Record<string, { color: string; dashArray?: string; width: number }> = {
  stimule: { color: "#22c55e", width: 1.5 },
  inhibe: { color: "#ef4444", dashArray: "4,4", width: 1.5 },
  produit: { color: "#8b5cf6", width: 2 },
  retrocontrole: { color: "#f59e0b", dashArray: "8,4", width: 2 },
  couplage: { color: "#6366f1", dashArray: "2,2", width: 1 },
  lie: { color: "#14b8a6", dashArray: "6,3", width: 1 }
};

// Export des rayons pour dessin des cercles guides
export const RING_RADII = RINGS;