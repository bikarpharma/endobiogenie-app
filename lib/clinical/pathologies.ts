/**
 * Liste des pathologies courantes pour autocomplete
 * Organisé par catégories médicales
 * Basé sur CIM-10 simplifié pour usage clinique
 */

export interface PathologieItem {
  id: string;
  label: string;
  category: string;
  synonyms?: string[];
}

export const PATHOLOGIE_CATEGORIES = [
  { id: "endocrine", label: "Endocrinologie / Métabolisme", color: "#8b5cf6" },
  { id: "cardio", label: "Cardiologie", color: "#ef4444" },
  { id: "digestif", label: "Gastro-entérologie", color: "#f59e0b" },
  { id: "pneumo", label: "Pneumologie", color: "#06b6d4" },
  { id: "neuro", label: "Neurologie", color: "#6366f1" },
  { id: "rhumato", label: "Rhumatologie", color: "#84cc16" },
  { id: "dermato", label: "Dermatologie", color: "#ec4899" },
  { id: "uro", label: "Urologie / Néphrologie", color: "#14b8a6" },
  { id: "gyneco", label: "Gynécologie", color: "#f472b6" },
  { id: "psy", label: "Psychiatrie", color: "#a855f7" },
  { id: "immuno", label: "Immunologie / Allergologie", color: "#22c55e" },
  { id: "hemato", label: "Hématologie", color: "#dc2626" },
  { id: "infectio", label: "Infectiologie", color: "#eab308" },
  { id: "ophtalmo", label: "Ophtalmologie", color: "#0ea5e9" },
  { id: "orl", label: "ORL", color: "#78716c" },
];

