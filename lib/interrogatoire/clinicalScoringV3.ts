// ========================================
// MOTEUR DE SCORING ENDOBIOGÉNIQUE V3
// Utilise les VRAIS IDs des questions du formulaire
// ========================================

import type { QuestionConfig } from "./types";

// ========================================
// TYPES
// ========================================

export type OrientationEndobiogenique =
  | "insuffisance"      // L'axe ne fonctionne pas assez (hypo)
  | "sur_sollicitation" // L'axe fonctionne trop / est épuisé (hyper)
  | "mal_adaptation"    // L'axe fonctionne de travers
  | "equilibre"         // Fonctionnement normal
  | "instabilite";      // Alternance insuffisance/sur-sollicitation

export type TerrainPathologique =
  | "atopique"          // Allergie, terrain Th2
  | "auto_immun"        // Auto-immunité, terrain Th1
  | "spasmophile"       // Dysfonction SNA
  | "congestif"         // Congestion hépato-splanchnique
  | "inflammatoire"     // Inflammation chronique
  | "metabolique"       // Syndrome métabolique
  | "degeneratif";      // Vieillissement accéléré

export interface ScoreAxeEndobiogenique {
  insuffisance: number;      // Score 0-100
  surSollicitation: number;  // Score 0-100
  orientation: OrientationEndobiogenique;
  intensite: number;         // 0-10
  description: string;
  confiance: number;         // 0-1
  symptomesCles: string[];
}

export interface TerrainDetecte {
  terrain: TerrainPathologique;
  score: number;
  indicateurs: string[];
  axesImpliques: string[];
}

export interface ScoringResultV3 {
  axes: {
    neuro?: ScoreAxeEndobiogenique;
    adaptatif?: ScoreAxeEndobiogenique;
    thyro?: ScoreAxeEndobiogenique;
    gonado?: ScoreAxeEndobiogenique;
    somato?: ScoreAxeEndobiogenique;
    digestif?: ScoreAxeEndobiogenique;
    immuno?: ScoreAxeEndobiogenique;
  };
  terrainsDetectes: TerrainDetecte[];
  syntheseGlobale: {
    terrainPrincipal: TerrainPathologique | null;
    axePrioritaire: string | null;
    capaciteAdaptation: "bonne" | "moderee" | "faible" | "epuisee";
    risqueSpasmophilie: boolean;
    recommandationsPrioritaires: string[];
  };
}

// ========================================
// HELPERS
// ========================================

/**
 * Convertit une valeur scale_1_5 en score (1=0%, 5=100%)
 */
function scaleToPercent(value: any): number {
  if (value === undefined || value === null || value === "") return 0;
  const num = typeof value === "number" ? value : parseInt(value, 10);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(100, ((num - 1) / 4) * 100));
}

/**
 * Convertit un boolean en score
 */
function boolToScore(value: any, scoreIfTrue: number = 100): number {
  if (value === true || value === "oui" || value === "true") return scoreIfTrue;
  return 0;
}

/**
 * Détermine l'orientation à partir des scores hypo/hyper
 */
function determinerOrientation(hypo: number, hyper: number): OrientationEndobiogenique {
  if (hypo < 20 && hyper < 20) return "equilibre";
  if (hypo > 30 && hyper > 30 && Math.abs(hypo - hyper) < 20) return "instabilite";
  if (Math.abs(hypo - hyper) < 15 && (hypo > 25 || hyper > 25)) return "mal_adaptation";
  return hypo > hyper ? "insuffisance" : "sur_sollicitation";
}

// ========================================
// SCORING PAR AXE - UTILISE LES VRAIS IDs
// ========================================

/**
 * AXE NEUROVÉGÉTATIF
 * IDs: neuro_para_*, neuro_alpha_*, neuro_beta_*, neuro_sommeil_*
 */
function scorerAxeNeuro(answers: Record<string, any>): ScoreAxeEndobiogenique {
  const symptomesCles: string[] = [];
  let hypoTotal = 0, hypoMax = 0;
  let hyperTotal = 0, hyperMax = 0;

  // === PARASYMPATHIQUE (hypertonie = hyper) ===
  const paraSalivation = scaleToPercent(answers.neuro_para_salivation);
  if (paraSalivation > 50) {
    hyperTotal += paraSalivation * 2;
    symptomesCles.push("Hypersalivation (hypertonie vagale)");
  }
  hyperMax += 200;

  const paraNausee = scaleToPercent(answers.neuro_para_nausee);
  if (paraNausee > 50) {
    hyperTotal += paraNausee * 2;
    symptomesCles.push("Mal des transports (hyper-réflexivité vagale)");
  }
  hyperMax += 200;

  const paraNezBouche = scaleToPercent(answers.neuro_para_nez_bouche);
  if (paraNezBouche > 50) {
    hyperTotal += paraNezBouche * 2;
    symptomesCles.push("Congestion nasale post-prandiale (vagotonie)");
  }
  hyperMax += 200;

  // === SYMPATHIQUE ALPHA (vasoconstriction = hyper) ===
  const alphaFroid = scaleToPercent(answers.neuro_alpha_froid);
  if (alphaFroid > 50) {
    hyperTotal += alphaFroid * 3;
    symptomesCles.push("Extrémités froides (vasoconstriction alpha)");
  }
  hyperMax += 300;

  const alphaPeauSeche = scaleToPercent(answers.neuro_alpha_peau_seche);
  if (alphaPeauSeche > 50) {
    hyperTotal += alphaPeauSeche * 2;
    symptomesCles.push("Peau/yeux secs (hypertonie alpha)");
  }
  hyperMax += 200;

  const alphaConstipation = scaleToPercent(answers.neuro_alpha_constipation);
  if (alphaConstipation > 50) {
    hyperTotal += alphaConstipation * 2;
    symptomesCles.push("Constipation spastique (alpha)");
  }
  hyperMax += 200;

  const alphaMental = scaleToPercent(answers.neuro_alpha_mental);
  if (alphaMental > 50) {
    hyperTotal += alphaMental * 2;
    symptomesCles.push("Ruminations mentales (hypervigilance alpha)");
  }
  hyperMax += 200;

  // === SYMPATHIQUE BÊTA (réactivité cardiaque = hyper) ===
  const betaPalpitations = scaleToPercent(answers.neuro_beta_palpitations);
  if (betaPalpitations > 50) {
    hyperTotal += betaPalpitations * 3;
    symptomesCles.push("Palpitations (hyper-réactivité bêta)");
  }
  hyperMax += 300;

  const betaEmotivite = scaleToPercent(answers.neuro_beta_emotivite);
  if (betaEmotivite > 50) {
    hyperTotal += betaEmotivite * 2;
    symptomesCles.push("Hyper-émotivité (réactivité bêta)");
  }
  hyperMax += 200;

  const betaTremblements = scaleToPercent(answers.neuro_beta_tremblements);
  if (betaTremblements > 50) {
    hyperTotal += betaTremblements * 2;
    symptomesCles.push("Tremblements fins (excitation bêta)");
  }
  hyperMax += 200;

  const betaSpasmes = scaleToPercent(answers.neuro_beta_spasmes);
  if (betaSpasmes > 50) {
    hyperTotal += betaSpasmes * 2;
    symptomesCles.push("Spasmes douloureux (bêta)");
  }
  hyperMax += 200;

  // === SOMMEIL (perturbation = hyper sympathique) ===
  const sommeilEndormissement = scaleToPercent(answers.neuro_sommeil_endormissement);
  if (sommeilEndormissement > 50) {
    hyperTotal += sommeilEndormissement * 2;
    symptomesCles.push("Difficulté d'endormissement (alpha persistant)");
  }
  hyperMax += 200;

  const reveilNocturne = scaleToPercent(answers.neuro_reveil_nocturne);
  if (reveilNocturne > 50) {
    hyperTotal += reveilNocturne * 2;
    symptomesCles.push("Réveil nocturne 3h-4h (décharge adrénergique)");
  }
  hyperMax += 200;

  // Normalisation
  const hypoNorm = hypoMax > 0 ? (hypoTotal / hypoMax) * 100 : 0;
  const hyperNorm = hyperMax > 0 ? (hyperTotal / hyperMax) * 100 : 0;

  // L'axe neuro est particulier : on évalue surtout l'hyperactivité sympathique
  // L'hypo est rare (plutôt manque de réponse = épuisement)
  return {
    insuffisance: Math.round(hypoNorm),
    surSollicitation: Math.round(hyperNorm),
    orientation: determinerOrientation(hypoNorm, hyperNorm),
    intensite: Math.round(Math.max(hypoNorm, hyperNorm) / 10),
    description: genererDescriptionNeuro(hypoNorm, hyperNorm),
    confiance: calculerConfiance(answers, 14),
    symptomesCles
  };
}

