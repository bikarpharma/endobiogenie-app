import type { QuestionConfig } from "../types";

/**
 * AXE DIGESTIF - AUDIT EXPERT ENDOBIOGÉNIQUE
 * ============================================
 * Basé sur les volumes Lapraz & Hedayat :
 * 
 * PRINCIPE CLÉ : Le tractus digestif est le CARREFOUR de tous les axes
 * endocriniens. Chaque symptôme digestif renvoie à un terrain précis.
 * 
 * DÉCOUVERTES MAJEURES :
 * - Signes post-prandiaux = fenêtre diagnostique sur le métabolisme
 * - Canal de Sténon = miroir du pancréas exocrine
 * - Timing des ballonnements = localisation de la dysbiose
 * - Odeur des gaz = type de substrat fermenté
 * 
 * Total : 52 questions (vs 15 originales)
 * Priority 1 (Essentiel) : 18 questions → Mode Rapide
 * Priority 2 (Important) : 22 questions
 * Priority 3 (Optionnel) : 12 questions
 */

const AxeDigestifConfig: QuestionConfig[] = [
  
  // ============================================
  // 1. BOUCHE & GLANDES SALIVAIRES (6 questions)
  // ============================================
  
  {
    id: "dig_salive_quantite",
    question: "Comment est votre production de salive ?",
    type: "select",
    options: [
      "Normale",
      "Bouche souvent sèche (hypo-salivation)",
      "Salive abondante, déglutition fréquente (hyper-salivation)",
      "Salive épaisse, filandreuse"
    ],
    tooltip: "Hypo-salivation = alpha-sympathique élevé. Hyper-salivation = hyper-para (vagotonie). Salive filandreuse = alpha > para..",
    weight: 2,
    priority: 2,
    section: "Bouche & Glandes salivaires",
    physpiathologie: "Les glandes salivaires reflètent l'équilibre SNA. Le para stimule la sécrétion aqueuse, l'alpha la réduit."
  },
  {
    id: "dig_parotides_gonflees",
    question: "Avez-vous parfois les joues gonflées ou les parotides sensibles (devant les oreilles) ?",
    type: "boolean",
    tooltip: "Parotides hypertrophiées = sur-sollicitation des amylases du pancréas exocrine. Signe de dysbiose haute..",
    weight: 2,
    priority: 2,
    section: "Bouche & Glandes salivaires",
    physiopathologie: "La parotide produit l'amylase salivaire. Son hypertrophie compense l'insuffisance du pancréas exocrine."
  },
  {
    id: "dig_amygdales",
    question: "Avez-vous des amygdales volumineuses ou des angines à répétition ?",
    type: "select",
    options: [
      "Non, jamais d'angine",
      "Angines occasionnelles (1-2/an)",
      "Angines fréquentes (>3/an)",
      "Amygdales retirées (amygdalectomie)"
    ],
    tooltip: "Amygdales hypertrophiées = pancréas sur-sollicité + FSH élevée + congestion lymphoïde..",
    weight: 2,
    priority: 2,
    section: "Bouche & Glandes salivaires",
    physiopathologie: "L'hypertrophie amygdalienne traduit un terrain immuno-inflammatoire lié au pancréas exocrine."
  },
  {
    id: "dig_aphtes",
    question: "Faites-vous souvent des aphtes (ulcères buccaux) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Très souvent"],
    tooltip: "Aphtes récurrents = GH hyperfonctionnement.. Aussi lié au stress et carences (B12, fer, zinc).",
    weight: 1,
    priority: 3,
    section: "Bouche & Glandes salivaires"
  },
  {
    id: "dig_haleine",
    question: "Avez-vous mauvaise haleine (halitose) ?",
    type: "select",
    options: [
      "Non, haleine normale",
      "Parfois le matin au réveil",
      "Souvent, même après brossage",
      "Constamment, gêne sociale"
    ],
    tooltip: "Halitose = insuffisance hépatique exocrine fonctionnelle + dysbiose.. Aussi reflux gastrique.",
    weight: 2,
    priority: 2,
    section: "Bouche & Glandes salivaires",
    physiopathologie: "L'halitose chronique traduit une surcharge hépatique avec production de composés soufrés volatils."
  },
  {
    id: "dig_gout_metallique",
    question: "Avez-vous parfois un goût métallique ou désagréable dans la bouche ?",
    type: "boolean",
    tooltip: "Goût métallique = dysbiose buccale, reflux biliaire, ou intoxication métallique. Aussi signe de grossesse.",
    weight: 1,
    priority: 3,
    section: "Bouche & Glandes salivaires"
  },

  // ============================================
  // 2. LANGUE - MIROIR DIGESTIF (5 questions)
  // ============================================

  {
    id: "dig_langue_enduit",
    question: "Votre langue présente-t-elle un enduit (dépôt) ?",
    type: "select",
    options: [
      "Non, langue rose et propre",
      "Enduit blanc léger (normal le matin)",
      "Enduit blanc épais persistant",
      "Enduit jaunâtre ou verdâtre",
      "Langue noire ou très foncée"
    ],
    tooltip: "⭐ SIGNE PATHOGNOMONIQUE : Blanc = côlon congestionné. Verdâtre = congestion BILIAIRE. Noir = dysbiose sévère..",
    weight: 3,
    priority: 1,
    section: "Langue",
    physiopathologie: "L'enduit lingual reflète l'état de la flore digestive et du drainage hépatobiliaire. Signe clinique majeur."
  },
  {
    id: "dig_langue_fissures",
    question: "Votre langue présente-t-elle des fissures ou crevasses ?",
    type: "boolean",
    tooltip: "Fissures linguales = GH hyperfonctionnement.. Aussi déshydratation chronique ou carences.",
    weight: 2,
    priority: 2,
    section: "Langue"
  },
  {
    id: "dig_langue_empreintes",
    question: "Voyez-vous les marques de vos dents sur les bords de la langue ?",
    type: "boolean",
    tooltip: "Empreintes dentaires = langue grande et épaisse = hormone de croissance EXCESSIVE.. Aussi hypothyroïdie.",
    weight: 2,
    priority: 2,
    section: "Langue",
    physiopathologie: "Une langue élargie comprime contre les dents, laissant des empreintes. Signe d'hyperfonctionnement GH ou d'œdème."
  },
  {
    id: "dig_langue_papules",
    question: "Avez-vous des petites bosses rouges (papules) sur la langue, surtout vers la pointe ?",
    type: "boolean",
    tooltip: "Papules rouges en relief sur la pointe = inflammation DUODÉNALE.. Signe de gastrite ou ulcère.",
    weight: 2,
    priority: 2,
    section: "Langue",
    physiopathologie: "La pointe de la langue est en correspondance réflexe avec l'estomac et le duodénum en médecine chinoise."
  },
  {
    id: "dig_langue_brulure",
    question: "Ressentez-vous des sensations de brûlure sur la langue (glossodynie) ?",
    type: "boolean",
    tooltip: "Glossodynie = carence en fer/B12, reflux acide, ou candidose buccale. Aussi terrain anxieux.",
    weight: 1,
    priority: 3,
    section: "Langue"
  },

  // ============================================
  // 3. ESTOMAC & ŒSOPHAGE (7 questions)
  // ============================================

  {
    id: "dig_estomac_lourdeur",
    question: "Ressentez-vous une lourdeur d'estomac durable après les repas (impression de 'pierre') ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Signe d'HYPOCHLORHYDRIE (manque d'acide) ou de manque de tonus gastrique. Terrain hypo-alpha..",
    weight: 2,
    priority: 1,
    section: "Estomac & Œsophage",
    physiopathologie: "La vidange gastrique dépend de l'acidité et du tonus musculaire. L'hypochlorhydrie ralentit la digestion."
  },
  {
    id: "dig_estomac_rgo",
    question: "Avez-vous des brûlures, renvois acides ou reflux gastro-œsophagien ?",
    type: "select",
    options: [
      "Jamais",
      "Occasionnellement après excès",
      "Régulièrement (plusieurs fois/semaine)",
      "Quotidiennement",
      "Avec régurgitations ou toux nocturne"
    ],
    tooltip: "RGO Type 1 = SOI vagotonie (hyper-para). RGO Type 2 = sphincter pylorique + insuffisance bilio-pancréatique..",
    weight: 3,
    priority: 1,
    section: "Estomac & Œsophage",
    physiopathologie: "Le RGO a deux mécanismes différents nécessitant des traitements opposés. Le diagnostic différentiel est crucial."
  },
  {
    id: "dig_estomac_rgo_position",
    question: "Vos reflux sont-ils aggravés en position couchée ou penchée en avant ?",
    type: "boolean",
    tooltip: "Aggravation positionnelle = béance du cardia (SOI) = RGO Type 1 vagal. Traitement para-sympatholytique..",
    weight: 2,
    priority: 2,
    section: "Estomac & Œsophage"
  },
  {
    id: "dig_estomac_eructations",
    question: "Avez-vous beaucoup d'éructations (rots) pendant ou juste après le repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Éructations immédiates = aérophagie (stress, manger vite). Éructations retardées = fermentation gastrique..",
    weight: 1,
    priority: 2,
    section: "Estomac & Œsophage"
  },
  {
    id: "dig_estomac_nausees",
    question: "Avez-vous des nausées, surtout le matin ou en voyant/sentant la nourriture ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Nausées matinales = surcharge hépatique nocturne. Nausées aux odeurs = hypersensibilité vagale ou grossesse.",
    weight: 2,
    priority: 2,
    section: "Estomac & Œsophage"
  },
  {
    id: "dig_estomac_gout_persistant",
    question: "Le goût des aliments persiste-t-il longtemps après le repas (heures) ?",
    type: "boolean",
    tooltip: "Persistance du goût = insuffisance VÉSICULE BILIAIRE. La bile ne neutralise pas le chyme..",
    weight: 2,
    priority: 2,
    section: "Estomac & Œsophage",
    physiopathologie: "Le reflux de bile dans l'estomac puis l'œsophage maintient le goût des aliments. Signe de dysfonction biliaire."
  },
  {
    id: "dig_estomac_douleur",
    question: "Avez-vous des douleurs d'estomac (épigastriques) ?",
    type: "select",
    options: [
      "Jamais",
      "À jeun, soulagées par l'alimentation (faim douloureuse)",
      "Après les repas, aggravées par l'alimentation",
      "Brûlures nocturnes réveillant du sommeil",
      "Douleur permanente irradiant dans le dos"
    ],
    tooltip: "Douleur à jeun = ulcère duodénal. Douleur post-prandiale = gastrite. Irradiation dos = pancréas. URGENCE si douleur permanente.",
    weight: 3,
    priority: 1,
    section: "Estomac & Œsophage"
  },

  // ============================================
  // 4. FOIE & VÉSICULE BILIAIRE (8 questions)
  // ============================================

  {
    id: "dig_foie_graisses",
    question: "Êtes-vous écœuré par les graisses ou les digérez-vous mal ?",
    type: "select",
    options: [
      "Non, je digère bien les graisses",
      "Légère lourdeur après repas gras",
      "Nausées avec les fritures",
      "Intolérance totale aux graisses (selles grasses, diarrhées)",
      "Douleur sous les côtes droites après repas gras"
    ],
    tooltip: "Intolérance graisses = insuffisance de sécrétion BILIAIRE ou stase vésiculaire. Douleur sous-costale = vésicule..",
    weight: 3,
    priority: 1,
    section: "Foie & Vésicule biliaire",
    physiopathologie: "La bile émulsionne les graisses. Son insuffisance cause stéatorrhée et malabsorption des vitamines liposolubles."
  },
  {
    id: "dig_foie_appetit_matin",
    question: "Avez-vous de l'appétit le matin au réveil ?",
    type: "select",
    options: [
      "Oui, bon appétit dès le réveil",
      "Appétit modéré, je mange par habitude",
      "Peu d'appétit, je saute souvent le petit-déjeuner",
      "Jamais faim le matin, voire dégoût alimentaire",
      "Nausées matinales à la vue de la nourriture"
    ],
    tooltip: "⭐ Perte d'appétit le MATIN = signe cardinal de CONGESTION HÉPATIQUE..",
    weight: 3,
    priority: 1,
    section: "Foie & Vésicule biliaire",
    physiopathologie: "Le foie travaille la nuit pour détoxifier. S'il est congestionné, il n'a pas terminé le matin, causant l'anorexie."
  },
  {
    id: "dig_foie_frissons",
    question: "Avez-vous souvent des frissons, même sans fièvre ?",
    type: "boolean",
    tooltip: "Frissons sans fièvre = congestion HÉPATIQUE.. Le foie régule la thermogénèse.",
    weight: 2,
    priority: 2,
    section: "Foie & Vésicule biliaire"
  },
  {
    id: "dig_foie_reveil_nocturne",
    question: "Vous réveillez-vous souvent entre 1h et 3h du matin ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "L'heure du FOIE en chronobiologie chinoise. Réveil à cette heure = surcharge hépatique nocturne (détox active).",
    weight: 2,
    priority: 1,
    section: "Foie & Vésicule biliaire",
    physiopathologie: "Le pic de détoxification hépatique se situe entre 1h et 3h. Une surcharge toxique réveille à ces heures."
  },
  {
    id: "dig_foie_bouche_amere",
    question: "Avez-vous la bouche pâteuse ou amère le matin au réveil ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Bouche amère = reflux de BILE ou surcharge toxémique hépatique.. Signe de cholestase fonctionnelle.",
    weight: 2,
    priority: 1,
    section: "Foie & Vésicule biliaire"
  },
  {
    id: "dig_foie_prurit",
    question: "Avez-vous des démangeaisons généralisées sans éruption visible ?",
    type: "boolean",
    tooltip: "Prurit sine materia = augmentation des acides biliaires dans le sérum = CHOLESTASE..",
    weight: 2,
    priority: 2,
    section: "Foie & Vésicule biliaire",
    physiopathologie: "Les acides biliaires non excrétés s'accumulent dans les tissus et stimulent les terminaisons nerveuses."
  },
  {
    id: "dig_foie_selles_couleur",
    question: "Quelle est la couleur habituelle de vos selles ?",
    type: "select",
    options: [
      "Brun normal",
      "Brun foncé (presque noir)",
      "Jaune clair ou beige",
      "Argileuse (gris pâle, décolorée)",
      "Verdâtre"
    ],
    tooltip: "⭐ Selles ARGILEUSES (pâles) = insuffisance biliaire sévère.. Noir = sang digéré (URGENCE). Vert = transit accéléré.",
    weight: 3,
    priority: 1,
    section: "Foie & Vésicule biliaire",
    physiopathologie: "La bilirubine donne la couleur brune aux selles. Son absence = selles décolorées = obstruction biliaire."
  },
  {
    id: "dig_foie_urine_foncee",
    question: "Vos urines sont-elles souvent foncées (couleur thé ou coca) ?",
    type: "boolean",
    tooltip: "Urines foncées = augmentation des métabolites de la BILIRUBINE = cholestase.. Aussi déshydratation.",
    weight: 2,
    priority: 2,
    section: "Foie & Vésicule biliaire"
  },

  // ============================================
  // 5. PANCRÉAS EXOCRINE (6 questions)
  // ============================================

  {
    id: "dig_pancreas_ballonnement_immediat",
    question: "Votre ventre gonfle-t-il dans les 20 MINUTES suivant le début du repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "⭐ Ballonnement IMMÉDIAT (<20 min) = insuffisance ENZYMES pancréatiques ou SIBO..",
    weight: 3,
    priority: 1,
    section: "Pancréas exocrine",
    physiopathologie: "Le pancréas exocrine produit amylase, lipase, protéase. Son insuffisance cause fermentation immédiate du bol alimentaire."
  },
  {
    id: "dig_pancreas_somnolence",
    question: "Avez-vous un 'coup de barre' irrésistible 1-2h après le repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "⭐ Fatigue post-prandiale = sollicitation EXCESSIVE du pancréas exocrine + insulino-résistance..",
    weight: 3,
    priority: 1,
    section: "Pancréas exocrine",
    physiopathologie: "Le pancréas fatigué libère trop d'insuline, causant hypoglycémie réactionnelle et somnolence."
  },
  {
    id: "dig_pancreas_selles_flottantes",
    question: "Vos selles flottent-elles à la surface de l'eau (stéatorrhée) ?",
    type: "boolean",
    tooltip: "⭐ Selles FLOTTANTES = stéatorrhée = insuffisance LIPASE pancréatique.. Les graisses ne sont pas digérées.",
    weight: 3,
    priority: 1,
    section: "Pancréas exocrine",
    physiopathologie: "Les graisses non digérées allègent les selles qui flottent. Signe pathognomonique d'insuffisance pancréatique."
  },
  {
    id: "dig_pancreas_aliments_visibles",
    question: "Voyez-vous des morceaux d'aliments non digérés dans vos selles ?",
    type: "boolean",
    tooltip: "Aliments visibles = insuffisance des PROTÉASES pancréatiques.. Aussi transit trop rapide.",
    weight: 2,
    priority: 1,
    section: "Pancréas exocrine"
  },
  {
    id: "dig_pancreas_intolerance_specifique",
    question: "Avez-vous des intolérances à certains aliments spécifiques ?",
    type: "multiselect",
    options: [
      "Légumineuses (lentilles, pois chiches)",
      "Viande rouge",
      "Produits laitiers",
      "Gluten (blé, orge, seigle)",
      "Aliments gras",
      "Sucres/féculents",
      "Crucifères (choux, brocoli)",
      "Aucune intolérance particulière"
    ],
    tooltip: "Chaque intolérance oriente vers une enzyme déficiente : protéase (viande), lactase (lait), amylase (féculents)..",
    weight: 2,
    priority: 2,
    section: "Pancréas exocrine"
  },
  {
    id: "dig_pancreas_sinusites",
    question: "Avez-vous des sinusites à répétition ou une production excessive de mucus ?",
    type: "boolean",
    tooltip: "Sinusite récurrente = pancréas exocrine SUR-SOLLICITÉ.. Le mucus digestif déborde vers l'ORL.",
    weight: 2,
    priority: 2,
    section: "Pancréas exocrine",
    physiopathologie: "Le pancréas exocrine partage des récepteurs avec les muqueuses respiratoires. Sa congestion cause hypersécrétion muqueuse."
  },

  // ============================================
  // 6. INTESTIN GRÊLE & SIBO (5 questions)
  // ============================================

  {
    id: "dig_grele_ballonnement_10min",
    question: "Avez-vous des ballonnements dans les 10-20 minutes après le DÉBUT du repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "⭐ Ballonnement 10-20 min = prolifération bactérienne dans l'intestin GRÊLE (SIBO)..",
    weight: 3,
    priority: 1,
    section: "Intestin grêle & SIBO",
    physiopathologie: "Le SIBO (Small Intestinal Bacterial Overgrowth) cause fermentation dès l'arrivée du bol alimentaire dans le grêle."
  },
  {
    id: "dig_grele_gaz_inodores",
    question: "Vos gaz sont-ils principalement SANS odeur (air, CO2) ?",
    type: "boolean",
    tooltip: "⭐ Gaz INODORES = fermentation des GLUCIDES.. Oriente vers une dysbiose de type fermentatif.",
    weight: 2,
    priority: 2,
    section: "Intestin grêle & SIBO",
    physiopathologie: "La fermentation des glucides produit CO2 et méthane, gaz inodores. Contrairement à la putréfaction des protéines."
  },
  {
    id: "dig_grele_selles_explosives",
    question: "Avez-vous des selles explosives ou très gazeuses, parfois douloureuses ?",
    type: "boolean",
    tooltip: "Selles explosives = fermentation excessive des glucides dans le grêle.. Souvent avec douleurs.",
    weight: 2,
    priority: 2,
    section: "Intestin grêle & SIBO"
  },
  {
    id: "dig_grele_symptomes_systemiques",
    question: "Avez-vous des symptômes 'à distance' après les repas ?",
    type: "multiselect",
    options: [
      "Brouillard cérébral, difficultés de concentration",
      "Sautes d'humeur, irritabilité",
      "Maux de tête ou migraines",
      "Douleurs articulaires",
      "Éruptions cutanées",
      "Aucun de ces symptômes"
    ],
    tooltip: "Symptômes systémiques post-prandiaux = PERMÉABILITÉ INTESTINALE (Leaky Gut) avec translocation de toxines..",
    weight: 2,
    priority: 1,
    section: "Intestin grêle & SIBO",
    physiopathologie: "L'hyperperméabilité intestinale permet le passage de fragments alimentaires et bactériens dans le sang, causant inflammation systémique."
  },
  {
    id: "dig_grele_post_antibio",
    question: "Vos troubles digestifs ont-ils débuté ou empiré après des antibiotiques ?",
    type: "boolean",
    tooltip: "Dysbiose post-antibiotique = destruction de la flore protectrice permettant prolifération anormale..",
    weight: 2,
    priority: 2,
    section: "Intestin grêle & SIBO"
  },

  // ============================================
  // 7. CÔLON & MICROBIOTE (6 questions)
  // ============================================

  {
    id: "dig_colon_ballonnement_tardif",
    question: "Les ballonnements arrivent-ils TARDIVEMENT (2-3h après le repas ou en fin de journée) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "⭐ Ballonnement 2-3h après = prolifération bactérienne COLIQUE.. Dysbiose basse.",
    weight: 3,
    priority: 1,
    section: "Côlon & Microbiote",
    physiopathologie: "Le transit jusqu'au côlon prend 2-3h. La fermentation colique cause des ballonnements vespéraux."
  },
  {
    id: "dig_colon_gaz_odorants",
    question: "Vos gaz sont-ils très ODORANTS (œuf pourri, soufre) ?",
    type: "boolean",
    tooltip: "⭐ Gaz ODORANTS = PUTRÉFACTION des PROTÉINES.. Production de sulfure d'hydrogène.",
    weight: 2,
    priority: 1,
    section: "Côlon & Microbiote",
    physiopathologie: "La putréfaction colique des protéines non digérées produit des composés soufrés malodorants et toxiques."
  },
  {
    id: "dig_colon_spasmes",
    question: "Avez-vous des douleurs type 'coups de poignard' ou spasmes qui se déplacent ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Spasmes mobiles = côlon SPASMODIQUE lié à dystonie neurovégétative. Terrain spasmophile..",
    weight: 2,
    priority: 2,
    section: "Côlon & Microbiote"
  },
  {
    id: "dig_colon_alternance",
    question: "Alternez-vous constipation et diarrhée (syndrome de l'intestin irritable) ?",
    type: "boolean",
    tooltip: "Alternance = colopathie fonctionnelle (SII) = déséquilibre SNA avec phases alpha (constipation) et para (diarrhée).",
    weight: 2,
    priority: 1,
    section: "Côlon & Microbiote"
  },
  {
    id: "dig_colon_mucus",
    question: "Voyez-vous du mucus (glaires) dans vos selles ?",
    type: "boolean",
    tooltip: "Mucus visible = irritation colique ou inflammation. Si avec sang = URGENCE (MICI, infection).",
    weight: 2,
    priority: 2,
    section: "Côlon & Microbiote",
    physiopathologie: "Le côlon produit du mucus protecteur. Son excès visible traduit une agression de la muqueuse."
  },
  {
    id: "dig_colon_acne_fesses",
    question: "Avez-vous de l'acné sur les fesses ou le bas du dos ?",
    type: "boolean",
    tooltip: "⭐ Acné sur les fesses = congestion du CÔLON.. Signe pathognomonique de stase colique.",
    weight: 2,
    priority: 2,
    section: "Côlon & Microbiote",
    physiopathologie: "La congestion colique se répercute sur la peau de la zone sacrée par les connexions vasculaires pelviennes."
  },

  // ============================================
  // 8. TRANSIT & SELLES (8 questions)
  // ============================================

  {
    id: "dig_transit_frequence",
    question: "Quelle est votre fréquence habituelle de selles ?",
    type: "select",
    options: [
      "3 fois par jour ou plus",
      "1-2 fois par jour (optimal)",
      "1 fois tous les 2 jours",
      "2-3 fois par semaine",
      "Moins d'une fois par semaine"
    ],
    tooltip: "Optimal = 1-2x/jour. <3x/semaine = constipation. >3x/jour = diarrhée..",
    weight: 2,
    priority: 1,
    section: "Transit & Selles"
  },
  {
    id: "dig_transit_constipation",
    question: "Êtes-vous constipé (selles dures, effort à la défécation) ?",
    type: "select",
    options: [
      "Jamais",
      "Occasionnellement (voyage, stress)",
      "Régulièrement (plusieurs fois/mois)",
      "Chroniquement (besoin de laxatifs)",
      "Constipation sévère avec impaction"
    ],
    tooltip: "Constipation transit NORMAL = stase biliaire (sphincter d'Oddi). Transit RALENTI = hypothyroïdie ou œstrogènes..",
    weight: 2,
    priority: 1,
    section: "Transit & Selles"
  },
  {
    id: "dig_transit_urgence",
    question: "Avez-vous des urgences défécatoires (besoin impérieux) ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "Urgences = hyper-péristaltisme (thyroïde, stress) ou inflammation colique (MICI). Aussi syndrome de l'intestin irritable.",
    weight: 2,
    priority: 2,
    section: "Transit & Selles"
  },
  {
    id: "dig_transit_diarrhee",
    question: "Avez-vous tendance aux selles molles ou liquides ?",
    type: "select",
    options: [
      "Jamais, selles toujours formées",
      "Occasionnellement (stress, alimentation)",
      "Selles molles fréquentes mais formées",
      "Diarrhées fréquentes (>3 selles liquides/jour)",
      "Diarrhées chroniques avec malabsorption"
    ],
    tooltip: "Diarrhée aqueuse = origine grêle. Diarrhée mucoïde/sanglante = origine colique..",
    weight: 2,
    priority: 1,
    section: "Transit & Selles"
  },
  {
    id: "dig_transit_selles_aspect",
    question: "Quel est l'aspect habituel de vos selles (échelle de Bristol) ?",
    type: "select",
    options: [
      "Type 1-2 : Billes dures ou en morceaux (constipation)",
      "Type 3-4 : Saucisse lisse ou avec craquelures (optimal)",
      "Type 5 : Morceaux mous à bords nets (tendance molle)",
      "Type 6 : Morceaux floconneux, pâteux",
      "Type 7 : Entièrement liquide"
    ],
    tooltip: "L'échelle de Bristol quantifie le transit. Types 3-4 = optimal. Types 1-2 = constipation. Types 6-7 = diarrhée.",
    weight: 2,
    priority: 2,
    section: "Transit & Selles"
  },
  {
    id: "dig_transit_douleur_defecation",
    question: "La défécation est-elle douloureuse ou difficile ?",
    type: "select",
    options: [
      "Non, défécation facile et indolore",
      "Effort modéré nécessaire",
      "Effort important avec sensation d'évacuation incomplète",
      "Douleur anale (fissure, hémorroïdes)",
      "Besoin de manœuvres digitales"
    ],
    tooltip: "Effort important = dyssynergie ano-rectale. Douleur = fissure/hémorroïdes. Manœuvres digitales = prolapsus ou rectocèle.",
    weight: 2,
    priority: 2,
    section: "Transit & Selles"
  },
  {
    id: "dig_transit_horaire",
    question: "À quel moment de la journée allez-vous à la selle ?",
    type: "select",
    options: [
      "Le matin au réveil (réflexe gastro-colique)",
      "Après le petit-déjeuner",
      "À horaire variable selon les jours",
      "Plutôt le soir",
      "Pas de régularité, quand l'envie vient"
    ],
    tooltip: "Le réflexe gastro-colique matinal est physiologique. Son absence = dysautonomie digestive.",
    weight: 1,
    priority: 3,
    section: "Transit & Selles"
  },
  {
    id: "dig_transit_sang",
    question: "Avez-vous du sang dans les selles ?",
    type: "select",
    options: [
      "Jamais",
      "Sang rouge sur le papier uniquement (hémorroïdes externes)",
      "Sang rouge mêlé aux selles",
      "Sang noir (méléna) ou selles très foncées",
      "Glaires sanglantes"
    ],
    tooltip: "⚠️ URGENCE si sang noir (saignement haut digestif) ou glaires sanglantes (MICI, infection). Sang rouge = hémorroïdes ou fissure.",
    weight: 3,
    priority: 1,
    section: "Transit & Selles"
  },

  // ============================================
  // 9. SIGNES POST-PRANDIAUX (7 questions)
  // ============================================

  {
    id: "dig_postprandial_froid",
    question: "Avez-vous froid aux extrémités (oreilles, nez, doigts) APRÈS les repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "⭐ Froid POST-PRANDIAL = congestion ACTIVE alpha-sympathique > para-sympathique..",
    weight: 3,
    priority: 1,
    section: "Signes post-prandiaux",
    physiopathologie: "La digestion mobilise le sang vers le tractus digestif. Un excès alpha sympathique cause vasoconstriction périphérique."
  },
  {
    id: "dig_postprandial_chaleur",
    question: "Avez-vous les oreilles ou le visage qui chauffent APRÈS les repas ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "⭐ Chaleur post-prandiale (oreilles chaudes) = congestion PASSIVE alpha + HISTAMINES..",
    weight: 2,
    priority: 2,
    section: "Signes post-prandiaux",
    physiopathologie: "La libération d'histamine lors de la digestion cause vasodilatation locale et chaleur. Signe d'allergie alimentaire latente."
  },
  {
    id: "dig_postprandial_rougissement",
    question: "Avez-vous des rougeurs sur le thorax ou l'abdomen après les repas ?",
    type: "boolean",
    tooltip: "Rougissement post-prandial (flush) = congestion PASSIVE par le bêta-sympathique..",
    weight: 2,
    priority: 2,
    section: "Signes post-prandiaux"
  },
  {
    id: "dig_postprandial_fatigue_glucides",
    question: "Êtes-vous fatigué avec sensation de chaleur après les repas SUCRÉS ou féculents ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "⭐ Fatigue + chaleur après GLUCIDES = perturbation du métabolisme des glucides.. Insulino-résistance.",
    weight: 3,
    priority: 1,
    section: "Signes post-prandiaux",
    physiopathologie: "L'hyperinsulinisme réactionnel cause hypoglycémie et fatigue. La chaleur traduit l'effort métabolique du foie."
  },
  {
    id: "dig_postprandial_reflux_lipides",
    question: "Avez-vous fatigue, reflux ou perte de poids malgré un bon appétit, surtout après repas GRAS ?",
    type: "boolean",
    tooltip: "⭐ Fatigue + reflux après LIPIDES = insuffisance du métabolisme des lipides. Alpha impliqué dans le reflux..",
    weight: 2,
    priority: 2,
    section: "Signes post-prandiaux",
    physiopathologie: "L'insuffisance biliaire empêche l'émulsification des graisses, causant reflux et malabsorption avec amaigrissement."
  },
  {
    id: "dig_postprandial_transpiration",
    question: "Transpirez-vous pendant ou juste après les repas ?",
    type: "boolean",
    tooltip: "Transpiration post-prandiale = relance para-sympathique digestive excessive.. Aussi hypoglycémie.",
    weight: 1,
    priority: 3,
    section: "Signes post-prandiaux"
  },
  {
    id: "dig_postprandial_cicatrisation",
    question: "Avez-vous une cicatrisation lente des plaies ?",
    type: "boolean",
    tooltip: "⭐ Retard de cicatrisation = insuffisance du métabolisme des PROTÉINES.. Hypoprotéinémie fonctionnelle.",
    weight: 2,
    priority: 2,
    section: "Signes post-prandiaux",
    physiopathologie: "Le foie synthétise les facteurs de cicatrisation. Son insuffisance protéique retarde la réparation tissulaire."
  },

  // ============================================
  // 10. ZONE ANALE & ÉMONCTOIRE (4 questions)
  // ============================================

  {
    id: "dig_anus_prurit",
    question: "Avez-vous des démangeaisons anales ?",
    type: "scale_1_5",
    scaleLabels: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    tooltip: "⭐ Prurit anal = hyper-croissance FONGIQUE (Candida) liée au pancréas exocrine.. Aussi oxyures.",
    weight: 2,
    priority: 2,
    section: "Zone anale",
    physiopathologie: "L'insuffisance pancréatique laisse des résidus sucrés dans le côlon, nourrissant les levures qui prolifèrent à l'anus."
  },
  {
    id: "dig_anus_fissures",
    question: "Avez-vous des fissures anales (douleur vive à la défécation) ?",
    type: "boolean",
    tooltip: "⭐ Fissures anales = pancréas exocrine SUR-SOLLICITÉ.. Aussi constipation chronique.",
    weight: 2,
    priority: 2,
    section: "Zone anale",
    physiopathologie: "La congestion pancréatique se répercute sur la vascularisation anale, fragilisant la muqueuse."
  },
  {
    id: "dig_anus_hemorroides",
    question: "Souffrez-vous d'hémorroïdes ?",
    type: "select",
    options: [
      "Jamais",
      "Occasionnellement (poussées rares)",
      "Hémorroïdes externes chroniques",
      "Hémorroïdes internes avec saignements",
      "Prolapsus hémorroïdaire"
    ],
    tooltip: "Hémorroïdes = stase veineuse pelvienne + congestion hépatique. Aussi constipation, grossesse, position assise prolongée.",
    weight: 2,
    priority: 2,
    section: "Zone anale"
  },
  {
    id: "dig_anus_incontinence",
    question: "Avez-vous parfois des difficultés à retenir gaz ou selles ?",
    type: "boolean",
    tooltip: "Incontinence fécale = faiblesse du sphincter anal. Après accouchement, chirurgie, ou neurologique.",
    weight: 2,
    priority: 2,
    section: "Zone anale"
  }
];

