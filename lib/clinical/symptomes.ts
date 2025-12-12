/**
 * Liste des symptômes courants pour autocomplete
 * Organisé par systèmes physiologiques
 */

export interface SymptomeItem {
  id: string;
  label: string;
  category: string;
  synonyms?: string[];
}

export const SYMPTOME_CATEGORIES = [
  { id: "general", label: "Signes généraux", color: "#6b7280" },
  { id: "cardio", label: "Cardio-vasculaire", color: "#ef4444" },
  { id: "respiratoire", label: "Respiratoire", color: "#06b6d4" },
  { id: "digestif", label: "Digestif", color: "#f59e0b" },
  { id: "neuro", label: "Neurologique", color: "#6366f1" },
  { id: "musculo", label: "Musculo-squelettique", color: "#84cc16" },
  { id: "cutane", label: "Cutané", color: "#ec4899" },
  { id: "uro", label: "Uro-génital", color: "#14b8a6" },
  { id: "psy", label: "Psychique", color: "#a855f7" },
  { id: "endocrine", label: "Endocrinien", color: "#8b5cf6" },
  { id: "orl", label: "ORL", color: "#78716c" },
  { id: "ophtalmo", label: "Ophtalmologique", color: "#0ea5e9" },
];

export const SYMPTOMES: SymptomeItem[] = [
  // ==========================================
  // SIGNES GÉNÉRAUX
  // ==========================================
  { id: "fatigue", label: "Fatigue / Asthénie", category: "general", synonyms: ["épuisement", "manque d'énergie", "fatigue chronique"] },
  { id: "fievre", label: "Fièvre", category: "general", synonyms: ["hyperthermie", "température élevée"] },
  { id: "frissons", label: "Frissons", category: "general", synonyms: ["tremblements"] },
  { id: "sueurs_nocturnes", label: "Sueurs nocturnes", category: "general", synonyms: ["transpiration nocturne"] },
  { id: "perte_poids", label: "Perte de poids involontaire", category: "general", synonyms: ["amaigrissement", "perte pondérale"] },
  { id: "prise_poids", label: "Prise de poids", category: "general", synonyms: ["gain pondéral"] },
  { id: "malaise", label: "Malaise / Lipothymie", category: "general", synonyms: ["sensation de malaise", "évanouissement"] },
  { id: "syncope", label: "Syncope", category: "general", synonyms: ["perte de connaissance", "évanouissement"] },
  { id: "anorexie", label: "Perte d'appétit", category: "general", synonyms: ["anorexie", "manque d'appétit"] },
  { id: "soif_excessive", label: "Soif excessive", category: "general", synonyms: ["polydipsie"] },

  // ==========================================
  // CARDIO-VASCULAIRE
  // ==========================================
  { id: "douleur_thoracique", label: "Douleur thoracique", category: "cardio", synonyms: ["douleur poitrine", "oppression thoracique"] },
  { id: "palpitations", label: "Palpitations", category: "cardio", synonyms: ["battements rapides", "tachycardie ressentie"] },
  { id: "dyspnee_effort", label: "Dyspnée d'effort", category: "cardio", synonyms: ["essoufflement à l'effort", "souffle court"] },
  { id: "oedemes_membres_inf", label: "Œdèmes des membres inférieurs", category: "cardio", synonyms: ["jambes gonflées", "chevilles enflées"] },
  { id: "jambes_lourdes", label: "Jambes lourdes", category: "cardio", synonyms: ["sensation de pesanteur", "lourdeur jambes"] },
  { id: "crampes_mollets", label: "Crampes des mollets", category: "cardio", synonyms: ["crampes nocturnes"] },
  { id: "claudication", label: "Claudication intermittente", category: "cardio", synonyms: ["douleur marche", "artériopathie"] },
  { id: "varices", label: "Varices / Varicosités", category: "cardio", synonyms: ["veines apparentes"] },
  { id: "extremites_froides", label: "Extrémités froides", category: "cardio", synonyms: ["mains froides", "pieds froids", "acrosyndrome"] },
  { id: "cyanose", label: "Cyanose", category: "cardio", synonyms: ["coloration bleutée"] },

  // ==========================================
  // RESPIRATOIRE
  // ==========================================
  { id: "toux", label: "Toux", category: "respiratoire", synonyms: ["toux sèche", "toux grasse"] },
  { id: "toux_chronique", label: "Toux chronique", category: "respiratoire", synonyms: ["toux persistante"] },
  { id: "dyspnee", label: "Dyspnée / Essoufflement", category: "respiratoire", synonyms: ["gêne respiratoire", "souffle court"] },
  { id: "wheezing", label: "Sifflements respiratoires", category: "respiratoire", synonyms: ["wheezing", "sibilants"] },
  { id: "expectoration", label: "Expectorations", category: "respiratoire", synonyms: ["crachats", "glaires"] },
  { id: "hemoptysie", label: "Hémoptysie", category: "respiratoire", synonyms: ["crachats de sang"] },
  { id: "douleur_pleurale", label: "Douleur pleurale", category: "respiratoire", synonyms: ["point de côté", "douleur respiration"] },
  { id: "ronflements", label: "Ronflements", category: "respiratoire", synonyms: ["ronflement nocturne"] },
  { id: "apnees", label: "Apnées du sommeil", category: "respiratoire", synonyms: ["pauses respiratoires"] },

  // ==========================================
  // DIGESTIF
  // ==========================================
  { id: "nausees", label: "Nausées", category: "digestif", synonyms: ["envie de vomir", "mal au cœur"] },
  { id: "vomissements", label: "Vomissements", category: "digestif", synonyms: ["régurgitations"] },
  { id: "douleur_abdominale", label: "Douleur abdominale", category: "digestif", synonyms: ["mal au ventre", "douleur ventre"] },
  { id: "ballonnements", label: "Ballonnements", category: "digestif", synonyms: ["météorisme", "ventre gonflé", "gaz"] },
  { id: "constipation", label: "Constipation", category: "digestif", synonyms: ["transit lent", "difficultés à aller à la selle"] },
  { id: "diarrhee", label: "Diarrhée", category: "digestif", synonyms: ["selles liquides", "transit accéléré"] },
  { id: "alternance_transit", label: "Alternance diarrhée/constipation", category: "digestif", synonyms: ["transit irrégulier"] },
  { id: "brulures_estomac", label: "Brûlures d'estomac", category: "digestif", synonyms: ["pyrosis", "reflux", "acidité gastrique"] },
  { id: "dysphagie", label: "Difficultés à avaler", category: "digestif", synonyms: ["dysphagie", "gêne déglutition"] },
  { id: "regurgitations", label: "Régurgitations acides", category: "digestif", synonyms: ["remontées acides", "RGO"] },
  { id: "satiete_precoce", label: "Satiété précoce", category: "digestif", synonyms: ["vite rassasié"] },
  { id: "perte_appetit", label: "Perte d'appétit", category: "digestif", synonyms: ["anorexie", "manque d'appétit"] },
  { id: "sang_selles", label: "Sang dans les selles", category: "digestif", synonyms: ["rectorragies", "méléna", "selles noires"] },
  { id: "prurit_anal", label: "Prurit anal", category: "digestif", synonyms: ["démangeaisons anales"] },
  { id: "haleine_fetide", label: "Haleine fétide", category: "digestif", synonyms: ["mauvaise haleine", "halitose"] },

  // ==========================================
  // NEUROLOGIQUE
  // ==========================================
  { id: "cephalees", label: "Céphalées / Maux de tête", category: "neuro", synonyms: ["migraine", "mal de tête"] },
  { id: "vertiges", label: "Vertiges", category: "neuro", synonyms: ["sensation de tournis", "étourdissements"] },
  { id: "troubles_equilibre", label: "Troubles de l'équilibre", category: "neuro", synonyms: ["instabilité", "déséquilibre"] },
  { id: "paresthesies", label: "Paresthésies / Fourmillements", category: "neuro", synonyms: ["fourmillements", "engourdissements", "picotements"] },
  { id: "tremblements", label: "Tremblements", category: "neuro", synonyms: ["tremblement mains"] },
  { id: "faiblesse_musculaire", label: "Faiblesse musculaire", category: "neuro", synonyms: ["perte de force", "asthénie musculaire"] },
  { id: "troubles_memoire", label: "Troubles de la mémoire", category: "neuro", synonyms: ["oublis", "pertes de mémoire"] },
  { id: "troubles_concentration", label: "Troubles de la concentration", category: "neuro", synonyms: ["difficultés de concentration", "brouillard mental"] },
  { id: "somnolence", label: "Somnolence diurne", category: "neuro", synonyms: ["envie de dormir", "hypersomnolence"] },
  { id: "insomnie", label: "Insomnie", category: "neuro", synonyms: ["troubles du sommeil", "difficultés d'endormissement"] },
  { id: "douleurs_neuropathiques", label: "Douleurs neuropathiques", category: "neuro", synonyms: ["brûlures", "décharges électriques"] },
  { id: "syndrome_jambes_repos", label: "Syndrome des jambes sans repos", category: "neuro", synonyms: ["impatiences", "besoin de bouger les jambes"] },

  // ==========================================
  // MUSCULO-SQUELETTIQUE
  // ==========================================
  { id: "douleurs_articulaires", label: "Douleurs articulaires", category: "musculo", synonyms: ["arthralgies", "douleurs articulations"] },
  { id: "raideur_matinale", label: "Raideur matinale", category: "musculo", synonyms: ["raideur articulaire", "dérouillage matinal"] },
  { id: "douleurs_musculaires", label: "Douleurs musculaires", category: "musculo", synonyms: ["myalgies", "courbatures"] },
  { id: "crampes", label: "Crampes musculaires", category: "musculo", synonyms: ["contractions douloureuses"] },
  { id: "lombalgie", label: "Lombalgie / Mal de dos", category: "musculo", synonyms: ["douleur lombaire", "tour de reins"] },
  { id: "cervicalgie", label: "Cervicalgie", category: "musculo", synonyms: ["douleur nuque", "torticolis"] },
  { id: "dorsalgie", label: "Dorsalgie", category: "musculo", synonyms: ["douleur dos", "douleur dorsale"] },
  { id: "sciatique", label: "Sciatique", category: "musculo", synonyms: ["douleur jambe", "névralgie sciatique"] },
  { id: "tendinite", label: "Douleur tendineuse", category: "musculo", synonyms: ["tendinite", "tendinopathie"] },
  { id: "gonflement_articulaire", label: "Gonflement articulaire", category: "musculo", synonyms: ["articulation enflée", "épanchement"] },

  // ==========================================
  // CUTANÉ
  // ==========================================
  { id: "prurit", label: "Prurit / Démangeaisons", category: "cutane", synonyms: ["démangeaisons", "grattage"] },
  { id: "eruption_cutanee", label: "Éruption cutanée", category: "cutane", synonyms: ["rash", "plaques rouges"] },
  { id: "secheresse_peau", label: "Sécheresse cutanée", category: "cutane", synonyms: ["peau sèche", "xérose"] },
  { id: "eczema", label: "Eczéma", category: "cutane", synonyms: ["dermatite", "plaques suintantes"] },
  { id: "urticaire", label: "Urticaire", category: "cutane", synonyms: ["plaques rouges qui grattent"] },
  { id: "acne", label: "Acné", category: "cutane", synonyms: ["boutons", "comédons"] },
  { id: "chute_cheveux", label: "Chute de cheveux", category: "cutane", synonyms: ["alopécie", "perte cheveux"] },
  { id: "ongles_cassants", label: "Ongles cassants", category: "cutane", synonyms: ["ongles fragiles"] },
  { id: "cicatrisation_lente", label: "Cicatrisation lente", category: "cutane", synonyms: ["plaies qui ne cicatrisent pas"] },
  { id: "hypersudation", label: "Hypersudation", category: "cutane", synonyms: ["transpiration excessive", "sueurs"] },

  // ==========================================
  // URO-GÉNITAL
  // ==========================================
  { id: "pollakiurie", label: "Pollakiurie", category: "uro", synonyms: ["envies fréquentes d'uriner", "mictions fréquentes"] },
  { id: "nycturie", label: "Nycturie", category: "uro", synonyms: ["levers nocturnes", "uriner la nuit"] },
  { id: "dysurie", label: "Dysurie", category: "uro", synonyms: ["difficultés à uriner", "brûlures mictionnelles"] },
  { id: "hematurie", label: "Sang dans les urines", category: "uro", synonyms: ["hématurie", "urines rouges"] },
  { id: "incontinence", label: "Incontinence urinaire", category: "uro", synonyms: ["fuites urinaires"] },
  { id: "douleur_miction", label: "Douleur à la miction", category: "uro", synonyms: ["brûlures urinaires"] },
  { id: "colique_nephretique", label: "Douleur lombaire aiguë", category: "uro", synonyms: ["colique néphrétique"] },
  { id: "troubles_erectiles", label: "Troubles érectiles", category: "uro", synonyms: ["impuissance", "dysfonction érectile"] },
  { id: "baisse_libido", label: "Baisse de la libido", category: "uro", synonyms: ["perte désir sexuel"] },
  { id: "dysmenorrhee", label: "Règles douloureuses", category: "uro", synonyms: ["dysménorrhée", "douleurs menstruelles"] },
  { id: "menorragies", label: "Règles abondantes", category: "uro", synonyms: ["ménorragies", "saignements abondants"] },
  { id: "metrorragies", label: "Saignements entre les règles", category: "uro", synonyms: ["métrorragies", "spotting"] },
  { id: "bouffees_chaleur", label: "Bouffées de chaleur", category: "uro", synonyms: ["flush", "chaleurs"] },

  // ==========================================
  // PSYCHIQUE
  // ==========================================
  { id: "anxiete", label: "Anxiété", category: "psy", synonyms: ["angoisse", "nervosité", "stress"] },
  { id: "tristesse", label: "Tristesse / Humeur dépressive", category: "psy", synonyms: ["déprime", "moral bas"] },
  { id: "irritabilite", label: "Irritabilité", category: "psy", synonyms: ["nervosité", "agacement"] },
  { id: "troubles_sommeil", label: "Troubles du sommeil", category: "psy", synonyms: ["insomnies", "réveils nocturnes"] },
  { id: "perte_interet", label: "Perte d'intérêt", category: "psy", synonyms: ["anhédonie", "démotivation"] },
  { id: "difficulte_concentration", label: "Difficulté de concentration", category: "psy", synonyms: ["attention diminuée"] },
  { id: "stress", label: "Stress chronique", category: "psy", synonyms: ["tension nerveuse", "surmenage"] },
  { id: "attaques_panique", label: "Attaques de panique", category: "psy", synonyms: ["crises d'angoisse"] },
  { id: "phobies", label: "Phobies", category: "psy", synonyms: ["peurs irrationnelles"] },
  { id: "troubles_alimentaires", label: "Troubles du comportement alimentaire", category: "psy", synonyms: ["TCA", "compulsions alimentaires"] },

  // ==========================================
  // ENDOCRINIEN
  // ==========================================
  { id: "polyurie", label: "Polyurie", category: "endocrine", synonyms: ["urines abondantes", "beaucoup d'urines"] },
  { id: "polydipsie", label: "Polydipsie", category: "endocrine", synonyms: ["soif excessive"] },
  { id: "intolerance_chaleur", label: "Intolérance à la chaleur", category: "endocrine", synonyms: ["chaleur mal supportée"] },
  { id: "intolerance_froid", label: "Intolérance au froid", category: "endocrine", synonyms: ["frilosité", "froid mal supporté"] },
  { id: "hypoglycemies", label: "Hypoglycémies ressenties", category: "endocrine", synonyms: ["malaises hypoglycémiques"] },
  { id: "goitre", label: "Masse cervicale / Goitre", category: "endocrine", synonyms: ["gonflement cou"] },
  { id: "exophtalmie", label: "Yeux exorbités", category: "endocrine", synonyms: ["exophtalmie"] },
  { id: "gynécomastie", label: "Gynécomastie", category: "endocrine", synonyms: ["augmentation seins homme"] },
  { id: "hirsutisme", label: "Hirsutisme", category: "endocrine", synonyms: ["pilosité excessive"] },

  // ==========================================
  // ORL
  // ==========================================
  { id: "otalgie", label: "Douleur d'oreille", category: "orl", synonyms: ["mal à l'oreille", "otalgie"] },
  { id: "acouphenes", label: "Acouphènes", category: "orl", synonyms: ["bourdonnements", "sifflements oreille"] },
  { id: "hypoacousie", label: "Baisse d'audition", category: "orl", synonyms: ["surdité", "perte auditive"] },
  { id: "rhinorrhee", label: "Écoulement nasal", category: "orl", synonyms: ["nez qui coule", "rhinorrhée"] },
  { id: "obstruction_nasale", label: "Obstruction nasale", category: "orl", synonyms: ["nez bouché", "congestion"] },
  { id: "epistaxis", label: "Saignements de nez", category: "orl", synonyms: ["épistaxis"] },
  { id: "odynophagie", label: "Douleur à la déglutition", category: "orl", synonyms: ["mal de gorge en avalant"] },
  { id: "dysphonie", label: "Enrouement / Dysphonie", category: "orl", synonyms: ["voix cassée", "extinction de voix"] },
  { id: "pharyngite", label: "Mal de gorge", category: "orl", synonyms: ["angine", "gorge irritée"] },

  // ==========================================
  // OPHTALMOLOGIQUE
  // ==========================================
  { id: "baisse_acuite", label: "Baisse d'acuité visuelle", category: "ophtalmo", synonyms: ["vision floue", "vue qui baisse"] },
  { id: "diplopie", label: "Vision double", category: "ophtalmo", synonyms: ["diplopie"] },
  { id: "secheresse_oculaire", label: "Sécheresse oculaire", category: "ophtalmo", synonyms: ["yeux secs"] },
  { id: "larmoiement", label: "Larmoiement", category: "ophtalmo", synonyms: ["yeux qui pleurent"] },
  { id: "douleur_oculaire", label: "Douleur oculaire", category: "ophtalmo", synonyms: ["mal aux yeux"] },
  { id: "rougeur_oculaire", label: "Œil rouge", category: "ophtalmo", synonyms: ["conjonctivite", "yeux rouges"] },
  { id: "photophobie", label: "Photophobie", category: "ophtalmo", synonyms: ["sensibilité à la lumière"] },
  { id: "scotomes", label: "Scotomes / Taches visuelles", category: "ophtalmo", synonyms: ["corps flottants", "mouches volantes"] },
];

