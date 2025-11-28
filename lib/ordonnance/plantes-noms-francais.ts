// ========================================
// DICTIONNAIRE NOMS LATINS → NOMS FRANÇAIS
// ========================================
// Base de données des noms français pour les plantes courantes

export const NOMS_FRANCAIS_PLANTES: Record<string, string> = {
  // === PLANTES ENDOBIOGÉNIQUES PRINCIPALES ===

  // Thyroïdien
  "Fucus vesiculosus": "Fucus vésiculeux",
  "Avena sativa": "Avoine cultivée",
  "Lithospermum officinale": "Grémil officinal",
  "Melissa officinalis": "Mélisse officinale",

  // Corticotrope / Adaptogènes
  "Glycyrrhiza glabra": "Réglisse",
  "Ribes nigrum": "Cassis",
  "Rhodiola rosea": "Rhodiole",
  "Eleutherococcus senticosus": "Éleuthérocoque",
  "Withania somnifera": "Ashwagandha",

  // Génital / Hormonal
  "Salvia officinalis": "Sauge officinale",
  "Vitex agnus-castus": "Gattilier",
  "Rubus idaeus": "Framboisier",
  "Alchemilla vulgaris": "Alchémille",

  // Digestif / Hépatique
  "Rosmarinus officinalis": "Romarin",
  "Taraxacum officinale": "Pissenlit",
  "Cynara scolymus": "Artichaut",
  "Silybum marianum": "Chardon-Marie",
  "Artemisia absinthium": "Absinthe",
  "Artemisia herba-alba": "Armoise blanche",

  // Cardiovasculaire
  "Crataegus oxyacantha": "Aubépine",
  "Ginkgo biloba": "Ginkgo",
  "Allium sativum": "Ail cultivé",
  "Olea europaea": "Olivier",

  // Nerveux / Anxiolytique
  "Passiflora incarnata": "Passiflore",
  "Valeriana officinalis": "Valériane",
  "Hypericum perforatum": "Millepertuis",
  "Tilia cordata": "Tilleul",
  "Lavandula angustifolia": "Lavande vraie",

  // Immunitaire
  "Echinacea purpurea": "Échinacée pourpre",
  "Echinacea angustifolia": "Échinacée à feuilles étroites",
  "Thymus vulgaris": "Thym commun",
  "Thymus capitatus": "Thym à têtes",

  // Respiratoire
  "Eucalyptus globulus": "Eucalyptus",
  "Plantago lanceolata": "Plantain lancéolé",
  "Verbascum thapsus": "Bouillon-blanc",
  "Mentha pulegium": "Menthe pouliot",

  // Urinaire
  "Solidago virgaurea": "Verge d'or",
  "Betula pendula": "Bouleau verruqueux",
  "Vaccinium macrocarpon": "Canneberge",
  "Orthosiphon stamineus": "Orthosiphon",

  // Circulation / Veineux
  "Vitis vinifera": "Vigne rouge",
  "Aesculus hippocastanum": "Marronnier d'Inde",
  "Ruscus aculeatus": "Fragon petit houx",
  "Pistacia lentiscus": "Lentisque pistachier",

  // Métabolique
  "Trigonella foenum-graecum": "Fenugrec",
  "Gymnema sylvestre": "Gymnéma",
  "Cinnamomum verum": "Cannelle de Ceylan",

  // Détox / Drainage
  "Urtica dioica": "Ortie",
  "Arctium lappa": "Bardane",
  "Galium aparine": "Gaillet gratteron",

  // Autres plantes courantes
  "Myrtus communis": "Myrte commun",
  "Achillea millefolium": "Achillée millefeuille",
  "Calendula officinalis": "Souci officinal",
  "Matricaria recutita": "Camomille allemande",
  "Chamaemelum nobile": "Camomille romaine",
  "Foeniculum vulgare": "Fenouil",
  "Angelica archangelica": "Angélique",
  "Mentha piperita": "Menthe poivrée",
  "Salvia sclarea": "Sauge sclarée",
  "Origanum majorana": "Marjolaine",
  "Origanum vulgare": "Origan",

  // Gemmothérapie (MG = Macérat Glycériné)
  "Ribes nigrum MG": "Cassis (bourgeons)",
  "Rubus idaeus MG": "Framboisier (bourgeons)",
  "Betula pendula MG": "Bouleau (bourgeons)",
  "Tilia tomentosa MG": "Tilleul argenté (bourgeons)",
  "Ficus carica MG": "Figuier (bourgeons)",
  "Corylus avellana MG": "Noisetier (bourgeons)",
  "Rosmarinus officinalis MG": "Romarin (jeunes pousses)",

  // Huiles Essentielles (pour référence)
  "Thymus vulgaris CT Thymol": "Thym à thymol",
  "Thymus vulgaris CT Linalol": "Thym à linalol",
  "Rosmarinus officinalis CT 1,8-Cinéole": "Romarin à cinéole",
  "Rosmarinus officinalis CT Camphre": "Romarin à camphre",
  "Rosmarinus officinalis CT Verbénone": "Romarin à verbénone",
};

/**
 * Fonction utilitaire pour obtenir le nom français d'une plante
 * @param nomLatin Nom latin de la plante (ex: "Rhodiola rosea")
 * @returns Nom français si trouvé, sinon le nom latin inchangé
 */
export function getNomFrancais(nomLatin: string): string {
  // Recherche exacte
  if (NOMS_FRANCAIS_PLANTES[nomLatin]) {
    return NOMS_FRANCAIS_PLANTES[nomLatin];
  }

  // Recherche partielle (pour les CT, chemotypes, etc.)
  const partialMatch = Object.keys(NOMS_FRANCAIS_PLANTES).find(key =>
    nomLatin.includes(key.split(' ')[0]) && nomLatin.includes(key.split(' ')[1])
  );

  if (partialMatch) {
    return NOMS_FRANCAIS_PLANTES[partialMatch];
  }

  // Retourne le nom latin si pas de correspondance
  return nomLatin;
}

/**
 * Fonction pour formater l'affichage : "Nom français (Nom latin)"
 */
export function formatNomComplet(nomLatin: string): string {
  const nomFr = getNomFrancais(nomLatin);
  if (nomFr === nomLatin) {
    return nomLatin; // Pas de traduction trouvée
  }
  return `${nomFr} (${nomLatin})`;
}