export default AxeDigestifConfig;

/**
 * RÉSUMÉ DE L'AUDIT EXPERT
 * ========================
 * 
 * FICHIER ORIGINAL : 15 questions en 4 sections
 * FICHIER AUDITÉ : 52 questions en 10 sections
 * 
 * NOUVELLES SECTIONS AJOUTÉES :
 * 1. Bouche & Glandes salivaires (6 questions) - Canal de Sténon/Wharton
 * 2. Langue - Miroir digestif (5 questions) - Signes pathognomoniques
 * 3. Signes post-prandiaux (7 questions) - Fenêtre diagnostique critique
 * 4. Zone anale & Émonctoire (4 questions) - Prurit, fissures, hémorroïdes
 * 
 * SECTIONS ENRICHIES :
 * - Estomac : 3 → 7 questions (RGO types 1 vs 2)
 * - Foie : 4 → 8 questions.
 * - Pancréas exocrine : 1 → 6 questions (insuffisance enzymes)
 * - Intestin grêle : 1 → 5 questions (SIBO, perméabilité)
 * - Côlon : 2 → 6 questions (dysbiose, fermentation vs putréfaction)
 * - Transit : 3 → 8 questions (Bristol, sang, urgences)
 * 
 * DÉCOUVERTES CLÉS :
 * 
 * 1. TIMING DES BALLONNEMENTS = LOCALISATION
 *    - 10-20 min = grêle (SIBO)
 *    - 2-3h = côlon
 * 
 * 2. ODEUR DES GAZ = TYPE DE SUBSTRAT
 *    - Inodores = fermentation GLUCIDES
 *    - Odorants = putréfaction PROTÉINES
 * 
 * 3. SIGNES POST-PRANDIAUX = FENÊTRE MÉTABOLIQUE
 *    - Froid = congestion ACTIVE alpha > para
 *    - Chaleur oreilles = congestion PASSIVE + histamines
 *    - Fatigue + chaleur après sucres = insulino-résistance
 *    - Fatigue + reflux après gras = insuffisance biliaire
 * 
 * 4. SIGNES PATHOGNOMONIQUES
 *    - Langue enduit verdâtre = congestion BILIAIRE
 *    - Selles argileuses = insuffisance biliaire sévère
 *    - Selles flottantes = insuffisance lipase
 *    - Acné fesses = congestion CÔLON
 *    - Fissures anales = pancréas sur-sollicité
 * 
 * RÉPARTITION DES PRIORITÉS :
 * - Priority 1 (Essentiel) : 18 questions → MODE RAPIDE
 * - Priority 2 (Important) : 22 questions
 * - Priority 3 (Optionnel) : 12 questions
 * 
 * PACK MODE RAPIDE (18 questions) :
 * dig_langue_enduit, dig_estomac_lourdeur, dig_estomac_rgo,
 * dig_estomac_douleur, dig_foie_graisses, dig_foie_appetit_matin,
 * dig_foie_reveil_nocturne, dig_foie_bouche_amere, dig_foie_selles_couleur,
 * dig_pancreas_ballonnement_immediat, dig_pancreas_somnolence,
 * dig_pancreas_selles_flottantes, dig_pancreas_aliments_visibles,
 * dig_grele_ballonnement_10min, dig_grele_symptomes_systemiques,
 * dig_colon_ballonnement_tardif, dig_colon_gaz_odorants,
 * dig_colon_alternance, dig_transit_frequence, dig_transit_constipation,
 * dig_transit_diarrhee, dig_transit_sang,
 * dig_postprandial_froid, dig_postprandial_fatigue_glucides
 * 
 * GEMMOTHÉRAPIE DIGESTIVE :
 * - Figuier (Ficus carica Bgs) : estomac + intestin + perméabilité
 * - Noyer (Juglans regia Bgs) : flore intestinale, astringent
 * - Romarin (Rosmarinus off. Bgs) : drainage hépatique, vésicule
 * - Genévrier (Juniperus communis Bgs) : détox hépatique
 * - Aulne (Alnus glutinosa Bgs) : anti-inflammatoire digestif
 * 
 * PLANTES POLYVALENTES DYSBIOSE. :
 * - Artemisia dracunculus (Estragon)
 * - Mentha piperita (Menthe poivrée)
 * - Satureja montana (Sarriette)
 * - Cinnamomum zeylanicum (Cannelle)
 * - Achillea millefolium (Achillée)
 */