export const PATHOLOGIES: PathologieItem[] = [
  // ==========================================
  // ENDOCRINOLOGIE / MÉTABOLISME
  // ==========================================
  { id: "diabete_type1", label: "Diabète de type 1", category: "endocrine", synonyms: ["DT1", "diabète insulino-dépendant", "DID"] },
  { id: "diabete_type2", label: "Diabète de type 2", category: "endocrine", synonyms: ["DT2", "diabète non insulino-dépendant", "DNID"] },
  { id: "prediabete", label: "Pré-diabète", category: "endocrine", synonyms: ["intolérance au glucose", "hyperglycémie modérée"] },
  { id: "hypothyroidie", label: "Hypothyroïdie", category: "endocrine", synonyms: ["thyroïde basse", "hashimoto"] },
  { id: "hyperthyroidie", label: "Hyperthyroïdie", category: "endocrine", synonyms: ["basedow", "thyroïde haute"] },
  { id: "thyroidite_hashimoto", label: "Thyroïdite de Hashimoto", category: "endocrine", synonyms: ["hashimoto", "thyroïdite auto-immune"] },
  { id: "nodule_thyroidien", label: "Nodule thyroïdien", category: "endocrine", synonyms: ["goitre nodulaire"] },
  { id: "goitre", label: "Goitre", category: "endocrine", synonyms: ["goitre multinodulaire"] },
  { id: "insuffisance_surrenale", label: "Insuffisance surrénalienne", category: "endocrine", synonyms: ["addison", "insuffisance corticosurrénale"] },
  { id: "syndrome_cushing", label: "Syndrome de Cushing", category: "endocrine", synonyms: ["hypercorticisme"] },
  { id: "hyperparathyroidie", label: "Hyperparathyroïdie", category: "endocrine", synonyms: ["hypercalcémie parathyroïdienne"] },
  { id: "osteoporose", label: "Ostéoporose", category: "endocrine", synonyms: ["perte osseuse", "fragilité osseuse"] },
  { id: "obesite", label: "Obésité", category: "endocrine", synonyms: ["surpoids sévère", "IMC > 30"] },
  { id: "surpoids", label: "Surpoids", category: "endocrine", synonyms: ["excès pondéral", "IMC 25-30"] },
  { id: "dyslipidémie", label: "Dyslipidémie", category: "endocrine", synonyms: ["hyperlipidémie", "cholestérol élevé"] },
  { id: "hypercholesterolemie", label: "Hypercholestérolémie", category: "endocrine", synonyms: ["cholestérol élevé", "LDL élevé"] },
  { id: "hypertriglyceridemie", label: "Hypertriglycéridémie", category: "endocrine", synonyms: ["triglycérides élevés", "TG élevés"] },
  { id: "syndrome_metabolique", label: "Syndrome métabolique", category: "endocrine", synonyms: ["syndrome X", "insulinorésistance"] },
  { id: "goutte", label: "Goutte", category: "endocrine", synonyms: ["hyperuricémie symptomatique", "arthrite goutteuse"] },
  { id: "hyperuricemie", label: "Hyperuricémie", category: "endocrine", synonyms: ["acide urique élevé"] },

  // ==========================================
  // CARDIOLOGIE
  // ==========================================
  { id: "hta", label: "Hypertension artérielle", category: "cardio", synonyms: ["HTA", "tension élevée", "hypertension"] },
  { id: "insuffisance_cardiaque", label: "Insuffisance cardiaque", category: "cardio", synonyms: ["IC", "défaillance cardiaque"] },
  { id: "cardiopathie_ischemique", label: "Cardiopathie ischémique", category: "cardio", synonyms: ["coronaropathie", "maladie coronarienne"] },
  { id: "infarctus_myocarde", label: "Infarctus du myocarde", category: "cardio", synonyms: ["IDM", "crise cardiaque", "SCA"] },
  { id: "angor", label: "Angor / Angine de poitrine", category: "cardio", synonyms: ["angine de poitrine", "douleur thoracique d'effort"] },
  { id: "arythmie", label: "Arythmie cardiaque", category: "cardio", synonyms: ["trouble du rythme"] },
  { id: "fibrillation_auriculaire", label: "Fibrillation auriculaire", category: "cardio", synonyms: ["FA", "ACFA", "arythmie complète"] },
  { id: "flutter_auriculaire", label: "Flutter auriculaire", category: "cardio", synonyms: ["flutter atrial"] },
  { id: "tachycardie", label: "Tachycardie", category: "cardio", synonyms: ["rythme cardiaque rapide"] },
  { id: "bradycardie", label: "Bradycardie", category: "cardio", synonyms: ["rythme cardiaque lent"] },
  { id: "valvulopathie", label: "Valvulopathie", category: "cardio", synonyms: ["maladie valvulaire", "insuffisance valvulaire"] },
  { id: "prolapsus_mitral", label: "Prolapsus valvulaire mitral", category: "cardio", synonyms: ["PVM", "ballonnisation mitrale"] },
  { id: "pericardite", label: "Péricardite", category: "cardio", synonyms: ["inflammation péricarde"] },
  { id: "atherosclerose", label: "Athérosclérose", category: "cardio", synonyms: ["artériosclérose", "plaques d'athérome"] },
  { id: "aomi", label: "Artériopathie oblitérante (AOMI)", category: "cardio", synonyms: ["artérite", "claudication intermittente"] },
  { id: "thrombose_veineuse", label: "Thrombose veineuse profonde", category: "cardio", synonyms: ["TVP", "phlébite profonde"] },
  { id: "embolie_pulmonaire", label: "Embolie pulmonaire", category: "cardio", synonyms: ["EP", "embolie"] },
  { id: "insuffisance_veineuse", label: "Insuffisance veineuse", category: "cardio", synonyms: ["varices", "jambes lourdes"] },

  // ==========================================
  // GASTRO-ENTÉROLOGIE
  // ==========================================
  { id: "rgo", label: "Reflux gastro-oesophagien", category: "digestif", synonyms: ["RGO", "reflux", "brûlures d'estomac", "pyrosis"] },
  { id: "hernie_hiatale", label: "Hernie hiatale", category: "digestif", synonyms: ["hernie diaphragmatique"] },
  { id: "gastrite", label: "Gastrite", category: "digestif", synonyms: ["inflammation gastrique"] },
  { id: "ulcere_gastrique", label: "Ulcère gastrique", category: "digestif", synonyms: ["ulcère de l'estomac"] },
  { id: "ulcere_duodenal", label: "Ulcère duodénal", category: "digestif", synonyms: ["ulcère du duodénum"] },
  { id: "helicobacter", label: "Infection à Helicobacter pylori", category: "digestif", synonyms: ["H. pylori", "HP positif"] },
  { id: "colopathie_fonctionnelle", label: "Colopathie fonctionnelle (SII)", category: "digestif", synonyms: ["syndrome de l'intestin irritable", "SII", "côlon irritable"] },
  { id: "mici_crohn", label: "Maladie de Crohn", category: "digestif", synonyms: ["crohn", "MICI", "iléite"] },
  { id: "mici_rch", label: "Rectocolite hémorragique", category: "digestif", synonyms: ["RCH", "colite ulcéreuse", "MICI"] },
  { id: "diverticulose", label: "Diverticulose colique", category: "digestif", synonyms: ["diverticules", "sigmoïdite"] },
  { id: "constipation_chronique", label: "Constipation chronique", category: "digestif", synonyms: ["transit lent"] },
  { id: "diarrhee_chronique", label: "Diarrhée chronique", category: "digestif", synonyms: ["transit accéléré"] },
  { id: "maladie_coeliaque", label: "Maladie coeliaque", category: "digestif", synonyms: ["intolérance au gluten", "coeliaque"] },
  { id: "intolerance_lactose", label: "Intolérance au lactose", category: "digestif", synonyms: ["malabsorption lactose"] },
  { id: "steatose_hepatique", label: "Stéatose hépatique (NASH)", category: "digestif", synonyms: ["foie gras", "NAFLD", "NASH"] },
  { id: "hepatite_b", label: "Hépatite B", category: "digestif", synonyms: ["VHB", "hépatite virale B"] },
  { id: "hepatite_c", label: "Hépatite C", category: "digestif", synonyms: ["VHC", "hépatite virale C"] },
  { id: "cirrhose", label: "Cirrhose hépatique", category: "digestif", synonyms: ["cirrhose", "fibrose hépatique sévère"] },
  { id: "lithiase_biliaire", label: "Lithiase biliaire", category: "digestif", synonyms: ["calculs biliaires", "cholélithiase"] },
  { id: "pancreatite", label: "Pancréatite", category: "digestif", synonyms: ["inflammation pancréas"] },

  // ==========================================
  // PNEUMOLOGIE
  // ==========================================
  { id: "asthme", label: "Asthme", category: "pneumo", synonyms: ["asthme bronchique", "hyperréactivité bronchique"] },
  { id: "bpco", label: "BPCO", category: "pneumo", synonyms: ["bronchopneumopathie chronique obstructive", "emphysème"] },
  { id: "bronchite_chronique", label: "Bronchite chronique", category: "pneumo", synonyms: ["toux chronique"] },
  { id: "emphyseme", label: "Emphysème", category: "pneumo", synonyms: ["destruction alvéolaire"] },
  { id: "pneumonie", label: "Pneumonie", category: "pneumo", synonyms: ["infection pulmonaire", "pneumopathie"] },
  { id: "fibrose_pulmonaire", label: "Fibrose pulmonaire", category: "pneumo", synonyms: ["PID", "pneumopathie interstitielle"] },
  { id: "apnee_sommeil", label: "Syndrome d'apnée du sommeil", category: "pneumo", synonyms: ["SAOS", "apnées", "SAS"] },
  { id: "allergie_respiratoire", label: "Allergie respiratoire", category: "pneumo", synonyms: ["rhinite allergique", "rhume des foins"] },
  { id: "sarcoïdose", label: "Sarcoïdose", category: "pneumo", synonyms: ["BBS", "granulomatose"] },

  // ==========================================
  // NEUROLOGIE
  // ==========================================
  { id: "migraine", label: "Migraine", category: "neuro", synonyms: ["céphalées migraineuses", "migraines"] },
  { id: "cephalees_tension", label: "Céphalées de tension", category: "neuro", synonyms: ["maux de tête", "céphalées chroniques"] },
  { id: "epilepsie", label: "Épilepsie", category: "neuro", synonyms: ["convulsions", "crises comitiales"] },
  { id: "parkinson", label: "Maladie de Parkinson", category: "neuro", synonyms: ["parkinson", "syndrome parkinsonien"] },
  { id: "alzheimer", label: "Maladie d'Alzheimer", category: "neuro", synonyms: ["démence alzheimer", "troubles cognitifs"] },
  { id: "sclerose_plaques", label: "Sclérose en plaques", category: "neuro", synonyms: ["SEP", "MS"] },
  { id: "neuropathie", label: "Neuropathie périphérique", category: "neuro", synonyms: ["polyneuropathie", "neuropathie diabétique"] },
  { id: "avc", label: "Accident vasculaire cérébral", category: "neuro", synonyms: ["AVC", "AIT", "accident ischémique"] },
  { id: "syndrome_jambes_sans_repos", label: "Syndrome des jambes sans repos", category: "neuro", synonyms: ["SJSR", "impatiences"] },
  { id: "nevralgie", label: "Névralgie", category: "neuro", synonyms: ["douleur neuropathique", "névralgie faciale"] },
  { id: "vertiges", label: "Vertiges chroniques", category: "neuro", synonyms: ["syndrome vestibulaire", "vertiges positionnels"] },

  // ==========================================
  // RHUMATOLOGIE
  // ==========================================
  { id: "polyarthrite_rhumatoide", label: "Polyarthrite rhumatoïde", category: "rhumato", synonyms: ["PR", "arthrite rhumatoïde"] },
  { id: "arthrose", label: "Arthrose", category: "rhumato", synonyms: ["ostéoarthrite", "arthrose dégénérative"] },
  { id: "spondylarthrite", label: "Spondylarthrite ankylosante", category: "rhumato", synonyms: ["SPA", "pelvispondylite"] },
  { id: "fibromyalgie", label: "Fibromyalgie", category: "rhumato", synonyms: ["syndrome fibromyalgique", "douleurs diffuses"] },
  { id: "lupus", label: "Lupus érythémateux systémique", category: "rhumato", synonyms: ["LES", "lupus", "LED"] },
  { id: "sjogren", label: "Syndrome de Sjögren", category: "rhumato", synonyms: ["syndrome sec", "sjögren"] },
  { id: "sclerodermie", label: "Sclérodermie", category: "rhumato", synonyms: ["sclérose systémique"] },
  { id: "tendinite", label: "Tendinite", category: "rhumato", synonyms: ["tendinopathie", "ténosynovite"] },
  { id: "lombalgie_chronique", label: "Lombalgie chronique", category: "rhumato", synonyms: ["mal de dos", "douleur lombaire"] },
  { id: "hernie_discale", label: "Hernie discale", category: "rhumato", synonyms: ["protrusion discale", "discopathie"] },
  { id: "canal_lombaire_etroit", label: "Canal lombaire étroit", category: "rhumato", synonyms: ["sténose lombaire"] },

  // ==========================================
  // DERMATOLOGIE
  // ==========================================
  { id: "eczema", label: "Eczéma / Dermatite atopique", category: "dermato", synonyms: ["dermatite atopique", "eczéma atopique"] },
  { id: "psoriasis", label: "Psoriasis", category: "dermato", synonyms: ["psoriasis vulgaire", "psoriasis en plaques"] },
  { id: "acne", label: "Acné", category: "dermato", synonyms: ["acné vulgaire", "acné inflammatoire"] },
  { id: "rosacee", label: "Rosacée", category: "dermato", synonyms: ["couperose", "acné rosacée"] },
  { id: "urticaire_chronique", label: "Urticaire chronique", category: "dermato", synonyms: ["urticaire", "dermographisme"] },
  { id: "vitiligo", label: "Vitiligo", category: "dermato", synonyms: ["dépigmentation"] },
  { id: "alopecie", label: "Alopécie", category: "dermato", synonyms: ["perte de cheveux", "calvitie", "alopécie androgénétique"] },
  { id: "mycose_cutanee", label: "Mycose cutanée", category: "dermato", synonyms: ["dermatophytose", "teigne"] },

  // ==========================================
  // UROLOGIE / NÉPHROLOGIE
  // ==========================================
  { id: "insuffisance_renale", label: "Insuffisance rénale chronique", category: "uro", synonyms: ["IRC", "MRC", "néphropathie"] },
  { id: "lithiase_urinaire", label: "Lithiase urinaire", category: "uro", synonyms: ["calculs rénaux", "colique néphrétique"] },
  { id: "infection_urinaire", label: "Infection urinaire récidivante", category: "uro", synonyms: ["cystite récidivante", "IU"] },
  { id: "prostatite", label: "Prostatite", category: "uro", synonyms: ["prostatite chronique"] },
  { id: "hypertrophie_prostate", label: "Hypertrophie bénigne de prostate", category: "uro", synonyms: ["HBP", "adénome prostatique"] },
  { id: "incontinence_urinaire", label: "Incontinence urinaire", category: "uro", synonyms: ["fuites urinaires"] },
  { id: "vesical_hyperactif", label: "Vessie hyperactive", category: "uro", synonyms: ["instabilité vésicale", "pollakiurie"] },

  // ==========================================
  // GYNÉCOLOGIE
  // ==========================================
  { id: "endometriose", label: "Endométriose", category: "gyneco", synonyms: ["endométriome", "adénomyose"] },
  { id: "sopk", label: "Syndrome des ovaires polykystiques", category: "gyneco", synonyms: ["SOPK", "OPK", "ovaires polykystiques"] },
  { id: "fibrome_uterin", label: "Fibrome utérin", category: "gyneco", synonyms: ["myome", "léiomyome"] },
  { id: "menopause", label: "Ménopause / Troubles climatériques", category: "gyneco", synonyms: ["climatère", "bouffées de chaleur", "péri-ménopause"] },
  { id: "syndrome_premenstruel", label: "Syndrome prémenstruel", category: "gyneco", synonyms: ["SPM", "tension prémenstruelle"] },
  { id: "dysmenorrhee", label: "Dysménorrhée", category: "gyneco", synonyms: ["règles douloureuses", "douleurs menstruelles"] },
  { id: "amenorrhee", label: "Aménorrhée", category: "gyneco", synonyms: ["absence de règles"] },
  { id: "mastopathie", label: "Mastopathie fibrokystique", category: "gyneco", synonyms: ["mastose", "seins fibrokystiques"] },

  // ==========================================
  // PSYCHIATRIE
  // ==========================================
  { id: "depression", label: "Dépression", category: "psy", synonyms: ["épisode dépressif", "dépression majeure", "trouble dépressif"] },
  { id: "anxiete_generalisee", label: "Trouble anxieux généralisé", category: "psy", synonyms: ["TAG", "anxiété chronique", "anxiété"] },
  { id: "trouble_panique", label: "Trouble panique", category: "psy", synonyms: ["attaques de panique", "crises d'angoisse"] },
  { id: "phobie", label: "Phobie", category: "psy", synonyms: ["phobie sociale", "agoraphobie"] },
  { id: "toc", label: "Trouble obsessionnel compulsif", category: "psy", synonyms: ["TOC", "obsessions"] },
  { id: "trouble_bipolaire", label: "Trouble bipolaire", category: "psy", synonyms: ["maniaco-dépression", "bipolarité"] },
  { id: "insomnie", label: "Insomnie chronique", category: "psy", synonyms: ["troubles du sommeil", "insomnie"] },
  { id: "burnout", label: "Burn-out / Épuisement professionnel", category: "psy", synonyms: ["épuisement", "surmenage"] },
  { id: "stress_post_traumatique", label: "Stress post-traumatique", category: "psy", synonyms: ["PTSD", "ESPT", "traumatisme"] },
  { id: "trouble_alimentaire", label: "Trouble du comportement alimentaire", category: "psy", synonyms: ["TCA", "anorexie", "boulimie"] },

  // ==========================================
  // IMMUNOLOGIE / ALLERGOLOGIE
  // ==========================================
  { id: "allergie_alimentaire", label: "Allergie alimentaire", category: "immuno", synonyms: ["allergie aux arachides", "allergie aux fruits à coque"] },
  { id: "allergie_medicamenteuse", label: "Allergie médicamenteuse", category: "immuno", synonyms: ["intolérance médicamenteuse"] },
  { id: "rhinite_allergique", label: "Rhinite allergique", category: "immuno", synonyms: ["rhume des foins", "allergie au pollen"] },
  { id: "asthme_allergique", label: "Asthme allergique", category: "immuno", synonyms: ["asthme atopique"] },
  { id: "deficit_immunitaire", label: "Déficit immunitaire", category: "immuno", synonyms: ["immunodépression", "immunodéficience"] },

  // ==========================================
  // HÉMATOLOGIE
  // ==========================================
  { id: "anemie", label: "Anémie", category: "hemato", synonyms: ["anémie ferriprive", "anémie par carence"] },
  { id: "anemie_b12", label: "Anémie par carence en B12", category: "hemato", synonyms: ["anémie de Biermer", "carence B12"] },
  { id: "thalassemie", label: "Thalassémie", category: "hemato", synonyms: ["thalassémie mineure", "bêta-thalassémie"] },
  { id: "hemochromatose", label: "Hémochromatose", category: "hemato", synonyms: ["surcharge en fer"] },
  { id: "thrombocytopenie", label: "Thrombocytopénie", category: "hemato", synonyms: ["plaquettes basses", "PTI"] },
  { id: "trouble_coagulation", label: "Trouble de la coagulation", category: "hemato", synonyms: ["coagulopathie", "hémophilie"] },

  // ==========================================
  // INFECTIOLOGIE
  // ==========================================
  { id: "vih", label: "Infection VIH", category: "infectio", synonyms: ["VIH", "SIDA", "séropositif"] },
  { id: "tuberculose", label: "Tuberculose", category: "infectio", synonyms: ["TB", "tuberculose pulmonaire"] },
  { id: "lyme", label: "Maladie de Lyme", category: "infectio", synonyms: ["borréliose", "Lyme"] },
  { id: "covid_long", label: "COVID long", category: "infectio", synonyms: ["syndrome post-COVID", "long COVID"] },

  // ==========================================
  // ORL
  // ==========================================
  { id: "sinusite_chronique", label: "Sinusite chronique", category: "orl", synonyms: ["rhinosinusite chronique"] },
  { id: "otite_chronique", label: "Otite chronique", category: "orl", synonyms: ["otite séreuse", "otite moyenne"] },
  { id: "acouphenes", label: "Acouphènes", category: "orl", synonyms: ["bourdonnements", "sifflements oreille"] },
  { id: "hypoacousie", label: "Hypoacousie / Surdité", category: "orl", synonyms: ["perte auditive", "surdité"] },
  { id: "vertige_meniere", label: "Maladie de Ménière", category: "orl", synonyms: ["syndrome de Ménière", "hydrops endolymphatique"] },

  // ==========================================
  // OPHTALMOLOGIE
  // ==========================================
  { id: "glaucome", label: "Glaucome", category: "ophtalmo", synonyms: ["hypertension oculaire", "glaucome chronique"] },
  { id: "cataracte", label: "Cataracte", category: "ophtalmo", synonyms: ["opacification cristallin"] },
  { id: "dmla", label: "DMLA", category: "ophtalmo", synonyms: ["dégénérescence maculaire", "maculopathie"] },
  { id: "secheresse_oculaire", label: "Sécheresse oculaire", category: "ophtalmo", synonyms: ["syndrome sec oculaire", "yeux secs"] },
  { id: "retinopathie_diabetique", label: "Rétinopathie diabétique", category: "ophtalmo", synonyms: ["rétinopathie", "complication diabétique"] },
];