/**
 * AXE CORTICOTROPE (Adaptatif)
 * IDs: cortico_fatigue_matin, cortico_coup_pompe, cortico_sel, etc.
 */
function scorerAxeAdaptatif(answers: Record<string, any>): ScoreAxeEndobiogenique {
  const symptomesCles: string[] = [];
  let hypoTotal = 0, hypoMax = 0;
  let hyperTotal = 0, hyperMax = 0;

  // === INSUFFISANCE CORTICOTROPE (cortisol bas) ===
  const fatigueMatin = scaleToPercent(answers.cortico_fatigue_matin);
  if (fatigueMatin > 50) {
    hypoTotal += fatigueMatin * 3;
    symptomesCles.push("Fatigue matinale (pic cortisol absent)");
  }
  hypoMax += 300;

  const coupPompe = scaleToPercent(answers.cortico_coup_pompe);
  if (coupPompe > 50) {
    hypoTotal += coupPompe * 2;
    symptomesCles.push("Coups de pompe 11h/17h (hypoglycémie)");
  }
  hypoMax += 200;

  const endurance = scaleToPercent(answers.cortico_endurance);
  if (endurance > 50) {
    hypoTotal += endurance * 2;
    symptomesCles.push("Manque d'endurance (épuisement surrénalien)");
  }
  hypoMax += 200;

  const sel = scaleToPercent(answers.cortico_sel);
  if (sel > 50) {
    hypoTotal += sel * 3;
    symptomesCles.push("Envies de sel (hypo-aldostéronisme)");
  }
  hypoMax += 300;

  const hypotension = scaleToPercent(answers.cortico_hypotension);
  if (hypotension > 50) {
    hypoTotal += hypotension * 2;
    symptomesCles.push("Hypotension orthostatique");
  }
  hypoMax += 200;

  const douleurs = scaleToPercent(answers.cortico_douleurs);
  if (douleurs > 50) {
    hypoTotal += douleurs * 2;
    symptomesCles.push("Douleurs inflammatoires (cortisol anti-inflammatoire insuffisant)");
  }
  hypoMax += 200;

  const irritabilite = scaleToPercent(answers.cortico_irritabilite);
  if (irritabilite > 50) {
    hypoTotal += irritabilite * 2;
    symptomesCles.push("Irritabilité à jeun (hypoglycémie surrénalienne)");
  }
  hypoMax += 200;

  const bruit = scaleToPercent(answers.cortico_bruit);
  if (bruit > 50) {
    hypoTotal += bruit * 2;
    symptomesCles.push("Hypersensibilité bruit/lumière (épuisement adaptatif)");
  }
  hypoMax += 200;

  // === SUR-SOLLICITATION CORTICOTROPE ===
  const cicatrisation = scaleToPercent(answers.cortico_cicatrisation);
  if (cicatrisation > 50) {
    hyperTotal += cicatrisation * 2;
    symptomesCles.push("Cicatrisation lente (cortisol chroniquement élevé)");
  }
  hyperMax += 200;

  // Normalisation
  const hypoNorm = hypoMax > 0 ? (hypoTotal / hypoMax) * 100 : 0;
  const hyperNorm = hyperMax > 0 ? (hyperTotal / hyperMax) * 100 : 0;

  return {
    insuffisance: Math.round(hypoNorm),
    surSollicitation: Math.round(hyperNorm),
    orientation: determinerOrientation(hypoNorm, hyperNorm),
    intensite: Math.round(Math.max(hypoNorm, hyperNorm) / 10),
    description: genererDescriptionAdaptatif(hypoNorm, hyperNorm),
    confiance: calculerConfiance(answers, 9),
    symptomesCles
  };
}

/**
 * AXE THYRÉOTROPE
 * IDs: thyro_frilosite, thyro_prise_poids_facile, thyro_intolerance_chaleur, etc.
 */
