/**
 * Données Pilotes - Axe Corticotrope
 * ===================================
 * Source: Volumes 1 & 2 de "La Théorie de l'Endobiogénie" (Hedayat, Lapraz)
 *
 * Ceci est un exemple pour VALIDATION avant d'ingérer les autres axes.
 * À VALIDER par un praticien endobiogéniste !
 */

import {
  createAxe,
  createSymptome,
  createTerrain,
  createPlante,
  createEmonctoire,
  createIndexBdF,
  createRelation,
  initSchema,
} from './schema';

// ============================================
// AXE CORTICOTROPE (ADAPTATIF)
// ============================================

const AXE_CORTICOTROPE = {
  id: 'corticotrope',
  nom: 'Axe Corticotrope (Adaptatif)',
  description: "Axe de l'adaptation au stress. Régule la réponse surrénalienne via le cortisol et la DHEA.",
  hormones: ['CRH', 'ACTH', 'Cortisol', 'DHEA', 'DHEA-S'],
  organes: ['Hypothalamus', 'Hypophyse antérieure', 'Glandes surrénales (cortex)'],
  fonction: "Gestion du stress, adaptation, métabolisme glucidique, anti-inflammation endogène",
};

// ============================================
// TERRAINS liés au Corticotrope
// ============================================

const TERRAINS_CORTICOTROPE = [
  {
    id: 'hypocorticisme',
    nom: 'Hypocorticisme (Insuffisance corticotrope)',
    description: "Épuisement de l'axe corticotrope avec déficit en cortisol et/ou DHEA. Capacité d'adaptation réduite.",
    type: 'insuffisance' as const,
  },
  {
    id: 'hypercorticisme',
    nom: 'Hypercorticisme (Sur-sollicitation corticotrope)',
    description: "Sur-activation chronique de l'axe corticotrope. Excès de cortisol, catabolisme tissulaire.",
    type: 'sur_sollicitation' as const,
  },
  {
    id: 'dysadaptation',
    nom: 'Dysadaptation',
    description: "Incapacité à adapter la réponse corticotrope aux besoins. Alternance hypo/hyper.",
    type: 'dysfonction' as const,
  },
];

// ============================================
// SYMPTÔMES suggérant un déséquilibre corticotrope
// ============================================

const SYMPTOMES_CORTICOTROPE = [
  // HYPOCORTICISME
  {
    id: 'fatigue_matinale',
    nom: 'Fatigue au réveil',
    description: "Difficulté à se lever le matin, besoin de temps pour 'démarrer'",
    localisation: 'general',
    temporalite: 'matin',
    terrain_suggere: 'hypocorticisme',
    poids: 0.9,
    source: 'Volume 2, p.18',
  },
  {
    id: 'hypoglycemie_fonctionnelle',
    nom: 'Hypoglycémie fonctionnelle',
    description: "Malaise si repas sauté, besoin de manger régulièrement",
    localisation: 'metabolique',
    temporalite: 'variable',
    terrain_suggere: 'hypocorticisme',
    poids: 0.85,
    source: 'Volume 1, p.156',
  },
  {
    id: 'hypotension_orthostatique',
    nom: 'Hypotension orthostatique',
    description: "Vertiges au lever, tête qui tourne en se levant vite",
    localisation: 'cardiovasculaire',
    temporalite: 'positional',
    terrain_suggere: 'hypocorticisme',
    poids: 0.8,
    source: 'Volume 2, p.22',
  },
  {
    id: 'envies_sel',
    nom: 'Envies de sel',
    description: "Besoin d'ajouter du sel, attirance pour les aliments salés",
    localisation: 'metabolique',
    temporalite: 'permanent',
    terrain_suggere: 'hypocorticisme',
    poids: 0.75,
    source: 'Volume 1, p.158',
  },
  {
    id: 'stress_mal_gere',
    nom: 'Mauvaise gestion du stress',
    description: "Débordement rapide face au stress, panique facile",
    localisation: 'psychique',
    temporalite: 'situationnel',
    terrain_suggere: 'hypocorticisme',
    poids: 0.9,
    source: 'Volume 2, p.25',
  },
  {
    id: 'recuperation_lente',
    nom: 'Récupération lente après effort',
    description: "Fatigue prolongée après effort physique ou stress",
    localisation: 'general',
    temporalite: 'post-effort',
    terrain_suggere: 'hypocorticisme',
    poids: 0.85,
    source: 'Volume 2, p.20',
  },

  // HYPERCORTICISME
  {
    id: 'insomnie_reveil_nocturne',
    nom: 'Réveils nocturnes (3-5h)',
    description: "Réveils entre 3h et 5h du matin, difficultés à se rendormir",
    localisation: 'sommeil',
    temporalite: 'nuit',
    terrain_suggere: 'hypercorticisme',
    poids: 0.85,
    source: 'Volume 2, p.28',
  },
  {
    id: 'prise_poids_abdominale',
    nom: 'Prise de poids abdominale',
    description: "Accumulation graisseuse au niveau abdominal",
    localisation: 'metabolique',
    temporalite: 'progressif',
    terrain_suggere: 'hypercorticisme',
    poids: 0.8,
    source: 'Volume 1, p.162',
  },
  {
    id: 'anxiete_chronique',
    nom: 'Anxiété chronique',
    description: "État d'inquiétude permanent, ruminations",
    localisation: 'psychique',
    temporalite: 'permanent',
    terrain_suggere: 'hypercorticisme',
    poids: 0.75,
    source: 'Volume 2, p.30',
  },
  {
    id: 'hyperglycemie',
    nom: 'Tendance hyperglycémique',
    description: "Glycémie à jeun élevée ou limite haute",
    localisation: 'metabolique',
    temporalite: 'permanent',
    terrain_suggere: 'hypercorticisme',
    poids: 0.7,
    source: 'Volume 1, p.164',
  },
];