/**
 * Recherche intelligente dans les pathologies
 * Supporte la recherche fuzzy et les synonymes
 */
export function searchPathologies(query: string, limit: number = 10): PathologieItem[] {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const scored = PATHOLOGIES.map(p => {
    let score = 0;
    const normalizedLabel = p.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedSynonyms = (p.synonyms || []).map(s =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );

    // Correspondance exacte au début = score max
    if (normalizedLabel.startsWith(normalizedQuery)) {
      score = 100;
    }
    // Contient la query
    else if (normalizedLabel.includes(normalizedQuery)) {
      score = 80;
    }
    // Correspondance dans les synonymes
    else {
      for (const syn of normalizedSynonyms) {
        if (syn.startsWith(normalizedQuery)) {
          score = Math.max(score, 90);
        } else if (syn.includes(normalizedQuery)) {
          score = Math.max(score, 70);
        }
      }
    }

    // Boost pour les mots individuels
    const words = normalizedQuery.split(/\s+/);
    for (const word of words) {
      if (word.length >= 3) {
        if (normalizedLabel.includes(word)) score += 10;
        for (const syn of normalizedSynonyms) {
          if (syn.includes(word)) score += 5;
        }
      }
    }

    return { ...p, score };
  })
  .filter(p => p.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit);

  return scored;
}

/**
 * Obtenir la couleur d'une catégorie
 */
export function getCategoryColor(categoryId: string): string {
  const cat = PATHOLOGIE_CATEGORIES.find(c => c.id === categoryId);
  return cat?.color || "#6b7280";
}

/**
 * Obtenir le label d'une catégorie
 */
export function getCategoryLabel(categoryId: string): string {
  const cat = PATHOLOGIE_CATEGORIES.find(c => c.id === categoryId);
  return cat?.label || categoryId;
}