/**
 * Recherche intelligente dans les symptômes
 */
export function searchSymptomes(query: string, limit: number = 10): SymptomeItem[] {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const scored = SYMPTOMES.map(s => {
    let score = 0;
    const normalizedLabel = s.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedSynonyms = (s.synonyms || []).map(syn =>
      syn.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );

    if (normalizedLabel.startsWith(normalizedQuery)) {
      score = 100;
    } else if (normalizedLabel.includes(normalizedQuery)) {
      score = 80;
    } else {
      for (const syn of normalizedSynonyms) {
        if (syn.startsWith(normalizedQuery)) {
          score = Math.max(score, 90);
        } else if (syn.includes(normalizedQuery)) {
          score = Math.max(score, 70);
        }
      }
    }

    const words = normalizedQuery.split(/\s+/);
    for (const word of words) {
      if (word.length >= 3) {
        if (normalizedLabel.includes(word)) score += 10;
        for (const syn of normalizedSynonyms) {
          if (syn.includes(word)) score += 5;
        }
      }
    }

    return { ...s, score };
  })
  .filter(s => s.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit);

  return scored;
}

export function getSymptomeCategoryColor(categoryId: string): string {
  const cat = SYMPTOME_CATEGORIES.find(c => c.id === categoryId);
  return cat?.color || "#6b7280";
}

export function getSymptomeCategoryLabel(categoryId: string): string {
  const cat = SYMPTOME_CATEGORIES.find(c => c.id === categoryId);
  return cat?.label || categoryId;
}
