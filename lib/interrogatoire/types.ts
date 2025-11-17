// lib/interrogatoire/types.ts

// ---------------------------------------------------------------------------
// CONFIGURATION DES QUESTIONS
// ---------------------------------------------------------------------------

export interface QuestionConfig {
  id: string;
  question: string;
  type: "boolean" | "text" | "select" | "number" | "multiselect" | "date";
  tooltip?: string;
  section?: string;
  axis?: string;
  options?: string[];
  mapping?: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Échelles génériques réutilisables
// ---------------------------------------------------------------------------

export type FrequenceSymptome = "jamais" | "rarement" | "parfois" | "souvent" | "toujours";

export type IntensiteSymptome = "faible" | "moderee" | "importante";

export type Qualite = "mauvaise" | "moyenne" | "bonne";

export type OuiNon = "oui" | "non";

// ---------------------------------------------------------------------------
// BLOC 1 : Axe neurovégétatif
// ---------------------------------------------------------------------------

export interface AxeNeuroVegetatifAnswers {
  sommeil_endormissement_difficile?: OuiNon;
  sommeil_reveils_nocturnes?: OuiNon;
  sommeil_heure_reveils?: string; // ex: "3h du matin"
  sommeil_reveils_fatigue?: OuiNon;

  appetit_faim_matinale?: OuiNon;
  appetit_fringales?: OuiNon;
  appetit_fringales_type?: string; // sucré, salé, etc.

  soif_importante?: OuiNon;
  soif_faible?: OuiNon;
  boissons_sucrees?: OuiNon;

  transpiration_abondante?: OuiNon;
  transpiration_nocturne?: OuiNon;
  transpiration_absente?: OuiNon;

  frilosite?: OuiNon;
  intolerance_chaleur?: OuiNon;

  transit_type?: "normal" | "lent" | "rapide" | "alternant";
  transit_gaz?: OuiNon;

  energie_matin?: Qualite;    // mauvaise, moyenne, bonne
  energie_apresmidi?: Qualite;
  energie_soir?: Qualite;

  palpitations?: OuiNon;
  tension_interne?: OuiNon;
  cefalees_tensionnelles?: OuiNon;
}

// ---------------------------------------------------------------------------
// BLOC 2 : Axe adaptatif (ACTH / cortisol / stress)
// ---------------------------------------------------------------------------

export interface AxeAdaptatifAnswers {
  stress_actuel?: OuiNon;
  stress_chronique?: OuiNon;
  description_stress?: string;

  irritabilite?: FrequenceSymptome;
  sautes_humeur?: FrequenceSymptome;
  pleurs_faciles?: FrequenceSymptome;

  sensation_epuisement?: OuiNon;
  besoin_stimulants?: OuiNon; // café, sucre...
  details_stimulants?: string;

  fatigue_matin?: IntensiteSymptome;
  fatigue_apresmidi?: IntensiteSymptome;
  fatigue_soir?: IntensiteSymptome;

  endormissement_difficile_pensees?: OuiNon;

  craving_sucre?: OuiNon;
  craving_chocolat?: OuiNon;
  craving_sel?: OuiNon;

  tensions_musculaires_cervicales?: OuiNon;
  tensions_musculaires_dorsales?: OuiNon;
}

// ---------------------------------------------------------------------------
// BLOC 3 : Axe thyroïdien
// ---------------------------------------------------------------------------

export interface AxeThyroidienAnswers {
  sensibilite_froid?: OuiNon;
  sensibilite_chaleur?: OuiNon;

  prise_poids_recent?: OuiNon;
  perte_poids_recent?: OuiNon;
  variation_poids_kg?: number | null;

  chute_cheveux?: OuiNon;
  peau_seche?: OuiNon;

  lenteur_mentale?: OuiNon;
  troubles_memoire?: OuiNon;

  transpiration_excessive?: OuiNon;

  transit_lent?: OuiNon;

  tachycardie?: OuiNon;
  palpitations?: OuiNon;
}

// ---------------------------------------------------------------------------
// BLOC 4 : Axe gonadotrope / génital
// ---------------------------------------------------------------------------

export interface AxeGonadiqueFemmeAnswers {
  cycle_regulier?: OuiNon;
  cycle_duree_jours?: number | null;
  cycle_saignements_abondants?: OuiNon;
  cycle_douleurs_importantes?: OuiNon;