function scorerAxeThyro(answers: Record<string, any>): ScoreAxeEndobiogenique {
  const symptomesCles: string[] = [];
  let hypoTotal = 0, hypoMax = 0;
  let hyperTotal = 0, hyperMax = 0;

  // === HYPO-THYROÏDIE FONCTIONNELLE ===
  const metabolisme = scaleToPercent(answers.thyro_metabolisme_general);
  // Scale inversée : 1-2 = hypo, 4-5 = hyper
  if (metabolisme < 50) {
    hypoTotal += (100 - metabolisme) * 3;
    symptomesCles.push("Métabolisme lent");
  } else if (metabolisme > 75) {
    hyperTotal += metabolisme * 3;
    symptomesCles.push("Métabolisme rapide");
  }
  hypoMax += 300; hyperMax += 300;

  if (boolToScore(answers.thyro_frilosite) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Frilosité (hypométabolisme)");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_sensation_froid_extremites) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Extrémités froides");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_prise_poids_facile) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Prise de poids facile");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_fatigue_matinale) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Fatigue matinale");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_ralentissement_general) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Fonctionnement au ralenti");
  }
  hypoMax += 300;

  if (boolToScore(answers.thyro_difficultes_concentration) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Difficultés de concentration (brain fog)");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_peau_seche) > 0) {
    hypoTotal += 100;
    symptomesCles.push("Peau sèche");
  }
  hypoMax += 100;

  // Chute cheveux
  const cheveux = answers.thyro_chute_cheveux;
  if (cheveux === "Oui légère") { hypoTotal += 100; symptomesCles.push("Chute cheveux légère"); }
  else if (cheveux === "Oui modérée") { hypoTotal += 150; symptomesCles.push("Chute cheveux modérée"); }
  else if (cheveux === "Oui importante") { hypoTotal += 200; symptomesCles.push("Chute cheveux importante"); }
  hypoMax += 200;

  if (boolToScore(answers.thyro_ongles_fragiles) > 0) {
    hypoTotal += 100;
    symptomesCles.push("Ongles fragiles");
  }
  hypoMax += 100;

  if (boolToScore(answers.thyro_sourcils_externes) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Perte tiers externe sourcils (signe Hertoghe)");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_transit_lent) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Transit lent / constipation");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_digestion_lente) > 0) {
    hypoTotal += 100;
    symptomesCles.push("Digestion lente");
  }
  hypoMax += 100;

  if (boolToScore(answers.thyro_froid_apres_effort) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Difficile à réchauffer après effort");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_pouls_lent) > 0) {
    hypoTotal += 100;
    symptomesCles.push("Pouls lent au repos");
  }
  hypoMax += 100;

  // === HYPER-THYROÏDIE FONCTIONNELLE ===
  if (boolToScore(answers.thyro_intolerance_chaleur) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Intolérance à la chaleur");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_anxiete_agitation) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Anxiété/agitation");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_appetit_augmente) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Appétit augmenté sans prise de poids");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_tachycardie_repos) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Tachycardie au repos");
  }
  hyperMax += 200;

  // Normalisation
  const hypoNorm = hypoMax > 0 ? (hypoTotal / hypoMax) * 100 : 0;
  const hyperNorm = hyperMax > 0 ? (hyperTotal / hyperMax) * 100 : 0;

  return {
    insuffisance: Math.round(hypoNorm),
    surSollicitation: Math.round(hyperNorm),
    orientation: determinerOrientation(hypoNorm, hyperNorm),
    intensite: Math.round(Math.max(hypoNorm, hyperNorm) / 10),
    description: genererDescriptionThyro(hypoNorm, hyperNorm),
    confiance: calculerConfiance(answers, 20),
    symptomesCles
  };
}

/**
 * AXE GONADOTROPE
 * IDs: gona_f_* (femme), gona_h_* (homme), gona_acne (commun)
 */
function scorerAxeGonado(answers: Record<string, any>, sexe: "H" | "F"): ScoreAxeEndobiogenique {
  const symptomesCles: string[] = [];
  let hypoTotal = 0, hypoMax = 0;
  let hyperTotal = 0, hyperMax = 0;

  if (sexe === "F") {
    // === FEMME : INSUFFISANCE (hypo-œstrogénie) ===
    const bouffees = scaleToPercent(answers.gona_f_menopause_bouffees);
    if (bouffees > 50) {
      hypoTotal += bouffees * 3;
      symptomesCles.push("Bouffées de chaleur (chute œstrogènes)");
    }
    hypoMax += 300;

    const cyclesCourts = scaleToPercent(answers.gona_f_cycles_courts);
    if (cyclesCourts > 50) {
      hypoTotal += cyclesCourts * 2;
      symptomesCles.push("Cycles courts (insuffisance lutéale)");
    }
    hypoMax += 200;

    // === FEMME : SUR-SOLLICITATION (hyperoestrogénie) ===
    const reglesDoul = scaleToPercent(answers.gona_f_regles_douloureuses);
    if (reglesDoul > 50) {
      hyperTotal += reglesDoul * 2;
      symptomesCles.push("Dysménorrhée (hyperoestrogénie)");
    }
    hyperMax += 200;

    const fluxAbondant = scaleToPercent(answers.gona_f_flux_abondant);
    if (fluxAbondant > 50) {
      hyperTotal += fluxAbondant * 3;
      symptomesCles.push("Flux abondant / caillots (hyperoestrogénie)");
    }
    hyperMax += 300;

    const pmsSeins = scaleToPercent(answers.gona_f_pms_seins);
    if (pmsSeins > 50) {
      hyperTotal += pmsSeins * 2;
      symptomesCles.push("Mastodynies prémenstruelles");
    }
    hyperMax += 200;

  } else {
    // === HOMME : INSUFFISANCE (hypo-androgénie) ===
    const libido = scaleToPercent(answers.gona_h_libido);
    if (libido > 50) {
      hypoTotal += libido * 3;
      symptomesCles.push("Baisse libido/élan vital (hypo-androgénie)");
    }
    hypoMax += 300;

    const musculaire = scaleToPercent(answers.gona_h_musculaire);
    if (musculaire > 50) {
      hypoTotal += musculaire * 2;
      symptomesCles.push("Fonte musculaire / gras abdominal");
    }
    hypoMax += 200;

    // === HOMME : SUR-SOLLICITATION (prostate) ===
    const urinaire = scaleToPercent(answers.gona_h_urinaire);
    if (urinaire > 50) {
      hyperTotal += urinaire * 3;
      symptomesCles.push("Troubles urinaires (congestion prostatique)");
    }
    hyperMax += 300;
  }

  // === COMMUN ===
  const acne = scaleToPercent(answers.gona_acne);
  if (acne > 50) {
    hyperTotal += acne * 2;
    symptomesCles.push("Acné / peau grasse (hyper-androgénie)");
  }
  hyperMax += 200;

  // Normalisation
  const hypoNorm = hypoMax > 0 ? (hypoTotal / hypoMax) * 100 : 0;
  const hyperNorm = hyperMax > 0 ? (hyperTotal / hyperMax) * 100 : 0;

  return {
    insuffisance: Math.round(hypoNorm),
    surSollicitation: Math.round(hyperNorm),
    orientation: determinerOrientation(hypoNorm, hyperNorm),
    intensite: Math.round(Math.max(hypoNorm, hyperNorm) / 10),
    description: genererDescriptionGonado(hypoNorm, hyperNorm, sexe),
    confiance: calculerConfiance(answers, sexe === "F" ? 6 : 4),
    symptomesCles
  };
}

