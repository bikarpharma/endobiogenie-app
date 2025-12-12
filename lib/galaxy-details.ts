// lib/galaxy-details.ts
// 📚 DESCRIPTIONS DÉTAILLÉES - Basées sur Lapraz & Duraffourd
// Sources: La Théorie de l'Endobiogénie Vol. 1 & 2

export interface NodeDetail {
  title: string;
  subtitle?: string;
  role: string;
  laprazQuote?: string;  // Citation du maître
  description: string;
  physiology?: string;   // Mécanisme physiologique
  clinical: string[];    // Signes cliniques associés
  bdfIndex?: string[];   // Index BDF liés
  action: string;
  therapeuticTarget?: string;
  relatedPlants?: string[];
}

export const NODE_DETAILS: Record<string, NodeDetail> = {
  
  // ═══════════════════════════════════════════════════════════════════════
  // 🧠 ÉTAGE CENTRAL
  // ═══════════════════════════════════════════════════════════════════════
  
  "Hypothalamus": {
    title: "Hypothalamus",
    subtitle: "Le Chef d'Orchestre Neuro-Endocrinien",
    role: "Centre d'intégration SNA-Endocrine",
    laprazQuote: "L'hypothalamus reçoit les informations du système limbique (émotions) et du cortex pour orchestrer la réponse au stress.",
    description: "Véritable tour de contrôle, l'hypothalamus intègre les signaux nerveux (émotions, stress) et les traduit en messages hormonaux. Il initie l'axe corticotrope par la production de CRH.",
    physiology: "Produit la CRH en réponse à l'activation α-sympathique. Sensible aux rétrocontrôles du cortisol et aux stimuli émotionnels.",
    clinical: [
      "Troubles du sommeil",
      "Dérèglements thermiques",
      "Appétit anarchique",
      "Désynchronisation hormonale"
    ],
    bdfIndex: ["Adaptation globale", "Index hypothalamique"],
    action: "Commande l'hypophyse via la CRH",
    therapeuticTarget: "Régulation du terrain neuro-végétatif",
    relatedPlants: ["Passiflora incarnata", "Valeriana officinalis"]
  },

  "Hypophyse_Ant": {
    title: "Hypophyse Antérieure",
    subtitle: "L'Usine à Ordres Hormonaux",
    role: "Relais Central → Périphérie",
    laprazQuote: "Elle transforme l'influx nerveux (CRH) en message hormonal sanguin (ACTH). Elle est le relais indispensable entre le cerveau et le corps.",
    description: "L'antéhypophyse produit les hormones tropiques (ACTH, FSH, LH, TSH, GH, PRL) qui commandent les glandes périphériques. Pour l'axe corticotrope, elle produit l'ACTH à partir du précurseur POMC.",
    physiology: "Sous contrôle de la CRH, elle clive le POMC en ACTH, αMSH et β-endorphine. Sensible au rétrocontrôle du cortisol.",
    clinical: [
      "Hyperpigmentation (ACTH élevé)",
      "Signes d'insuffisance hypophysaire",
      "Troubles de la lactation"
    ],
    action: "Produit ACTH, stimule les glandes périphériques",
    therapeuticTarget: "Modulation centrale de l'axe"
  },

  "Hypophyse_Post": {
    title: "Hypophyse Postérieure",
    subtitle: "Neurohypophyse",
    role: "Stockage & Libération",
    description: "Stocke et libère la vasopressine (ADH) et l'ocytocine produites par l'hypothalamus. Intervient dans la 2ème boucle corticotrope.",
    physiology: "La vasopressine stimule l'ACTH et favorise l'aldostérone lors de la 2ème boucle.",
    clinical: [
      "Rétention hydrique",
      "Troubles de la soif",
      "Diabète insipide (si déficit)"
    ],
    action: "Libère vasopressine pour la 2ème boucle"
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ⚡ SYSTÈME NERVEUX AUTONOME
  // ═══════════════════════════════════════════════════════════════════════

  "Alpha_Sympathique": {
    title: "Système Alpha-Sympathique",
    subtitle: "αΣ - Le Déclencheur",
    role: "Vigilance, Vasoconstriction, Starter",
    laprazQuote: "L'αΣ stimule l'excrétion des trois niveaux d'activité corticotrope : hypothalamus (CRH), hypophyse (ACTH), cortex surrénalien (cortisol).",
    description: "Branche du système nerveux autonome responsable de l'alerte immédiate. C'est lui qui INITIE tout l'axe corticotrope en réponse au stress. Il provoque la vasoconstriction périphérique pour ramener le sang vers les organes nobles.",
    physiology: "Active simultanément CRH, ACTH et cortex surrénalien. Stimule aussi la médullosurrénale (adrénaline).",
    clinical: [
      "Mains/Pieds froids (vasoconstriction)",
      "Bouche sèche",
      "Hypertension réactionnelle",
      "Tachycardie",
      "Mydriase"
    ],
    bdfIndex: ["Index sympathique", "Ratio αΣ/Cortisol"],
    action: "Initie et maintient l'axe corticotrope",
    therapeuticTarget: "Première cible à réguler",
    relatedPlants: ["Passiflora incarnata", "Crataegus oxyacantha", "Lavandula angustifolia"]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🔴 PREMIÈRE BOUCLE - HORMONES
  // ═══════════════════════════════════════════════════════════════════════

  "CRH": {
    title: "CRH",
    subtitle: "Corticolibérine - Corticotropin-Releasing Hormone",
    role: "Starter du Stress",
    laprazQuote: "CRH stimule le POMC hypophysaire pour produire de l'ACTH et de l'αMSH.",
    description: "Hormone hypothalamique qui lance la cascade du stress. Très sensible à l'état émotionnel et aux stimuli α-sympathiques.",
    physiology: "Stimule la production et libération d'ACTH. Se couple à la GnRH pour calibrer l'axe gonadotrope.",
    clinical: [
      "Anxiété d'anticipation",
      "Stress chronique",
      "Troubles de l'adaptation"
    ],
    action: "Stimule POMC → ACTH + αMSH",
    relatedPlants: ["Rhodiola rosea", "Withania somnifera"]
  },

  "POMC": {
    title: "POMC",
    subtitle: "Pro-opiomélanocortine",
    role: "Précurseur Multifonctionnel",
    laprazQuote: "Le lobe intermédiaire contient la majorité des dérivés de la POMC divisés en deux classes : mélanocortines (ACTH, αMSH) et endorphines.",
    description: "Grosse molécule précurseur qui est clivée en plusieurs hormones actives : ACTH (adaptation), αMSH (pigmentation, amplification), β-endorphine (modulation).",
    physiology: "Son clivage est orchestré par la CRH. Les produits ont des actions complémentaires sur l'adaptation.",
    clinical: [
      "Troubles de la pigmentation",
      "Déséquilibres opioïdes endogènes"
    ],
    action: "Fournit ACTH, αMSH, β-endorphine"
  },

  "ACTH": {
    title: "ACTH",
    subtitle: "Adrénocorticotrophine - Hormone Corticotrope",
    role: "Messager de l'Urgence",
    laprazQuote: "L'ACTH stimule la zone fasciculée (Cortisol) et réticulée (Androgènes) de la surrénale. Ce que l'ACTH stimule dans un premier temps d'adaptation sera régulé à la baisse par le cortisol qu'elle induit.",
    description: "Hormone hypophysaire centrale de l'axe. Elle ordonne au cortex surrénalien de produire cortisol, DHEA et aldostérone. Ses actions horizontales calibrent aussi les autres axes.",
    physiology: "Effets génomiques (heures/jours) et non génomiques (minutes). Augmente les récepteurs à l'histamine. Stimule le thymus (immunité).",
    clinical: [
      "Hyperpigmentation (si très élevé)",
      "Réveil matinal précoce",
      "Congestion jonction gastrique"
    ],
    bdfIndex: ["ACTH", "Cortisol/ACTH"],
    action: "Ordonne la production de cortisol, DHEA, aldostérone",
    relatedPlants: ["Ribes nigrum", "Glycyrrhiza glabra"]
  },

  "Alpha_MSH": {
    title: "α-MSH",
    subtitle: "Alpha-Mélanotropine",
    role: "Amplificateur & Modulateur",
    laprazQuote: "αMSH stimule l'ACTH et le fonctionnement général de l'hypophyse, augmente le nombre de récepteurs ACTH sur le cortex surrénalien, augmente l'intensité de la libération de cortisol.",
    description: "Dérivée de la POMC, elle amplifie l'action de l'ACTH sur le cortex surrénalien. Elle augmente le nombre de récepteurs et l'intensité de la réponse. Rôle aussi dans la pigmentation.",
    physiology: "Action locale hypophysaire et périphérique surrénalienne.",
    clinical: [
      "Troubles de la pigmentation",
      "Taches mélaniques de l'iris"
    ],
    action: "Amplifie ACTH, ↑ récepteurs surrénaliens"
  },

  "Beta_Endorphine": {
    title: "β-Endorphine",
    subtitle: "Opioïde Endogène",
    role: "Modulateur & Frein",
    laprazQuote: "La β-endorphine réduit le cortisol et aide l'ACTH à stimuler l'aldostérone (2ème tour de boucle). Elle favorise l'activité intracellulaire.",
    description: "Opioïde naturel qui module la réponse au stress. Elle privilégie l'aldostérone par rapport au cortisol, préparant ainsi la 2ème boucle anabolique. Préserve aussi le calcium.",
    physiology: "Inhibe partiellement le cortisol tout en permettant à l'ACTH de stimuler l'aldostérone.",
    clinical: [
      "Seuil de douleur modifié",
      "Humeur (euphorie/dysphorie)"
    ],
    action: "Freine cortisol, favorise aldostérone"
  },

  "Cortisol": {
    title: "Cortisol",
    subtitle: "L'Hormone de l'Adaptation",
    role: "Chef d'Orchestre Périphérique",
    laprazQuote: "Le cortisol est une hormone à la fois catabolique et anti-anabolique. Il mobilise tous les métabolites, électrolytes principaux et l'eau. Il a deux rôles généraux : permissif et adaptatif.",
    description: "Hormone VITALE de l'adaptation. Elle mobilise glucose, protéines, lipides pour faire face à l'urgence. Son rythme circadien (haut le matin, bas le soir) est CRUCIAL. Elle freine l'inflammation et l'immunité pour économiser l'énergie.",
    physiology: "Actions génomiques (6-24h) et non génomiques (minutes). Rétrocontrôle négatif sur CRH et ACTH. Calibre les autres axes (FSH, GH).",
    clinical: [
      "Asthénie matinale (si bas)",
      "Excitation vespérale (si haut)",
      "Infections à répétition",
      "Prise de poids abdominale",
      "Visage lunaire (si excès chronique)",
      "Réveil 3h-5h (inversion rythme)"
    ],
    bdfIndex: ["Cortisol structure", "Cortisol fonction", "Ratio Cortisol/DHEA"],
    action: "Mobilise les réserves, freine inflammation, rétrocontrôle",
    therapeuticTarget: "Restaurer le rythme circadien",
    relatedPlants: ["Glycyrrhiza glabra", "Ribes nigrum", "Rhodiola rosea"]
  },

  "DHEA": {
    title: "DHEA",
    subtitle: "Déhydroépiandrostérone",
    role: "Réparation & Pré-Anabolisme",
    laprazQuote: "La DHEA est une hormone pré-anabolique qui prépare le corps à utiliser plus tard ce que le cortisol a mobilisé, en étant localement convertie en hormones gonadiques anabolisantes.",
    description: "Contre-balance les effets cataboliques du cortisol. C'est l'hormone de la réparation tissulaire, de la mémoire et de la vitalité. Elle est convertie localement en œstrogènes et androgènes selon les besoins.",
    physiology: "Produite dans la zone réticulée. Sert de réservoir pour la production locale d'hormones sexuelles.",
    clinical: [
      "Peau sèche/fine",
      "Troubles de mémoire",
      "Baisse de libido",
      "Fatigue chronique",
      "Vieillissement prématuré"
    ],
    bdfIndex: ["DHEA", "Ratio Cortisol/DHEA", "Androgènes surrénaliens"],
    action: "Prépare l'anabolisme, réparation tissulaire",
    relatedPlants: ["Tribulus terrestris", "Maca", "Quercus (bg)"]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🔵 DEUXIÈME BOUCLE - HORMONES
  // ═══════════════════════════════════════════════════════════════════════

  "Vasopressine": {
    title: "Vasopressine",
    subtitle: "ADH - Hormone Antidiurétique",
    role: "Mémoire, Eau & 2ème Boucle",
    laprazQuote: "La vasopressine stimule la libération d'ACTH et l'excrétion d'aldostérone. Elle bloque la perte d'eau par le rein et augmente le tonus vasculaire.",
    description: "Hormone de la neurohypophyse cruciale pour la 2ème boucle. Elle retient l'eau, augmente la tension et joue un rôle clé dans la mémoire et l'anxiété chronique.",
    physiology: "Stimule ACTH et aldostérone. Action antidiurétique rénale. Effets sur la mémoire (hippocampe).",
    clinical: [
      "Rétention hydrique",
      "Troubles mnésiques",
      "Anxiété chronique",
      "Hyponatrémie (si excès)"
    ],
    action: "Stimule ACTH + Aldostérone, retient l'eau"
  },

  "Aldosterone": {
    title: "Aldostérone",
    subtitle: "Minéralocorticoïde",
    role: "Gestion Eau/Sel - Pro-Anabolisme",
    laprazQuote: "L'aldostérone est une hormone pro-anabolique car elle favorise l'anabolisme en fournissant un matériau secondaire qui affine la qualité de l'intégrité structurale et la qualité nutritionnelle.",
    description: "Gère la volémie et la tension artérielle en retenant sodium et eau, excrétant potassium. Elle prépare le terrain pour l'anabolisme en optimisant l'environnement cellulaire.",
    physiology: "Stimulée par ACTH, vasopressine, β-endorphine et le système Rénine-Angiotensine.",
    clinical: [
      "Rétention d'eau",
      "Soif excessive",
      "Hypertension",
      "Hypokaliémie",
      "Œdèmes"
    ],
    bdfIndex: ["Aldostérone", "Ratio Na/K"],
    action: "Retient Na+/eau, excrète K+, prépare anabolisme"
  },

  "Prolactine": {
    title: "Prolactine",
    subtitle: "Hormone de la Protection",
    role: "Relance de la Boucle & Immunité",
    laprazQuote: "La prolactine stimule la CRH pour permettre l'enchaînement des boucles. Elle augmente en cas de stress passif (subi).",
    description: "Hormone de 'couvade' et de protection. Elle relance la CRH pour enchaîner les boucles. En excès, elle peut bloquer l'ovulation et favoriser la rumination.",
    physiology: "Stimule CRH et immunité. Inhibe GnRH. Favorise la lactation.",
    clinical: [
      "Tension mammaire",
      "Baisse de libido",
      "Prise de poids",
      "Rumination mentale",
      "Aménorrhée"
    ],
    bdfIndex: ["Prolactine", "Index somatotrope"],
    action: "Relance CRH, stimule immunité, inhibe gonadotrope"
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🏭 GLANDES
  // ═══════════════════════════════════════════════════════════════════════

  "Cortex_Surrenal": {
    title: "Cortex Surrénalien",
    subtitle: "L'Usine de l'Adaptation",
    role: "Production Corticostéroïdes",
    laprazQuote: "Le cortex surrénalien produit Cortisol, DHEA et Aldostérone. C'est l'effecteur final de l'axe.",
    description: "Partie périphérique de la glande surrénale. Zone fasciculée (cortisol), zone réticulée (DHEA), zone glomérulée (aldostérone). C'est LUI qui produit toutes les hormones de l'adaptation lente.",
    clinical: [
      "Épuisement surrénalien (Burn-out)",
      "Fatigue chronique",
      "Hypotension orthostatique"
    ],
    bdfIndex: ["Cortex surrénalien", "Capacité adaptative"],
    action: "Produit Cortisol, DHEA, Aldostérone",
    relatedPlants: ["Ribes nigrum", "Quercus (bg)", "Glycyrrhiza glabra"]
  },

  "Medullosurrenale": {
    title: "Médullosurrénale",
    subtitle: "Centre de l'Urgence Absolue",
    role: "Catécholamines",
    description: "Centre nerveux au cœur de la glande surrénale. Produit Adrénaline et Noradrénaline pour la réponse immédiate 'Fight or Flight'.",
    physiology: "Activée directement par l'α-sympathique. Réponse en secondes.",
    clinical: [
      "Hyper-réactivité au stress",
      "Palpitations",
      "Sueurs froides"
    ],
    action: "Libère adrénaline (urgence immédiate)"
  },

  "Adrenaline": {
    title: "Adrénaline",
    subtitle: "L'Hormone de l'Urgence",
    role: "Fight or Flight",
    description: "Réponse immédiate au danger. Augmente rythme cardiaque, vigilance, mobilise glucose. Action en secondes, durée courte.",
    clinical: [
      "Palpitations",
      "Sueurs froides",
      "Anxiété paroxystique",
      "Tremblements"
    ],
    action: "Mobilisation instantanée"
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🔗 GLOBULINES DE LIAISON
  // ═══════════════════════════════════════════════════════════════════════

  "CBG": {
    title: "CBG",
    subtitle: "Cortisol-Binding Globulin - Transcortine",
    role: "Réservoir & Tampon Cortisol",
    laprazQuote: "La CBG maintient en réserve les corticostéroïdes et la progestérone. Les œstrogènes circulants stimulent la CBG pour réduire le cortisol libre.",
    description: "Globuline de liaison qui garde 94% du cortisol en réserve circulante. Seuls 4-6% sont libres et actifs. Système tampon crucial pour éviter les excès.",
    physiology: "Stimulée par les œstrogènes. Lie aussi la progestérone.",
    clinical: [
      "Hypercortisolisme fonctionnel (si CBG basse)",
      "Résistance au cortisol (si CBG élevée)"
    ],
    action: "Lie 94% du cortisol, régule sa biodisponibilité"
  },

  "SHBG": {
    title: "SHBG",
    subtitle: "Sex Hormone-Binding Globulin",
    role: "Réservoir Hormones Sexuelles",
    laprazQuote: "La SHBG lie les œstrogènes et les androgènes pour les garder en réserve. Elle a une plus grande affinité pour les androgènes. Le cortisol stimule la SHBG pour lier les œstrogènes.",
    description: "Globuline qui lie œstrogènes et androgènes. Affinité androgènes > œstrogènes. Régulation croisée avec l'axe corticotrope via le cortisol.",
    clinical: [
      "Hyperandrogénie (si SHBG basse)",
      "Déficit androgénique (si SHBG haute)"
    ],
    action: "Lie hormones sexuelles, régulation croisée avec cortisol"
  },

  "Albumine": {
    title: "Albumine",
    subtitle: "Transporteur Universel",
    role: "Transport Non-Spécifique",
    description: "Protéine de transport à faible affinité mais haute capacité. Transporte de nombreuses hormones dont le cortisol.",
    clinical: [
      "Hypoalbuminémie → hormones libres augmentées"
    ],
    action: "Transport non-spécifique"
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🔄 MÉTABOLISME
  // ═══════════════════════════════════════════════════════════════════════

  "Glucose": {
    title: "Métabolisme Glucidique",
    subtitle: "Carburant Cérébral",
    role: "Source d'Énergie Immédiate",
    description: "Le cortisol maintient la glycémie stable pour le cerveau par gluconéogenèse hépatique. En excès chronique, il favorise l'insulino-résistance.",
    clinical: [
      "Hypoglycémie réactionnelle (cortisol bas)",
      "Hyperglycémie (cortisol chroniquement élevé)",
      "Envies de sucre"
    ],
    action: "Mobilisation par cortisol, stockage par insuline"
  },

  "Proteines": {
    title: "Métabolisme Protéique",
    subtitle: "Structure & Enzymes",
    role: "Catabolisme/Anabolisme",
    description: "Le cortisol catabolise les protéines musculaires pour fournir des acides aminés. La DHEA prépare leur reconstruction (anabolisme).",
    clinical: [
      "Fonte musculaire (cortisol élevé chronique)",
      "Vergetures (dégradation collagène)"
    ],
    action: "Catabolisme (Cortisol) / Anabolisme (DHEA)"
  },

  "Lipides": {
    title: "Métabolisme Lipidique",
    subtitle: "Réserves Énergétiques",
    role: "Stockage & Mobilisation",
    description: "Le cortisol mobilise les graisses périphériques mais en excès chronique, il stocke sur le tronc et le visage (répartition androïde).",
    clinical: [
      "Cholestérol élevé",
      "Triglycérides",
      "Adiposité abdominale"
    ],
    action: "Mobilisation/redistribution par cortisol"
  },

  "Immunite": {
    title: "Système Immunitaire",
    subtitle: "Défense de l'Organisme",
    role: "Protection",
    laprazQuote: "Le système immunitaire est fortement inhibé par le cortisol (pour éviter l'auto-immunité) et stimulé par la Prolactine/GH.",
    description: "Le cortisol freine l'immunité pour économiser l'énergie en période de stress. La DHEA et la prolactine la soutiennent.",
    clinical: [
      "Infections fréquentes (cortisol élevé)",
      "Maladies auto-immunes (cortisol bas)",
      "Allergies"
    ],
    action: "Freiné par cortisol, soutenu par DHEA/PRL"
  },

  "Inflammation": {
    title: "Inflammation",
    subtitle: "Réponse Tissulaire",
    role: "Signal d'Alarme",
    description: "Normalement freinée par le cortisol. Si elle persiste, cela signe soit un excès d'agression, soit une insuffisance de cortisol.",
    clinical: [
      "Douleurs articulaires",
      "Rougeurs",
      "Maladies en '-ite'"
    ],
    action: "Freinée par cortisol",
    relatedPlants: ["Ribes nigrum", "Harpagophytum"]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🩺 SIGNES CLINIQUES
  // ═══════════════════════════════════════════════════════════════════════

  "Anxiete": {
    title: "Anxiété",
    subtitle: "État d'Alerte Permanent",
    role: "Surcharge Corticotrope",
    laprazQuote: "États affectifs (αΣ + axe corticotrope) : anxiété, peur, asthénie, insomnie psychophysiologique.",
    description: "Traduit une hyperactivité α-sympathique et/ou une incapacité à gérer le flux d'informations. L'anticipation excessive du danger maintient l'axe en tension.",
    clinical: [
      "Boule au ventre",
      "Tension musculaire",
      "Rumination",
      "Mains moites"
    ],
    action: "Traiter le terrain neuro-végétatif",
    relatedPlants: ["Passiflora incarnata", "Valeriana officinalis", "Eschscholzia californica"]
  },

  "Insomnie": {
    title: "Insomnie",
    subtitle: "Trouble du Sommeil",
    role: "Dysrégulation du Rythme",
    description: "Souvent liée à un cortisol élevé le soir (inversion de rythme) ou une hyperactivité sympathique. Le type d'insomnie oriente vers la cause.",
    clinical: [
      "Difficulté d'endormissement → Sympathique",
      "Réveils nocturnes 1-3h → Foie",
      "Réveils 3-5h → Cortisol inversé"
    ],
    action: "Restaurer le rythme circadien",
    relatedPlants: ["Passiflora incarnata", "Eschscholzia californica", "Valeriana officinalis"]
  },

  "Depression": {
    title: "Dépression",
    subtitle: "Effondrement de l'Axe",
    role: "Épuisement Adaptatif",
    laprazQuote: "Quand la prolactine n'est pas capable de réadapter la fonction du cortex surrénalien, le patient tombe dans un état émotionnel très intense avec une forte tendance à ruminer.",
    description: "Souvent la conséquence d'un stress chronique ayant épuisé les réserves de catécholamines et désensibilisé les récepteurs au cortisol. Le terrain s'effondre.",
    clinical: [
      "Perte d'élan vital",
      "Tristesse matinale",
      "Ralentissement psychomoteur",
      "Anhédonie"
    ],
    bdfIndex: ["Cortisol insuffisant ou désadapté"],
    action: "Restaurer l'axe, soutenir la surrénale",
    relatedPlants: ["Rhodiola rosea", "Hypericum perforatum", "Griffonia simplicifolia"]
  },

  "Fatigue": {
    title: "Fatigue Chronique",
    subtitle: "Asthénie",
    role: "Épuisement des Réserves",
    description: "Signe cardinal d'un axe corticotrope dépassé. Peut être par excès (burn-in) ou par insuffisance (burn-out) de cortisol.",
    clinical: [
      "Fatigue matinale (cortisol bas)",
      "Fatigue continue (épuisement surrénalien)",
      "Coup de pompe 11h/17h"
    ],
    action: "Évaluer le stade d'adaptation",
    relatedPlants: ["Rhodiola rosea", "Eleutherococcus senticosus", "Ribes nigrum"]
  },

  "Hypoglycemie": {
    title: "Hypoglycémie Réactionnelle",
    subtitle: "Défaut d'Adaptation",
    role: "Cortisol Insuffisant",
    description: "Signe que le cortisol ne mobilise pas assez vite le glucose hépatique face à une demande. Le cerveau 'crie famine'.",
    clinical: [
      "Coup de pompe 11h/17h",
      "Irritabilité avant les repas",
      "Tremblements",
      "Sueurs froides",
      "Malaise"
    ],
    action: "Soutenir la fonction glucocorticoïde",
    relatedPlants: ["Glycyrrhiza glabra", "Ribes nigrum"]
  },

  "Reveil_Nocturne": {
    title: "Réveil Nocturne",
    subtitle: "Inversion du Rythme",
    role: "Désynchronisation",
    description: "Réveil entre 1h-3h souvent lié au foie. Réveil entre 3h-5h souvent lié à un pic d'ACTH/cortisol prématuré (inversion).",
    clinical: [
      "Réveil 1-3h → Hépatique",
      "Réveil 3-5h → ACTH/Cortisol",
      "Impossibilité de se rendormir"
    ],
    action: "Identifier l'origine, resynchroniser"
  },

  "Mains_Froides": {
    title: "Mains Froides",
    subtitle: "Vasoconstriction Périphérique",
    role: "Hyperactivité αΣ",
    description: "Signe cardinal d'hyperactivité α-sympathique. Le sang est redirigé vers les organes nobles (cœur, cerveau).",
    clinical: [
      "Mains/pieds froids",
      "Extrémités blanches",
      "Acrocyanose"
    ],
    action: "Réduire le tonus sympathique",
    relatedPlants: ["Ginkgo biloba", "Vitis vinifera"]
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🔀 COUPLAGES INTER-AXIAUX
  // ═══════════════════════════════════════════════════════════════════════

  "Axe_Gonadotrope": {
    title: "Axe Gonadotrope",
    subtitle: "FSH/LH → Œstrogènes/Androgènes",
    role: "Anabolisme & Reproduction",
    laprazQuote: "Les axes corticotrope et gonadotrope sont des axes adjacents d'activité alternée catabolisme/anabolisme. Ils assurent les fonctions les plus fondamentales et existentielles.",
    description: "Couplage crucial : la CRH calibre la GnRH, l'ACTH calibre la FSH, le cortisol retarde la libération de FSH. Ce dialogue détermine l'équilibre cata/anabolique.",
    clinical: [
      "Aménorrhée (stress)",
      "Troubles de fertilité",
      "Ménorragies",
      "Kystes, adénomes"
    ],
    action: "Régulation croisée CBG/SHBG"
  },

  "Axe_Thyreotrope": {
    title: "Axe Thyréotrope",
    subtitle: "TSH → T4/T3",
    role: "Métabolisme Cellulaire",
    laprazQuote: "L'αΣ relance la CRH et la TRH. En aval, le cortisol sensibilise les cellules à l'activité de la T4.",
    description: "Couplage cortico-thyréotrope : le sympathique co-stimule CRH et TRH. Le cortisol sensibilise les cellules à la T4.",
    clinical: [
      "Hypothyroïdie fonctionnelle",
      "Frilosité",
      "Constipation"
    ],
    action: "Couplage catabolisant-catabolisant"
  },

  "Axe_Somatotrope": {
    title: "Axe Somatotrope",
    subtitle: "GH → IGF-1",
    role: "Croissance & Réparation",
    laprazQuote: "La prolactine stimule la CRH pour permettre l'enchaînement des boucles. L'axe somatotrope est à la croisée de la 1ère et 2ème boucle.",
    description: "Couplage somato-corticotrope : le cortisol calibre la GH. La prolactine fait le lien entre les boucles.",
    clinical: [
      "Troubles de croissance",
      "Récupération tissulaire altérée"
    ],
    action: "Couplage anabolisant"
  },

  // ═══════════════════════════════════════════════════════════════════════
  // 🌿 PHYTOTHÉRAPIE
  // ═══════════════════════════════════════════════════════════════════════

  "Ribes_nigrum": {
    title: "Ribes nigrum",
    subtitle: "Cassis (Bourgeon)",
    role: "Cortison-Like Naturel",
    laprazQuote: "Action anti-inflammatoire puissante sans les effets secondaires des corticoïdes.",
    description: "LE remède roi de l'adaptation. Le bourgeon de cassis stimule le cortex surrénalien, possède une action anti-inflammatoire et adaptogène majeure. C'est le 'starter' de toute prescription corticotrope.",
    clinical: [
      "Épuisement surrénalien",
      "Allergies",
      "Inflammation chronique",
      "Asthme"
    ],
    action: "Stimule cortex surrénalien, anti-inflammatoire"
  },

  "Rhodiola_rosea": {
    title: "Rhodiola rosea",
    subtitle: "Orpin Rose",
    role: "Adaptogène Central",
    description: "Adaptogène majeur qui module la réponse au stress. Elle soutient les neurotransmetteurs (Sérotonine/Dopamine) tout en épargnant la surrénale. Excellente pour le burn-out.",
    clinical: [
      "Burn-out",
      "Dépression légère",
      "Fatigue cognitive",
      "Stress chronique"
    ],
    action: "Harmonisation centrale, épargne surrénalienne"
  },

  "Passiflora": {
    title: "Passiflora incarnata",
    subtitle: "Passiflore",
    role: "Sédatif α-Sympathique",
    laprazQuote: "Passiflora incarnata est particulièrement efficace dans la réduction du rôle de l'alpha en relation avec un cortisol élevé.",
    description: "Calme l'hyperexcitabilité neuro-végétative sans effondrer le tonus global. C'est LA plante pour freiner le sympathique et l'anxiété d'anticipation.",
    clinical: [
      "Insomnie d'endormissement",
      "Anxiété",
      "Éréthisme cardiaque",
      "Hyperactivité sympathique"
    ],
    action: "Freine αΣ, anxiolytique"
  },

  "Glycyrrhiza": {
    title: "Glycyrrhiza glabra",
    subtitle: "Réglisse",
    role: "Épargneur de Cortisol",
    description: "Freine la dégradation du cortisol dans le foie (inhibe 11β-HSD), prolongeant son action. Excellente pour l'hypotension. ATTENTION : contre-indiquée si hypertension !",
    clinical: [
      "Hypotension",
      "Inflammation gastrique",
      "Besoin de sucre/sel",
      "Fatigue surrénalienne"
    ],
    action: "↑ demi-vie du cortisol"
  },

  "Eleutherococcus": {
    title: "Eleutherococcus senticosus",
    subtitle: "Ginseng Sibérien",
    role: "Tonique Adaptogène",
    description: "Plante de l'effort physique et intellectuel. Augmente la capacité de travail et la résistance au froid. Plus stimulante que Rhodiola.",
    clinical: [
      "Fatigue physique intense",
      "Convalescence",
      "Préparation sportive"
    ],
    action: "Tonique, stimulant adaptogène"
  },

  "Quercus_bg": {
    title: "Quercus pedunculata",
    subtitle: "Chêne (Bourgeon)",
    role: "Tonique Polyglandulaire",
    description: "Action tonique sur le cortex surrénalien ET les gonades. C'est la plante de la structure et de la vitalité. Excellente pour les hommes fatigués.",
    clinical: [
      "Fatigue sexuelle",
      "Hypotension",
      "Fragilité vasculaire"
    ],
    action: "Tonification surrénalo-gonadique"
  }
};