// ============================================
// PLANTES pour l'axe Corticotrope
// ============================================

const PLANTES_CORTICOTROPE = [
  // Pour HYPOCORTICISME (soutenir les surrénales)
  {
    id: 'cassis',
    nom_commun: 'Cassis',
    nom_latin: 'Ribes nigrum',
    parties_utilisees: ['bourgeons', 'feuilles'],
    actions: ['cortisone-like', 'anti-inflammatoire', 'adaptogène'],
    terrain_traite: 'hypocorticisme',
    poids: 0.95,
    source: 'Volume 2, Matière médicale',
  },
  {
    id: 'reglisse',
    nom_commun: 'Réglisse',
    nom_latin: 'Glycyrrhiza glabra',
    parties_utilisees: ['racine'],
    actions: ['prolonge action cortisol', 'anti-inflammatoire', 'adaptogène'],
    terrain_traite: 'hypocorticisme',
    poids: 0.9,
    source: 'Volume 2, Matière médicale',
  },
  {
    id: 'eleuthérocoque',
    nom_commun: 'Éleuthérocoque',
    nom_latin: 'Eleutherococcus senticosus',
    parties_utilisees: ['racine'],
    actions: ['adaptogène', 'tonique surrénalien', 'anti-fatigue'],
    terrain_traite: 'hypocorticisme',
    poids: 0.85,
    source: 'Volume 2, Matière médicale',
  },
  {
    id: 'rhodiole',
    nom_commun: 'Rhodiole',
    nom_latin: 'Rhodiola rosea',
    parties_utilisees: ['racine'],
    actions: ['adaptogène', 'anti-stress', 'neuroprotecteur'],
    terrain_traite: 'hypocorticisme',
    poids: 0.85,
    source: 'Volume 2, Matière médicale',
  },

  // Pour HYPERCORTICISME (freiner l'axe)
  {
    id: 'aubepine',
    nom_commun: 'Aubépine',
    nom_latin: 'Crataegus monogyna',
    parties_utilisees: ['sommités fleuries', 'bourgeons'],
    actions: ['sédatif', 'anxiolytique', 'régulateur cardiaque'],
    terrain_traite: 'hypercorticisme',
    poids: 0.85,
    source: 'Volume 2, Matière médicale',
  },
  {
    id: 'passiflore',
    nom_commun: 'Passiflore',
    nom_latin: 'Passiflora incarnata',
    parties_utilisees: ['parties aériennes'],
    actions: ['anxiolytique', 'sédatif', 'antispasmodique'],
    terrain_traite: 'hypercorticisme',
    poids: 0.8,
    source: 'Volume 2, Matière médicale',
  },
];

// ============================================
// INDEX BdF liés au Corticotrope
// ============================================