/**
 * AXE SOMATOTROPE (GH/IGF-1)
 * IDs: soma_reveil_lourd, soma_recuperation_lente, soma_tendinites, etc.
 */
function scorerAxeSomato(answers: Record<string, any>): ScoreAxeEndobiogenique {
  const symptomesCles: string[] = [];
  let hypoTotal = 0, hypoMax = 0;
  let hyperTotal = 0, hyperMax = 0;

  // === INSUFFISANCE SOMATOTROPE (GH basse) ===
  const reveilLourd = scaleToPercent(answers.soma_reveil_lourd);
  if (reveilLourd > 50) {
    hypoTotal += reveilLourd * 3;
    symptomesCles.push("Corps lourd au réveil (déficit GH nocturne)");
  }
  hypoMax += 300;

  const recuperationLente = scaleToPercent(answers.soma_recuperation_lente);
  if (recuperationLente > 50) {
    hypoTotal += recuperationLente * 2;
    symptomesCles.push("Récupération lente après effort");
  }
  hypoMax += 200;

  const sommeilAgite = scaleToPercent(answers.soma_sommeil_agite);
  if (sommeilAgite > 50) {
    hypoTotal += sommeilAgite * 2;
    symptomesCles.push("Sommeil agité");
  }
  hypoMax += 200;

  const tendinites = scaleToPercent(answers.soma_tendinites);
  if (tendinites > 50) {
    hypoTotal += tendinites * 2;
    symptomesCles.push("Tendinites récidivantes (déficit réparation)");
  }
  hypoMax += 200;

  const forceMuscul = scaleToPercent(answers.soma_force_musculaire);
  if (forceMuscul > 50) {
    hypoTotal += forceMuscul * 2;
    symptomesCles.push("Faiblesse musculaire");
  }
  hypoMax += 200;

  const peauFine = scaleToPercent(answers.soma_peau_fine);
  if (peauFine > 50) {
    hypoTotal += peauFine * 1;
    symptomesCles.push("Peau très fine");
  }
  hypoMax += 100;

  const faimMatin = scaleToPercent(answers.soma_faim_matin);
  if (faimMatin > 50) {
    hypoTotal += faimMatin * 3;
    symptomesCles.push("Faim impérieuse au réveil (hypoglycémie nocturne)");
  }
  hypoMax += 300;

  const coupPompeRepas = scaleToPercent(answers.soma_coup_pompe_repas);
  if (coupPompeRepas > 50) {
    hypoTotal += coupPompeRepas * 2;
    symptomesCles.push("Coup de pompe 2-3h après repas (relais GH défaillant)");
  }
  hypoMax += 200;

  const graisseAbdo = scaleToPercent(answers.soma_graisse_abdo);
  if (graisseAbdo > 50) {
    hypoTotal += graisseAbdo * 2;
    symptomesCles.push("Graisse abdominale (résistance insuline / déficit GH)");
  }
  hypoMax += 200;

  // Normalisation
  const hypoNorm = hypoMax > 0 ? (hypoTotal / hypoMax) * 100 : 0;
  const hyperNorm = hyperMax > 0 ? (hyperTotal / hyperMax) * 100 : 0;

  return {
    insuffisance: Math.round(hypoNorm),
    surSollicitation: Math.round(hyperNorm),
    orientation: determinerOrientation(hypoNorm, hyperNorm),
    intensite: Math.round(Math.max(hypoNorm, hyperNorm) / 10),
    description: genererDescriptionSomato(hypoNorm, hyperNorm),
    confiance: calculerConfiance(answers, 9),
    symptomesCles
  };
}

/**
 * AXE DIGESTIF
 * IDs: dig_estomac_*, dig_foie_*, dig_grele_*, dig_transit_*
 */
function scorerAxeDigestif(answers: Record<string, any>): ScoreAxeEndobiogenique {
  const symptomesCles: string[] = [];
  let hypoTotal = 0, hypoMax = 0;
  let hyperTotal = 0, hyperMax = 0;

  // === INSUFFISANCE DIGESTIVE ===
  const lourdeur = scaleToPercent(answers.dig_estomac_lourdeur);
  if (lourdeur > 50) {
    hypoTotal += lourdeur * 2;
    symptomesCles.push("Lourdeur estomac (hypochlorhydrie)");
  }
  hypoMax += 200;

  const graisses = scaleToPercent(answers.dig_foie_graisses);
  if (graisses > 50) {
    hypoTotal += graisses * 3;
    symptomesCles.push("Mal digestion des graisses (insuffisance biliaire)");
  }
  hypoMax += 300;

  const somnolence = scaleToPercent(answers.dig_pancreas_somnolence);
  if (somnolence > 50) {
    hypoTotal += somnolence * 3;
    symptomesCles.push("Somnolence post-prandiale (fatigue pancréas)");
  }
  hypoMax += 300;

  const constipation = scaleToPercent(answers.dig_transit_constipation);
  if (constipation > 50) {
    hypoTotal += constipation * 2;
    symptomesCles.push("Constipation");
  }
  hypoMax += 200;

  // === SUR-SOLLICITATION / IRRITATION ===
  const reflux = scaleToPercent(answers.dig_estomac_reflux);
  if (reflux > 50) {
    hyperTotal += reflux * 2;
    symptomesCles.push("RGO / brûlures gastriques");
  }
  hyperMax += 200;

  const eructations = scaleToPercent(answers.dig_estomac_eructations);
  if (eructations > 50) {
    hyperTotal += eructations * 1;
    symptomesCles.push("Éructations");
  }
  hyperMax += 100;

  const reveilFoie = scaleToPercent(answers.dig_foie_reveil_nocturne);
  if (reveilFoie > 50) {
    hyperTotal += reveilFoie * 2;
    symptomesCles.push("Réveil 1h-3h (surcharge hépatique)");
  }
  hyperMax += 200;

  const boucheAmere = scaleToPercent(answers.dig_foie_bouche_amere);
  if (boucheAmere > 50) {
    hyperTotal += boucheAmere * 1;
    symptomesCles.push("Bouche amère le matin");
  }
  hyperMax += 100;

  const ballonnementImmediat = scaleToPercent(answers.dig_grele_ballonnement_immediat);
  if (ballonnementImmediat > 50) {
    hyperTotal += ballonnementImmediat * 2;
    symptomesCles.push("Ballonnement immédiat (SIBO)");
  }
  hyperMax += 200;

  const ballonnementTardif = scaleToPercent(answers.dig_colon_ballonnement_tardif);
  if (ballonnementTardif > 50) {
    hyperTotal += ballonnementTardif * 2;
    symptomesCles.push("Ballonnements tardifs (putréfaction colique)");
  }
  hyperMax += 200;

  const spasmes = scaleToPercent(answers.dig_douleurs_spasmes);
  if (spasmes > 50) {
    hyperTotal += spasmes * 2;
    symptomesCles.push("Spasmes abdominaux");
  }
  hyperMax += 200;

  const diarrhee = scaleToPercent(answers.dig_transit_diarrhee);
  if (diarrhee > 50) {
    hyperTotal += diarrhee * 2;
    symptomesCles.push("Selles molles / diarrhée");
  }
  hyperMax += 200;

  const intolerances = scaleToPercent(answers.dig_intolerances);
  if (intolerances > 50) {
    hyperTotal += intolerances * 2;
    symptomesCles.push("Intolérances alimentaires (Leaky Gut)");
  }
  hyperMax += 200;

  // Normalisation
  const hypoNorm = hypoMax > 0 ? (hypoTotal / hypoMax) * 100 : 0;
  const hyperNorm = hyperMax > 0 ? (hyperTotal / hyperMax) * 100 : 0;

  return {
    insuffisance: Math.round(hypoNorm),
    surSollicitation: Math.round(hyperNorm),
    orientation: determinerOrientation(hypoNorm, hyperNorm),
    intensite: Math.round(Math.max(hypoNorm, hyperNorm) / 10),
    description: genererDescriptionDigestif(hypoNorm, hyperNorm),
    confiance: calculerConfiance(answers, 13),
    symptomesCles
  };
}

