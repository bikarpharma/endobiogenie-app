/**
 * MOTEUR DE SCORING CLINIQUE V3 - CORRIGÉ
 * ========================================
 *
 * Ce fichier calcule les scores cliniques pour chaque axe endobiogénique
 * basé sur les réponses aux questionnaires.
 *
 * CORRECTION MAJEURE (Décembre 2024) :
 * Les IDs des questions correspondent maintenant exactement aux fichiers de config :
 * - axe-neuro.ts : neuro_para_*, neuro_alpha_*, neuro_beta_*, neuro_spasmophilie, etc.
 * - axe-adaptatif.ts : cortico_*
 * - axe-thyro.ts : thyro_*
 * - axe-gonado.ts : gona_f_*, gona_h_*, gona_*
 * - axe-somato.ts : somato_*
 * - axe-digestif.ts : dig_*
 * - axe-immuno.ts : immuno_*
 * - axe-terrains-pathologiques.ts : terr_*
 */

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
  if (value === true || value === "oui" || value === "true" || value === "Oui") return scoreIfTrue;
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
 * IDs VRAIS: neuro_para_*, neuro_alpha_*, neuro_beta_*, neuro_sommeil_*, neuro_spasmophilie, etc.
 */
function scorerAxeNeuro(answers: Record<string, any>): ScoreAxeEndobiogenique {
  const symptomesCles: string[] = [];
  let hypoTotal = 0, hypoMax = 0;
  let hyperTotal = 0, hyperMax = 0;

  // === PARASYMPATHIQUE (hypertonie = hyper) ===
  // neuro_para_crise_vagale (select)
  if (answers.neuro_para_crise_vagale) {
    const val = typeof answers.neuro_para_crise_vagale === "string"
      ? ["Jamais", "1-2 fois dans ma vie", "Plusieurs fois", "Fréquemment"].indexOf(answers.neuro_para_crise_vagale) * 33.3
      : scaleToPercent(answers.neuro_para_crise_vagale);
    if (val > 33) {
      hyperTotal += val * 3;
      symptomesCles.push("Crises vagales (malaises)");
    }
    hyperMax += 300;
  }

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

  const paraBallonnement = scaleToPercent(answers.neuro_para_ballonnement);
  if (paraBallonnement > 50) {
    hyperTotal += paraBallonnement * 2;
    symptomesCles.push("Ballonnements/aérophagie (vagotonie)");
  }
  hyperMax += 200;

  const paraSueursNuit = scaleToPercent(answers.neuro_para_sueurs_nuit);
  if (paraSueursNuit > 50) {
    hyperTotal += paraSueursNuit * 2;
    symptomesCles.push("Sueurs de première partie de nuit");
  }
  hyperMax += 200;

  const paraDiarrhee = scaleToPercent(answers.neuro_para_diarrhee);
  if (paraDiarrhee > 50) {
    hyperTotal += paraDiarrhee * 2;
    symptomesCles.push("Transit accéléré / diarrhée");
  }
  hyperMax += 200;

  if (boolToScore(answers.neuro_para_bradycardie) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Bradycardie de repos (<60 bpm)");
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

  const alphaMydriase = scaleToPercent(answers.neuro_alpha_mydriase);
  if (alphaMydriase > 50) {
    hyperTotal += alphaMydriase * 2;
    symptomesCles.push("Pupilles dilatées / photosensibilité");
  }
  hyperMax += 200;

  const alphaVigilance = scaleToPercent(answers.neuro_alpha_vigilance);
  if (alphaVigilance > 50) {
    hyperTotal += alphaVigilance * 2;
    symptomesCles.push("Hypervigilance chronique");
  }
  hyperMax += 200;

  if (boolToScore(answers.neuro_alpha_tension) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Hypertension artérielle");
  }
  hyperMax += 200;

  const alphaBruxisme = scaleToPercent(answers.neuro_alpha_bruxisme);
  if (alphaBruxisme > 50) {
    hyperTotal += alphaBruxisme * 2;
    symptomesCles.push("Bruxisme (serrement de dents)");
  }
  hyperMax += 200;

  if (boolToScore(answers.neuro_alpha_raynaud) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Syndrome de Raynaud");
  }
  hyperMax += 200;

  // === SYMPATHIQUE BÊTA (réactivité cardiaque = hyper) ===
  const betaPalpitations = scaleToPercent(answers.neuro_beta_palpitations);
  if (betaPalpitations > 50) {
    hyperTotal += betaPalpitations * 3;
    symptomesCles.push("Palpitations (hyper-réactivité bêta)");
  }
  hyperMax += 300;

  const betaBouffeesChaleur = scaleToPercent(answers.neuro_beta_bouffees_chaleur);
  if (betaBouffeesChaleur > 50) {
    hyperTotal += betaBouffeesChaleur * 2;
    symptomesCles.push("Bouffées de chaleur soudaines");
  }
  hyperMax += 200;

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

  const betaHypoglycemie = scaleToPercent(answers.neuro_beta_hypoglycemie);
  if (betaHypoglycemie > 50) {
    hyperTotal += betaHypoglycemie * 2;
    symptomesCles.push("Malaises hypoglycémiques");
  }
  hyperMax += 200;

  // Bêta HYPO (insuffisant)
  const betaLibidoBasse = scaleToPercent(answers.neuro_beta_libido_basse);
  if (betaLibidoBasse > 50) {
    hypoTotal += betaLibidoBasse * 2;
    symptomesCles.push("Absence de libido/désir (bêta insuffisant)");
  }
  hypoMax += 200;

  const betaFatigueInitiative = scaleToPercent(answers.neuro_beta_fatigue_initiative);
  if (betaFatigueInitiative > 50) {
    hypoTotal += betaFatigueInitiative * 2;
    symptomesCles.push("Manque d'élan/initiative");
  }
  hypoMax += 200;

  if (boolToScore(answers.neuro_beta_bronchospasme) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Tendance aux bronchospasmes/asthme");
  }
  hypoMax += 200;

  // === SOMMEIL ===
  const sommeilEndormissement = scaleToPercent(answers.neuro_sommeil_endormissement);
  if (sommeilEndormissement > 50) {
    hyperTotal += sommeilEndormissement * 2;
    symptomesCles.push("Difficulté d'endormissement (alpha persistant)");
  }
  hyperMax += 200;

  const reveilNocturne = scaleToPercent(answers.neuro_reveil_nocturne);
  if (reveilNocturne > 50) {
    hyperTotal += reveilNocturne * 2;
    symptomesCles.push("Réveil nocturne 3h-5h (décharge adrénergique)");
  }
  hyperMax += 200;

  const reveil1h3h = scaleToPercent(answers.neuro_reveil_1h_3h);
  if (reveil1h3h > 50) {
    hyperTotal += reveil1h3h * 2;
    symptomesCles.push("Réveil 1h-3h (congestion hépatique)");
  }
  hyperMax += 200;

  const reves = scaleToPercent(answers.neuro_reves);
  if (reves > 50) {
    hyperTotal += reves * 2;
    symptomesCles.push("Rêves vifs/cauchemars (TRH élevée)");
  }
  hyperMax += 200;

  // === SPASMOPHILIE ===
  if (answers.neuro_spasmophilie) {
    const val = typeof answers.neuro_spasmophilie === "string"
      ? ["Jamais", "1-2 fois dans ma vie", "Plusieurs fois", "Régulièrement"].indexOf(answers.neuro_spasmophilie) * 33.3
      : scaleToPercent(answers.neuro_spasmophilie);
    if (val > 33) {
      hyperTotal += val * 3;
      symptomesCles.push("Crises de tétanie/spasmophilie");
    }
    hyperMax += 300;
  }

  const fourmillements = scaleToPercent(answers.neuro_fourmillements);
  if (fourmillements > 50) {
    hyperTotal += fourmillements * 2;
    symptomesCles.push("Paresthésies (fourmillements)");
  }
  hyperMax += 200;

  const oppressionThoracique = scaleToPercent(answers.neuro_oppression_thoracique);
  if (oppressionThoracique > 50) {
    hyperTotal += oppressionThoracique * 2;
    symptomesCles.push("Oppression thoracique");
  }
  hyperMax += 200;

  const crampesNocturnes = scaleToPercent(answers.neuro_crampes_nocturnes);
  if (crampesNocturnes > 50) {
    hyperTotal += crampesNocturnes * 2;
    symptomesCles.push("Crampes nocturnes");
  }
  hyperMax += 200;

  const anxieteAnticipation = scaleToPercent(answers.neuro_anxiete_anticipation);
  if (anxieteAnticipation > 50) {
    hyperTotal += anxieteAnticipation * 2;
    symptomesCles.push("Anxiété d'anticipation");
  }
  hyperMax += 200;

  // === AUTACOÏDES ===
  if (boolToScore(answers.neuro_histamine_allergies) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Allergies/réactions histaminiques");
  }
  hyperMax += 200;

  const histaminePrurit = scaleToPercent(answers.neuro_histamine_prurit);
  if (histaminePrurit > 50) {
    hyperTotal += histaminePrurit * 1;
    symptomesCles.push("Prurit fréquent");
  }
  hyperMax += 100;

  const serotoninHumeur = scaleToPercent(answers.neuro_serotonine_humeur);
  if (serotoninHumeur > 50) {
    hypoTotal += serotoninHumeur * 2;
    symptomesCles.push("Troubles de l'humeur (sérotonine basse)");
  }
  hypoMax += 200;

  const serotoninImpulsivite = scaleToPercent(answers.neuro_serotonine_impulsivite);
  if (serotoninImpulsivite > 50) {
    hypoTotal += serotoninImpulsivite * 2;
    symptomesCles.push("Impulsivité/TCA");
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
    description: genererDescriptionNeuro(hypoNorm, hyperNorm),
    confiance: calculerConfiance(answers, "neuro_"),
    symptomesCles
  };
}

/**
 * AXE CORTICOTROPE (Adaptatif)
 * IDs VRAIS: cortico_fatigue_matin, cortico_coup_pompe, cortico_sel, cortico_reveil_precoce, etc.
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
    hypoTotal += coupPompe * 3;
    symptomesCles.push("Coups de pompe 11h/17h (hypoglycémie)");
  }
  hypoMax += 300;

  const endurance = scaleToPercent(answers.cortico_endurance);
  if (endurance > 50) {
    hypoTotal += endurance * 2;
    symptomesCles.push("Manque d'endurance (épuisement surrénalien)");
  }
  hypoMax += 200;

  const fatigueChronique = scaleToPercent(answers.cortico_fatigue_chronique);
  if (fatigueChronique > 50) {
    hypoTotal += fatigueChronique * 3;
    symptomesCles.push("Fatigue chronique non améliorée par repos");
  }
  hypoMax += 300;

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

  const infectionsRecidivantes = scaleToPercent(answers.cortico_infections_recidivantes);
  if (infectionsRecidivantes > 50) {
    hypoTotal += infectionsRecidivantes * 3;
    symptomesCles.push("Infections récidivantes (terrain précritique)");
  }
  hypoMax += 300;

  if (boolToScore(answers.cortico_allergies) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Allergies aggravées au stress");
  }
  hypoMax += 200;

  const libido = scaleToPercent(answers.cortico_libido);
  if (libido > 50) {
    hypoTotal += libido * 2;
    symptomesCles.push("Baisse de libido (DHEA insuffisante)");
  }
  hypoMax += 200;

  const irritabiliteFaim = scaleToPercent(answers.cortico_irritabilite_faim);
  if (irritabiliteFaim > 50) {
    hypoTotal += irritabiliteFaim * 2;
    symptomesCles.push("Irritabilité à jeun (hypoglycémie surrénalienne)");
  }
  hypoMax += 200;

  const bruit = scaleToPercent(answers.cortico_bruit);
  if (bruit > 50) {
    hypoTotal += bruit * 2;
    symptomesCles.push("Hypersensibilité bruit/lumière (épuisement adaptatif)");
  }
  hypoMax += 200;

  const anhedonie = scaleToPercent(answers.cortico_anhedonie);
  if (anhedonie > 50) {
    hypoTotal += anhedonie * 3;
    symptomesCles.push("Anhédonie (manque de plaisir)");
  }
  hypoMax += 300;

  const difficulteAdaptation = scaleToPercent(answers.cortico_difficulte_adaptation);
  if (difficulteAdaptation > 50) {
    hypoTotal += difficulteAdaptation * 3;
    symptomesCles.push("Difficulté d'adaptation aux changements");
  }
  hypoMax += 300;

  const stressChronique = scaleToPercent(answers.cortico_stress_chronique);
  if (stressChronique > 50) {
    hypoTotal += stressChronique * 3;
    symptomesCles.push("Stress chronique (épuisement surrénalien)");
  }
  hypoMax += 300;

  const recuperationStress = scaleToPercent(answers.cortico_recuperation_stress);
  if (recuperationStress > 50) {
    hypoTotal += recuperationStress * 2;
    symptomesCles.push("Récupération lente après stress");
  }
  hypoMax += 200;

  if (boolToScore(answers.cortico_aggravation_automne_hiver) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Aggravation automne/hiver");
  }
  hypoMax += 200;

  // === SUR-SOLLICITATION CORTICOTROPE (cortisol élevé / ACTH élevée) ===
  const reveilPrecoce = scaleToPercent(answers.cortico_reveil_precoce);
  if (reveilPrecoce > 50) {
    hyperTotal += reveilPrecoce * 3;
    symptomesCles.push("Réveil précoce 3-5h (ACTH élevée)");
  }
  hyperMax += 300;

  const oedemes = scaleToPercent(answers.cortico_oedemes);
  if (oedemes > 50) {
    hyperTotal += oedemes * 3;
    symptomesCles.push("Œdèmes (rétention hydrosodée)");
  }
  hyperMax += 300;

  const cicatrisation = scaleToPercent(answers.cortico_cicatrisation);
  if (cicatrisation > 50) {
    hyperTotal += cicatrisation * 2;
    symptomesCles.push("Cicatrisation lente (cortisol élevé)");
  }
  hyperMax += 200;

  const ecchymoses = scaleToPercent(answers.cortico_ecchymoses);
  if (ecchymoses > 50) {
    hyperTotal += ecchymoses * 2;
    symptomesCles.push("Ecchymoses faciles (fragilité capillaire)");
  }
  hyperMax += 200;

  if (answers.cortico_herpes_recidivant) {
    const val = typeof answers.cortico_herpes_recidivant === "string"
      ? ["Jamais", "Rarement (<1/an)", "Parfois (1-3/an)", "Souvent (>3/an)", "Très souvent"].indexOf(answers.cortico_herpes_recidivant) * 25
      : scaleToPercent(answers.cortico_herpes_recidivant);
    if (val > 25) {
      hyperTotal += val * 2;
      symptomesCles.push("Herpès récidivant (immunosuppression cortisol)");
    }
    hyperMax += 200;
  }

  if (boolToScore(answers.cortico_stries_violacees) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Stries violacées (hypercorticisme)");
  }
  hyperMax += 300;

  if (boolToScore(answers.cortico_acne_dos) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Acné du dos (ACTH élevée)");
  }
  hyperMax += 200;

  if (boolToScore(answers.cortico_eczema_plis) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Eczéma aux plis (ACTH élevée)");
  }
  hyperMax += 200;

  if (boolToScore(answers.cortico_peau_fine) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Peau fine et fragile");
  }
  hyperMax += 200;

  if (boolToScore(answers.cortico_visage_lunaire) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Visage rond/bouffi");
  }
  hyperMax += 200;

  const prisePoidsAbdominale = scaleToPercent(answers.cortico_prise_poids_abdominale);
  if (prisePoidsAbdominale > 50) {
    hyperTotal += prisePoidsAbdominale * 3;
    symptomesCles.push("Adiposité abdominale");
  }
  hyperMax += 300;

  const faiblesseMusculaire = scaleToPercent(answers.cortico_faiblesse_musculaire);
  if (faiblesseMusculaire > 50) {
    hyperTotal += faiblesseMusculaire * 3;
    symptomesCles.push("Faiblesse musculaire proximale");
  }
  hyperMax += 300;

  const irritabiliteAgressivite = scaleToPercent(answers.cortico_irritabilite_agressivite);
  if (irritabiliteAgressivite > 50) {
    hyperTotal += irritabiliteAgressivite * 2;
    symptomesCles.push("Irritabilité/agressivité");
  }
  hyperMax += 200;

  const douleurFosseIliaque = scaleToPercent(answers.cortico_douleur_fosse_iliaque);
  if (douleurFosseIliaque > 50) {
    hyperTotal += douleurFosseIliaque * 2;
    symptomesCles.push("Douleurs fosse iliaque droite (ACTH élevée)");
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
    confiance: calculerConfiance(answers, "cortico_"),
    symptomesCles
  };
}

/**
 * AXE THYRÉOTROPE
 * IDs VRAIS: thyro_metabolisme_general, thyro_frilosite, thyro_intolerance_chaleur, etc.
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

  if (boolToScore(answers.thyro_hypoglycemie) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Hypoglycémies (TSH basse)");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_ralentissement_general) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Fonctionnement au ralenti");
  }
  hypoMax += 300;

  if (boolToScore(answers.thyro_difficultes_concentration) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Brouillard cérébral");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_fatigue_chronique) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Fatigue chronique (TSH basse)");
  }
  hypoMax += 300;

  if (boolToScore(answers.thyro_fibromyalgie) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Fibromyalgie");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_craintif) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Caractère craintif");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_depression_saisonniere) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Dépression saisonnière");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_hypersomnie) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Hypersomnie (>10h)");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_cheveux_secs) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Cheveux secs/cassants");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_sourcils_externes) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Perte tiers externe sourcils (signe Hertoghe)");
  }
  hypoMax += 300;

  if (boolToScore(answers.thyro_ongles_cassants) > 0) {
    hypoTotal += 100;
    symptomesCles.push("Ongles fragiles");
  }
  hypoMax += 100;

  if (boolToScore(answers.thyro_peau_seche) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Peau sèche");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_myxoedeme) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Myxœdème (gonflement)");
  }
  hypoMax += 300;

  if (boolToScore(answers.thyro_oedeme_chevilles) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Œdème chevilles");
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

  if (boolToScore(answers.thyro_regles_abondantes) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Règles abondantes (thyroïde insuffisante)");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_goitre) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Goitre (TSH élevée compensatoire)");
  }
  hypoMax += 300;

  if (boolToScore(answers.thyro_amygdales_hypertrophie) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Amygdales volumineuses");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_voix_rauque) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Voix rauque");
  }
  hypoMax += 200;

  if (boolToScore(answers.thyro_hashimoto) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Thyroïdite de Hashimoto");
  }
  hypoMax += 300;

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

  if (boolToScore(answers.thyro_reves_intenses) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Rêves intenses (TRH élevée)");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_cauchemars) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Cauchemars fréquents");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_rumination) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Ruminations mentales");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_sursaut) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Sursauts faciles");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_reveil_nocturne) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Réveils nocturnes fréquents");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_insomnie) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Insomnie (TRH élevée)");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_paume_rouge) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Paumes rouges (érythème palmaire)");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_appetit_augmente) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Appétit augmenté sans prise de poids");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_perte_poids_appetit) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Perte de poids malgré bon appétit");
  }
  hyperMax += 300;

  if (boolToScore(answers.thyro_diarrhee) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Transit accéléré / diarrhées");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_tachycardie_repos) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Tachycardie au repos");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_palpitations) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Palpitations");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_tremblements) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Tremblements fins des mains");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_faiblesse_musculaire) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Faiblesse/fonte musculaire");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_osteoporose) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Ostéoporose");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_regles_courtes) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Règles courtes/peu abondantes");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_spm_irritabilite) > 0) {
    hyperTotal += 200;
    symptomesCles.push("SPM avec irritabilité");
  }
  hyperMax += 200;

  if (boolToScore(answers.thyro_exophtalmie) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Exophtalmie (Basedow)");
  }
  hyperMax += 300;

  if (boolToScore(answers.thyro_basedow) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Maladie de Basedow");
  }
  hyperMax += 300;

  // Normalisation
  const hypoNorm = hypoMax > 0 ? (hypoTotal / hypoMax) * 100 : 0;
  const hyperNorm = hyperMax > 0 ? (hyperTotal / hyperMax) * 100 : 0;

  return {
    insuffisance: Math.round(hypoNorm),
    surSollicitation: Math.round(hyperNorm),
    orientation: determinerOrientation(hypoNorm, hyperNorm),
    intensite: Math.round(Math.max(hypoNorm, hyperNorm) / 10),
    description: genererDescriptionThyro(hypoNorm, hyperNorm),
    confiance: calculerConfiance(answers, "thyro_"),
    symptomesCles
  };
}

/**
 * AXE GONADOTROPE
 * IDs VRAIS: gona_f_* (femme), gona_h_* (homme), gona_* (commun)
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

    const secheresse = scaleToPercent(answers.gona_f_menopause_secheresse);
    if (secheresse > 50) {
      hypoTotal += secheresse * 2;
      symptomesCles.push("Sécheresse vaginale");
    }
    hypoMax += 200;

    if (boolToScore(answers.gona_f_herpes_post_regles) > 0) {
      hypoTotal += 200;
      symptomesCles.push("Herpès en post-menstruel (hypo-œstrogénie)");
    }
    hypoMax += 200;

    // === FEMME : SUR-SOLLICITATION (hyperoestrogénie) ===
    const reglesDoul = scaleToPercent(answers.gona_f_regles_douloureuses);
    if (reglesDoul > 50) {
      hyperTotal += reglesDoul * 2;
      symptomesCles.push("Dysménorrhée");
    }
    hyperMax += 200;

    const fluxAbondant = scaleToPercent(answers.gona_f_flux_abondant);
    if (fluxAbondant > 50) {
      hyperTotal += fluxAbondant * 3;
      symptomesCles.push("Flux abondant / caillots (hyperoestrogénie)");
    }
    hyperMax += 300;

    const spotting = scaleToPercent(answers.gona_f_spotting);
    if (spotting > 50) {
      hyperTotal += spotting * 2;
      symptomesCles.push("Spotting intermenstruel");
    }
    hyperMax += 200;

    const pmsSeins = scaleToPercent(answers.gona_f_pms_seins);
    if (pmsSeins > 50) {
      hyperTotal += pmsSeins * 2;
      symptomesCles.push("Mastodynies prémenstruelles");
    }
    hyperMax += 200;

    if (boolToScore(answers.gona_f_seins_fibrokystiques) > 0) {
      hyperTotal += 200;
      symptomesCles.push("Seins fibrokystiques");
    }
    hyperMax += 200;

    const pmsEmotionnel = scaleToPercent(answers.gona_f_pms_emotionnel);
    if (pmsEmotionnel > 50) {
      hyperTotal += pmsEmotionnel * 2;
      symptomesCles.push("SPM émotionnel");
    }
    hyperMax += 200;

    const pmsRetention = scaleToPercent(answers.gona_f_pms_retention);
    if (pmsRetention > 50) {
      hyperTotal += pmsRetention * 2;
      symptomesCles.push("Rétention prémenstruelle");
    }
    hyperMax += 200;

  } else {
    // === HOMME : INSUFFISANCE (hypo-androgénie) ===
    const libido = scaleToPercent(answers.gona_h_libido);
    if (libido > 50) {
      hypoTotal += libido * 3;
      symptomesCles.push("Baisse libido (hypo-androgénie)");
    }
    hypoMax += 300;

    const erectionMatinale = scaleToPercent(answers.gona_h_erection_matinale);
    // Inversé: jamais = hypo
    if (erectionMatinale < 50) {
      hypoTotal += (100 - erectionMatinale) * 3;
      symptomesCles.push("Absence d'érections matinales");
    }
    hypoMax += 300;

    const qualiteErection = scaleToPercent(answers.gona_h_qualite_erection);
    if (qualiteErection > 50) {
      hypoTotal += qualiteErection * 2;
      symptomesCles.push("Troubles de l'érection");
    }
    hypoMax += 200;

    const ejaculation = scaleToPercent(answers.gona_h_ejaculation);
    if (ejaculation > 50) {
      hypoTotal += ejaculation * 2;
      symptomesCles.push("Troubles de l'éjaculation");
    }
    hypoMax += 200;

    const musculaire = scaleToPercent(answers.gona_h_musculaire);
    if (musculaire > 50) {
      hypoTotal += musculaire * 2;
      symptomesCles.push("Fonte musculaire");
    }
    hypoMax += 200;

    if (boolToScore(answers.gona_h_voix) > 0) {
      hypoTotal += 100;
      symptomesCles.push("Modification voix");
    }
    hypoMax += 100;

    // === HOMME : SUR-SOLLICITATION (prostate) ===
    if (boolToScore(answers.gona_h_gynecomastie) > 0) {
      hyperTotal += 200;
      symptomesCles.push("Gynécomastie");
    }
    hyperMax += 200;

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

  const varices = scaleToPercent(answers.gona_varices);
  if (varices > 50) {
    hyperTotal += varices * 2;
    symptomesCles.push("Varices / varicosités");
  }
  hyperMax += 200;

  const retentionEau = scaleToPercent(answers.gona_retention_eau);
  if (retentionEau > 50) {
    hyperTotal += retentionEau * 2;
    symptomesCles.push("Rétention d'eau cyclique");
  }
  hyperMax += 200;

  const fatigueCyclique = scaleToPercent(answers.gona_fatigue_cyclique);
  if (fatigueCyclique > 50) {
    hypoTotal += fatigueCyclique * 2;
    symptomesCles.push("Fatigue cyclique");
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
    description: genererDescriptionGonado(hypoNorm, hyperNorm, sexe),
    confiance: calculerConfiance(answers, "gona_"),
    symptomesCles
  };
}

/**
 * AXE SOMATOTROPE (GH/IGF-1)
 * IDs VRAIS: somato_* (somato_croissance_rapide, somato_envies_sucre, etc.)
 */
function scorerAxeSomato(answers: Record<string, any>): ScoreAxeEndobiogenique {
  const symptomesCles: string[] = [];
  let hypoTotal = 0, hypoMax = 0;
  let hyperTotal = 0, hyperMax = 0;

  // === HYPERFONCTIONNEMENT SOMATOTROPE (GH élevée, prolactine) ===
  if (boolToScore(answers.somato_croissance_rapide) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Croissance rapide enfance");
  }
  hyperMax += 300;

  if (boolToScore(answers.somato_grande_taille) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Grande taille");
  }
  hyperMax += 200;

  if (boolToScore(answers.somato_ossature_large) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Ossature large");
  }
  hyperMax += 200;

  if (boolToScore(answers.somato_pieds_plats) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Pieds plats");
  }
  hyperMax += 200;

  if (boolToScore(answers.somato_hallux_valgus) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Hallux valgus");
  }
  hyperMax += 200;

  if (boolToScore(answers.somato_cicatrices_cheloides) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Cicatrices chéloïdes (GH élevée)");
  }
  hyperMax += 300;

  const enviesSucre = scaleToPercent(answers.somato_envies_sucre);
  if (enviesSucre > 50) {
    hyperTotal += enviesSucre * 3;
    symptomesCles.push("Envies de sucre impérieuses");
  }
  hyperMax += 300;

  const somnolencePostprandiale = scaleToPercent(answers.somato_somnolence_postprandiale);
  if (somnolencePostprandiale > 50) {
    hyperTotal += somnolencePostprandiale * 2;
    symptomesCles.push("Somnolence post-prandiale");
  }
  hyperMax += 200;

  if (boolToScore(answers.somato_adiposite_proximale) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Adiposité proximale (haut corps)");
  }
  hyperMax += 300;

  const prisePoidsF = scaleToPercent(answers.somato_prise_poids_facile);
  if (prisePoidsF > 50) {
    hyperTotal += prisePoidsF * 2;
    symptomesCles.push("Prise de poids facile");
  }
  hyperMax += 200;

  if (boolToScore(answers.somato_amygdales_hypertrophiees) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Amygdales hypertrophiées");
  }
  hyperMax += 300;

  const sinusites = scaleToPercent(answers.somato_sinusites_recurrentes);
  if (sinusites > 50) {
    hyperTotal += sinusites * 2;
    symptomesCles.push("Sinusites récurrentes");
  }
  hyperMax += 200;

  if (boolToScore(answers.somato_langue_empreinte_dents) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Langue avec empreintes de dents");
  }
  hyperMax += 200;

  const aphtes = scaleToPercent(answers.somato_aphtes_frequents);
  if (aphtes > 50) {
    hyperTotal += aphtes * 2;
    symptomesCles.push("Aphtes fréquents");
  }
  hyperMax += 200;

  if (boolToScore(answers.somato_polypes_kystes) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Polypes / kystes");
  }
  hyperMax += 300;

  if (boolToScore(answers.somato_lipomes) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Lipomes");
  }
  hyperMax += 200;

  const furoncles = scaleToPercent(answers.somato_furoncles);
  if (furoncles > 50) {
    hyperTotal += furoncles * 3;
    symptomesCles.push("Furoncles récidivants");
  }
  hyperMax += 300;

  if (boolToScore(answers.somato_keratose_pilaire) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Kératose pilaire");
  }
  hyperMax += 200;

  const sensationFroid = scaleToPercent(answers.somato_sensation_froid);
  if (sensationFroid > 50) {
    hyperTotal += sensationFroid * 3;
    symptomesCles.push("Sensation de froid (hypothyroïdie relative)");
  }
  hyperMax += 300;

  // === HYPOFONCTIONNEMENT SOMATOTROPE (GH basse) ===
  const hypoglycemie = scaleToPercent(answers.somato_hypoglycemie);
  if (hypoglycemie > 50) {
    hypoTotal += hypoglycemie * 3;
    symptomesCles.push("Hypoglycémies");
  }
  hypoMax += 300;

  const retardCicatrisation = scaleToPercent(answers.somato_retard_cicatrisation);
  if (retardCicatrisation > 50) {
    hypoTotal += retardCicatrisation * 2;
    symptomesCles.push("Cicatrisation lente");
  }
  hypoMax += 200;

  const fatigueGenerale = scaleToPercent(answers.somato_fatigue_generale);
  if (fatigueGenerale > 50) {
    hypoTotal += fatigueGenerale * 3;
    symptomesCles.push("Fatigue générale");
  }
  hypoMax += 300;

  if (boolToScore(answers.somato_fibromyalgie) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Fibromyalgie");
  }
  hypoMax += 300;

  if (boolToScore(answers.somato_maladies_autoimmunes) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Maladies auto-immunes");
  }
  hypoMax += 300;

  // Normalisation
  const hypoNorm = hypoMax > 0 ? (hypoTotal / hypoMax) * 100 : 0;
  const hyperNorm = hyperMax > 0 ? (hyperTotal / hyperMax) * 100 : 0;

  return {
    insuffisance: Math.round(hypoNorm),
    surSollicitation: Math.round(hyperNorm),
    orientation: determinerOrientation(hypoNorm, hyperNorm),
    intensite: Math.round(Math.max(hypoNorm, hyperNorm) / 10),
    description: genererDescriptionSomato(hypoNorm, hyperNorm),
    confiance: calculerConfiance(answers, "somato_"),
    symptomesCles
  };
}

/**
 * AXE DIGESTIF
 * IDs VRAIS: dig_estomac_*, dig_foie_*, dig_pancreas_*, dig_grele_*, dig_colon_*, dig_postprandial_*
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

  // dig_foie_graisses (select)
  if (answers.dig_foie_graisses) {
    const val = typeof answers.dig_foie_graisses === "string"
      ? ["Non, je digère bien les graisses", "Légère lourdeur après repas gras", "Nausées avec les fritures", "Intolérance totale aux graisses (selles grasses, diarrhées)", "Douleur sous les côtes droites après repas gras"].indexOf(answers.dig_foie_graisses) * 25
      : 0;
    if (val > 25) {
      hypoTotal += val * 3;
      symptomesCles.push("Mal digestion des graisses (insuffisance biliaire)");
    }
    hypoMax += 300;
  }

  // dig_foie_appetit_matin (select)
  if (answers.dig_foie_appetit_matin) {
    const val = typeof answers.dig_foie_appetit_matin === "string"
      ? ["Oui, bon appétit dès le réveil", "Appétit modéré, je mange par habitude", "Peu d'appétit, je saute souvent le petit-déjeuner", "Jamais faim le matin, voire dégoût alimentaire", "Nausées matinales à la vue de la nourriture"].indexOf(answers.dig_foie_appetit_matin) * 25
      : 0;
    if (val > 25) {
      hyperTotal += val * 3;
      symptomesCles.push("Pas d'appétit le matin (congestion hépatique)");
    }
    hyperMax += 300;
  }

  const ballonnementPancreas = scaleToPercent(answers.dig_pancreas_ballonnement_immediat);
  if (ballonnementPancreas > 50) {
    hypoTotal += ballonnementPancreas * 3;
    symptomesCles.push("Ballonnement immédiat (insuffisance pancréatique)");
  }
  hypoMax += 300;

  if (boolToScore(answers.dig_pancreas_selles_flottantes) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Selles flottantes graisseuses");
  }
  hypoMax += 300;

  if (boolToScore(answers.dig_pancreas_aliments_visibles) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Aliments non digérés dans les selles");
  }
  hypoMax += 200;

  if (boolToScore(answers.dig_postprandial_reflux_lipides) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Reflux après repas gras");
  }
  hypoMax += 200;

  if (boolToScore(answers.dig_postprandial_cicatrisation) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Troubles cicatrisation post-repas");
  }
  hypoMax += 200;

  // === SUR-SOLLICITATION / IRRITATION ===
  // dig_estomac_rgo (select)
  if (answers.dig_estomac_rgo) {
    const val = typeof answers.dig_estomac_rgo === "string"
      ? ["Jamais", "Occasionnellement après excès", "Régulièrement (plusieurs fois/semaine)", "Quotidiennement", "Avec régurgitations ou toux nocturne"].indexOf(answers.dig_estomac_rgo) * 25
      : scaleToPercent(answers.dig_estomac_rgo);
    if (val > 25) {
      hyperTotal += val * 2;
      symptomesCles.push("RGO / brûlures gastriques");
    }
    hyperMax += 200;
  }

  const nausees = scaleToPercent(answers.dig_estomac_nausees);
  if (nausees > 50) {
    hyperTotal += nausees * 2;
    symptomesCles.push("Nausées fréquentes");
  }
  hyperMax += 200;

  if (boolToScore(answers.dig_estomac_gout_persistant) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Goût persistant en bouche");
  }
  hypoMax += 200;

  const reveilFoie = scaleToPercent(answers.dig_foie_reveil_nocturne);
  if (reveilFoie > 50) {
    hyperTotal += reveilFoie * 2;
    symptomesCles.push("Réveil 1h-3h (surcharge hépatique)");
  }
  hyperMax += 200;

  const boucheAmere = scaleToPercent(answers.dig_foie_bouche_amere);
  if (boucheAmere > 50) {
    hyperTotal += boucheAmere * 2;
    symptomesCles.push("Bouche amère le matin");
  }
  hyperMax += 200;

  if (boolToScore(answers.dig_foie_frissons) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Frissons (congestion hépatique)");
  }
  hyperMax += 200;

  if (boolToScore(answers.dig_foie_prurit) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Prurit (démangeaisons)");
  }
  hyperMax += 200;

  const somnolencePancreas = scaleToPercent(answers.dig_pancreas_somnolence);
  if (somnolencePancreas > 50) {
    hyperTotal += somnolencePancreas * 3;
    symptomesCles.push("Somnolence post-prandiale (fatigue pancréas)");
  }
  hyperMax += 300;

  if (boolToScore(answers.dig_pancreas_sinusites) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Sinusites récurrentes (pancréas)");
  }
  hyperMax += 200;

  const ballonnementGrele = scaleToPercent(answers.dig_grele_ballonnement_10min);
  if (ballonnementGrele > 50) {
    hyperTotal += ballonnementGrele * 3;
    symptomesCles.push("Ballonnement <10min (SIBO)");
  }
  hyperMax += 300;

  if (boolToScore(answers.dig_grele_gaz_inodores) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Gaz inodores (fermentation grêle)");
  }
  hyperMax += 200;

  if (boolToScore(answers.dig_grele_selles_explosives) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Selles explosives");
  }
  hyperMax += 200;

  if (boolToScore(answers.dig_grele_post_antibio) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Troubles post-antibiotiques");
  }
  hyperMax += 200;

  const ballonnementColon = scaleToPercent(answers.dig_colon_ballonnement_tardif);
  if (ballonnementColon > 50) {
    hyperTotal += ballonnementColon * 3;
    symptomesCles.push("Ballonnements tardifs (putréfaction colique)");
  }
  hyperMax += 300;

  if (boolToScore(answers.dig_colon_gaz_odorants) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Gaz odorants (putréfaction)");
  }
  hyperMax += 200;

  const spasmes = scaleToPercent(answers.dig_colon_spasmes);
  if (spasmes > 50) {
    hyperTotal += spasmes * 2;
    symptomesCles.push("Spasmes coliques");
  }
  hyperMax += 200;

  if (boolToScore(answers.dig_colon_alternance) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Alternance constipation/diarrhée");
  }
  hyperMax += 200;

  if (boolToScore(answers.dig_colon_mucus) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Mucus dans les selles");
  }
  hyperMax += 200;

  const froidPostprandial = scaleToPercent(answers.dig_postprandial_froid);
  if (froidPostprandial > 50) {
    hyperTotal += froidPostprandial * 3;
    symptomesCles.push("Froid post-prandial (insuffisance thyroïdienne)");
  }
  hyperMax += 300;

  const fatigueGlucides = scaleToPercent(answers.dig_postprandial_fatigue_glucides);
  if (fatigueGlucides > 50) {
    hyperTotal += fatigueGlucides * 3;
    symptomesCles.push("Fatigue après glucides (hyperinsulinisme)");
  }
  hyperMax += 300;

  const pruritAnus = scaleToPercent(answers.dig_anus_prurit);
  if (pruritAnus > 50) {
    hyperTotal += pruritAnus * 2;
    symptomesCles.push("Prurit anal");
  }
  hyperMax += 200;

  if (boolToScore(answers.dig_anus_fissures) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Fissures anales");
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
    confiance: calculerConfiance(answers, "dig_"),
    symptomesCles
  };
}

/**
 * AXE IMMUNO-INFLAMMATOIRE
 * IDs VRAIS: immuno_infections_recidivantes, immuno_allergies, immuno_autoimmune, etc.
 */
function scorerAxeImmuno(answers: Record<string, any>): ScoreAxeEndobiogenique {
  const symptomesCles: string[] = [];
  let hypoTotal = 0, hypoMax = 0;
  let hyperTotal = 0, hyperMax = 0;

  // === INSUFFISANCE IMMUNITAIRE (infections récidivantes, immunité faible) ===
  const infectionsRecidivantes = scaleToPercent(answers.immuno_infections_recidivantes);
  if (infectionsRecidivantes > 50) {
    hypoTotal += infectionsRecidivantes * 3;
    symptomesCles.push("Infections récidivantes");
  }
  hypoMax += 300;

  const anginesRepetition = scaleToPercent(answers.immuno_angines_repetition);
  if (anginesRepetition > 50) {
    hypoTotal += anginesRepetition * 3;
    symptomesCles.push("Angines à répétition");
  }
  hypoMax += 300;

  if (boolToScore(answers.immuno_otites_repetition) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Otites à répétition");
  }
  hypoMax += 200;

  const sinusites = scaleToPercent(answers.immuno_sinusites_recurrentes);
  if (sinusites > 50) {
    hypoTotal += sinusites * 2;
    symptomesCles.push("Sinusites récurrentes");
  }
  hypoMax += 200;

  const bronchites = scaleToPercent(answers.immuno_bronchites_recurrentes);
  if (bronchites > 50) {
    hypoTotal += bronchites * 3;
    symptomesCles.push("Bronchites récurrentes");
  }
  hypoMax += 300;

  const cystites = scaleToPercent(answers.immuno_cystites_recurrentes);
  if (cystites > 50) {
    hypoTotal += cystites * 2;
    symptomesCles.push("Cystites récurrentes");
  }
  hypoMax += 200;

  const herpes = scaleToPercent(answers.immuno_herpes);
  if (herpes > 50) {
    hypoTotal += herpes * 3;
    symptomesCles.push("Herpès récidivant");
  }
  hypoMax += 300;

  if (boolToScore(answers.immuno_zona) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Antécédent de zona");
  }
  hypoMax += 300;

  const mycoses = scaleToPercent(answers.immuno_mycoses);
  if (mycoses > 50) {
    hypoTotal += mycoses * 3;
    symptomesCles.push("Mycoses récidivantes");
  }
  hypoMax += 300;

  if (boolToScore(answers.immuno_verrues) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Verrues récidivantes");
  }
  hypoMax += 200;

  const fatigueInfection = scaleToPercent(answers.immuno_fatigue_infection);
  if (fatigueInfection > 50) {
    hypoTotal += fatigueInfection * 3;
    symptomesCles.push("Fatigue importante pendant/après infections");
  }
  hypoMax += 300;

  const guerisonLente = scaleToPercent(answers.immuno_guerison_lente);
  if (guerisonLente > 50) {
    hypoTotal += guerisonLente * 3;
    symptomesCles.push("Guérison lente des infections");
  }
  hypoMax += 300;

  if (boolToScore(answers.immuno_fievre_rare) > 0) {
    hypoTotal += 300;
    symptomesCles.push("Absence de fièvre lors d'infections (immunité insuffisante)");
  }
  hypoMax += 300;

  const cicatrisationLente = scaleToPercent(answers.immuno_cicatrisation_lente);
  if (cicatrisationLente > 50) {
    hypoTotal += cicatrisationLente * 3;
    symptomesCles.push("Cicatrisation lente / plaies infectées");
  }
  hypoMax += 300;

  if (boolToScore(answers.immuno_lymphocytes_bas) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Lymphocytes bas");
  }
  hypoMax += 200;

  if (boolToScore(answers.immuno_creux_suprasternal) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Sensibilité creux sus-sternal (thymus congestif)");
  }
  hypoMax += 200;

  const stressDeclencheur = scaleToPercent(answers.immuno_stress_declencheur);
  if (stressDeclencheur > 50) {
    hypoTotal += stressDeclencheur * 2;
    symptomesCles.push("Infections déclenchées par le stress");
  }
  hypoMax += 200;

  if (boolToScore(answers.immuno_antibiotiques_frequents) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Antibiotiques fréquents (>2x/an)");
  }
  hypoMax += 200;

  const convalescenceLongue = scaleToPercent(answers.immuno_convalescence_longue);
  if (convalescenceLongue > 50) {
    hypoTotal += convalescenceLongue * 2;
    symptomesCles.push("Convalescence prolongée");
  }
  hypoMax += 200;

  if (boolToScore(answers.immuno_vitamine_d_basse) > 0) {
    hypoTotal += 200;
    symptomesCles.push("Carence en vitamine D");
  }
  hypoMax += 200;

  const sommeilMauvais = scaleToPercent(answers.immuno_sommeil_mauvais);
  if (sommeilMauvais > 50) {
    hypoTotal += sommeilMauvais * 2;
    symptomesCles.push("Mauvais sommeil");
  }
  hypoMax += 200;

  // === HYPERFONCTIONNEMENT IMMUNITAIRE (allergies, auto-immunité, inflammation) ===
  if (boolToScore(answers.immuno_fievre_elevee) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Fièvre élevée pour infections mineures");
  }
  hyperMax += 200;

  const ganglions = scaleToPercent(answers.immuno_ganglions);
  if (ganglions > 50) {
    hyperTotal += ganglions * 2;
    symptomesCles.push("Ganglions palpables/douloureux");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_amygdales_grosses) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Amygdales volumineuses");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_rate_grosse) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Splénomégalie");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_vegetations) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Végétations adénoïdes");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_allergies) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Allergies (terrain Th2)");
  }
  hyperMax += 300;

  if (boolToScore(answers.immuno_eczema) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Eczéma");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_asthme) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Asthme");
  }
  hyperMax += 200;

  const urticaire = scaleToPercent(answers.immuno_urticaire);
  if (urticaire > 50) {
    hyperTotal += urticaire * 2;
    symptomesCles.push("Urticaire");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_atopie_familiale) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Terrain atopique familial");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_intolerances) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Intolérances alimentaires");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_autoimmune) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Maladie auto-immune");
  }
  hyperMax += 300;

  if (boolToScore(answers.immuno_autoimmune_familiale) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Auto-immunité familiale");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_thyroidite) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Thyroïdite auto-immune");
  }
  hyperMax += 300;

  if (boolToScore(answers.immuno_declenchement_peripartum) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Auto-immunité péri-partum");
  }
  hyperMax += 200;

  const douleursArticulaires = scaleToPercent(answers.immuno_douleurs_articulaires);
  if (douleursArticulaires > 50) {
    hyperTotal += douleursArticulaires * 2;
    symptomesCles.push("Douleurs articulaires chroniques");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_raideur_matinale) > 0) {
    hyperTotal += 300;
    symptomesCles.push("Raideur matinale >30min (auto-immunité)");
  }
  hyperMax += 300;

  if (boolToScore(answers.immuno_crp_elevee) > 0) {
    hyperTotal += 200;
    symptomesCles.push("CRP élevée (inflammation)");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_vs_elevee) > 0) {
    hyperTotal += 200;
    symptomesCles.push("VS élevée");
  }
  hyperMax += 200;

  const spasmophilie = scaleToPercent(answers.immuno_spasmophilie);
  if (spasmophilie > 50) {
    hyperTotal += spasmophilie * 2;
    symptomesCles.push("Spasmophilie");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_dermographisme) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Dermographisme");
  }
  hyperMax += 200;

  if (boolToScore(answers.immuno_alimentation_aggravation) > 0) {
    hyperTotal += 200;
    symptomesCles.push("Aggravation par certains aliments");
  }
  hyperMax += 200;

  const mucusExcessif = scaleToPercent(answers.immuno_mucus_excessif);
  if (mucusExcessif > 50) {
    hyperTotal += mucusExcessif * 2;
    symptomesCles.push("Mucus excessif");
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
    description: genererDescriptionImmuno(hypoNorm, hyperNorm),
    confiance: calculerConfiance(answers, "immuno_"),
    symptomesCles
  };
}