const INDEX_CORTICOTROPE = [
  {
    id: 'idx_cortico',
    nom: 'Index Corticotrope',
    formule: 'Estimation activité globale axe corticotrope',
    interpretation_bas: "Insuffisance corticotrope, épuisement surrénalien, capacité d'adaptation réduite",
    interpretation_haut: "Hypercorticisme, stress chronique, catabolisme excessif",
    norme_min: 0.8,
    norme_max: 1.2,
  },
  {
    id: 'idx_adaptatif',
    nom: 'Index Adaptatif',
    formule: 'DHEA / Cortisol (rapport)',
    interpretation_bas: "Épuisement adaptatif, DHEA insuffisante par rapport au cortisol",
    interpretation_haut: "Bonne réserve adaptative, DHEA suffisante",
    norme_min: 0.7,
    norme_max: 1.3,
  },
];

// ============================================
// ÉMONCTOIRES concernés
// ============================================

const EMONCTOIRES = [
  {
    id: 'surrenales',
    nom: 'Glandes surrénales',
    fonction: "Production de cortisol, DHEA, aldostérone. Organe clé de l'adaptation au stress.",
  },
  {
    id: 'foie',
    nom: 'Foie',
    fonction: "Métabolisme du cortisol, néoglucogenèse, détoxification.",
  },
];

// ============================================
// FONCTION DE SEED
// ============================================

export async function seedCorticotrope(): Promise<void> {
  console.log('[Seed] Début du seed Axe Corticotrope...');

  // 1. Initialiser le schéma
  await initSchema();

  // 2. Créer l'axe
  console.log('[Seed] Création de l\'axe Corticotrope...');
  await createAxe(AXE_CORTICOTROPE);

  // 3. Créer les terrains
  console.log('[Seed] Création des terrains...');
  for (const terrain of TERRAINS_CORTICOTROPE) {
    await createTerrain(terrain);
    // Relation Terrain -> Axe
    await createRelation({
      type: 'IMPLIQUE',
      from: terrain.id,
      to: 'corticotrope',
      poids: 1.0,
      source: 'Volume 1',
    });
  }

  // 4. Créer les symptômes et leurs relations
  console.log('[Seed] Création des symptômes...');
  for (const symptome of SYMPTOMES_CORTICOTROPE) {
    await createSymptome({
      id: symptome.id,
      nom: symptome.nom,
      description: symptome.description,
      localisation: symptome.localisation,
      temporalite: symptome.temporalite,
    });
    // Relation Symptome -> Terrain
    await createRelation({
      type: 'SUGGERE',
      from: symptome.id,
      to: symptome.terrain_suggere,
      poids: symptome.poids,
      source: symptome.source,
    });
  }

  // 5. Créer les plantes et leurs relations
  console.log('[Seed] Création des plantes...');
  for (const plante of PLANTES_CORTICOTROPE) {
    await createPlante({
      id: plante.id,
      nom_commun: plante.nom_commun,
      nom_latin: plante.nom_latin,
      parties_utilisees: plante.parties_utilisees,
      actions: plante.actions,
    });
    // Relation Plante -> Terrain
    await createRelation({
      type: 'TRAITE',
      from: plante.id,
      to: plante.terrain_traite,
      poids: plante.poids,
      source: plante.source,
    });
  }

  // 6. Créer les index BdF
  console.log('[Seed] Création des index BdF...');
  for (const index of INDEX_CORTICOTROPE) {
    await createIndexBdF(index);
    // Relation Index -> Axe
    await createRelation({
      type: 'EVALUE',
      from: index.id,
      to: 'corticotrope',
      poids: 1.0,
    });
  }

  // 7. Créer les émonctoires
  console.log('[Seed] Création des émonctoires...');
  for (const emonctoire of EMONCTOIRES) {
    await createEmonctoire(emonctoire);
  }

  console.log('[Seed] ✅ Axe Corticotrope seedé avec succès !');
  console.log(`   - 1 axe`);
  console.log(`   - ${TERRAINS_CORTICOTROPE.length} terrains`);
  console.log(`   - ${SYMPTOMES_CORTICOTROPE.length} symptômes`);
  console.log(`   - ${PLANTES_CORTICOTROPE.length} plantes`);
  console.log(`   - ${INDEX_CORTICOTROPE.length} index BdF`);
  console.log(`   - ${EMONCTOIRES.length} émonctoires`);
}

export default seedCorticotrope;