/**
 * AXE IMMUNO-INFLAMMATOIRE
 * IDs: immu_infections_hiver, immu_rhinite_saison, immu_douleurs_articulaires, etc.
 */
function scorerAxeImmuno(answers: Record<string, any>): ScoreAxeEndobiogenique {
  const symptomesCles: string[] = [];
  let hypoTotal = 0, hypoMax = 0;
  let hyperTotal = 0, hyperMax = 0;

  // === INSUFFISANCE IMMUNITAIRE (Th1 faible) ===
  const infections = scaleToPercent(answers.immu_infections_hiver);
  if (infections > 50) {
    hypoTotal += infections * 3;
    symptomesCles.push("Infections récidivantes (immunité faible)");
  }
  hypoMax += 300;

  const convalescence = scaleToPercent(answers.immu_convalescence);
  if (convalescence > 50) {
    hypoTotal += convalescence * 2;
    symptomesCles.push("Convalescence longue");
  }
  hypoMax += 200;

  const viralLatent = scaleToPercent(answers.immu_viral_latent);
  if (viralLatent > 50) {
    hypoTotal += viralLatent * 3;
    symptomesCles.push("Herpès/Zona au stress (réactivation virale)");
  }
  hypoMax += 300;

  const sinusites = scaleToPercent(answers.immu_sinusites);
  if (sinusites > 50) {
    hypoTotal += sinusites * 2;
    symptomesCles.push("Sinusites récidivantes");
  }
  hypoMax += 200;

  const angines = scaleToPercent(answers.immu_angines);
  if (angines > 50) {
    hypoTotal += angines * 2;
    symptomesCles.push("Angines à répétition");
  }
  hypoMax += 200;

  // === SUR-SOLLICITATION / INFLAMMATION (Th2 / auto-immunité) ===
  const rhinite = scaleToPercent(answers.immu_rhinite_saison);
  if (rhinite > 50) {
    hyperTotal += rhinite * 2;
    symptomesCles.push("Rhinite allergique (terrain Th2)");
  }
  hyperMax += 200;

  const eczema = scaleToPercent(answers.immu_eczema_atopique);
  if (eczema > 50) {
    hyperTotal += eczema * 2;
    symptomesCles.push("Eczéma / urticaire (atopie)");
  }
  hyperMax += 200;

  const intolAlim = scaleToPercent(answers.immu_intolerance_alim);
  if (intolAlim > 50) {
    hyperTotal += intolAlim * 2;
    symptomesCles.push("Intolérances alimentaires multiples");
  }
  hyperMax += 200;

  const douleursArt = scaleToPercent(answers.immu_douleurs_articulaires);
  if (douleursArt > 50) {
    hyperTotal += douleursArt * 3;
    symptomesCles.push("Douleurs articulaires inflammatoires");
  }
  hyperMax += 300;

  const fatigueChr = scaleToPercent(answers.immu_fatigue_chronique);
  if (fatigueChr > 50) {
    hyperTotal += fatigueChr * 2;
    symptomesCles.push("Fatigue chronique inexpliquée (inflammation silencieuse)");
  }
  hyperMax += 200;

  if (boolToScore(answers.immu_maladie_auto_immune) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Maladie auto-immune diagnostiquée");
  }
  hyperMax += 300;

  if (boolToScore(answers.immu_vaccins_reactions) > 0) {
    hyperTotal += 100;
    symptomesCles.push("Réactions vaccinales fortes");
  }
  hyperMax += 100;

  // Normalisation
  const hypoNorm = hypoMax > 0 ? (hypoTotal / hypoMax) * 100 : 0;
  const hyperNorm = hyperMax > 0 ? (hyperTotal / hyperMax) * 100 : 0;

  return {
    insuffisance: Math.round(hypoNorm),
    surSollicitation: Math.round(hyperNorm),
    orientation: determinerOrientation(hypoNorm, hyperNorm),
    intensite: Math.round(Math.max(hypoNorm, hyperNorm) / 10),
    description: genererDescriptionImmuno(hypoNorm, hyperNorm),
    confiance: calculerConfiance(answers, 12),
    symptomesCles
  };
}

// ========================================
// DÉTECTION DES TERRAINS PATHOLOGIQUES
// ========================================
// Utilise les questions dédiées du fichier terrains-pathologiques.ts
// en complément des questions des axes standards

