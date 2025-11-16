// lib/interrogatoire/clinicalScoring.ts

import { InterrogatoireEndobiogenique, OuiNon } from "./types";

// Type de sortie : scores cliniques par axe
export interface ClinicalAxeScores {
  neuroVegetatif: {
    sympathetic: number;
    parasympathetic: number;
    orientation: "sympathicotonique" | "parasympathicotonique" | "equilibre";
  };

  adaptatif: {
    hyper: number;
    hypo: number;
    orientation: "hyperadaptatif" | "hypoadaptatif" | "equilibre";
  };

  thyroidien: {
    hypo: number;
    hyper: number;
    orientation: "hypometabolisme" | "hypermetabolisme" | "normal";
  };

  gonadique: {
    hypo: number;
    hyper: number;
    orientation: "hypogonadisme" | "hypergonadisme" | "dysregulation" | "normal";
  };

  digestif: {
    dysbiose: number;
    lenteur: number;
    inflammation: number;
  };

  immunoInflammatoire: {
    hyper: number;
    hypo: number;
  };

  rythmes: {
    desynchronisation: number;
  };

  axesVie: {
    stressChronique: number;
    traumatismes: number;
    sommeil: number;
  };
}

// Helper
const yn = (v?: OuiNon) => (v === "oui" ? 1 : 0);

