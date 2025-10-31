// ========================================
// FICHES MALADIES - Base de données
// ========================================
// Fiches multi-approches : Endobiogénie, Gemmothérapie, Aromathérapie, Phytothérapie

export interface FicheMaladie {
  id: string;
  slug: string;
  titre: string;
  categorie: "infectieux" | "nerveux" | "cardiovasculaire" | "digestif" | "immunitaire" | "urinaire";
  symptomes: string[];
  endobiogenie?: {
    titre: string;
    terrain: string;
    axes: string[];
    approche: string;
  };
  gemmotherapie?: {
    titre: string;
    bourgeons: Array<{
      nom: string;
      posologie: string;
      duree: string;
    }>;
  };
  aromatherapie?: {
    titre: string;
    huilesEssentielles: Array<{
      nom: string;
      voie: string;
      posologie: string;
    }>;
  };
  phytotherapie?: {
    titre: string;
    plantes: Array<{
      nom: string;
      forme: string;
      posologie: string;
    }>;
  };
  precautions: string[];
  conseils: string[];
}

export const fichesMaladies: FicheMaladie[] = [
  // FICHE 1 : ANGINE / PHARYNGITE
  {
    id: "1",
    slug: "angine-pharyngite",
    titre: "Angine / Pharyngite",
    categorie: "infectieux",
    symptomes: [
      "Douleur à la déglutition",
      "Gorge rouge et inflammée",
      "Fièvre modérée à élevée",
      "Ganglions cervicaux gonflés",
      "Fatigue générale",
    ],
    endobiogenie: {
      titre: "Approche endobiogénique",
      terrain: "Terrain inflammatoire avec hyperactivité alpha-sympathique",
      axes: [
        "Axe cortico-surrénalien : soutien des défenses anti-inflammatoires",
        "Axe thyroïdien : régulation métabolique",
        "Système neurovégétatif : rééquilibrage alpha/para-sympathique",
      ],
      approche: "Soutenir la réponse immunitaire locale tout en modulant la réaction inflammatoire excessive. Favoriser la récupération énergétique post-infectieuse.",
    },
    gemmotherapie: {
      titre: "Bourgeons recommandés",
      bourgeons: [
        {
          nom: "Cassis (Ribes nigrum)",
          posologie: "50 gouttes 3×/jour dans un peu d'eau",
          duree: "5-7 jours (phase aiguë)",
        },
        {
          nom: "Rosa canina (Églantier)",
          posologie: "50 gouttes 2×/jour",
          duree: "7-10 jours (immunostimulant)",
        },
        {
          nom: "Aulne glutineux (Alnus glutinosa)",
          posologie: "50 gouttes 2×/jour",
          duree: "En phase de surinfection",
        },
      ],
    },
    aromatherapie: {
      titre: "Synergies aromatiques",
      huilesEssentielles: [
        {
          nom: "Tea tree (Melaleuca alternifolia)",
          voie: "Voie orale",
          posologie: "2 gouttes sur comprimé neutre, 3×/jour pendant 5 jours",
        },
        {
          nom: "Thym à thujanol (Thymus vulgaris CT thujanol)",
          voie: "Voie orale",
          posologie: "2 gouttes sur comprimé neutre, 3×/jour",
        },
        {
          nom: "Ravintsara (Cinnamomum camphora)",
          voie: "Application locale + diffusion",
          posologie: "2 gouttes diluées dans HV, masser le cou 3×/jour",
        },
      ],
    },
    phytotherapie: {
      titre: "Protocole phytothérapeutique",
      plantes: [
        {
          nom: "Propolis",
          forme: "Spray buccal ou gommes à mâcher",
          posologie: "3-4 pulvérisations ou 3 gommes/jour",
        },
        {
          nom: "Erysimum (Sisymbrium officinale)",
          forme: "Teinture mère",
          posologie: "40 gouttes dans eau tiède, 3×/jour en gargarisme puis avaler",
        },
        {
          nom: "Échinacée (Echinacea purpurea)",
          forme: "Extrait sec ou teinture",
          posologie: "600 mg/jour ou 60 gouttes 3×/jour pendant 7 jours",
        },
      ],
    },
    precautions: [
      "Différencier angine virale et bactérienne (test rapide si doute)",
      "HE interdites chez femmes enceintes et enfants <6 ans (sauf avis médical)",
      "Échinacée contre-indiquée en maladies auto-immunes",
      "Consulter si fièvre >39°C persistante ou dyspnée",
    ],
    conseils: [
      "Repos vocal et hydratation abondante (eau tiède, tisanes)",
      "Éviter irritants : tabac, air sec, aliments épicés",
      "Gargarismes eau salée tiède 3-4×/jour",
      "Alimentation légère, privilégier soupes et compotes",
    ],
  },

  // FICHE 2 : GRIPPE / SYNDROME GRIPPAL
  {
    id: "2",
    slug: "grippe-syndrome-grippal",
    titre: "Grippe / Syndrome grippal",
    categorie: "infectieux",
    symptomes: [
      "Fièvre élevée brutale (>38.5°C)",
      "Courbatures et douleurs musculaires intenses",
      "Fatigue extrême (asthénie)",
      "Maux de tête (céphalées)",
      "Toux sèche, congestion nasale",
    ],
    endobiogenie: {
      titre: "Lecture endobiogénique",
      terrain: "Épuisement surrénalien avec inefficacité de la réponse cortisolique",
      axes: [
        "Axe hypothalamo-hypophyso-surrénalien : restauration des capacités adaptatives",
        "Système immunitaire : soutien des défenses innées (interférons)",
        "Équilibre thyroïdien : maintien du métabolisme basal",
      ],
      approche: "Soutenir rapidement la réponse immunitaire tout en préservant les réserves énergétiques. Prévenir la chronicisation de la fatigue post-grippale.",
    },
    gemmotherapie: {
      titre: "Protocole gemmothérapique",
      bourgeons: [
        {
          nom: "Cassis (Ribes nigrum)",
          posologie: "100 gouttes 3×/jour en phase aiguë",
          duree: "Premiers 3 jours",
        },
        {
          nom: "Églantier (Rosa canina)",
          posologie: "50 gouttes 3×/jour",
          duree: "7-10 jours",
        },
        {
          nom: "Bouleau (Betula pubescens)",
          posologie: "50 gouttes 2×/jour en relais",
          duree: "Convalescence (10-15 jours)",
        },
      ],
    },
    aromatherapie: {
      titre: "Synergie antivirale",
      huilesEssentielles: [
        {
          nom: "Ravintsara (Cinnamomum camphora)",
          voie: "Voie orale + cutanée",
          posologie: "3 gouttes sur comprimé 4×/jour + application thorax",
        },
        {
          nom: "Eucalyptus radié (Eucalyptus radiata)",
          voie: "Inhalation + diffusion",
          posologie: "Inhalation 2×/jour + diffusion atmosphérique",
        },
        {
          nom: "Laurier noble (Laurus nobilis)",
          voie: "Voie orale",
          posologie: "2 gouttes 3×/jour sur comprimé neutre",
        },
      ],
    },
    phytotherapie: {
      titre: "Plantes antivirales et immunostimulantes",
      plantes: [
        {
          nom: "Cyprès (Cupressus sempervirens)",
          forme: "Teinture mère",
          posologie: "50 gouttes 3×/jour dans eau",
        },
        {
          nom: "Sureau noir (Sambucus nigra)",
          forme: "Infusion de fleurs",
          posologie: "3 tasses/jour (sudorifique)",
        },
        {
          nom: "Andrographis (Andrographis paniculata)",
          forme: "Extrait sec",
          posologie: "400 mg 3×/jour pendant 5 jours",
        },
      ],
    },
    precautions: [
      "Surveiller déshydratation chez enfants et personnes âgées",
      "Consulter rapidement si : dyspnée, confusion, douleur thoracique",
      "HE Ravintsara interdite chez femmes enceintes et enfants <3 ans",
      "Isolement recommandé (contagiosité élevée)",
    ],
    conseils: [
      "Repos strict au lit pendant 48-72h",
      "Hydratation massive : 2-3 litres/jour (eau, tisanes, bouillons)",
      "Alimentation légère riche en vitamine C (agrumes, kiwi)",
      "Éviter aspirine chez enfants (syndrome de Reye)",
      "Aération quotidienne de la chambre",
    ],
  },

  // FICHE 3 : STRESS CHRONIQUE / ANXIÉTÉ
  {
    id: "3",
    slug: "stress-anxiete",
    titre: "Stress chronique / Anxiété",
    categorie: "nerveux",
    symptomes: [
      "Tension nerveuse permanente",
      "Ruminations mentales",
      "Troubles du sommeil",
      "Palpitations, oppression thoracique",
      "Fatigue nerveuse, irritabilité",
      "Troubles digestifs fonctionnels",
    ],
    endobiogenie: {
      titre: "Profil endobiogénique",
      terrain: "Hyperactivité alpha-sympathique avec épuisement surrénalien progressif",
      axes: [
        "Axe hypothalamo-hypophyso-surrénalien : régulation du cortisol",
        "Système neurovégétatif : rééquilibrage sympathique/parasympathique",
        "Axe thyroïdien : modulation métabolique",
        "Sphère digestive : axe cerveau-intestin",
      ],
      approche: "Restaurer la capacité d'adaptation au stress (allostasie). Protéger les réserves surrénaliennes. Favoriser le parasympathique (relaxation, digestion).",
    },
    gemmotherapie: {
      titre: "Bourgeons adaptogènes et calmants",
      bourgeons: [
        {
          nom: "Figuier (Ficus carica)",
          posologie: "50 gouttes matin et soir",
          duree: "Cure de 3 semaines minimum (renouvelable)",
        },
        {
          nom: "Tilleul (Tilia tomentosa)",
          posologie: "50 gouttes le soir avant coucher",
          duree: "Associé au Figuier",
        },
        {
          nom: "Aubépine (Crataegus oxyacantha)",
          posologie: "50 gouttes midi et soir",
          duree: "Si palpitations associées",
        },
      ],
    },
    aromatherapie: {
      titre: "HE calmantes et équilibrantes",
      huilesEssentielles: [
        {
          nom: "Lavande vraie (Lavandula angustifolia)",
          voie: "Voie cutanée + olfaction",
          posologie: "2 gouttes pures sur plexus solaire matin et soir + inhalation",
        },
        {
          nom: "Petit grain bigarade (Citrus aurantium)",
          voie: "Voie orale + olfaction",
          posologie: "2 gouttes sur comprimé neutre 2×/jour",
        },
        {
          nom: "Camomille romaine (Chamaemelum nobile)",
          voie: "Voie cutanée",
          posologie: "1 goutte diluée dans HV, massage poignets",
        },
      ],
    },
    phytotherapie: {
      titre: "Plantes adaptogènes et anxiolytiques",
      plantes: [
        {
          nom: "Rhodiole (Rhodiola rosea)",
          forme: "Extrait sec standardisé",
          posologie: "200 mg le matin (adaptogène anti-fatigue)",
        },
        {
          nom: "Passiflore (Passiflora incarnata)",
          forme: "Infusion ou extrait sec",
          posologie: "200 mg 2×/jour ou infusion soir",
        },
        {
          nom: "Ashwagandha (Withania somnifera)",
          forme: "Extrait sec",
          posologie: "300 mg 2×/jour pendant 8 semaines",
        },
      ],
    },
    precautions: [
      "Rhodiole contre-indiquée en troubles bipolaires",
      "Ashwagandha déconseillée en hyperthyroïdie",
      "HE à diluer chez peaux sensibles",
      "Consulter si symptômes dépressifs associés",
    ],
    conseils: [
      "Cohérence cardiaque : 3×5 min/jour (respiration 5s inspire/5s expire)",
      "Activité physique régulière (marche, yoga, natation)",
      "Limiter excitants : café, thé fort, alcool, écrans le soir",
      "Techniques de relaxation : méditation, sophrologie",
      "Magnésium : 300 mg/jour en cure de 3 mois",
    ],
  },

  // FICHE 4 : INSOMNIE / TROUBLES DU SOMMEIL
  {
    id: "4",
    slug: "insomnie-troubles-sommeil",
    titre: "Insomnie / Troubles du sommeil",
    categorie: "nerveux",
    symptomes: [
      "Difficultés d'endormissement (>30 min)",
      "Réveils nocturnes fréquents",
      "Réveil précoce (4-5h du matin)",
      "Fatigue au réveil",
      "Somnolence diurne",
      "Irritabilité, troubles de concentration",
    ],
    endobiogenie: {
      titre: "Approche endobiogénique du sommeil",
      terrain: "Déséquilibre neurovégétatif avec hyperactivité alpha-sympathique nocturne",
      axes: [
        "Rythme cortisol/mélatonine : restauration du cycle circadien",
        "Axe somatotrope : optimisation de la sécrétion de GH nocturne",
        "Système parasympathique : activation en soirée",
        "Sphère hépatique : détoxication nocturne",
      ],
      approche: "Rétablir le rythme veille-sommeil naturel. Favoriser la transition vers le parasympathique en soirée. Soutenir la qualité du sommeil profond (récupération).",
    },
    gemmotherapie: {
      titre: "Bourgeons du sommeil",
      bourgeons: [
        {
          nom: "Tilleul (Tilia tomentosa)",
          posologie: "100 gouttes 30 min avant coucher",
          duree: "Cure de 1 mois minimum",
        },
        {
          nom: "Figuier (Ficus carica)",
          posologie: "50 gouttes matin + 50 gouttes 17h",
          duree: "Si insomnie liée au stress",
        },
        {
          nom: "Aubépine (Crataegus oxyacantha)",
          posologie: "50 gouttes le soir",
          duree: "Si palpitations nocturnes",
        },
      ],
    },
    aromatherapie: {
      titre: "HE sédatives et hypnotiques",
      huilesEssentielles: [
        {
          nom: "Lavande vraie (Lavandula angustifolia)",
          voie: "Diffusion + voie cutanée",
          posologie: "Diffusion 30 min avant coucher + 2 gouttes sur oreiller",
        },
        {
          nom: "Mandarine (Citrus reticulata)",
          voie: "Voie orale + olfaction",
          posologie: "2 gouttes sur comprimé neutre 1h avant coucher",
        },
        {
          nom: "Marjolaine à coquilles (Origanum majorana)",
          voie: "Voie cutanée",
          posologie: "2 gouttes diluées, massage plexus solaire",
        },
      ],
    },
    phytotherapie: {
      titre: "Plantes sédatives",
      plantes: [
        {
          nom: "Valériane (Valeriana officinalis)",
          forme: "Extrait sec",
          posologie: "400 mg 1-2h avant coucher",
        },
        {
          nom: "Eschscholtzia (Eschscholzia californica)",
          forme: "Extrait sec ou teinture",
          posologie: "200 mg ou 40 gouttes au coucher",
        },
        {
          nom: "Mélisse (Melissa officinalis)",
          forme: "Infusion",
          posologie: "1 tasse 30 min avant coucher",
        },
      ],
    },
    precautions: [
      "Valériane : effet paradoxal possible (agitation) chez certaines personnes",
      "Éviter association avec somnifères chimiques sans avis médical",
      "HE à éviter chez femmes enceintes",
      "Consulter si insomnie >3 semaines ou apnées du sommeil suspectées",
    ],
    conseils: [
      "Horaires réguliers : coucher et lever à heures fixes (même week-end)",
      "Chambre : obscurité totale, 18-19°C, silence",
      "Éviter écrans 1-2h avant coucher (lumière bleue inhibe mélatonine)",
      "Dîner léger 2-3h avant coucher (éviter protéines lourdes)",
      "Rituel du soir : lecture, tisane, relaxation",
      "Exposition lumière naturelle le matin (synchronisation circadienne)",
    ],
  },

  // FICHE 5 : HYPERTENSION ARTÉRIELLE
  {
    id: "5",
    slug: "hypertension-arterielle",
    titre: "Hypertension artérielle",
    categorie: "cardiovasculaire",
    symptomes: [
      "Souvent asymptomatique (\"tueur silencieux\")",
      "Céphalées matinales (occipitales)",
      "Vertiges, acouphènes",
      "Palpitations",
      "Fatigue, nervosité",
      "Épistaxis (saignements de nez)",
    ],
    endobiogenie: {
      titre: "Profil endobiogénique de l'hypertendu",
      terrain: "Hyperactivité alpha-sympathique avec rigidité vasculaire",
      axes: [
        "Système nerveux sympathique : modulation du tonus vasculaire",
        "Axe rénine-angiotensine-aldostérone : régulation volémie et pression",
        "Fonction endothéliale : préservation de la vasodilatation (NO)",
        "Métabolisme lipidique et glucidique : prévention athérosclérose",
      ],
      approche: "Favoriser la vasodilatation naturelle. Moduler l'hyperréactivité sympathique. Protéger la fonction rénale et endothéliale. Approche terrain de fond.",
    },
    gemmotherapie: {
      titre: "Bourgeons hypotenseurs",
      bourgeons: [
        {
          nom: "Olivier (Olea europaea)",
          posologie: "50 gouttes 2×/jour",
          duree: "Cure de 3 mois (renouvelable)",
        },
        {
          nom: "Aubépine (Crataegus oxyacantha)",
          posologie: "50 gouttes 2×/jour",
          duree: "Régulation cardio-vasculaire globale",
        },
        {
          nom: "Gui (Viscum album)",
          posologie: "50 gouttes 1-2×/jour",
          duree: "Hypotenseur puissant (sous surveillance)",
        },
      ],
    },
    aromatherapie: {
      titre: "HE cardiovasculaires",
      huilesEssentielles: [
        {
          nom: "Ylang-ylang (Cananga odorata)",
          voie: "Voie cutanée + olfaction",
          posologie: "2 gouttes diluées en massage plexus cardiaque 2×/jour",
        },
        {
          nom: "Lavande vraie (Lavandula angustifolia)",
          voie: "Olfaction + diffusion",
          posologie: "Inhalation profonde en cas de tension nerveuse",
        },
        {
          nom: "Marjolaine à coquilles (Origanum majorana)",
          voie: "Voie cutanée",
          posologie: "2 gouttes diluées, massage face interne poignets",
        },
      ],
    },
    phytotherapie: {
      titre: "Plantes hypotensives",
      plantes: [
        {
          nom: "Olivier (Olea europaea) - feuilles",
          forme: "Infusion ou extrait sec",
          posologie: "3 tasses/jour ou 500 mg 2×/jour",
        },
        {
          nom: "Ail (Allium sativum)",
          forme: "Extrait sec standardisé",
          posologie: "600-900 mg/jour (allicine)",
        },
        {
          nom: "Hibiscus (Hibiscus sabdariffa)",
          forme: "Infusion",
          posologie: "2-3 tasses/jour",
        },
      ],
    },
    precautions: [
      "⚠️ NE JAMAIS ARRÊTER traitement médical sans avis médical",
      "Surveillance régulière de la tension (automesure)",
      "Gui contre-indiqué en insuffisance rénale sévère",
      "Ail : interaction possible avec anticoagulants",
      "Consulter si TA >180/110 mmHg ou symptômes neurologiques",
    ],
    conseils: [
      "Réduction sel : <5g/jour (éviter plats industriels, charcuterie)",
      "Alimentation DASH : fruits, légumes, céréales complètes, poissons gras",
      "Activité physique : 30 min/jour marche rapide ou équivalent",
      "Gestion du stress : cohérence cardiaque, méditation",
      "Maintien poids santé (IMC <25)",
      "Limitation alcool : <2 verres/jour homme, <1 femme",
      "Arrêt tabac (priorité absolue)",
    ],
  },

  // FICHE 6 : TROUBLES DIGESTIFS
  {
    id: "6",
    slug: "troubles-digestifs",
    titre: "Troubles digestifs (gastrite, ballonnements)",
    categorie: "digestif",
    symptomes: [
      "Ballonnements postprandiaux",
      "Douleurs épigastriques",
      "Brûlures d'estomac (pyrosis)",
      "Nausées",
      "Alternance diarrhée/constipation",
      "Flatulences",
    ],
    endobiogenie: {
      titre: "Axe cerveau-intestin",
      terrain: "Dysautonomie avec parasympathique insuffisant (troubles motilité)",
      axes: [
        "Système nerveux entérique : régulation péristaltisme",
        "Axe cortico-surrénalien : impact du stress sur muqueuse digestive",
        "Fonction hépatobiliaire : sécrétion bile et enzymes",
        "Microbiote intestinal : eubiose/dysbiose",
      ],
      approche: "Restaurer la motilité digestive. Protéger la muqueuse gastrique. Rééquilibrer le microbiote. Gérer le stress digestif.",
    },
    gemmotherapie: {
      titre: "Bourgeons digestifs",
      bourgeons: [
        {
          nom: "Figuier (Ficus carica)",
          posologie: "50 gouttes avant 2 repas principaux",
          duree: "Cure de 3 semaines",
        },
        {
          nom: "Noyer (Juglans regia)",
          posologie: "50 gouttes 2×/jour",
          duree: "Rééquilibrage flore intestinale",
        },
        {
          nom: "Airelle (Vaccinium vitis-idaea)",
          posologie: "50 gouttes avant repas",
          duree: "Si constipation associée",
        },
      ],
    },
    aromatherapie: {
      titre: "HE carminatives et antispasmodiques",
      huilesEssentielles: [
        {
          nom: "Basilic tropical (Ocimum basilicum)",
          voie: "Voie orale",
          posologie: "1 goutte après repas sur comprimé neutre",
        },
        {
          nom: "Menthe poivrée (Mentha x piperita)",
          voie: "Voie orale + cutanée",
          posologie: "1 goutte après repas + massage abdominal dilué",
        },
        {
          nom: "Estragon (Artemisia dracunculus)",
          voie: "Voie orale",
          posologie: "1 goutte 2×/jour sur comprimé (antispasmodique puissant)",
        },
      ],
    },
    phytotherapie: {
      titre: "Plantes digestives",
      plantes: [
        {
          nom: "Mélisse (Melissa officinalis)",
          forme: "Infusion",
          posologie: "1 tasse après chaque repas",
        },
        {
          nom: "Réglisse (Glycyrrhiza glabra)",
          forme: "Extrait sec DGL (déglycyrrhizinée)",
          posologie: "400 mg 3×/jour avant repas (protection muqueuse gastrique)",
        },
        {
          nom: "Chardon-Marie (Silybum marianum)",
          forme: "Extrait sec",
          posologie: "200 mg 3×/jour (soutien hépatique)",
        },
      ],
    },
    precautions: [
      "Réglisse contre-indiquée en HTA (sauf forme DGL)",
      "Menthe poivrée interdite chez enfants <6 ans",
      "Consulter si : perte de poids, sang dans selles, vomissements persistants",
      "Éliminer Helicobacter pylori si ulcère gastrique",
    ],
    conseils: [
      "Mastiquer lentement (20-30×/bouchée)",
      "Repas à horaires réguliers, dans le calme",
      "Éviter aliments déclencheurs : épices fortes, graisses, alcool, café",
      "Probiotiques : Lactobacillus + Bifidobacterium (30 jours)",
      "Bouillotte chaude sur abdomen en cas de spasmes",
      "Éviter manger tard le soir (>3h avant coucher)",
    ],
  },

  // FICHE 7 : MIGRAINES / CÉPHALÉES
  {
    id: "7",
    slug: "migraines-cephalees",
    titre: "Migraines / Céphalées",
    categorie: "nerveux",
    symptomes: [
      "Douleur pulsatile unilatérale (hémicrânie)",
      "Nausées, vomissements",
      "Photophobie, phonophobie",
      "Aura visuelle (scotomes, phosphènes)",
      "Durée : 4-72h si non traitée",
    ],
    endobiogenie: {
      titre: "Physiopathologie endobiogénique",
      terrain: "Instabilité vasomotrice avec composante inflammatoire",
      axes: [
        "Système neurovégétatif : hyperréactivité sympathique",
        "Axe œstro-progestatif : migraines cataméniales (femmes)",
        "Fonction hépatique : métabolisme hormones et neurotransmetteurs",
        "Inflammation neurogène : activation CGRP et substance P",
      ],
      approche: "Prévenir les crises (traitement de fond). Moduler la réactivité vasculaire. Réguler les déclencheurs hormonaux et alimentaires.",
    },
    gemmotherapie: {
      titre: "Bourgeons anti-migraineux",
      bourgeons: [
        {
          nom: "Grande camomille (en phyto, pas gemmo standard)",
          posologie: "Voir phytothérapie",
          duree: "Traitement de fond",
        },
        {
          nom: "Tilleul (Tilia tomentosa)",
          posologie: "50 gouttes 2×/jour",
          duree: "Action calmante générale",
        },
        {
          nom: "Figuier (Ficus carica)",
          posologie: "50 gouttes matin et soir",
          duree: "Si stress déclencheur",
        },
      ],
    },
    aromatherapie: {
      titre: "HE anti-migraineuses",
      huilesEssentielles: [
        {
          nom: "Menthe poivrée (Mentha x piperita)",
          voie: "Application locale",
          posologie: "1 goutte pure sur tempes et nuque dès les premiers signes",
        },
        {
          nom: "Lavande vraie (Lavandula angustifolia)",
          voie: "Voie cutanée + olfaction",
          posologie: "2 gouttes en massage crâne + inhalation",
        },
        {
          nom: "Gaulthérie couchée (Gaultheria procumbens)",
          voie: "Application locale",
          posologie: "Diluée en massage nuque (anti-inflammatoire)",
        },
      ],
    },
    phytotherapie: {
      titre: "Plantes préventives",
      plantes: [
        {
          nom: "Grande camomille (Tanacetum parthenium)",
          forme: "Extrait sec standardisé",
          posologie: "100-150 mg/jour en prévention (>3 mois)",
        },
        {
          nom: "Pétasite (Petasites hybridus)",
          forme: "Extrait sec sans alcaloïdes pyrrolizidiniques",
          posologie: "75 mg 2×/jour pendant 3-4 mois",
        },
        {
          nom: "Gingembre (Zingiber officinale)",
          forme: "Poudre ou infusion fraîche",
          posologie: "500 mg au début de la crise (anti-nauséeux)",
        },
      ],
    },
    precautions: [
      "Grande camomille contre-indiquée en grossesse et anticoagulants",
      "Menthe poivrée : éviter près des yeux",
      "Pétasite : UNIQUEMENT extraits certifiés sans PA (hépatotoxicité)",
      "Consulter si : céphalée brutale intense, fièvre, raideur nuque, troubles visuels persistants",
    ],
    conseils: [
      "Tenir un journal des crises (identifier déclencheurs)",
      "Déclencheurs fréquents : chocolat, fromages affinés, vin rouge, glutamate",
      "Régularité : sommeil, repas, hydratation (éviter jeûne prolongé)",
      "Magnésium : 400 mg/jour en prévention (3 mois)",
      "Riboflavine (B2) : 400 mg/jour (traitement de fond)",
      "Chambre obscure et silence lors de la crise",
      "Gestion du stress : biofeedback, relaxation",
    ],
  },

  // FICHE 8 : ALLERGIES SAISONNIÈRES
  {
    id: "8",
    slug: "allergies-saisonnieres",
    titre: "Allergies saisonnières (rhinite allergique)",
    categorie: "immunitaire",
    symptomes: [
      "Éternuements en salves",
      "Rhinorrhée aqueuse (nez qui coule)",
      "Obstruction nasale (nez bouché)",
      "Prurit nasal, oculaire, pharyngé",
      "Conjonctivite (yeux rouges, larmoyants)",
      "Asthénie, irritabilité",
    ],
    endobiogenie: {
      titre: "Terrain atopique",
      terrain: "Hyperréactivité immune de type Th2 avec dysrégulation IgE",
      axes: [
        "Système immunitaire : équilibre Th1/Th2 (excès Th2)",
        "Fonction surrénalienne : déficit cortisol endogène antiallergique",
        "Muqueuses respiratoires : hyperperméabilité et inflammation",
        "Microbiote : impact sur tolérance immune",
      ],
      approche: "Moduler la réponse allergique (avant et pendant la saison). Renforcer la barrière muqueuse. Soutenir la fonction cortisolique naturelle.",
    },
    gemmotherapie: {
      titre: "Bourgeons antiallergiques",
      bourgeons: [
        {
          nom: "Cassis (Ribes nigrum)",
          posologie: "50-100 gouttes 2-3×/jour",
          duree: "Dès les premiers symptômes + toute la saison",
        },
        {
          nom: "Romarin (Rosmarinus officinalis)",
          posologie: "50 gouttes 2×/jour",
          duree: "Détoxication hépatique (drainage)",
        },
        {
          nom: "Viorne (Viburnum lantana)",
          posologie: "50 gouttes 2×/jour",
          duree: "Action bronchique si asthme associé",
        },
      ],
    },
    aromatherapie: {
      titre: "HE antihistaminiques",
      huilesEssentielles: [
        {
          nom: "Estragon (Artemisia dracunculus)",
          voie: "Voie orale",
          posologie: "2 gouttes 3×/jour sur comprimé neutre",
        },
        {
          nom: "Camomille allemande (Matricaria chamomilla)",
          voie: "Inhalation + application locale",
          posologie: "Inhalation sèche + 1 goutte diluée sur sinus",
        },
        {
          nom: "Eucalyptus radié (Eucalyptus radiata)",
          voie: "Inhalation + diffusion",
          posologie: "Décongestion des voies respiratoires",
        },
      ],
    },
    phytotherapie: {
      titre: "Plantes antiallergiques",
      plantes: [
        {
          nom: "Plantain lancéolé (Plantago lanceolata)",
          forme: "Infusion ou extrait sec",
          posologie: "3 tasses/jour ou 300 mg 3×/jour",
        },
        {
          nom: "Perilla (Perilla frutescens)",
          forme: "Extrait sec riche en acide rosmarinique",
          posologie: "200 mg 2×/jour (antihistaminique naturel)",
        },
        {
          nom: "Quercétine",
          forme: "Complément alimentaire",
          posologie: "500 mg 2×/jour (stabilisant mastocytes)",
        },
      ],
    },
    precautions: [
      "Débuter traitement 4-6 semaines AVANT la saison pollinique (prévention)",
      "Quercétine peut interagir avec certains antibiotiques",
      "HE Estragon contre-indiquée en grossesse",
      "Consulter si : dyspnée, asthme sévère, surinfection",
    ],
    conseils: [
      "Consulter calendrier pollinique local (pollens.fr)",
      "Éviter sorties aux pics polliniques (5-10h et 21-23h)",
      "Lunettes de soleil en extérieur (protection oculaire)",
      "Rinçage nasal quotidien (sérum physiologique ou eau de mer)",
      "Laver cheveux le soir (éliminer pollens)",
      "Fermer fenêtres pendant journée, aérer tôt le matin",
      "Vitamine C : 1g/jour (antihistaminique naturel)",
      "Oméga-3 : 2g EPA+DHA/jour (anti-inflammatoire)",
    ],
  },

  // FICHE 9 : INFECTIONS URINAIRES (CYSTITE)
  {
    id: "9",
    slug: "infections-urinaires-cystite",
    titre: "Infections urinaires (cystite)",
    categorie: "urinaire",
    symptomes: [
      "Brûlures mictionnelles intenses",
      "Pollakiurie (envies fréquentes d'uriner)",
      "Urines troubles, malodorantes",
      "Pesanteur pelvienne",
      "Parfois hématurie (sang dans urines)",
      "Pas de fièvre (si fièvre = pyélonéphrite)",
    ],
    endobiogenie: {
      titre: "Terrain cystite récidivante",
      terrain: "Déficit immunitaire local avec déséquilibre flore vaginale/urinaire",
      axes: [
        "Immunité locale : renforcement défenses muqueuses",
        "Équilibre œstro-progestatif : impact sur flore (femmes)",
        "pH urinaire : alcalinisation (défavorable aux bactéries)",
        "Fonction rénale : diurèse et élimination",
      ],
      approche: "Traiter l'infection aiguë naturellement (si légère). Prévenir les récidives (immunité, flore, hydratation). Identifier facteurs favorisants.",
    },
    gemmotherapie: {
      titre: "Bourgeons uro-génitaux",
      bourgeons: [
        {
          nom: "Airelle (Vaccinium vitis-idaea)",
          posologie: "50 gouttes 3×/jour",
          duree: "7 jours en phase aiguë",
        },
        {
          nom: "Bouleau (Betula pubescens)",
          posologie: "50 gouttes 3×/jour",
          duree: "Drainage rénal (diurétique)",
        },
        {
          nom: "Cassis (Ribes nigrum)",
          posologie: "50 gouttes 2×/jour",
          duree: "Anti-inflammatoire urinaire",
        },
      ],
    },
    aromatherapie: {
      titre: "HE antibactériennes urinaires",
      huilesEssentielles: [
        {
          nom: "Sarriette des montagnes (Satureja montana)",
          voie: "Voie orale",
          posologie: "2 gouttes 3×/jour sur comprimé pendant 5 jours",
        },
        {
          nom: "Origan compact (Origanum compactum)",
          voie: "Voie orale",
          posologie: "2 gouttes 3×/jour (antibactérien puissant)",
        },
        {
          nom: "Tea tree (Melaleuca alternifolia)",
          voie: "Voie orale",
          posologie: "2 gouttes 3×/jour",
        },
      ],
    },
    phytotherapie: {
      titre: "Plantes antiseptiques urinaires",
      plantes: [
        {
          nom: "Canneberge (Vaccinium macrocarpon)",
          forme: "Jus pur ou extrait sec (36 mg PAC)",
          posologie: "500 ml jus/jour ou 1 gélule 2×/jour (prévention)",
        },
        {
          nom: "Bruyère (Calluna vulgaris)",
          forme: "Infusion",
          posologie: "3-4 tasses/jour (antiseptique + diurétique)",
        },
        {
          nom: "Busserole (Arctostaphylos uva-ursi)",
          forme: "Infusion ou extrait",
          posologie: "3 tasses/jour max 7 jours (arbutine antibactérienne)",
        },
      ],
    },
    precautions: [
      "Busserole : max 7 jours, contre-indiquée grossesse/allaitement",
      "HE dermocaustiques (Sarriette, Origan) : NE PAS utiliser pures",
      "⚠️ Consulter RAPIDEMENT si : fièvre, douleurs lombaires, vomissements (risque pyélonéphrite)",
      "Femmes enceintes : avis médical obligatoire",
      "ECBU si récidives fréquentes (>3/an)",
    ],
    conseils: [
      "Hydratation massive : 2-3 litres/jour (diluer urines)",
      "Uriner fréquemment (ne pas se retenir)",
      "Miction après rapports sexuels (éliminer bactéries)",
      "Toilette intime : d'avant en arrière (femmes)",
      "Éviter : sous-vêtements synthétiques, douches vaginales",
      "Alcaliniser urines : bicarbonate de sodium (1 c.à.c. dans eau 2×/jour)",
      "Probiotiques vaginaux : Lactobacillus crispatus (prévention récidives)",
      "D-Mannose : 2g/jour en prévention (anti-adhésion E.coli)",
    ],
  },

  // FICHE 10 : FATIGUE CHRONIQUE
  {
    id: "10",
    slug: "fatigue-chronique",
    titre: "Fatigue chronique / Asthénie",
    categorie: "nerveux",
    symptomes: [
      "Fatigue persistante >6 mois",
      "Non améliorée par le repos",
      "Diminution >50% activités habituelles",
      "Troubles cognitifs (concentration, mémoire)",
      "Douleurs musculaires, articulaires",
      "Sommeil non réparateur",
      "Malaise post-effort (>24h)",
    ],
    endobiogenie: {
      titre: "Profil d'épuisement neuroendocrinien",
      terrain: "Insuffisance surrénalienne fonctionnelle avec dysrégulation HPA",
      axes: [
        "Axe hypothalamo-hypophyso-surrénalien : restauration capacité adaptative",
        "Fonction thyroïdienne : métabolisme énergétique (T3, T4)",
        "Mitochondries : production ATP (bioénergétique cellulaire)",
        "Système nerveux : équilibre neurotransmetteurs (sérotonine, dopamine)",
        "Inflammation de bas grade : cytokines pro-inflammatoires",
      ],
      approche: "Restauration progressive des réserves énergétiques. Soutien adaptatif (surrénales). Optimisation mitochondriale. Gestion inflammation silencieuse.",
    },
    gemmotherapie: {
      titre: "Bourgeons revitalisants",
      bourgeons: [
        {
          nom: "Cassis (Ribes nigrum)",
          posologie: "50 gouttes le matin",
          duree: "Cure de 3 mois (soutien surrénalien)",
        },
        {
          nom: "Séquoia (Sequoiadendron giganteum)",
          posologie: "50 gouttes le matin",
          duree: "Tonique général, axe gonadique",
        },
        {
          nom: "Chêne (Quercus robur)",
          posologie: "50 gouttes matin et midi",
          duree: "Revitalisant profond",
        },
      ],
    },
    aromatherapie: {
      titre: "HE toniques et adaptogènes",
      huilesEssentielles: [
        {
          nom: "Épinette noire (Picea mariana)",
          voie: "Voie cutanée",
          posologie: "2 gouttes diluées en massage bas du dos (surrénales) matin",
        },
        {
          nom: "Pin sylvestre (Pinus sylvestris)",
          voie: "Voie cutanée + inhalation",
          posologie: "Tonique général, stimulant cortisol-like",
        },
        {
          nom: "Menthe poivrée (Mentha x piperita)",
          voie: "Olfaction",
          posologie: "Inhalation sèche en coup de fatigue",
        },
      ],
    },
    phytotherapie: {
      titre: "Plantes adaptogènes",
      plantes: [
        {
          nom: "Rhodiole (Rhodiola rosea)",
          forme: "Extrait sec standardisé (3% rosavines)",
          posologie: "200-400 mg le matin pendant 8-12 semaines",
        },
        {
          nom: "Ginseng (Panax ginseng)",
          forme: "Extrait standardisé",
          posologie: "200 mg/jour en cure de 3 mois (pause 1 mois)",
        },
        {
          nom: "Éleuthérocoque (Eleutherococcus senticosus)",
          forme: "Extrait sec",
          posologie: "300 mg 2×/jour",
        },
        {
          nom: "Coenzyme Q10",
          forme: "Complément ubiquinol",
          posologie: "100-200 mg/jour (soutien mitochondrial)",
        },
      ],
    },
    precautions: [
      "⚠️ ÉLIMINER causes organiques : anémie, hypothyroïdie, diabète, apnées du sommeil",
      "Ginseng contre-indiqué en HTA, troubles bipolaires",
      "Rhodiole : éviter le soir (effet stimulant)",
      "Consultation médicale OBLIGATOIRE pour diagnostic différentiel",
      "Bilan sanguin : NFS, TSH, ferritine, vitamine D, B12",
    ],
    conseils: [
      "Gestion énergétique : pacing (activité progressive sans épuisement)",
      "Sommeil : régularité, 8-9h/nuit, sieste courte (20 min) si besoin",
      "Nutrition anti-inflammatoire : Méditerranéenne, oméga-3, antioxydants",
      "Suppléments : Magnésium 300 mg, Vitamine D 2000-4000 UI, B-complex",
      "Activité physique TRÈS progressive (risque malaise post-effort)",
      "Hydratation : 2L/jour minimum",
      "Gestion du stress : yoga doux, méditation, cohérence cardiaque",
      "Mitochondrial support : CoQ10, L-carnitine, acide alpha-lipoïque",
      "Éviter : alcool, excès sucre raffiné, caféine excessive",
    ],
  },
];

export function getFicheBySlug(slug: string): FicheMaladie | undefined {
  return fichesMaladies.find((fiche) => fiche.slug === slug);
}

export function getFichesByCategorie(categorie: string): FicheMaladie[] {
  return fichesMaladies.filter((fiche) => fiche.categorie === categorie);
}