function detecterTerrains(
  scores: ScoringResultV3["axes"],
  answers: Record<string, Record<string, any>>
): TerrainDetecte[] {
  const terrains: TerrainDetecte[] = [];
  const terrainsAnswers = answers.terrains || {};

  // === TERRAIN ATOPIQUE ===
  const immunoHyper = scores.immuno?.surSollicitation || 0;
  const hasAllergies =
    scaleToPercent(answers.immuno?.immu_rhinite_saison) > 50 ||
    scaleToPercent(answers.immuno?.immu_eczema_atopique) > 50;
  // Nouvelles questions dédiées terrains
  const hasAsthme = boolToScore(terrainsAnswers.terrain_atopique_asthme) > 0;
  const hasAtcdFamiliaux = boolToScore(terrainsAnswers.terrain_atopique_antecedents_familiaux) > 0;
  const hasSensibChimique = scaleToPercent(terrainsAnswers.terrain_atopique_reactif_chimique) > 50;
  const hasYeuxPrurigineux = scaleToPercent(terrainsAnswers.terrain_atopique_yeux_prurigineux) > 50;

  const atopicScore = Math.round(
    (immunoHyper * 0.4) +
    (hasAllergies ? 20 : 0) +
    (hasAsthme ? 25 : 0) +
    (hasAtcdFamiliaux ? 15 : 0) +
    (hasSensibChimique ? 10 : 0) +
    (hasYeuxPrurigineux ? 10 : 0)
  );

  if (atopicScore > 30) {
    const indicateurs: string[] = ["Terrain Th2 dominant"];
    if (hasAllergies) indicateurs.push("Allergies cutanées/respiratoires");
    if (hasAsthme) indicateurs.push("Asthme (actuel ou passé)");
    if (hasAtcdFamiliaux) indicateurs.push("Antécédents familiaux atopiques");
    if (hasSensibChimique) indicateurs.push("Sensibilité chimique multiple");

    terrains.push({
      terrain: "atopique",
      score: Math.min(atopicScore, 100),
      indicateurs,
      axesImpliques: ["immuno", "adaptatif", "digestif"]
    });
  }

  // === TERRAIN AUTO-IMMUN ===
  const autoImmun = boolToScore(answers.immuno?.immu_maladie_auto_immune) > 0;
  const adaptatifHypo = scores.adaptatif?.insuffisance || 0;
  // Nouvelles questions dédiées
  const hasAtcdAutoImmun = boolToScore(terrainsAnswers.terrain_autoimmun_atcd_familiaux) > 0;
  const hasSyndromeSec = scaleToPercent(terrainsAnswers.terrain_autoimmun_secheresse_yeux_bouche) > 50;
  const hasRaideurMatinale = scaleToPercent(terrainsAnswers.terrain_autoimmun_raideur_matinale) > 50;
  const hasAphtes = scaleToPercent(terrainsAnswers.terrain_autoimmun_ulceres_buccaux) > 50;
  const hasPhotosens = scaleToPercent(terrainsAnswers.terrain_autoimmun_photosensibilite) > 50;

  const autoImmunScore = Math.round(
    (autoImmun ? 50 : 0) +
    (adaptatifHypo * 0.3) +
    (hasAtcdAutoImmun ? 15 : 0) +
    (hasSyndromeSec ? 15 : 0) +
    (hasRaideurMatinale ? 20 : 0) +
    (hasAphtes ? 10 : 0) +
    (hasPhotosens ? 10 : 0)
  );

  if (autoImmunScore > 30 || autoImmun) {
    const indicateurs: string[] = [];
    if (autoImmun) indicateurs.push("Maladie auto-immune diagnostiquée");
    if (adaptatifHypo > 40) indicateurs.push("Cortisol insuffisant");
    if (hasRaideurMatinale) indicateurs.push("Raideur matinale inflammatoire (> 30 min)");
    if (hasSyndromeSec) indicateurs.push("Syndrome sec (Sjögren ?)");
    if (hasPhotosens) indicateurs.push("Photosensibilité (lupus ?)");
    if (indicateurs.length === 0) indicateurs.push("Terrain inflammatoire Th1/Th17");

    terrains.push({
      terrain: "auto_immun",
      score: Math.min(autoImmunScore, 100),
      indicateurs,
      axesImpliques: ["immuno", "adaptatif"]
    });
  }

  // === TERRAIN SPASMOPHILE ===
  const neuroHyper = scores.neuro?.surSollicitation || 0;
  const hasPalpitations = scaleToPercent(answers.neuro?.neuro_beta_palpitations) > 50;
  const hasTremblements = scaleToPercent(answers.neuro?.neuro_beta_tremblements) > 50;
  // Nouvelles questions dédiées
  const hasCrampes = scaleToPercent(terrainsAnswers.terrain_spasmo_crampes) > 50;
  const hasPaupiere = scaleToPercent(terrainsAnswers.terrain_spasmo_paupiere) > 50;
  const hasOppression = scaleToPercent(terrainsAnswers.terrain_spasmo_oppression) > 50;
  const hasHypervent = scaleToPercent(terrainsAnswers.terrain_spasmo_hyperventilation) > 50;
  const hasSensibBruit = scaleToPercent(terrainsAnswers.terrain_spasmo_sensibilite_bruit) > 50;

  const spasmoScore = Math.round(
    (neuroHyper * 0.3) +
    (hasPalpitations ? 15 : 0) +
    (hasTremblements ? 10 : 0) +
    (hasCrampes ? 20 : 0) +
    (hasPaupiere ? 10 : 0) +
    (hasOppression ? 20 : 0) +
    (hasHypervent ? 20 : 0) +
    (hasSensibBruit ? 10 : 0)
  );

  if (spasmoScore > 30) {
    const indicateurs: string[] = ["Dystonie neurovégétative"];
    if (hasCrampes || hasPaupiere) indicateurs.push("Déficit magnésien probable");
    if (hasOppression) indicateurs.push("Oppression thoracique fonctionnelle");
    if (hasHypervent) indicateurs.push("Hyperventilation / Tétanie latente");
    if (hasSensibBruit) indicateurs.push("Hypersensibilité sensorielle");

    terrains.push({
      terrain: "spasmophile",
      score: Math.min(spasmoScore, 100),
      indicateurs,
      axesImpliques: ["neuro", "adaptatif"]
    });
  }

  // === TERRAIN CONGESTIF ===
  const digestifHyper = scores.digestif?.surSollicitation || 0;
  const hasCongestioFoie =
    scaleToPercent(answers.digestif?.dig_foie_reveil_nocturne) > 50 ||
    scaleToPercent(answers.digestif?.dig_foie_graisses) > 50;
  // Nouvelles questions dédiées
  const hasJambesLourdes = scaleToPercent(terrainsAnswers.terrain_congestif_jambes_lourdes) > 50;
  const hasHemoroides = boolToScore(terrainsAnswers.terrain_congestif_hemoroides) > 0;
  const hasCephaleesDigest = scaleToPercent(terrainsAnswers.terrain_congestif_cephalees_digestives) > 50;
  const hasLangueChargee = scaleToPercent(terrainsAnswers.terrain_congestif_langue_chargee) > 50;
  const hasTeintBrouille = scaleToPercent(terrainsAnswers.terrain_congestif_teint_brouille) > 50;

  const congestifScore = Math.round(
    (digestifHyper * 0.3) +
    (hasCongestioFoie ? 20 : 0) +
    (hasJambesLourdes ? 15 : 0) +
    (hasHemoroides ? 25 : 0) +
    (hasCephaleesDigest ? 15 : 0) +
    (hasLangueChargee ? 10 : 0) +
    (hasTeintBrouille ? 10 : 0)
  );

  if (congestifScore > 30) {
    const indicateurs: string[] = ["Congestion hépato-splanchnique"];
    if (hasHemoroides) indicateurs.push("Hypertension portale relative (hémorroïdes/varices)");
    if (hasJambesLourdes) indicateurs.push("Stase veineuse périphérique");
    if (hasCephaleesDigest) indicateurs.push("Céphalées hépato-digestives");
    if (hasLangueChargee || hasTeintBrouille) indicateurs.push("Surcharge toxémique");

    terrains.push({
      terrain: "congestif",
      score: Math.min(congestifScore, 100),
      indicateurs,
      axesImpliques: ["digestif", "neuro"]
    });
  }

  // === TERRAIN MÉTABOLIQUE ===
  const somatoHypo = scores.somato?.insuffisance || 0;
  const hasGraisseAbdo = scaleToPercent(answers.somato?.soma_graisse_abdo) > 50;
  const hasHypoGlycemies =
    scaleToPercent(answers.somato?.soma_faim_matin) > 50 ||
    scaleToPercent(answers.adaptatif?.cortico_coup_pompe) > 50;
  // Nouvelles questions dédiées
  const hasGraisseAbdoTerrain = scaleToPercent(terrainsAnswers.terrain_metabo_graisse_abdominale) > 50;
  const hasEnvieSucre = scaleToPercent(terrainsAnswers.terrain_metabo_sucre_envie) > 50;
  const hasSoifUrines = scaleToPercent(terrainsAnswers.terrain_metabo_soif_urines) > 50;
  const hasAcanthosis = boolToScore(terrainsAnswers.terrain_metabo_acanthosis) > 0;
  const hasGlycemieElevee = boolToScore(terrainsAnswers.terrain_metabo_glycemie_elevee) > 0;

  const metaboScore = Math.round(
    (somatoHypo * 0.2) +
    (hasGraisseAbdo || hasGraisseAbdoTerrain ? 20 : 0) +
    (hasHypoGlycemies ? 10 : 0) +
    (hasEnvieSucre ? 15 : 0) +
    (hasSoifUrines ? 20 : 0) +
    (hasAcanthosis ? 25 : 0) +
    (hasGlycemieElevee ? 25 : 0)
  );

  if (metaboScore > 30) {
    const indicateurs: string[] = ["Insulino-résistance probable"];
    if (hasGraisseAbdo || hasGraisseAbdoTerrain) indicateurs.push("Adiposité abdominale");
    if (hasEnvieSucre) indicateurs.push("Envies sucrées (dysglycémie)");
    if (hasSoifUrines) indicateurs.push("Polyurie-polydipsie (pré-diabète ?)");
    if (hasAcanthosis) indicateurs.push("Acanthosis nigricans (pathognomonique)");
    if (hasGlycemieElevee) indicateurs.push("Glycémie limite connue");

    terrains.push({
      terrain: "metabolique",
      score: Math.min(metaboScore, 100),
      indicateurs,
      axesImpliques: ["somato", "digestif", "adaptatif"]
    });
  }

  // === TERRAIN DÉGÉNÉRATIF ===
  // Questions dédiées uniquement
  const hasMemoire = scaleToPercent(terrainsAnswers.terrain_degeneratif_memoire) > 50;
  const hasPeauRelach = scaleToPercent(terrainsAnswers.terrain_degeneratif_peau_relachement) > 50;
  const hasArthrose = scaleToPercent(terrainsAnswers.terrain_degeneratif_douleurs_articulaires_usure) > 50;
  const hasOsteoporose = boolToScore(terrainsAnswers.terrain_degeneratif_osteoporose_fractures) > 0;

  const degeneratifScore = Math.round(
    (hasMemoire ? 20 : 0) +
    (hasPeauRelach ? 15 : 0) +
    (hasArthrose ? 25 : 0) +
    (hasOsteoporose ? 40 : 0)
  );

  if (degeneratifScore > 30) {
    const indicateurs: string[] = ["Vieillissement accéléré"];
    if (hasMemoire) indicateurs.push("Déclin cognitif");
    if (hasArthrose) indicateurs.push("Arthrose mécanique");
    if (hasOsteoporose) indicateurs.push("Ostéopénie / Ostéoporose");
    if (hasPeauRelach) indicateurs.push("Dégradation tissulaire (collagène)");

    terrains.push({
      terrain: "degeneratif",
      score: Math.min(degeneratifScore, 100),
      indicateurs,
      axesImpliques: ["somato", "thyro", "gonado"]
    });
  }

  return terrains.sort((a, b) => b.score - a.score);
}