  spm_irritabilite?: OuiNon;
  spm_douleurs_seins?: OuiNon;
  spm_retenue_eau?: OuiNon;

  bouffees_chaleur?: OuiNon;
  sueurs_nocturnes?: OuiNon;

  libido_basse?: OuiNon;
  secheresse_vaginale?: OuiNon;

  contraception_hormonale?: OuiNon;
}

export interface AxeGonadiqueHommeAnswers {
  libido_basse?: OuiNon;
  erections_matinales_diminuees?: OuiNon;
  perte_muscle?: OuiNon;
  prise_graisse_abdominale?: OuiNon;
  troubles_urinaires?: OuiNon;
}

// ---------------------------------------------------------------------------
// BLOC 5 : Axe digestif / métabolique
// ---------------------------------------------------------------------------

export interface AxeDigestifMetaboliqueAnswers {
  digestion_lente?: OuiNon;
  digestion_lourde?: OuiNon;

  ballonnements?: OuiNon;
  ballonnements_apres_repas?: OuiNon;
  heure_ballonnements?: string;

  intolerances_connues?: string; // ex: "lait, gluten"

  transit?: "normal" | "constipation" | "diarrhee" | "alternant";

  hypoglycemies?: OuiNon; // tremblements, faim urgente
  details_hypoglycemies?: string;

  intolerance_alcool?: OuiNon;
  prise_poids_centrale?: OuiNon;
}

// ---------------------------------------------------------------------------
// BLOC 6 : Axe immuno-inflammatoire
// ---------------------------------------------------------------------------

export interface AxeImmunoInflammatoireAnswers {
  douleurs_articulaires?: OuiNon;
  douleurs_musculaires?: OuiNon;

  allergies_saisonnieres?: OuiNon;
  allergies_alimentaires?: OuiNon;
  details_allergies?: string;

  infections_recidivantes?: OuiNon; // sinusites, cystites...
  details_infections?: string;

  eczema?: OuiNon;
  psoriasis?: OuiNon;
  autres_dermatoses?: string;
}

// ---------------------------------------------------------------------------
// BLOC 7 : Rythmes
// ---------------------------------------------------------------------------

export interface RythmesAnswers {
  rythme_sommeil_couche_heure?: string; // ex: "23h"
  rythme_sommeil_reveil_heure?: string; // ex: "6h30"
  travail_nuit?: OuiNon;
  decalage_horaire_frequent?: OuiNon;

  energie_pic_matin?: OuiNon;
  energie_pic_soir?: OuiNon;

  saison_amelioration?: string; // "été", "hiver", etc.
  saison_aggravation?: string;
}

// ---------------------------------------------------------------------------
// BLOC 8 : Axes de vie & histoire
// ---------------------------------------------------------------------------

export interface AxesDeVieAnswers {
  traumatisme_majeur_historique?: OuiNon;
  details_traumatisme?: string;

  burnout_passe?: OuiNon;
  annee_burnout?: string;

  contexte_professionnel?: string; // ex: stress élevé, horaires, etc.
  contexte_familial?: string;

  alimentation_reelle?: string; // code libre : nombre repas, qualité, grignotage...

  activite_physique_reguliere?: OuiNon;
  type_activite_physique?: string;
  frequence_activite_physique?: string; // ex: "3x/semaine"

  qualite_sommeil_ressentie?: Qualite;

  consommation_tabac?: OuiNon;
  consommation_alcool?: OuiNon;
  consommation_cafeine?: OuiNon;
  details_consommation?: string;
}

// ---------------------------------------------------------------------------
// STRUCTURE GLOBALE D'INTERROGATOIRE
// ---------------------------------------------------------------------------

export interface InterrogatoireEndobiogenique {
  date_creation?: string; // ISO string
  sexe: "H" | "F";

  axeNeuroVegetatif: AxeNeuroVegetatifAnswers;
  axeAdaptatif: AxeAdaptatifAnswers;
  axeThyroidien: AxeThyroidienAnswers;

  axeGonadiqueFemme?: AxeGonadiqueFemmeAnswers;
  axeGonadiqueHomme?: AxeGonadiqueHommeAnswers;

  axeDigestifMetabolique: AxeDigestifMetaboliqueAnswers;
  axeImmunoInflammatoire: AxeImmunoInflammatoireAnswers;
  rythmes: RythmesAnswers;
  axesDeVie: AxesDeVieAnswers;
}