// ========================================
// DÉTECTION DES TERRAINS PATHOLOGIQUES
// ========================================
// Utilise les questions dédiées du fichier terrains-pathologiques.ts (terr_*)
// en complément des questions des axes standards

function detecterTerrains(
  scores: ScoringResultV3["axes"],
  answers: Record<string, Record<string, any>>
): TerrainDetecte[] {
  const terrains: TerrainDetecte[] = [];
  const allAnswers = { ...answers.neuro, ...answers.adaptatif, ...answers.thyro, ...answers.gonado, ...answers.somato, ...answers.digestif, ...answers.immuno, ...answers.terrains };

  // === TERRAIN ATOPIQUE ===
  const immunoHyper = scores.immuno?.surSollicitation || 0;
  const hasAllergies = boolToScore(allAnswers.immuno_allergies) > 0;
  const hasEczema = boolToScore(allAnswers.immuno_eczema) > 0;
  const hasAsthme = boolToScore(allAnswers.immuno_asthme) > 0;
  const hasAtopieFamiliale = boolToScore(allAnswers.immuno_atopie_familiale) > 0;
  const hasAllergiesMultiples = scaleToPercent(allAnswers.terr_allergies_multiples) > 50;

  const atopicScore = Math.round(
    (immunoHyper * 0.4) +
    (hasAllergies ? 20 : 0) +
    (hasEczema ? 15 : 0) +
    (hasAsthme ? 25 : 0) +
    (hasAtopieFamiliale ? 15 : 0) +
    (hasAllergiesMultiples ? 20 : 0)
  );

  if (atopicScore > 30) {
    const indicateurs: string[] = ["Terrain Th2 dominant"];
    if (hasAllergies) indicateurs.push("Allergies cutanées/respiratoires");
    if (hasAsthme) indicateurs.push("Asthme");
    if (hasEczema) indicateurs.push("Eczéma");
    if (hasAtopieFamiliale) indicateurs.push("Antécédents familiaux atopiques");

    terrains.push({
      terrain: "atopique",
      score: Math.min(atopicScore, 100),
      indicateurs,
      axesImpliques: ["immuno", "adaptatif", "digestif"]
    });
  }

  // === TERRAIN AUTO-IMMUN ===
  const hasAutoImmune = boolToScore(allAnswers.immuno_autoimmune) > 0;
  const hasThyroidite = boolToScore(allAnswers.immuno_thyroidite) > 0;
  const hasRaideurMatinale = boolToScore(allAnswers.immuno_raideur_matinale) > 0;
  const hasAutoImmunFamiliale = boolToScore(allAnswers.immuno_autoimmune_familiale) > 0;
  const hasTerrautoImmun = allAnswers.terr_auto_immun && allAnswers.terr_auto_immun !== "Non";

  const autoImmunScore = Math.round(
    (hasAutoImmune ? 50 : 0) +
    (hasThyroidite ? 30 : 0) +
    (hasRaideurMatinale ? 25 : 0) +
    (hasAutoImmunFamiliale ? 15 : 0) +
    (hasTerrautoImmun ? 30 : 0)
  );

  if (autoImmunScore > 30 || hasAutoImmune) {
    const indicateurs: string[] = [];
    if (hasAutoImmune) indicateurs.push("Maladie auto-immune diagnostiquée");
    if (hasThyroidite) indicateurs.push("Thyroïdite auto-immune");
    if (hasRaideurMatinale) indicateurs.push("Raideur matinale inflammatoire (> 30 min)");
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
  const hasSpasmophilie = scaleToPercent(allAnswers.neuro_spasmophilie) > 50 || scaleToPercent(allAnswers.terr_spasmophilie) > 50;
  const hasFourmillements = scaleToPercent(allAnswers.neuro_fourmillements) > 50 || scaleToPercent(allAnswers.terr_paresthesies) > 50;
  const hasCrampesNocturnes = scaleToPercent(allAnswers.neuro_crampes_nocturnes) > 50;
  const hasOppression = scaleToPercent(allAnswers.neuro_oppression_thoracique) > 50;
  const hasAttaquesPanique = scaleToPercent(allAnswers.terr_attaques_panique) > 50;

  const spasmoScore = Math.round(
    (neuroHyper * 0.3) +
    (hasSpasmophilie ? 30 : 0) +
    (hasFourmillements ? 15 : 0) +
    (hasCrampesNocturnes ? 15 : 0) +
    (hasOppression ? 20 : 0) +
    (hasAttaquesPanique ? 25 : 0)
  );

  if (spasmoScore > 30) {
    const indicateurs: string[] = ["Dystonie neurovégétative"];
    if (hasSpasmophilie) indicateurs.push("Crises de tétanie/spasmophilie");
    if (hasFourmillements) indicateurs.push("Paresthésies");
    if (hasOppression) indicateurs.push("Oppression thoracique fonctionnelle");
    if (hasAttaquesPanique) indicateurs.push("Attaques de panique");

    terrains.push({
      terrain: "spasmophile",
      score: Math.min(spasmoScore, 100),
      indicateurs,
      axesImpliques: ["neuro", "adaptatif"]
    });
  }

  // === TERRAIN CONGESTIF ===
  const digestifHyper = scores.digestif?.surSollicitation || 0;
  const hasReveilFoie = scaleToPercent(allAnswers.dig_foie_reveil_nocturne) > 50;
  const hasBoucheAmere = scaleToPercent(allAnswers.dig_foie_bouche_amere) > 50;
  const hasReveil1h3h = scaleToPercent(allAnswers.neuro_reveil_1h_3h) > 50;
  const hasCongestionHepatique = scaleToPercent(allAnswers.terr_congestion_hepatique) > 50;
  const hasCongestionPelvienne = scaleToPercent(allAnswers.terr_congestion_pelvienne) > 50;

  const congestifScore = Math.round(
    (digestifHyper * 0.3) +
    (hasReveilFoie ? 20 : 0) +
    (hasBoucheAmere ? 15 : 0) +
    (hasReveil1h3h ? 20 : 0) +
    (hasCongestionHepatique ? 25 : 0) +
    (hasCongestionPelvienne ? 20 : 0)
  );

  if (congestifScore > 30) {
    const indicateurs: string[] = ["Congestion hépato-splanchnique"];
    if (hasReveilFoie || hasReveil1h3h) indicateurs.push("Réveil nocturne 1h-3h");
    if (hasBoucheAmere) indicateurs.push("Bouche amère matinale");
    if (hasCongestionPelvienne) indicateurs.push("Congestion pelvienne");

    terrains.push({
      terrain: "congestif",
      score: Math.min(congestifScore, 100),
      indicateurs,
      axesImpliques: ["digestif", "neuro"]
    });
  }

  // === TERRAIN MÉTABOLIQUE ===
  const somatoHyper = scores.somato?.surSollicitation || 0;
  const hasEnviesSucre = scaleToPercent(allAnswers.somato_envies_sucre) > 50;
  const hasSomnolencePostprandiale = scaleToPercent(allAnswers.somato_somnolence_postprandiale) > 50;
  const hasAdipositéProximale = boolToScore(allAnswers.somato_adiposite_proximale) > 0;
  const hasPrisePoidsAbdo = scaleToPercent(allAnswers.cortico_prise_poids_abdominale) > 50;
  const hasResistanceInsuline = scaleToPercent(allAnswers.terr_resistance_insuline) > 50;

  const metaboScore = Math.round(
    (somatoHyper * 0.2) +
    (hasEnviesSucre ? 20 : 0) +
    (hasSomnolencePostprandiale ? 15 : 0) +
    (hasAdipositéProximale ? 25 : 0) +
    (hasPrisePoidsAbdo ? 20 : 0) +
    (hasResistanceInsuline ? 25 : 0)
  );

  if (metaboScore > 30) {
    const indicateurs: string[] = ["Insulino-résistance probable"];
    if (hasAdipositéProximale || hasPrisePoidsAbdo) indicateurs.push("Adiposité abdominale");
    if (hasEnviesSucre) indicateurs.push("Envies sucrées (dysglycémie)");
    if (hasSomnolencePostprandiale) indicateurs.push("Somnolence post-prandiale");

    terrains.push({
      terrain: "metabolique",
      score: Math.min(metaboScore, 100),
      indicateurs,
      axesImpliques: ["somato", "digestif", "adaptatif"]
    });
  }

  // === TERRAIN INFLAMMATOIRE ===
  const hasDouleursArticulaires = scaleToPercent(allAnswers.immuno_douleurs_articulaires) > 50;
  const hasCRPElevee = boolToScore(allAnswers.immuno_crp_elevee) > 0;
  const hasVSElevee = boolToScore(allAnswers.immuno_vs_elevee) > 0;
  const hasInflammationChronique = scaleToPercent(allAnswers.terr_inflammation_chronique) > 50;

  const inflammatoireScore = Math.round(
    (hasDouleursArticulaires ? 25 : 0) +
    (hasCRPElevee ? 30 : 0) +
    (hasVSElevee ? 20 : 0) +
    (hasInflammationChronique ? 40 : 0)
  );

  if (inflammatoireScore > 30) {
    const indicateurs: string[] = ["Inflammation chronique bas grade"];
    if (hasDouleursArticulaires) indicateurs.push("Douleurs articulaires/musculaires");
    if (hasCRPElevee || hasVSElevee) indicateurs.push("Marqueurs inflammatoires élevés");

    terrains.push({
      terrain: "inflammatoire",
      score: Math.min(inflammatoireScore, 100),
      indicateurs,
      axesImpliques: ["immuno", "adaptatif"]
    });
  }

  // === TERRAIN DÉGÉNÉRATIF ===
  const hasTumeursBenignes = allAnswers.terr_tumeurs_benignes && allAnswers.terr_tumeurs_benignes !== "Non";
  const hasDegeneratif = scaleToPercent(allAnswers.terr_degeneratif) > 50;
  const hasOsteoporose = boolToScore(allAnswers.thyro_osteoporose) > 0 || boolToScore(allAnswers.somato_osteoporose) > 0;

  const degeneratifScore = Math.round(
    (hasTumeursBenignes ? 30 : 0) +
    (hasDegeneratif ? 40 : 0) +
    (hasOsteoporose ? 30 : 0)
  );

  if (degeneratifScore > 30) {
    const indicateurs: string[] = ["Vieillissement tissulaire"];
    if (hasTumeursBenignes) indicateurs.push("Tumeurs bénignes");
    if (hasOsteoporose) indicateurs.push("Ostéoporose");

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
  if (hyper > 40) return "Hyperactivité somatotrope - Terrain hyperinsulinique/prolifératif";
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

function calculerConfiance(answers: Record<string, any>, prefix: string): number {
  if (!answers) return 0;
  const allKeys = Object.keys(answers);
  const relevantKeys = allKeys.filter(k => k.startsWith(prefix));
  const answered = relevantKeys.filter(k => answers[k] !== undefined && answers[k] !== null && answers[k] !== "").length;
  return Math.min(answered / Math.max(relevantKeys.length, 1), 1);
}

// ========================================
// FONCTION PRINCIPALE
// ========================================

export function calculateClinicalScoresV3(
  answersByAxis: Record<string, Record<string, any>>,
  sexe: "H" | "F"
): ScoringResultV3 {
  const axes: ScoringResultV3["axes"] = {};

  // Fusionner toutes les réponses pour faciliter l'accès
  const allAnswers = {
    ...answersByAxis.neuro,
    ...answersByAxis.adaptatif,
    ...answersByAxis.thyro,
    ...answersByAxis.gonado,
    ...answersByAxis.somato,
    ...answersByAxis.digestif,
    ...answersByAxis.immuno,
    ...answersByAxis.terrains
  };

  // Scorer chaque axe avec les réponses fusionnées
  if (Object.keys(allAnswers).some(k => k.startsWith("neuro_"))) {
    axes.neuro = scorerAxeNeuro(allAnswers);
  }

  if (Object.keys(allAnswers).some(k => k.startsWith("cortico_"))) {
    axes.adaptatif = scorerAxeAdaptatif(allAnswers);
  }

  if (Object.keys(allAnswers).some(k => k.startsWith("thyro_"))) {
    axes.thyro = scorerAxeThyro(allAnswers);
  }

  if (Object.keys(allAnswers).some(k => k.startsWith("gona_"))) {
    axes.gonado = scorerAxeGonado(allAnswers, sexe);
  }

  if (Object.keys(allAnswers).some(k => k.startsWith("somato_"))) {
    axes.somato = scorerAxeSomato(allAnswers);
  }

  if (Object.keys(allAnswers).some(k => k.startsWith("dig_"))) {
    axes.digestif = scorerAxeDigestif(allAnswers);
  }

  if (Object.keys(allAnswers).some(k => k.startsWith("immuno_"))) {
    axes.immuno = scorerAxeImmuno(allAnswers);
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
  if (terrainsDetectes.some(t => t.terrain === "metabolique")) {
    recommandationsPrioritaires.push("Régulation glycémique (Cannelle, Chrome, Gymnema)");
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