// ========================================
// GÉNÉRATEURS DE DESCRIPTIONS
// ========================================

function genererDescriptionNeuro(hypo: number, hyper: number): string {
  if (hypo < 20 && hyper < 20) return "Équilibre neurovégétatif préservé";
  if (hyper > hypo + 20) return "Hyperactivité sympathique (alpha et/ou bêta) - Terrain spasmophile probable";
  if (hypo > hyper + 20) return "Hypotonie vagale - Déficit de récupération";
  return "Instabilité neurovégétative - Alternance sympathique/parasympathique";
}

function genererDescriptionAdaptatif(hypo: number, hyper: number): string {
  if (hypo < 20 && hyper < 20) return "Capacité d'adaptation préservée";
  if (hypo > 50) return "Insuffisance corticotrope - Épuisement surrénalien probable";
  if (hyper > 50) return "Hypercorticisme fonctionnel - Risque d'épuisement à moyen terme";
  return "Fragilité adaptative modérée";
}

function genererDescriptionThyro(hypo: number, hyper: number): string {
  if (hypo < 20 && hyper < 20) return "Fonction thyroïdienne équilibrée";
  if (hypo > hyper + 20) return "Hypothyroïdie fonctionnelle - Hypométabolisme";
  if (hyper > hypo + 20) return "Hyperthyroïdie fonctionnelle - Hypermétabolisme";
  return "Instabilité thyroïdienne fonctionnelle";
}

