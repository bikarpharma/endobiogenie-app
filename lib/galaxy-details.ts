// lib/galaxy-details.ts

export const NODE_DETAILS: Record<string, any> = {
  // --- ÉTAGE MASTER (CERVEAU) ---
  "Hypothalamus": {
    title: "Le Chef d'Orchestre",
    role: "Centre d'intégration Neuro-Endocrinien",
    desc: "Reçoit les informations du système limbique (émotions) et du cortex pour orchestrer la réponse au stress via la CRH.",
    clinical: ["Troubles du sommeil", "Dérèglements thermiques", "Appétit anarchique"],
    action: "Commande l'hypophyse."
  },
  "Hypophyse": {
    title: "Glande Pituitaire",
    role: "L'Usine à Ordres",
    desc: "Transforme l'influx nerveux (CRH) en message hormonal sanguin (ACTH). Elle est le relais indispensable entre le cerveau et le corps.",
    clinical: ["Signes de déconnexion hypothalamo-hypophysaire"],
    action: "Stimule les glandes périphériques."
  },
  "Alpha_Sympathique": {
    title: "Système Alpha-Sympathique",
    role: "Vigilance & Vasoconstriction",
    desc: "Branche du système nerveux autonome qui gère l'alerte immédiate. Il déclenche la vasoconstriction périphérique (mains froides) pour ramener le sang vers les organes nobles.",
    clinical: ["Mains/Pieds froids", "Bouche sèche", "Hypertension réactionnelle"],
    action: "Stimule l'axe corticotrope et la médullosurrénale."
  },

  // --- HORMONES ---
  "CRH": {
    title: "Corticotropin-Releasing Hormone",
    role: "Starter du Stress",
    desc: "Hormone hypothalamique qui lance la cascade du stress. Très sensible à l'état émotionnel.",
    clinical: ["Anxiété d'anticipation"],
    action: "Stimule l'ACTH."
  },
  "ACTH": {
    title: "Adrénocorticotrophine",
    role: "Stimulateur Surrénalien",
    desc: "Messager de l'urgence. Stimule la zone fasciculée (Cortisol) et réticulée (Androgènes) de la surrénale.",
    clinical: ["Hyperpigmentation (si très élevé)"],
    action: "Ordonne la production de cortisol."
  },
  "Cortisol": {
    title: "Hormone de l'Adaptation",
    role: "Catabolisme & Anti-inflammatoire",
    desc: "Hormone vitale de l'adaptation. Elle mobilise le glucose, freine l'inflammation et l'immunité pour gérer l'urgence. Son rythme circadien (haut le matin, bas le soir) est crucial.",
    clinical: ["Asthénie matinale (si bas)", "Excitation vespérale (si haut)", "Infections à répétition"],
    action: "Rétrocontrôle négatif sur l'axe (Frein)."
  },
  "DHEA": {
    title: "Déhydroépiandrostérone",
    role: "Réparation & Anabolisme",
    desc: "Contre-balance les effets cataboliques du cortisol. C'est l'hormone de la réparation tissulaire et de la mémoire.",
    clinical: ["Peau sèche/fine", "Troubles de mémoire", "Baisse de libido"],
    action: "Soutien anabolique."
  },
  "Aldostérone": {
    title: "Aldostérone",
    role: "Gestion Eau/Sel",
    desc: "Gère la volémie (volume sanguin) et la tension artérielle en retenant le sodium et l'eau.",
    clinical: ["Rétention d'eau", "Soif excessive", "Hypertension"],
    action: "Minéralocorticoïde."
  },
  "Adrénaline": {
    title: "L'Hormone de l'Urgence",
    role: "Sympathique Médullosurrénalien",
    desc: "Réponse immédiate (Fight or Flight). Augmente le rythme cardiaque et la vigilance.",
    clinical: ["Palpitations", "Sueurs froides", "Anxiété paroxystique"],
    action: "Mobilisation instantanée."
  },
  "ACTH_Alpha_MSH": {
    title: "Alpha-MSH",
    role: "Régulation Immunitaire",
    desc: "Dérivé de la POMC, elle a un rôle anti-inflammatoire et antipyrétique central.",
    clinical: ["Troubles de la pigmentation"],
    action: "Modulation."
  },
  "Prolactine_PL": {
    title: "Prolactine",
    role: "Protection & Maternel",
    desc: "Hormone de 'couvade', elle augmente en cas de stress passif (subi). Elle bloque l'ovulation et stimule l'immunité.",
    clinical: ["Tension mammaire", "Baisse de libido", "Prise de poids"],
    action: "Inhibition gonadotrope."
  },
  "Vasopressine_AVP": {
    title: "Vasopressine (ADH)",
    role: "Mémoire & Eau",
    desc: "Hormone antidiurétique. Elle joue aussi un rôle clé dans la mémoire et l'anxiété chronique.",
    clinical: ["Rétention hydrique", "Troubles mnésiques"],
    action: "Synergie avec CRH."
  },

  // --- GLANDES & ORGANES ---
  "Cortex_Surrenal": {
    title: "Cortex Surrénalien",
    role: "Usine de l'Adaptation",
    desc: "Partie périphérique de la glande surrénale. Produit Cortisol, DHEA et Aldostérone.",
    clinical: ["Épuisement surrénalien (Burn-out)"],
    action: "Adaptation lente."
  },
  "Médullosurrénale": {
    title: "Médullosurrénale",
    role: "Urgence Absolue",
    desc: "Centre nerveux au cœur de la glande. Produit Adrénaline et Noradrénaline.",
    clinical: ["Hyper-réactivité au stress"],
    action: "Adaptation rapide."
  },
  "Rein": {
    title: "Le Rein",
    role: "Filtration & Volémie",
    desc: "Organe cible de l'aldostérone pour la gestion de la pression artérielle.",
    clinical: ["Oedèmes", "Hypertension"],
    action: "Élimination."
  },
  "Foie": {
    title: "Le Foie",
    role: "Carrefour Métabolique",
    desc: "Doit répondre à la demande de glucose du Cortisol. Si le foie est congestionné, l'adaptation échoue.",
    clinical: ["Réveils nocturnes (1h-3h)", "Nausées matinales", "Colère/Irritabilité"],
    action: "Gluconéogenèse."
  },
  "Systeme_Immunitaire": {
    title: "Système Immunitaire",
    role: "Défense",
    desc: "Fortement inhibé par le cortisol (pour éviter l'auto-immunité) et stimulé par la Prolactine/GH.",
    clinical: ["Maladies auto-immunes", "Allergies", "Infections fréquentes"],
    action: "Protection."
  },

  // --- PLANTES ---
  "Ribes_nigrum": {
    title: "Cassis (Bourgeon)",
    role: "Cortison-Like",
    desc: "Le remède roi de l'adaptation. Il stimule le cortex surrénalien et possède une action anti-inflammatoire puissante sans les effets secondaires des corticoïdes.",
    clinical: ["Épuisement", "Allergies", "Inflammation chronique"],
    action: "Relance la surrénale épuisée."
  },
  "Rhodiola_rosea": {
    title: "Orpin Rose",
    role: "Adaptogène Majeur",
    desc: "Module la réponse au stress. Elle soutient les neurotransmetteurs (Sérotonine/Dopamine) tout en épargnant la surrénale.",
    clinical: ["Burn-out", "Dépression légère", "Fatigue cognitive"],
    action: "Harmonisation centrale."
  },
  "Passiflora_incarnata": {
    title: "Passiflore",
    role: "Sédatif Alpha-Sympathique",
    desc: "Calme l'hyperexcitabilité neuro-végétative sans effondrer le tonus global.",
    clinical: ["Insomnie d'endormissement", "Anxiété", "Eréthisme cardiaque"],
    action: "Freine le sympathique."
  },
  "Eleutherococcus_senticosus": {
    title: "Éleuthérocoque",
    role: "Ginseng Sibérien",
    desc: "Plante de l'effort physique et intellectuel. Augmente la capacité de travail et la résistance au froid.",
    clinical: ["Fatigue physique intense", "Convalescence", "Préparation sportive"],
    action: "Stimulant adaptogène."
  },
  "Quercus_pedunculata": {
    title: "Chêne (Bourgeon)",
    role: "Stimulant Polyglandulaire",
    desc: "Action tonique sur la corticosurrénale et les gonades. C'est la plante de la structure et de la vitalité masculine.",
    clinical: ["Fatigue sexuelle", "Hypotension", "Fragilité vasculaire"],
    action: "Tonification globale."
  },
  "Glycyrrhiza_glabra": {
    title: "Réglisse",
    role: "Épargneur de Cortisol",
    desc: "Freine la dégradation du cortisol dans le foie, prolongeant son action. Attention à l'hypertension.",
    clinical: ["Hypotension", "Inflammation gastrique", "Besoin de sucre/sel"],
    action: "Potentialise le cortisol."
  },

  // --- SYMPTÔMES & MÉTABOLISME ---
  "Insomnie": {
    title: "Trouble du Sommeil",
    role: "Signe de Dysrégulation",
    desc: "Souvent liée à un cortisol élevé le soir (inversion de rythme) ou une hyperactivité sympathique.",
    clinical: ["Réveils nocturnes (Foie/Cortisol)", "Difficulté d'endormissement (Sympathique)"],
    action: "Nécessite une régulation du rythme."
  },
  "Anxiété": {
    title: "État d'Alerte Permanent",
    role: "Surcharge Corticotrope",
    desc: "Traduit une incapacité à gérer le flux d'informations entrant ou une anticipation excessive du danger.",
    clinical: ["Boule au ventre", "Tension musculaire", "Rumination"],
    action: "Traiter le terrain neuro-végétatif."
  },
  "Dépression": {
    title: "Dépression Épuisement",
    role: "Effondrement de l'Axe",
    desc: "Souvent la conséquence d'un stress chronique ayant épuisé les réserves de catécholamines et désensibilisé les récepteurs au cortisol.",
    clinical: ["Perte d'élan", "Tristesse matinale", "Ralentissement"],
    action: "Restaurer l'axe."
  },
  "Hypoglycémie": {
    title: "Hypoglycémie Réactionnelle",
    role: "Défaut d'Adaptation",
    desc: "Signe que le cortisol ne mobilise pas assez vite le glucose hépatique face à une demande.",
    clinical: ["Coup de pompe 11h/17h", "Irritabilité avant les repas", "Tremblements"],
    action: "Soutenir la fonction glucocorticoïde."
  },
  "Inflammation": {
    title: "Inflammation",
    role: "Réponse Tissulaire",
    desc: "Normalement freinée par le cortisol. Si elle persiste, cela signe soit un excès d'agression, soit une insuffisance de cortisol (frein cassé).",
    clinical: ["Douleurs articulaires", "Rougeurs", "Maladies en -ite"],
    action: "Modulation."
  },
  "Metabolisme_Glucose": {
    title: "Métabolisme Glucidique",
    role: "Carburant",
    desc: "Le cortisol doit maintenir la glycémie stable pour le cerveau.",
    clinical: ["Prise de poids abdominale", "Envies de sucre"],
    action: "Gestion énergie."
  },
  "Metabolisme_Lipides": {
    title: "Métabolisme Lipidique",
    role: "Réserve",
    desc: "Le cortisol mobilise les graisses. En excès chronique, il stocke sur le tronc et le visage.",
    clinical: ["Cholestérol", "Triglycérides"],
    action: "Stockage/Déstockage."
  }
};