export function scoreInterrogatoire(inter: InterrogatoireEndobiogenique): ClinicalAxeScores {

  // ---------------------------------------------------------------------------
  // AXE NEUROVÉGÉTATIF
  // ---------------------------------------------------------------------------

  const nvSymp =
    yn(inter.axeNeuroVegetatif.sommeil_endormissement_difficile) +
    yn(inter.axeNeuroVegetatif.sommeil_reveils_nocturnes) +
    yn(inter.axeNeuroVegetatif.transpiration_abondante) +
    yn(inter.axeNeuroVegetatif.intolerance_chaleur) +
    yn(inter.axeNeuroVegetatif.palpitations) +
    yn(inter.axeNeuroVegetatif.tension_interne);

  const nvPara =
    yn(inter.axeNeuroVegetatif.frilosite) +
    (inter.axeNeuroVegetatif.transit_type === "lent" ? 1 : 0) +
    yn(inter.axeNeuroVegetatif.transpiration_absente) +
    (inter.axeNeuroVegetatif.energie_soir === "bonne" ? 1 : 0);

  let nvOrientation: ClinicalAxeScores["neuroVegetatif"]["orientation"] = "equilibre";
  if (nvSymp - nvPara >= 2) nvOrientation = "sympathicotonique";
  if (nvPara - nvSymp >= 2) nvOrientation = "parasympathicotonique";

  // ---------------------------------------------------------------------------
  // AXE ADAPTATIF (ACTH / CORTISOL)
  // ---------------------------------------------------------------------------

  const adaptHyper =
    yn(inter.axeAdaptatif.stress_actuel) +
    yn(inter.axeAdaptatif.besoin_stimulants) +
    yn(inter.axeAdaptatif.endormissement_difficile_pensees) +
    (inter.axeAdaptatif.irritabilite === "souvent" ? 2 : 0);

  const adaptHypo =
    yn(inter.axeAdaptatif.sensation_epuisement) +
    (inter.axeAdaptatif.fatigue_matin === "importante" ? 1 : 0) +
    (inter.axeAdaptatif.fatigue_apresmidi === "importante" ? 1 : 0);

  let adaptOrientation: ClinicalAxeScores["adaptatif"]["orientation"] = "equilibre";
  if (adaptHyper - adaptHypo >= 2) adaptOrientation = "hyperadaptatif";
  if (adaptHypo - adaptHyper >= 2) adaptOrientation = "hypoadaptatif";

  // ---------------------------------------------------------------------------
  // AXE THYROÏDIEN
  // ---------------------------------------------------------------------------

  const thyHypo =
    yn(inter.axeThyroidien.sensibilite_froid) +
    yn(inter.axeThyroidien.transit_lent) +
    yn(inter.axeThyroidien.peau_seche) +
    yn(inter.axeThyroidien.lenteur_mentale);

  const thyHyper =
    yn(inter.axeThyroidien.sensibilite_chaleur) +
    yn(inter.axeThyroidien.transpiration_excessive) +
    yn(inter.axeThyroidien.palpitations);

  let thyOrientation: ClinicalAxeScores["thyroidien"]["orientation"] = "normal";
  if (thyHypo - thyHyper >= 2) thyOrientation = "hypometabolisme";
  if (thyHyper - thyHypo >= 2) thyOrientation = "hypermetabolisme";

  // ---------------------------------------------------------------------------
  // AXE GONADIQUE
  // ---------------------------------------------------------------------------

  let gonHypo = 0;
  let gonHyper = 0;

  if (inter.sexe === "F" && inter.axeGonadiqueFemme) {
    gonHypo += yn(inter.axeGonadiqueFemme.libido_basse);
    gonHypo += yn(inter.axeGonadiqueFemme.secheresse_vaginale);
    gonHyper += yn(inter.axeGonadiqueFemme.spm_irritabilite);
  }

  if (inter.sexe === "H" && inter.axeGonadiqueHomme) {
    gonHypo += yn(inter.axeGonadiqueHomme.libido_basse);
    gonHypo += yn(inter.axeGonadiqueHomme.erections_matinales_diminuees);
    gonHyper += yn(inter.axeGonadiqueHomme.prise_graisse_abdominale);
  }

  let gonOrientation: ClinicalAxeScores["gonadique"]["orientation"] = "normal";
  if (gonHypo >= 2) gonOrientation = "hypogonadisme";
  if (gonHyper >= 2) gonOrientation = "hypergonadisme";

  // ---------------------------------------------------------------------------
  // AXE DIGESTIF
  // ---------------------------------------------------------------------------

  const digestDysbiose =
    yn(inter.axeDigestifMetabolique.ballonnements) +
    yn(inter.axeDigestifMetabolique.intolerances_connues ? "oui" : "non");

  const digestLenteur =
    yn(inter.axeDigestifMetabolique.digestion_lente) +
    (inter.axeDigestifMetabolique.transit === "constipation" ? 1 : 0);

  const digestInflamm =
    yn(inter.axeDigestifMetabolique.intolerance_alcool);

  // ---------------------------------------------------------------------------
  // AXE IMMUNO-INFLAMMATOIRE
  // ---------------------------------------------------------------------------

  const immunoHyper =
    yn(inter.axeImmunoInflammatoire.allergies_saisonnieres) +
    yn(inter.axeImmunoInflammatoire.douleurs_articulaires);

  const immunoHypo =
    yn(inter.axeImmunoInflammatoire.infections_recidivantes);

  // ---------------------------------------------------------------------------
  // RYTHMES
  // ---------------------------------------------------------------------------

  const rythmeDesynch =
    yn(inter.rythmes.travail_nuit) +
    yn(inter.rythmes.decalage_horaire_frequent);

  // ---------------------------------------------------------------------------
  // AXES DE VIE
  // ---------------------------------------------------------------------------

  const stressChronique = yn(inter.axesDeVie.traumatisme_majeur_historique);
  const traumatismes = yn(inter.axesDeVie.burnout_passe);
  const sommeil = inter.axesDeVie.qualite_sommeil_ressentie === "mauvaise" ? 1 : 0;

  // ---------------------------------------------------------------------------

  return {
    neuroVegetatif: {
      sympathetic: nvSymp,
      parasympathetic: nvPara,
      orientation: nvOrientation,
    },
    adaptatif: {
      hyper: adaptHyper,
      hypo: adaptHypo,
      orientation: adaptOrientation,
    },
    thyroidien: {
      hypo: thyHypo,
      hyper: thyHyper,
      orientation: thyOrientation,
    },
    gonadique: {
      hypo: gonHypo,
      hyper: gonHyper,
      orientation: gonOrientation,
    },
    digestif: {
      dysbiose: digestDysbiose,
      lenteur: digestLenteur,
      inflammation: digestInflamm,
    },
    immunoInflammatoire: {
      hyper: immunoHyper,
      hypo: immunoHypo,
    },
    rythmes: {
      desynchronisation: rythmeDesynch,
    },
    axesVie: {
      stressChronique,
      traumatismes,
      sommeil,
    }
  };
}