function genererDescriptionGonado(hypo: number, hyper: number, sexe: "H" | "F"): string {
  if (hypo < 20 && hyper < 20) return "Équilibre gonadotrope préservé";
  if (sexe === "F") {
    if (hyper > hypo + 20) return "Hyperoestrogénie relative - Dominance œstrogènes";
    if (hypo > hyper + 20) return "Insuffisance gonadotrope - Hypo-œstrogénie";
    return "Déséquilibre œstrogènes/progestérone";
  } else {
    if (hypo > hyper + 20) return "Hypoandrogénie - Insuffisance testostérone";
    if (hyper > hypo + 20) return "Congestion prostatique - DHT élevée";
    return "Déséquilibre androgénique";
  }
}

function genererDescriptionSomato(hypo: number, hyper: number): string {
  if (hypo < 20 && hyper < 20) return "Axe somatotrope équilibré";
  if (hypo > 30) return "Insuffisance somatotrope - Déficit GH/IGF-1 fonctionnel";
  return "Légère perturbation de l'axe somatotrope";
}

function genererDescriptionDigestif(hypo: number, hyper: number): string {
  if (hypo < 20 && hyper < 20) return "Fonction digestive équilibrée";
  if (hypo > hyper + 20) return "Insuffisance digestive - Hypochlorhydrie / Insuffisance biliaire";
  if (hyper > hypo + 20) return "Irritation digestive - Hyperacidité / Dysbiose";
  return "Instabilité digestive - Terrain mixte";
}

function genererDescriptionImmuno(hypo: number, hyper: number): string {
  if (hypo < 20 && hyper < 20) return "Immunité équilibrée";
  if (hypo > hyper + 20) return "Déficit immunitaire relatif - Susceptibilité infectieuse";
  if (hyper > hypo + 20) return "Hyperréactivité immunitaire - Terrain atopique ou inflammatoire";
  return "Instabilité immunitaire - Balance Th1/Th2 perturbée";
}

function calculerConfiance(answers: Record<string, any>, totalQuestions: number): number {
  if (!answers) return 0;
  const answered = Object.values(answers).filter(v => v !== undefined && v !== null && v !== "").length;
  return Math.min(answered / totalQuestions, 1);
}

// ========================================
// FONCTION PRINCIPALE
// ========================================

export function calculateClinicalScoresV3(
  answersByAxis: Record<string, Record<string, any>>,
  sexe: "H" | "F"
): ScoringResultV3 {
  const axes: ScoringResultV3["axes"] = {};

  // Scorer chaque axe
  if (answersByAxis.neuro && Object.keys(answersByAxis.neuro).length > 0) {
    axes.neuro = scorerAxeNeuro(answersByAxis.neuro);
  }

  if (answersByAxis.adaptatif && Object.keys(answersByAxis.adaptatif).length > 0) {
    axes.adaptatif = scorerAxeAdaptatif(answersByAxis.adaptatif);
  }

  if (answersByAxis.thyro && Object.keys(answersByAxis.thyro).length > 0) {
    axes.thyro = scorerAxeThyro(answersByAxis.thyro);
  }

  if (answersByAxis.gonado && Object.keys(answersByAxis.gonado).length > 0) {
    axes.gonado = scorerAxeGonado(answersByAxis.gonado, sexe);
  }

  if (answersByAxis.somato && Object.keys(answersByAxis.somato).length > 0) {
    axes.somato = scorerAxeSomato(answersByAxis.somato);
  }

  if (answersByAxis.digestif && Object.keys(answersByAxis.digestif).length > 0) {
    axes.digestif = scorerAxeDigestif(answersByAxis.digestif);
  }

  if (answersByAxis.immuno && Object.keys(answersByAxis.immuno).length > 0) {
    axes.immuno = scorerAxeImmuno(answersByAxis.immuno);
  }

  // Détecter terrains pathologiques
  const terrainsDetectes = detecterTerrains(axes, answersByAxis);

  // Générer synthèse globale
  const terrainPrincipal = terrainsDetectes.length > 0 ? terrainsDetectes[0].terrain : null;

  // Trouver l'axe le plus perturbé
  let axePrioritaire: string | null = null;
  let maxIntensity = 0;
  for (const [key, score] of Object.entries(axes)) {
    if (score && score.intensite > maxIntensity) {
      maxIntensity = score.intensite;
      axePrioritaire = key;
    }
  }

  // Évaluer capacité d'adaptation
  const adaptatif = axes.adaptatif;
  let capaciteAdaptation: ScoringResultV3["syntheseGlobale"]["capaciteAdaptation"] = "bonne";
  if (adaptatif) {
    if (adaptatif.insuffisance > 60) capaciteAdaptation = "epuisee";
    else if (adaptatif.insuffisance > 40) capaciteAdaptation = "faible";
    else if (adaptatif.insuffisance > 20) capaciteAdaptation = "moderee";
  }

  // Recommandations
  const recommandationsPrioritaires: string[] = [];
  if (capaciteAdaptation === "epuisee") {
    recommandationsPrioritaires.push("Soutien corticotrope URGENT (adaptogènes : Éleuthérocoque, Rhodiola)");
  }
  if (terrainsDetectes.some(t => t.terrain === "spasmophile")) {
    recommandationsPrioritaires.push("Magnésium + régulation SNA (Passiflore, Mélisse)");
  }
  if (terrainsDetectes.some(t => t.terrain === "atopique")) {
    recommandationsPrioritaires.push("Ribes nigrum MG + drainage hépatique");
  }
  if (terrainsDetectes.some(t => t.terrain === "congestif")) {
    recommandationsPrioritaires.push("Drainage hépatique PRIORITAIRE (Romarin, Artichaut)");
  }

  return {
    axes,
    terrainsDetectes,
    syntheseGlobale: {
      terrainPrincipal,
      axePrioritaire,
      capaciteAdaptation,
      risqueSpasmophilie: terrainsDetectes.some(t => t.terrain === "spasmophile"),
      recommandationsPrioritaires
    }
  };
}
