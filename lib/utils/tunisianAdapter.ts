/**
 * ============================================================================
 * INTEGRIA - TUNISIAN ADAPTER MIDDLEWARE v3.0 (Guide Clinique Tunisie)
 * ============================================================================
 *
 * Ce module est le "Douanier Logistique". Il reçoit une prescription théorique
 * (Format France/Endobiogénie) et la convertit en format exécutable pour la Tunisie.
 *
 * RÈGLES CRITIQUES (Guide Clinique de Prescription Tunisie) :
 * 1. TM (France) → MICROSPHERES (Tunisie) : 1g micro ≈ 10g TM
 * 2. MG 1DH (France) → MACERAT_MERE (Tunisie) : 10gt 1DH ≈ 1gt Mère
 * 3. EPS : Identité (5-10ml/jour, 5j/7, le soir)
 * 4. HE : 4 VOIES distinctes selon indication (v3.1 - noms harmonisés)
 *    - SOLUTION_ORALE : Fond chronique (2ml x 2/j, 30j)
 *    - SUPPOSITOIRE : Aigu ORL (2-3/j, 3-5j)
 *    - CUTANEE : Local (dilution 5-20% HV)
 *    - INHALATION : Respiratoire (5-10gt eau chaude)
 * 5. MUST_FORMS : Certaines plantes ont une forme OBLIGATOIRE
 *
 * Source: Guide Clinique de Prescription - Département Médical IntegrIA
 * ============================================================================
 */

import { getMustForm, getConversionWarning, type GalenicForm } from '../ordonnance/mustForms';
import {
  type VoieAromatherapie,
  type FormePratiqueTunisie,
  determinerVoieAromatherapie,
  VOIES_AROMATHERAPIE,
  PROTOCOLES,
} from '../ordonnance/tunisianProtocols';

// =============================================================================
// 1. TYPES & INTERFACES
// =============================================================================

/** Formes galéniques France (input théorique) */
export type FormeFrance = 'TM' | 'MG 1DH' | 'EPS' | 'HE';

/**
 * Formes galéniques Tunisie (output pratique)
 * v3.0: Ajout des 4 voies aromathérapie selon Guide Clinique
 *
 * HARMONISATION v3.1: Noms alignés avec VoieAromatherapie de tunisianProtocols.ts
 */
export type FormeTunisie =
  // Formes classiques (inchangées pour compatibilité)
  | 'MICROSPHERES'        // TM → Gélules 400-600mg
  | 'MACERAT_CONCENTRE'   // MG 1DH → Gouttes concentrées
  | 'EPS'                 // Identité
  | 'HE'                  // HE générique (conservé pour compatibilité)
  | 'EPF'                 // Extraits Plantes Fraîches
  // Formes aromathérapie v3.1 (alignées sur VoieAromatherapie)
  | 'SOLUTION_ORALE'      // HE fond chronique (Voie 1)
  | 'SUPPOSITOIRE'        // HE aigu ORL (Voie 2)
  | 'CUTANEE'             // HE locale (Voie 3)
  | 'INHALATION';         // HE respiratoire (Voie 4)

/** Alias pour le guide tunisien (macérat mère = macérat concentré) */
export const MACERAT_MERE = 'MACERAT_CONCENTRE' as const;

/** Niveaux d'alerte pour l'UI */
export type AlertLevel = 'NONE' | 'INFO' | 'WARNING' | 'CRITICAL';

/** Plante en entrée (depuis l'IA) */
export interface PlantInput {
  plant_id: string;
  name_latin: string;
  name_fr: string;
  form: string;
  dosage: string;
  justification: string;
  endo_covered: boolean;

  // Justification structurée v3.0
  symptome_cible?: string;           // Symptôme spécifique ciblé
  justification_terrain?: string;    // Lien avec diagnostic patient
  justification_classique?: string;  // Base scientifique
  explication_patient?: string;      // Vulgarisation
  axe_cible?: string;                // Axe endobiogénique
  mecanisme?: string;                // Mécanisme pharmacologique
  synergies?: string[];              // Synergies avec autres plantes
  confiance?: 'haute' | 'moyenne' | 'faible';  // Niveau confiance IA
  precautions?: string[];            // Précautions spécifiques

  // Temporalité
  duree?: string;
  frequence?: string;
  moment?: string;

  // Aromathérapie spécifique (si HE)
  voie_aroma?: VoieAromatherapie;    // Voie d'administration Tunisie
  chemotype?: string;                 // Chémotype HE
  dilution?: string;                  // Dilution si cutanée
  huile_vegetale?: string;            // Support HV
  zone_application?: string;          // Zone d'application
  aigu?: boolean;                     // Indication aiguë vs fond
}

/** Plante en sortie (adaptée Tunisie) */
export interface PlantOutput extends PlantInput {
  // Disponibilité
  is_available_tunisia: boolean;
  available_forms?: FormeTunisie[];

  // Conversion
  original_form: string;
  original_dosage: string;
  adapted_form: string | null;       // Forme convertie (texte libre pour flexibilité)
  adapted_form_code?: FormeTunisie;  // Code technique de la forme (pour logique)
  adapted_dosage: string | null;
  conversion_note: string | null;

  // Alertes
  alert_level: AlertLevel;

  // Alternatives si non disponible
  alternatives?: string[];

  // Aromathérapie - Badge voie (pour affichage UI)
  voie_badge?: string;        // "FOND" | "AIGU" | "LOCAL" | "ORL"
  voie_couleur?: string;      // Couleur hex pour le badge
}

/** Oligoélément en entrée */
export interface OligoInput {
  oligo_id: string;
  name: string;
  form: string;
  dosage: string;
  justification: string;
}

/** Oligoélément en sortie */
export interface OligoOutput extends OligoInput {
  is_available_tunisia: boolean;
  alert_level: AlertLevel;
}

/** Prescription complète en entrée (depuis l'IA) */
export interface PrescriptionInput {
  global_strategy_summary: string;
  priority_axis: string;
  prescription: {
    symptomatic: PlantInput[];
    neuro_endocrine: PlantInput[];
    ans: PlantInput[];
    drainage: PlantInput[];
    aromatherapie?: PlantInput[];  // 🆕 Huiles essentielles
    oligos: OligoInput[];
  };
}

/** Prescription complète en sortie (adaptée Tunisie) */
export interface PrescriptionOutput {
  global_strategy_summary: string;
  priority_axis: string;
  prescription: {
    symptomatic: PlantOutput[];
    neuro_endocrine: PlantOutput[];
    ans: PlantOutput[];
    drainage: PlantOutput[];
    aromatherapie?: PlantOutput[];  // 🆕 Huiles essentielles
    oligos: OligoOutput[];
  };
  meta: {
    conversion_date: string;
    total_plants: number;
    available_count: number;
    warnings_count: number;
    critical_count: number;
    conversions_applied: string[];
  };
}

// =============================================================================
// 2. BASE DE DONNÉES TUNISIENNE (271 plantes - Source: plantes_extraits_complet.xlsx)
// =============================================================================

interface TunisiaPlantProfile {
  nom_fr: string;
  nom_latin: string;
  formes_dispo: FormeTunisie[];
}

/**
 * Base de données OFFICIELLE des plantes disponibles en officine tunisienne
 * Source: Excel "plantes_extraits_complet.xlsx" - 271 plantes
 * Généré automatiquement le 2025-01-XX
 */
const TUNISIA_DB = new Map<string, TunisiaPlantProfile>([
  // ========================================
  // MICROSPHÈRES & PLANTES GÉNÉRALES
  // ========================================
  ['malpighia_glabra', { nom_fr: 'ACEROLA', nom_latin: 'Malpighia glabra', formes_dispo: ['MICROSPHERES'] }],
  ['leonurus_cardiaca', { nom_fr: 'AGRIPAUME', nom_latin: 'Leonurus cardiaca', formes_dispo: ['MICROSPHERES'] }],
  ['agrimonia_eupatoria', { nom_fr: 'AIGREMOINE', nom_latin: 'Agrimonia eupatoria', formes_dispo: ['MICROSPHERES', 'EPF'] }],
  ['allium_sativum', { nom_fr: 'AIL', nom_latin: 'Allium sativum', formes_dispo: ['HE'] }],
  ['vaccinum_vitis_idaea', { nom_fr: 'AIRELLE', nom_latin: 'Vaccinum vitis-idaea', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['trachyspermum_ammi', { nom_fr: 'AJOWAN', nom_latin: 'Trachyspermum ammi', formes_dispo: ['HE', 'MACERAT_CONCENTRE'] }],
  ['alchemilla_vulgaris', { nom_fr: 'ALCHEMILLE', nom_latin: 'Alchemilla vulgaris', formes_dispo: ['EPS'] }],
  ['aloe_vera', { nom_fr: 'ALOE VERA', nom_latin: 'Aloe vera', formes_dispo: ['MICROSPHERES'] }],
  ['anemone_pulsatilla', { nom_fr: 'ANEMONE', nom_latin: 'Anemone pulsatilla', formes_dispo: ['MICROSPHERES'] }],
  ['anethum_graveolens', { nom_fr: 'ANETH', nom_latin: 'Anethum graveolens', formes_dispo: ['MICROSPHERES'] }],
  ['angelica_archangelica', { nom_fr: 'ANGELIQUE RACINE', nom_latin: 'Angelica archangelica', formes_dispo: ['HE'] }],
  ['angelique_epf', { nom_fr: 'Angélique', nom_latin: 'Angelica archangelica', formes_dispo: ['EPF'] }],
  ['artemisia_herba_alba', { nom_fr: 'ARMOISE BLANCHE', nom_latin: 'Artemisia herba alba', formes_dispo: ['HE'] }],
  ['cynara_scolymus', { nom_fr: 'ARTICHAUT', nom_latin: 'Cynara scolymus', formes_dispo: ['HE', 'MICROSPHERES', 'EPS'] }],
  ['withania_somnifera', { nom_fr: 'ASHWAGANDHA', nom_latin: 'Withania somnifera', formes_dispo: ['MICROSPHERES'] }],
  ['astragalus_membranaceus', { nom_fr: 'ASTRAGALE', nom_latin: 'Astragalus membranaceus', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['crataegus_laevigata', { nom_fr: 'AUBEPINE', nom_latin: 'Crataegus laevigata', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['alnus_glutinosa', { nom_fr: 'AULNE', nom_latin: 'Alnus glutinosa', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['inula_racemosa', { nom_fr: 'AUNEE RACINE', nom_latin: 'Inula racemosa', formes_dispo: ['MICROSPHERES'] }],
  ['avena_sativa', { nom_fr: 'AVOINE', nom_latin: 'Avena sativa', formes_dispo: ['MICROSPHERES'] }],
  ['bacopa_monnieri', { nom_fr: 'BACOPA', nom_latin: 'Bacopa monnieri', formes_dispo: ['MICROSPHERES'] }],
  ['illicium_verum', { nom_fr: 'BADIANE (Anis Etoile)', nom_latin: 'Illicium verum', formes_dispo: ['HE'] }],
  ['ballota_foetida', { nom_fr: 'BALLOTE', nom_latin: 'Ballota foetida', formes_dispo: ['MICROSPHERES'] }],
  ['bambusa_arundinacea', { nom_fr: 'BAMBOU', nom_latin: 'Bambusa arundinacea', formes_dispo: ['MICROSPHERES'] }],
  ['arctium_lappa', { nom_fr: 'BARDANE', nom_latin: 'Arctium lappa', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['ocimum_basilicum', { nom_fr: 'BASILIC', nom_latin: 'Ocimum basilicum', formes_dispo: ['HE'] }],
  ['myroxylon_balsamum', { nom_fr: 'BAUME DU PEROU', nom_latin: 'Myroxylon balsamum', formes_dispo: ['HE'] }],
  ['pimenta_racemosa', { nom_fr: 'BAY SAINT THOMAS (Bay Piment)', nom_latin: 'Pimenta racemosa', formes_dispo: ['HE'] }],
  ['styrax_benzoin', { nom_fr: 'BENJOIN DE SUMATRA', nom_latin: 'Styrax benzoin', formes_dispo: ['HE'] }],
  ['heracleum_sphondylium', { nom_fr: 'BERCE', nom_latin: 'Heracleum sphondylium', formes_dispo: ['MICROSPHERES'] }],
  ['citrus_bergamia', { nom_fr: 'BERGAMOTE', nom_latin: 'Citrus bergamia', formes_dispo: ['HE'] }],
  ['citrus_aurantium', { nom_fr: 'BIGARADE', nom_latin: 'Citrus aurantium', formes_dispo: ['HE'] }],
  ['polygonum_bistorta', { nom_fr: 'BISTORTE', nom_latin: 'Polygonum bistorta', formes_dispo: ['MICROSPHERES'] }],
  ['juniperus_oxycedrus', { nom_fr: 'BOIS DE CADE', nom_latin: 'Juniperus oxycedrus', formes_dispo: ['HE'] }],
  ['cedrus_atlantica', { nom_fr: 'BOIS DE CEDRE', nom_latin: 'Cedrus atlantica', formes_dispo: ['HE'] }],
  ['cinnamomum_camphora', { nom_fr: 'BOIS DE HO', nom_latin: 'Cinnamomum camphora', formes_dispo: ['HE'] }],
  ['peumus_boldus', { nom_fr: 'BOLDO', nom_latin: 'Peumus boldus', formes_dispo: ['MICROSPHERES'] }],
  ['verbascum_thapsus', { nom_fr: 'BOUILLON BLANC', nom_latin: 'Verbascum thapsus', formes_dispo: ['MICROSPHERES'] }],
  ['betula_pendula_roth', { nom_fr: 'BOULEAU BLANC', nom_latin: 'Betula pendula Roth', formes_dispo: ['MICROSPHERES'] }],
  ['betula_pubescens', { nom_fr: 'BOULEAU PUBESCENT', nom_latin: 'Betula pubescens', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['betula_pendula', { nom_fr: 'BOULEAU VERRUQUEUX', nom_latin: 'Betula pendula', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['rhamnus_frangula', { nom_fr: 'BOURDAINE', nom_latin: 'Rhamnus frangula', formes_dispo: ['MICROSPHERES'] }],
  ['borago_officinalis', { nom_fr: 'BOURRACHE', nom_latin: 'Borago officinalis', formes_dispo: ['MICROSPHERES'] }],
  ['arctostaphylos_uva_ursi', { nom_fr: 'BUSSEROLE', nom_latin: 'Arctostaphylos uva ursi', formes_dispo: ['MICROSPHERES'] }],
  ['melaleuca_leucadendra', { nom_fr: 'CAJEPUT', nom_latin: 'Melaleuca leucadendra', formes_dispo: ['HE'] }],
  ['tanacetum_annuum', { nom_fr: 'CAMOMILLE BLEUE (Tanaisie)', nom_latin: 'Tanacetum annuum', formes_dispo: ['HE'] }],
  ['chamomilla_matricaria_recutita', { nom_fr: 'CAMOMILLE MATRICAIRE (Allemande)', nom_latin: 'Chamomilla matricaria recutita', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['anthemis_nobilis', { nom_fr: 'CAMOMILLE ROMAINE (Noble)', nom_latin: 'Anthemis nobilis', formes_dispo: ['HE'] }],
  ['vaccinum_macrocarpon', { nom_fr: 'CANNEBERGE', nom_latin: 'Vaccinum macrocarpon', formes_dispo: ['MICROSPHERES'] }],
  ['cinnamomum_zeylanicum', { nom_fr: 'CANNELLE ECORCE', nom_latin: 'Cinnamomum zeylanicum', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['cannelle_feuille', { nom_fr: 'CANNELLE FEUILLE', nom_latin: 'Cinnamomum zeylanicum', formes_dispo: ['HE'] }],
  ['daucus_carota', { nom_fr: 'CAROTTE SEMENCES', nom_latin: 'Daucus carota', formes_dispo: ['HE'] }],
  ['carum_carvi', { nom_fr: 'CARVI', nom_latin: 'Carum carvi', formes_dispo: ['HE'] }],
  ['ribes_nigrum', { nom_fr: 'CASSIS', nom_latin: 'Ribes nigrum', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['cedrus_deodara', { nom_fr: 'CEDRE DE L\'HIMALAYA', nom_latin: 'Cedrus deodara', formes_dispo: ['HE'] }],
  ['cedrus_libani', { nom_fr: 'CEDRE DU LIBAN', nom_latin: 'cedrus libani', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['apium_graveolens', { nom_fr: 'CELERI SEMENCES', nom_latin: 'Apium graveolens', formes_dispo: ['HE'] }],
  ['silybum_marianum', { nom_fr: 'CHARDON MARIE', nom_latin: 'Silybum marianum', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['carpinus_betulus', { nom_fr: 'CHARME', nom_latin: 'carpinus betulus', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['chelidonium_majus', { nom_fr: 'CHELIDOINE', nom_latin: 'Chelidonium majus', formes_dispo: ['MICROSPHERES'] }],
  ['quercus_robur', { nom_fr: 'CHENE', nom_latin: 'Quercus robur', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['chenopodium_ambrosioides', { nom_fr: 'CHENOPODE', nom_latin: 'Chenopodium ambrosioides', formes_dispo: ['HE'] }],
  ['cimicifuga_racemosa', { nom_fr: 'CIMICIFUGA', nom_latin: 'Cimicifuga racemosa', formes_dispo: ['MICROSPHERES'] }],
  ['cistus_ladanifer', { nom_fr: 'CISTE LADANIFERE', nom_latin: 'Cistus ladanifer', formes_dispo: ['HE'] }],
  ['citrus_limon', { nom_fr: 'CITRON', nom_latin: 'Citrus limon', formes_dispo: ['HE', 'MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['cymbopogon_nardus', { nom_fr: 'CITRONNELLE DE CEYLAN', nom_latin: 'Cymbopogon nardus', formes_dispo: ['HE'] }],
  ['cymbopogon_winterianus', { nom_fr: 'CITRONNELLE DE JAVA', nom_latin: 'Cymbopogon winterianus', formes_dispo: ['HE'] }],
  ['marsdenia_condurango', { nom_fr: 'CONDURANGO', nom_latin: 'Marsdenia condurango', formes_dispo: ['MICROSPHERES'] }],
  ['papaver_rhoeas', { nom_fr: 'COQUELICOT', nom_latin: 'Papaver rhoeas', formes_dispo: ['MICROSPHERES', 'EPF'] }],
  ['coriandrum_sativum', { nom_fr: 'CORIANDRE', nom_latin: 'Coriandrum sativum', formes_dispo: ['HE'] }],
  ['cuminum_cyminum', { nom_fr: 'CUMIN', nom_latin: 'Cuminum cyminum', formes_dispo: ['HE'] }],
  ['curcuma_longa', { nom_fr: 'CURCUMA LONGA', nom_latin: 'Curcuma longa', formes_dispo: ['MICROSPHERES'] }],
  ['safran_de_linde', { nom_fr: "SAFRAN DE L'INDE", nom_latin: 'Curcuma longa', formes_dispo: ['HE'] }],
  ['cupressus_sempervirens', { nom_fr: 'CYPRES', nom_latin: 'Cupressus sempervirens', formes_dispo: ['HE', 'EPS'] }],
  ['turnera_aphrodisiaca', { nom_fr: 'DAMIANA', nom_latin: 'Turnera aphrodisiaca', formes_dispo: ['MICROSPHERES'] }],
  ['desmodium_adscendens', { nom_fr: 'DESMODIUM', nom_latin: 'Desmodium adscendens', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['echinacea_purpurea', { nom_fr: 'ECHINACEE', nom_latin: 'Echinacea purpurea', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['rosa_canina', { nom_fr: 'EGLANTIER', nom_latin: 'Rosa canina', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['canarium_luzonicum', { nom_fr: 'ELEMI', nom_latin: 'Canarium luzonicum', formes_dispo: ['HE'] }],
  ['eleutherococcus_senticosus', { nom_fr: 'ELEUTHEROCOQUE', nom_latin: 'Eleutherococcus senticosus', formes_dispo: ['MICROSPHERES'] }],
  ['boswellia_carterii', { nom_fr: 'ENCENS (Oliban)', nom_latin: 'Boswellia carterii', formes_dispo: ['HE'] }],
  ['picea_mariana', { nom_fr: 'EPINETTE NOIRE', nom_latin: 'Picea mariana', formes_dispo: ['HE'] }],
  ['sisymbrium_officinale', { nom_fr: 'ERYSIMUM', nom_latin: 'Sisymbrium officinale', formes_dispo: ['MICROSPHERES', 'EPF'] }],
  ['eschscholzia_californica', { nom_fr: 'ESCHOLTZIA', nom_latin: 'Eschscholzia californica', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['artemisia_dracunculus', { nom_fr: 'ESTRAGON', nom_latin: 'Artemisia dracunculus', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['eucalyptus_citriodora', { nom_fr: 'EUCALYPTUS CITRONNEE', nom_latin: 'Eucalyptus citriodora', formes_dispo: ['HE'] }],
  ['eucalyptus_globulus', { nom_fr: 'EUCALYPTUS GLOBULEUX', nom_latin: 'Eucalyptus globulus', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['eucalyptus_dives', { nom_fr: 'EUCALYPTUS MENTHOLEE', nom_latin: 'Eucalyptus dives', formes_dispo: ['HE'] }],
  ['eucalyptus_radiata', { nom_fr: 'EUCALYPTUS RADIEE', nom_latin: 'Eucalyptus radiata', formes_dispo: ['HE'] }],
  ['foeniculum_vulgare', { nom_fr: 'FENOUIL', nom_latin: 'Foeniculum vulgare', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['trigonella_foenum_graecum', { nom_fr: 'FENUGREC', nom_latin: 'Trigonella foenum-graecum', formes_dispo: ['MICROSPHERES'] }],
  ['ficus_carica', { nom_fr: 'FIGUIER', nom_latin: 'Ficus carica', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['fragaria_vesca', { nom_fr: 'FRAISIER', nom_latin: 'Fragaria vesca', formes_dispo: ['MICROSPHERES'] }],
  ['rubus_idaeus', { nom_fr: 'FRAMBOISIER', nom_latin: 'rubus idaeus', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['fraxinus_excelsior', { nom_fr: 'FRENE', nom_latin: 'Fraxinus excelsior', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['fucus_vesiculosus', { nom_fr: 'FUCUS', nom_latin: 'Fucus vesiculosus', formes_dispo: ['MICROSPHERES'] }],
  ['fumaria_officinalis', { nom_fr: 'FUMETERRE', nom_latin: 'Fumaria officinalis', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['galega_officinalis', { nom_fr: 'GALEGA', nom_latin: 'Galega officinalis', formes_dispo: ['MICROSPHERES'] }],
  ['garcinia_cambodgia', { nom_fr: 'GARCINIA CAMBODGIA', nom_latin: 'Garcinia cambodgia', formes_dispo: ['MICROSPHERES'] }],
  ['vitex_agnus_castus', { nom_fr: 'GATTILIER', nom_latin: 'Vitex agnus-castus', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['gaultheria_procumbens', { nom_fr: 'GAULTHERIE COUCHEE (Wintergreen)', nom_latin: 'Gaultheria procumbens', formes_dispo: ['HE'] }],
  ['gaultheria_fragrantissima', { nom_fr: 'GAULTHERIE ODORANTE', nom_latin: 'Gaultheria fragrantissima', formes_dispo: ['HE'] }],
  ['juniperus_communis', { nom_fr: 'GENEVRIER', nom_latin: 'Juniperus communis', formes_dispo: ['HE', 'MACERAT_CONCENTRE'] }],
  ['gentiana_lutea', { nom_fr: 'GENTIANE', nom_latin: 'Gentiana lutea', formes_dispo: ['MICROSPHERES'] }],
  ['pelargonium_graveolens', { nom_fr: 'GERANIUM', nom_latin: 'Pelargonium graveolens', formes_dispo: ['HE'] }],
  ['zingiber_officinalis', { nom_fr: 'GINGEMBRE', nom_latin: 'Zingiber officinalis', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['ginkgo_biloba', { nom_fr: 'GINKGO BILOBA', nom_latin: 'Ginkgo biloba', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['panax_ginseng', { nom_fr: 'GINSENG', nom_latin: 'Panax ginseng', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['eugenia_caryophyllus', { nom_fr: 'GIROFLE CLOUS', nom_latin: 'Eugenia caryophyllus', formes_dispo: ['HE'] }],
  ['inula_helenium', { nom_fr: 'GRANDE AUNEE', nom_latin: 'Inula helenium', formes_dispo: ['MICROSPHERES', 'EPF'] }],
  ['lithospermum_erythrorhizon', { nom_fr: 'GREMIL', nom_latin: 'Lithospermum erythrorhizon', formes_dispo: ['MICROSPHERES'] }],
  ['griffonia_simplicifolia', { nom_fr: 'GRIFFONIA', nom_latin: 'Griffonia simplicifolia', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['paullinia_cupana', { nom_fr: 'GUARANA', nom_latin: 'Paullinia cupana', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['viscum_album', { nom_fr: 'GUI', nom_latin: 'viscum album', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['gymnema_sylvestris', { nom_fr: 'GYMNEMA', nom_latin: 'Gymnema sylvestris', formes_dispo: ['MICROSPHERES'] }],
  ['hamamelis_virginiana', { nom_fr: 'HAMAMELIS', nom_latin: 'Hamamelis virginiana', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['harpagophytum_procumbens', { nom_fr: 'HARPAGOPHYTUM', nom_latin: 'Harpagophytum procumbens', formes_dispo: ['MICROSPHERES'] }],
  ['helichrysum_italicum', { nom_fr: 'HELICHRYSE ITALIENNE (Immortelle)', nom_latin: 'Helichrysum italicum', formes_dispo: ['HE'] }],
  ['humulus_lupulus', { nom_fr: 'HOUBLON', nom_latin: 'Humulus lupulus', formes_dispo: ['MICROSPHERES'] }],
  ['hyssopus_officinalis', { nom_fr: 'HYSOPE', nom_latin: 'Hyssopus officinalis', formes_dispo: ['HE'] }],
  ['inula_graveolens', { nom_fr: 'INULE ODORANTE', nom_latin: 'Inula graveolens', formes_dispo: ['HE'] }],
  ['ammi_visnaga', { nom_fr: 'KHELLA', nom_latin: 'Ammi visnaga', formes_dispo: ['HE'] }],
  ['cola_nitida', { nom_fr: 'KOLA', nom_latin: 'Cola nitida', formes_dispo: ['MICROSPHERES'] }],
  ['lamium_album', { nom_fr: 'LAMIER BLANC', nom_latin: 'Lamium album', formes_dispo: ['MICROSPHERES'] }],
  ['laurus_nobilis', { nom_fr: 'LAURIER NOBLE', nom_latin: 'Laurus nobilis', formes_dispo: ['HE'] }],
  ['lavandula_angustifolia', { nom_fr: 'LAVANDE', nom_latin: 'Lavandula angustifolia', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['lavandula_stoechas_l', { nom_fr: 'LAVANDE STOECHAS', nom_latin: 'Lavandula stoechas L.', formes_dispo: ['HE'] }],
  ['lavandula_burnetii', { nom_fr: 'LAVANDIN GROSSO', nom_latin: 'Lavandula burnetii', formes_dispo: ['HE'] }],
  ['cymbopogon_flexuosus', { nom_fr: 'LEMONGRASS', nom_latin: 'Cymbopogon flexuosus', formes_dispo: ['HE'] }],
  ['pistacia_lentiscus', { nom_fr: 'LENTISQUE PISTACHIER', nom_latin: 'Pistacia lentiscus', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['hedera_helix', { nom_fr: 'LIERRE GRIMPANTE', nom_latin: 'Hedera helix', formes_dispo: ['MICROSPHERES', 'EPF'] }],
  ['lotus_corniculatus', { nom_fr: 'LOTIER', nom_latin: 'Lotus corniculatus', formes_dispo: ['MICROSPHERES'] }],
  ['medicago_sativa', { nom_fr: 'LUZERNE (Alpha Alpha)', nom_latin: 'Medicago sativa', formes_dispo: ['MICROSPHERES'] }],
  ['lycopus_europaeus', { nom_fr: 'LYCOPE', nom_latin: 'Lycopus Europaeus', formes_dispo: ['MICROSPHERES', 'EPF'] }],
  ['lepidium_meyenii', { nom_fr: 'MACA', nom_latin: 'Lepidium meyenii', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['zea_mays', { nom_fr: 'MAIS', nom_latin: 'Zea mays', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['citrus_reticulata', { nom_fr: 'MANDARINE', nom_latin: 'Citrus reticulata', formes_dispo: ['HE'] }],
  ['origanum_majorana', { nom_fr: 'MARJOLAINE A COQUILLE', nom_latin: 'Origanum majorana', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['aesculus_hippocastanum', { nom_fr: 'MARRON D\'INDE', nom_latin: 'Aesculus hippocastanum', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['malva_sylvestris', { nom_fr: 'MAUVE', nom_latin: 'Malva sylvestris', formes_dispo: ['MICROSPHERES'] }],
  ['larix_decidua', { nom_fr: 'MELEZE', nom_latin: 'larix decidua', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['melilotus_officinalis', { nom_fr: 'MELILOT', nom_latin: 'Melilotus officinalis', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['melissa_officinalis', { nom_fr: 'MELISSE', nom_latin: 'Melissa officinalis', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['mentha_citrata', { nom_fr: 'MENTHE CITRONNEE', nom_latin: 'Mentha citrata', formes_dispo: ['HE'] }],
  ['mentha_arvensis', { nom_fr: 'MENTHE DES CHAMPS', nom_latin: 'Mentha arvensis', formes_dispo: ['HE'] }],
  ['mentha_piperita', { nom_fr: 'MENTHE POIVREE', nom_latin: 'Mentha piperita', formes_dispo: ['HE'] }],
  ['mentha_spicata', { nom_fr: 'MENTHE VERTE', nom_latin: 'Mentha spicata', formes_dispo: ['HE'] }],
  ['menyanthes_trifoliata', { nom_fr: 'MENYANTHE', nom_latin: 'Menyanthes trifoliata', formes_dispo: ['MICROSPHERES'] }],
  ['achillea_millefolium', { nom_fr: 'MILLEFEUILLE', nom_latin: 'Achillea millefolium', formes_dispo: ['MICROSPHERES'] }],
  ['hypericum_perforatum', { nom_fr: 'MILLEPERTUIS', nom_latin: 'Hypericum perforatum', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['monarda_fistulosa', { nom_fr: 'MONARDE FISTULEUSE', nom_latin: 'Monarda fistulosa', formes_dispo: ['HE'] }],
  ['ptychopetalum_olacoides', { nom_fr: 'MUIRA PUAMA', nom_latin: 'Ptychopetalum olacoides', formes_dispo: ['MICROSPHERES'] }],
  ['morus_alba', { nom_fr: 'MURIER', nom_latin: 'Morus alba', formes_dispo: ['MICROSPHERES'] }],
  ['myristica_fragrans', { nom_fr: 'MUSCADE', nom_latin: 'Myristica fragrans', formes_dispo: ['HE'] }],
  ['commiphora_myrrha', { nom_fr: 'MYRRHE', nom_latin: 'Commiphora myrrha', formes_dispo: ['HE'] }],
  ['myrtus_communis', { nom_fr: 'MYRTE ROUGE', nom_latin: 'Myrtus communis', formes_dispo: ['HE'] }],
  ['vaccinium_myrtillus', { nom_fr: 'MYRTILLE', nom_latin: 'Vaccinium myrtillus', formes_dispo: ['MICROSPHERES'] }],
  ['myrtillier', { nom_fr: 'Myrtillier', nom_latin: 'Vaccinium myrtillus', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['melaleuca_viridiflora', { nom_fr: 'NIAOULI', nom_latin: 'Melaleuca viridiflora', formes_dispo: ['HE'] }],
  ['corylus_avellana', { nom_fr: 'NOISETIER', nom_latin: 'Corylus avellana', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['juglans_regia', { nom_fr: 'NOYER', nom_latin: 'Juglans regia', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['olea_europea', { nom_fr: 'OLIVIER', nom_latin: 'Olea europea', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['citrus_sinensis', { nom_fr: 'ORANGE DOUCE', nom_latin: 'Citrus sinensis', formes_dispo: ['HE'] }],
  ['origanum_compactum', { nom_fr: 'ORIGAN COMPACT', nom_latin: 'Origanum compactum', formes_dispo: ['HE'] }],
  ['thymus_capitatus', { nom_fr: 'ORIGAN D\'ESPAGNE', nom_latin: 'Thymus capitatus', formes_dispo: ['HE'] }],
  ['orthosiphon_aristatus', { nom_fr: 'ORTHOSIPHON', nom_latin: 'Orthosiphon aristatus', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['urtica_dioica', { nom_fr: 'ORTIE PIQUANTE', nom_latin: 'Urtica dioica', formes_dispo: ['MICROSPHERES'] }],
  ['cymbopogon_martinii', { nom_fr: 'PALMAROSA', nom_latin: 'Cymbopogon martinii', formes_dispo: ['HE'] }],
  ['citrus_paradisii', { nom_fr: 'PAMPLEMOUSSE', nom_latin: 'Citrus paradisii', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['carica_papaya', { nom_fr: 'PAPAYE', nom_latin: 'Carica papaya', formes_dispo: ['MICROSPHERES'] }],
  ['tanacetum_parthenium', { nom_fr: 'PARTENELLE', nom_latin: 'Tanacetum parthenium', formes_dispo: ['MICROSPHERES'] }],
  ['passiflora_incarnata', { nom_fr: 'PASSIFLORE', nom_latin: 'Passiflora incarnata', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['pogostemon_cablin', { nom_fr: 'PATCHOULI', nom_latin: 'Pogostemon cablin', formes_dispo: ['HE'] }],
  ['viola_tricolor', { nom_fr: 'PENSEE SAUVAGE', nom_latin: 'Viola tricolor', formes_dispo: ['MICROSPHERES'] }],
  ['petroselinum_sativum', { nom_fr: 'PERSIL', nom_latin: 'Petroselinum sativum', formes_dispo: ['HE'] }],
  ['vinca_minor', { nom_fr: 'PERVENCHE', nom_latin: 'Vinca minor', formes_dispo: ['MICROSPHERES'] }],
  ['ruscus_aceleatus', { nom_fr: 'PETIT HOUX', nom_latin: 'Ruscus aceleatus', formes_dispo: ['MICROSPHERES'] }],
  ['fabiana_imbricata', { nom_fr: 'PICHI', nom_latin: 'Fabiana imbricata', formes_dispo: ['MICROSPHERES'] }],
  ['hieracium_pilosella', { nom_fr: 'PILOSELLE', nom_latin: 'Hieracium pilosella', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['sanguisorba_minor', { nom_fr: 'PIMPRENELLE', nom_latin: 'Sanguisorba minor', formes_dispo: ['MICROSPHERES'] }],
  ['pinus_sylvestris', { nom_fr: 'PIN SYLVESTRE', nom_latin: 'Pinus sylvestris', formes_dispo: ['HE', 'EPS'] }],
  ['taraxacum_officinalis', { nom_fr: 'PISSENLIT', nom_latin: 'Taraxacum officinalis', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['paeonia_lactiflora', { nom_fr: 'PIVOINE', nom_latin: 'Paeonia lactiflora', formes_dispo: ['MICROSPHERES'] }],
  ['plantago_lanceolata', { nom_fr: 'PLANTAIN', nom_latin: 'Plantago lanceolata', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS', 'EPF'] }],
  ['platanus_orientalis', { nom_fr: 'PLATANE', nom_latin: 'platanus orientalis', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['piper_nigrum', { nom_fr: 'POIVRE NOIR', nom_latin: 'Piper nigrum', formes_dispo: ['HE'] }],
  ['malus_domestica', { nom_fr: 'POMMIER', nom_latin: 'malus domestica', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['equisetum_arvense', { nom_fr: 'PRELE', nom_latin: 'Equisetum arvense', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['primula_veris', { nom_fr: 'PRIMEVERE', nom_latin: 'Primula veris', formes_dispo: ['MICROSPHERES'] }],
  ['pygeum_africanum', { nom_fr: 'PYGEUM', nom_latin: 'Pygeum africanum', formes_dispo: ['MICROSPHERES'] }],
  ['raphanus_niger', { nom_fr: 'RADIS NOIR', nom_latin: 'Raphanus niger', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['cochlearia_armoracia', { nom_fr: 'RAIFORT', nom_latin: 'Cochlearia armoracia', formes_dispo: ['MICROSPHERES'] }],
  ['ravensara_aromatica', { nom_fr: 'RAVENSARE AROMATIQUE', nom_latin: 'Ravensara aromatica', formes_dispo: ['HE'] }],
  ['cinnamomum_camphora_ravintsara', { nom_fr: 'RAVINTSARA', nom_latin: 'Cinnamomum camphora', formes_dispo: ['HE'] }],
  ['glycyrrhiza_glabra', { nom_fr: 'REGLISSE', nom_latin: 'Glycyrrhiza glabra', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['filipendula_ulmaria', { nom_fr: 'REINE DES PRES', nom_latin: 'Filipendula ulmaria', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['polygonum_aviculare', { nom_fr: 'RENOUEE DES OISEAUX', nom_latin: 'Polygonum aviculare', formes_dispo: ['MICROSPHERES'] }],
  ['rhodiola_rosea', { nom_fr: 'RHODIOLA', nom_latin: 'Rhodiola rosea', formes_dispo: ['MICROSPHERES', 'EPS', 'EPF'] }],
  ['rheum_palmatum', { nom_fr: 'RHUBARBE', nom_latin: 'Rheum palmatum', formes_dispo: ['MICROSPHERES'] }],
  ['rosmarinus_officinalis', { nom_fr: 'ROMARIN', nom_latin: 'Rosmarinus officinalis', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['romarin_camphre', { nom_fr: 'ROMARIN CAMPHRE', nom_latin: 'Rosmarinus officinalis', formes_dispo: ['HE'] }],
  ['romarin_cineole', { nom_fr: 'ROMARIN CINEOLE', nom_latin: 'Rosmarinus officinalis', formes_dispo: ['HE'] }],
  ['romarin_verbenone', { nom_fr: 'ROMARIN VERBENONE', nom_latin: 'Rosmarinus officinalis', formes_dispo: ['HE'] }],
  ['rubus_fruticosus', { nom_fr: 'RONCE', nom_latin: 'Rubus fruticosus', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['amyris_balsamifera', { nom_fr: 'SANTAL DES INDES', nom_latin: 'Amyris balsamifera', formes_dispo: ['HE'] }],
  ['santalum_austrocaledonicum', { nom_fr: 'SANTAL JAUNE', nom_latin: 'Santalum austrocaledonicum', formes_dispo: ['HE'] }],
  ['abies_alba', { nom_fr: 'SAPIN PECTINE', nom_latin: 'abies alba', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['satureja_montana', { nom_fr: 'SARRIETTE', nom_latin: 'Satureja montana', formes_dispo: ['HE'] }],
  ['salvia_officinalis', { nom_fr: 'SAUGE', nom_latin: 'Salvia officinalis', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['salvia_sclarea', { nom_fr: 'SAUGE SCLAREE', nom_latin: 'Salvia sclarea', formes_dispo: ['HE', 'EPS'] }],
  ['salix_alba', { nom_fr: 'SAULE BLANC', nom_latin: 'Salix alba', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['serenoa_repens', { nom_fr: 'SAW PALMETTO', nom_latin: 'Serenoa repens', formes_dispo: ['MICROSPHERES'] }],
  ['scrophularia_nodosa', { nom_fr: 'SCROFULAIRE', nom_latin: 'Scrophularia nodosa', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['cassia_angustifolia', { nom_fr: 'SENE', nom_latin: 'Cassia angustifolia', formes_dispo: ['MICROSPHERES'] }],
  ['sequoiadendron', { nom_fr: 'SEQUOIA', nom_latin: 'sequoiadendron', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['thymus_serpyllum', { nom_fr: 'SERPOLET', nom_latin: 'Thymus serpyllum', formes_dispo: ['HE', 'EPF'] }],
  ['glycine_max', { nom_fr: 'SOJA', nom_latin: 'Glycine max', formes_dispo: ['MICROSPHERES'] }],
  // NOTE: Solidago virgaurea n'est PAS disponible en Tunisie (vérifié Excel 2025-01)
  ['sambucus_nigra', { nom_fr: 'SUREAU', nom_latin: 'Sambucus nigra', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['tamarix_gallica', { nom_fr: 'TAMARIS', nom_latin: 'tamarix gallica', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['melaleuca_alternifolia', { nom_fr: 'TEA TREE (Arbre à Thé)', nom_latin: 'Melaleuca alternifolia', formes_dispo: ['HE'] }],
  ['pinus_pinaster', { nom_fr: 'TEREBENTHINE', nom_latin: 'Pinus pinaster', formes_dispo: ['HE'] }],
  ['thuya_occidentalis', { nom_fr: 'THUYA OCCIDENTAL', nom_latin: 'Thuya occidentalis', formes_dispo: ['HE'] }],
  ['thymus_vulgaris', { nom_fr: 'THYM', nom_latin: 'Thymus vulgaris', formes_dispo: ['MICROSPHERES'] }],
  ['thym_linalol', { nom_fr: 'THYM LINALOL', nom_latin: 'Thymus vulgaris', formes_dispo: ['HE'] }],
  ['thym_paracymene', { nom_fr: 'THYM PARACYMENE', nom_latin: 'Thymus vulgaris', formes_dispo: ['HE'] }],
  ['thym_thuyanol', { nom_fr: 'THYM THUYANOL', nom_latin: 'Thymus vulgaris', formes_dispo: ['HE'] }],
  ['thym_thymol', { nom_fr: 'THYM THYMOL', nom_latin: 'Thymus vulgaris', formes_dispo: ['HE'] }],
  ['thymus_satureioides', { nom_fr: 'THYM BORNEOL', nom_latin: 'Thymus satureioides', formes_dispo: ['HE'] }],
  ['tilia_cordata', { nom_fr: 'TILLEUL AUBIER', nom_latin: 'Tilia cordata', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['tribulus_terrestris', { nom_fr: 'TRIBULUS', nom_latin: 'Tribulus terrestris', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['valeriana_officinalis', { nom_fr: 'VALERIANE', nom_latin: 'Valeriana officinalis', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['verbena_officinalis', { nom_fr: 'VERVEINE', nom_latin: 'Verbena officinalis', formes_dispo: ['MICROSPHERES'] }],
  ['litsea_cubeba', { nom_fr: 'VERVEINE EXOTIQUE', nom_latin: 'Litsea cubeba', formes_dispo: ['HE'] }],
  ['lippia_citriodora', { nom_fr: 'VERVEINE ODORANTE', nom_latin: 'Lippia citriodora', formes_dispo: ['HE'] }],
  ['vetiveria_zizanioides', { nom_fr: 'VETIVER', nom_latin: 'Vetiveria zizanioides', formes_dispo: ['HE'] }],
  ['vitis_vinifera', { nom_fr: 'VIGNE ROUGE', nom_latin: 'Vitis vinifera', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['viburnum_lantana', { nom_fr: 'VIORNE', nom_latin: 'viburnum lantana', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['cananga_odorata', { nom_fr: 'YLANG YLANG', nom_latin: 'Cananga odorata', formes_dispo: ['HE'] }],

  // ========================================
  // MACÉRATS DE BOURGEONS (Gemmothérapie)
  // ========================================
  ['prunus_amygdalus', { nom_fr: 'Amandier', nom_latin: 'Prunus amygdalus', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['eleagnus_rhamnoides', { nom_fr: 'Argousier', nom_latin: 'Eleagnus rhamnoides', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['calluna_vulgaris', { nom_fr: 'Bruyere', nom_latin: 'Calluna vulgaris', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['castanea_sativa', { nom_fr: 'Chataignier', nom_latin: 'Castanea sativa', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['cornus_sanguinea', { nom_fr: 'Cornouiller Sanguin', nom_latin: 'Cornus sanguinea', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['acer_campestre', { nom_fr: 'Erable Champetre', nom_latin: 'Acer campestre', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['fagus_sylvatica', { nom_fr: 'Hetre', nom_latin: 'Fagus sylvatica', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['morus_nigra', { nom_fr: 'Murier Noir', nom_latin: 'Morus nigra', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['ulmus_glabra', { nom_fr: 'Orme', nom_latin: 'Ulmus glabra', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['populus_nigra', { nom_fr: 'Peuplier Noir', nom_latin: 'Populus nigra', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['pinus_mugo', { nom_fr: 'Pin De Montagne', nom_latin: 'Pinus mugo', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['salix_purpurea', { nom_fr: 'Saule Pourpre', nom_latin: 'Salix purpurea', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['sorbus_domestica', { nom_fr: 'Sorbier', nom_latin: 'Sorbus domestica', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['tilia_tomentosa', { nom_fr: 'Tilleul', nom_latin: 'Tilia tomentosa', formes_dispo: ['MACERAT_CONCENTRE'] }],

  // ========================================
  // EPF (Extraits de Plantes Fraîches)
  // ========================================
  ['allium_ursinum', { nom_fr: 'Ail Des Ours', nom_latin: 'Allium ursinum', formes_dispo: ['EPF'] }],
  ['capsella_bursa_pastoris', { nom_fr: 'Bourse A Pasteur', nom_latin: 'Capsella bursa-pastoris', formes_dispo: ['EPF'] }],
  ['matricaria_recutita', { nom_fr: 'Camomille', nom_latin: 'Matricaria recutita', formes_dispo: ['EPF'] }],
  ['euphrasia_officinalis', { nom_fr: 'Euphraise', nom_latin: 'Euphrasia officinalis', formes_dispo: ['EPF'] }],
  ['origanum_vulgare', { nom_fr: 'Origan', nom_latin: 'Origanum vulgare', formes_dispo: ['EPF'] }],
  ['viola_odorata', { nom_fr: 'Violette', nom_latin: 'Viola odorata', formes_dispo: ['EPF'] }],

  // ========================================
  // HE ADDITIONNELLES (Ajout 2025-12-07)
  // ========================================
  ['camomille_bleue', { nom_fr: 'CAMOMILLE BLEUE', nom_latin: 'Matricaria chamomilla', formes_dispo: ['HE'] }],
  ['girofle', { nom_fr: 'GIROFLE', nom_latin: 'Eugenia caryophyllata', formes_dispo: ['HE'] }],
  ['helichryse_madagascar', { nom_fr: 'HÉLICHRYSE DE MADAGASCAR', nom_latin: 'Helichrysum gymnocephalum', formes_dispo: ['HE'] }],
  ['lavande_aspic', { nom_fr: 'LAVANDE ASPIC', nom_latin: 'Lavandula latifolia', formes_dispo: ['HE'] }],
  ['lavandin_super', { nom_fr: 'LAVANDIN SUPER', nom_latin: 'Lavandula x intermedia', formes_dispo: ['HE'] }],
  ['sapin_siberie', { nom_fr: 'SAPIN DE SIBÉRIE', nom_latin: 'Abies sibirica', formes_dispo: ['HE'] }],
  ['saro', { nom_fr: 'SARO', nom_latin: 'Cinnamosma fragrans', formes_dispo: ['HE'] }],
  // HE MUST (formes obligatoires)
  ['cinnamomum_verum', { nom_fr: 'CANNELLE DE CEYLAN', nom_latin: 'Cinnamomum verum', formes_dispo: ['HE'] }],
  ['pimpinella_anisum', { nom_fr: 'ANIS VERT', nom_latin: 'Pimpinella anisum', formes_dispo: ['HE'] }],
]);

// =============================================================================
// 3. CONSTANTES DE POSOLOGIE TUNISIE
// =============================================================================

const POSOLOGIES_TUNISIE = {
  microspheres: {
    standard: "2 gélules matin et soir (400mg ou 600mg/gélule)",
    leger: "1 gélule matin et soir",
    intensif: "2 gélules 3x/jour",
    enfant: "1-2 gélules/jour"
  },
  macerat_concentre: {
    adulte: "15 gouttes le matin à jeun, 5 JOURS SUR 7",
    enfant: "5-10 gouttes le matin à jeun, 5 JOURS SUR 7",
    intensif: "15 gouttes matin et soir, 5 JOURS SUR 7"
  },
  eps: {
    standard: "5 ml le matin dans un peu d'eau",
    flacon_info: "Préparation 180ml (max 4 plantes × 45ml chacune) = 36 jours"
  },
  he: {
    voie_orale: "1-2 gouttes sur support (miel, huile, comprimé neutre), 2-3x/jour",
    voie_cutanee: "Diluée à 5-20% dans huile végétale",
    diffusion: "20-30 minutes, 2-3x/jour"
  },
  epf: {
    adulte: "15 gouttes matin et soir, sous la langue ou dans un peu d'eau",
    enfant: "5-10 gouttes matin et soir",
    note: "Espacé des repas. Liste restreinte (~16 plantes en Tunisie)"
  }
};

// =============================================================================
// 4. ALTERNATIVES THÉRAPEUTIQUES
// =============================================================================

/**
 * Mapping des alternatives pour les plantes non disponibles
 */
const ALTERNATIVES: Map<string, string[]> = new Map([
  ['lithospermum_officinale', ['lycopus_europaeus', 'melissa_officinalis']],
  ['poterium_sanguisorba', ['hamamelis_virginiana', 'achillea_millefolium']],
  ['arnica_montana', ['malva_sylvestris', 'lavandula_angustifolia']],
  ['medicago_sativa', ['alchemilla_vulgaris', 'achillea_millefolium']],
  ['crocus_sativa', ['rhodiola_rosea', 'hypericum_perforatum']],
  // MUST NON DISPONIBLE - Alternatives
  ['secale_cereale', ['betula_pubescens', 'juniperus_communis']], // Seigle → Bouleau/Genévrier (drainage hépatique)
]);

// =============================================================================
// 5. FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Nettoie et normalise un ID pour la recherche
 */
function sanitizeId(id: string): string {
  return id
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime accents
    .replace(/[-\s]+/g, "_")         // Espaces ET tirets → underscore (kebab-case safe)
    .replace(/[^a-z_]/g, "");
}

// =============================================================================
// ALIAS POUR PLANTES COURANTES (Nom court → ID complet dans TUNISIA_DB)
// =============================================================================
const PLANT_ALIASES: Record<string, string> = {
  // Adaptogènes
  'eleutherococcus': 'eleutherococcus_senticosus',
  'eleuthero': 'eleutherococcus_senticosus',
  'ginseng_siberien': 'eleutherococcus_senticosus',
  'withania': 'withania_somnifera',
  'ashwagandha': 'withania_somnifera',
  'rhodiola': 'rhodiola_rosea',
  'ginseng': 'panax_ginseng',
  'astragalus': 'astragalus_membranaceus',
  'astragale': 'astragalus_membranaceus',
  'maca': 'lepidium_meyenii',
  'lepidium': 'lepidium_meyenii',

  // Drainage hépatique/rénal
  'taraxacum': 'taraxacum_officinalis',  // Attention: 'officinalis' avec 's' dans Excel
  'taraxacum_officinale': 'taraxacum_officinalis', // Alias pour les deux orthographes
  'pissenlit': 'taraxacum_officinalis',
  // NOTE: Solidago NON DISPONIBLE en Tunisie - ne pas inclure dans aliases
  'cynara': 'cynara_scolymus',
  'artichaut': 'cynara_scolymus',
  'desmodium': 'desmodium_adscendens',
  'orthosiphon': 'orthosiphon_aristatus',
  'piloselle': 'hieracium_pilosella',
  'hieracium': 'hieracium_pilosella',
  'fumeterre': 'fumaria_officinalis',
  'fumaria': 'fumaria_officinalis',
  'bardane': 'arctium_lappa',
  'arctium': 'arctium_lappa',
  'radis_noir': 'raphanus_niger',
  'raphanus': 'raphanus_niger',
  'chelidoine': 'chelidonium_majus',

  // Neuro-végétatif
  'passiflora': 'passiflora_incarnata',
  'passiflore': 'passiflora_incarnata',
  'valeriana': 'valeriana_officinalis',
  'valeriane': 'valeriana_officinalis',
  'crataegus': 'crataegus_laevigata',
  'aubepine': 'crataegus_laevigata',
  'tilia': 'tilia_tomentosa',
  'tilleul': 'tilia_tomentosa',
  'tilia_cordata': 'tilia_cordata', // Tilleul aubier
  'melissa': 'melissa_officinalis',
  'melisse': 'melissa_officinalis',
  'escholtzia': 'eschscholzia_californica',
  'eschscholzia': 'eschscholzia_californica',
  'ballota': 'ballota_foetida',
  'ballote': 'ballota_foetida',
  'bacopa': 'bacopa_monnieri',

  // Endocrinien
  'ribes': 'ribes_nigrum',
  'cassis': 'ribes_nigrum',
  'ribes_nigrum': 'ribes_nigrum',
  'vitex': 'vitex_agnus_castus',
  'gattilier': 'vitex_agnus_castus',
  'tribulus': 'tribulus_terrestris',
  'rubus': 'rubus_idaeus',
  'framboisier': 'rubus_idaeus',
  'sequoia': 'sequoiadendron',
  'sequoiadendron_giganteum': 'sequoiadendron',
  'cimicifuga': 'cimicifuga_racemosa',
  'actaea': 'cimicifuga_racemosa',
  'alchemilla': 'alchemilla_vulgaris',
  'alchemille': 'alchemilla_vulgaris',
  'lycopus': 'lycopus_europaeus',
  'lycope': 'lycopus_europaeus',

  // Circulatoire/Veineux
  'vitis': 'vitis_vinifera',
  'vigne_rouge': 'vitis_vinifera',
  'hamamelis': 'hamamelis_virginiana',
  'aesculus': 'aesculus_hippocastanum',
  'marronnier': 'aesculus_hippocastanum',
  'ruscus': 'ruscus_aceleatus',
  'petit_houx': 'ruscus_aceleatus',
  'melilotus': 'melilotus_officinalis',
  'melilot': 'melilotus_officinalis',

  // Autres courantes
  'curcuma': 'curcuma_longa',
  'glycyrrhiza': 'glycyrrhiza_glabra',
  'reglisse': 'glycyrrhiza_glabra',
  'thymus': 'thymus_vulgaris',
  'thym': 'thymus_vulgaris',
  'rosmarinus': 'rosmarinus_officinalis',
  'romarin': 'rosmarinus_officinalis',
  'hypericum': 'hypericum_perforatum',
  'millepertuis': 'hypericum_perforatum',
  'echinacea': 'echinacea_purpurea',
  'echinacee': 'echinacea_purpurea',
  'silybum': 'silybum_marianum',
  'chardon_marie': 'silybum_marianum',
  'ginkgo': 'ginkgo_biloba',
  'lavandula': 'lavandula_angustifolia',
  'lavande': 'lavandula_angustifolia',
  'eucalyptus': 'eucalyptus_globulus',
  'avena': 'avena_sativa',
  'avoine': 'avena_sativa',
  'urtica': 'urtica_dioica',
  'ortie': 'urtica_dioica',
  'equisetum': 'equisetum_arvense',
  'prele': 'equisetum_arvense',
  'filipendula': 'filipendula_ulmaria',
  'reine_des_pres': 'filipendula_ulmaria',
  'harpagophytum': 'harpagophytum_procumbens',
  'griffonia': 'griffonia_simplicifolia',
  'zingiber': 'zingiber_officinalis',
  'gingembre': 'zingiber_officinalis',
  'plantago': 'plantago_lanceolata',
  'plantain': 'plantago_lanceolata',
  'achillea': 'achillea_millefolium',
  'millefeuille': 'achillea_millefolium',
  'achillee': 'achillea_millefolium',

  // Macérats de bourgeons
  'ficus': 'ficus_carica',
  'figuier': 'ficus_carica',
  'cornus': 'cornus_sanguinea',
  'cornouiller': 'cornus_sanguinea',
  'rosa': 'rosa_canina',
  'eglantier': 'rosa_canina',
  'juglans': 'juglans_regia',
  'noyer': 'juglans_regia',
  'alnus': 'alnus_glutinosa',
  'aulne': 'alnus_glutinosa',
  'quercus': 'quercus_robur',
  'chene': 'quercus_robur',
  'olea': 'olea_europea',
  'olivier': 'olea_europea',
  'betula': 'betula_pubescens',
  'bouleau': 'betula_pubescens',
  'fraxinus': 'fraxinus_excelsior',
  'frene': 'fraxinus_excelsior',
  'sambucus': 'sambucus_nigra',
  'sureau': 'sambucus_nigra',
  'carpinus': 'carpinus_betulus',
  'charme': 'carpinus_betulus',
  'viburnum': 'viburnum_lantana',
  'viorne': 'viburnum_lantana',
  'sorbus': 'sorbus_domestica',
  'sorbier': 'sorbus_domestica',
  'fagus': 'fagus_sylvatica',
  'hetre': 'fagus_sylvatica',

  // Huiles essentielles courantes
  'melaleuca': 'melaleuca_alternifolia',
  'tea_tree': 'melaleuca_alternifolia',
  'arbre_a_the': 'melaleuca_alternifolia',
  'ravintsara': 'cinnamomum_camphora_ravintsara',
  'cinnamomum_camphora': 'cinnamomum_camphora_ravintsara',
  'helichrysum': 'helichrysum_italicum',
  'immortelle': 'helichrysum_italicum',
  'cupressus': 'cupressus_sempervirens',
  'cypres': 'cupressus_sempervirens',

  // HE additionnelles (Ajout 2025-12-07)
  'camomille_bleue': 'camomille_bleue',
  'matricaria_chamomilla': 'camomille_bleue',
  'girofle': 'girofle',
  'clou_de_girofle': 'girofle',
  'eugenia_caryophyllata': 'girofle',
  'helichryse_madagascar': 'helichryse_madagascar',
  'helichrysum_gymnocephalum': 'helichryse_madagascar',
  'lavande_aspic': 'lavande_aspic',
  'lavandula_latifolia': 'lavande_aspic',
  'lavandin': 'lavandin_super',
  'lavandin_super': 'lavandin_super',
  'lavandula_intermedia': 'lavandin_super',
  'sapin_siberie': 'sapin_siberie',
  'abies_sibirica': 'sapin_siberie',
  'saro': 'saro',
  'cinnamosma_fragrans': 'saro',
  'mandravasarotra': 'saro',
  // HE MUST
  'cannelle_ceylan': 'cinnamomum_verum',
  'cannelle_de_ceylan': 'cinnamomum_verum',
  'cinnamomum_zeylanicum': 'cinnamomum_verum',
  'anis_vert': 'pimpinella_anisum',
  'anis': 'pimpinella_anisum',
  'badiane': 'pimpinella_anisum',
};

/**
 * Recherche intelligente dans TUNISIA_DB avec aliases et fuzzy matching
 */
function findInTunisiaDB(id: string): TunisiaPlantProfile | undefined {
  const cleanId = sanitizeId(id);

  // 1. Recherche exacte
  let result = TUNISIA_DB.get(cleanId);
  if (result) return result;

  // 2. Recherche via aliases
  const aliasedId = PLANT_ALIASES[cleanId];
  if (aliasedId) {
    result = TUNISIA_DB.get(aliasedId);
    if (result) return result;
  }

  // 3. Fuzzy matching - chercher si le cleanId est contenu dans une clé
  const keys = Array.from(TUNISIA_DB.keys());
  for (const key of keys) {
    if (key.includes(cleanId) || cleanId.includes(key.split('_')[0])) {
      return TUNISIA_DB.get(key);
    }
  }

  // 4. Recherche par nom latin ou français dans les profils
  const entries = Array.from(TUNISIA_DB.entries());
  for (const [, profile] of entries) {
    const latinLower = sanitizeId(profile.nom_latin);
    const frLower = sanitizeId(profile.nom_fr);
    if (latinLower.includes(cleanId) || frLower.includes(cleanId)) {
      return profile;
    }
  }

  return undefined;
}

/**
 * Extrait un nombre d'une chaîne (ex: "50 gouttes" → 50)
 */
function extractNumber(text: string): number | null {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * Détermine l'intensité de la posologie France
 */
function getDosageIntensity(dosage: string): 'leger' | 'standard' | 'intensif' {
  const num = extractNumber(dosage) || 0;
  const hasMultiple = /3\s*x|3\s*fois|trois\s*fois/i.test(dosage);
  
  if (hasMultiple || num > 100) return 'intensif';
  if (num < 30) return 'leger';
  return 'standard';
}

// =============================================================================
// 6. MOTEUR DE CONVERSION
// =============================================================================

/**
 * Adapte une plante individuelle au contexte tunisien
 */
export function adaptPlant(plant: PlantInput): PlantOutput {
  const output: PlantOutput = {
    ...plant,
    original_form: plant.form,
    original_dosage: plant.dosage,
    is_available_tunisia: false,
    adapted_form: null,
    adapted_dosage: null,
    conversion_note: null,
    alert_level: 'NONE'
  };

  // Recherche intelligente avec aliases et fuzzy matching
  const dbEntry = findInTunisiaDB(plant.plant_id) || findInTunisiaDB(plant.name_latin) || findInTunisiaDB(plant.name_fr);
  const cleanId = sanitizeId(plant.plant_id);

  // =========================================
  // CAS 1: Plante NON disponible en Tunisie
  // =========================================
  if (!dbEntry) {
    output.is_available_tunisia = false;
    output.alert_level = 'CRITICAL';
    output.conversion_note = `⛔ PLANTE NON DISPONIBLE en Tunisie: ${plant.name_fr || plant.name_latin}`;
    
    // Chercher des alternatives
    const alternatives = ALTERNATIVES.get(cleanId);
    if (alternatives && alternatives.length > 0) {
      output.alternatives = alternatives.map(altId => {
        const altEntry = TUNISIA_DB.get(altId);
        return altEntry ? `${altEntry.nom_fr} (${altEntry.nom_latin})` : altId;
      });
      output.conversion_note += ` | Alternatives suggérées: ${output.alternatives.join(', ')}`;
    }
    
    return output;
  }

  // =========================================
  // CAS 2: Plante disponible - Conversion
  // =========================================
  output.is_available_tunisia = true;
  output.available_forms = dbEntry.formes_dispo;

  const formIn = plant.form.toUpperCase();
  const intensity = getDosageIntensity(plant.dosage);

  // -----------------------------------------
  // CAS A: TEINTURE MÈRE (TM) → Microsphères
  // -----------------------------------------
  if (formIn.includes('TM') || formIn.includes('TEINTURE')) {
    if (dbEntry.formes_dispo.includes('MICROSPHERES')) {
      output.adapted_form = "Microsphères (Gélules 400mg)";
      output.adapted_dosage = POSOLOGIES_TUNISIE.microspheres[intensity];
      output.conversion_note = "✅ Conversion: TM (non dispo) → Microsphères | Ratio 1g micro = 10g TM";
      output.alert_level = 'INFO';
    } else if (dbEntry.formes_dispo.includes('EPS')) {
      output.adapted_form = "EPS";
      output.adapted_dosage = POSOLOGIES_TUNISIE.eps.standard;
      output.conversion_note = "✅ Conversion: TM (non dispo) → EPS";
      output.alert_level = 'INFO';
    } else {
      output.alert_level = 'WARNING';
      output.conversion_note = `⚠️ TM non dispo et pas de Microsphères/EPS. Formes dispo: ${dbEntry.formes_dispo.join(', ')}`;
    }
  }

  // -----------------------------------------
  // CAS B: MACÉRAT 1DH → Macérat Concentré
  // -----------------------------------------
  else if (formIn.includes('MG') || formIn.includes('1DH') || formIn.includes('MACERAT') || formIn.includes('MACÉRAT')) {
    if (dbEntry.formes_dispo.includes('MACERAT_CONCENTRE')) {
      output.adapted_form = "Macérat Concentré (Mère)";
      
      // Calcul de la conversion: diviser par 10
      const dropsFrance = extractNumber(plant.dosage) || 50;
      const dropsTunisie = Math.max(5, Math.ceil(dropsFrance / 10));
      
      output.adapted_dosage = `${dropsTunisie} gouttes le matin à jeun, 5 JOURS SUR 7`;
      output.conversion_note = `⚠️ CONVERSION CRITIQUE: 1DH ${dropsFrance}gt → Concentré ${dropsTunisie}gt (÷10) | NE PAS SURDOSER`;
      output.alert_level = 'WARNING';
    } else {
      output.alert_level = 'CRITICAL';
      output.conversion_note = `⛔ Macérat non disponible pour ${plant.name_fr}. Formes dispo: ${dbEntry.formes_dispo.join(', ')}`;
    }
  }

  // -----------------------------------------
  // CAS C: EPS → EPS (Identité)
  // -----------------------------------------
  else if (formIn.includes('EPS')) {
    if (dbEntry.formes_dispo.includes('EPS')) {
      output.adapted_form = "EPS";
      output.adapted_dosage = POSOLOGIES_TUNISIE.eps.standard;
      output.conversion_note = "✅ Conforme: EPS disponible tel quel";
      output.alert_level = 'NONE';
    } else if (dbEntry.formes_dispo.includes('MICROSPHERES')) {
      output.adapted_form = "Microsphères (Gélules 400mg)";
      output.adapted_dosage = POSOLOGIES_TUNISIE.microspheres.standard;
      output.conversion_note = "⚠️ EPS non dispo → Substitution par Microsphères";
      output.alert_level = 'INFO';
    } else {
      output.alert_level = 'WARNING';
      output.conversion_note = `⚠️ EPS non dispo. Formes dispo: ${dbEntry.formes_dispo.join(', ')}`;
    }
  }

  // -----------------------------------------
  // CAS D: HUILE ESSENTIELLE → HE avec 4 voies Tunisie
  // -----------------------------------------
  else if (formIn.includes('HE') || formIn.includes('HUILE')) {
    if (dbEntry.formes_dispo.includes('HE')) {
      // Déterminer la voie d'aromathérapie
      const voie: VoieAromatherapie = plant.voie_aroma ||
        determinerVoieAromatherapie(plant.symptome_cible || plant.justification || '', plant.aigu || false);

      // Récupérer le badge et couleur pour l'UI
      const voieConfig = VOIES_AROMATHERAPIE[voie];
      output.voie_badge = voieConfig.badge;
      output.voie_couleur = voieConfig.couleur;

      // Adapter la forme et posologie selon la voie (v3.1 - noms harmonisés)
      switch (voie) {
        case 'SOLUTION_ORALE':
          output.adapted_form = "Solution Orale HE (S.O.HE)";
          output.adapted_form_code = 'SOLUTION_ORALE';  // Harmonisé v3.1
          output.adapted_dosage = "2 ml x 2/jour au milieu du repas, 30 jours";
          output.conversion_note = `✅ HE - Voie FOND: ${voieConfig.nom}`;
          break;
        case 'SUPPOSITOIRE':
          output.adapted_form = "Suppositoires HE";
          output.adapted_form_code = 'SUPPOSITOIRE';  // Harmonisé v3.1
          output.adapted_dosage = "1 suppositoire matin et soir, 3-5 jours";
          output.conversion_note = `✅ HE - Voie AIGU ORL: ${voieConfig.nom}`;
          break;
        case 'CUTANEE':
          output.adapted_form = "HE voie cutanée";
          output.adapted_form_code = 'CUTANEE';  // Harmonisé v3.1
          output.adapted_dosage = `Dilution ${plant.dilution || '5-10%'} dans ${plant.huile_vegetale || 'HV Jojoba'}, application ${plant.zone_application || 'locale'}`;
          output.conversion_note = `✅ HE - Voie LOCALE: ${voieConfig.nom}`;
          break;
        case 'INHALATION':
          output.adapted_form = "HE inhalation";
          output.adapted_form_code = 'INHALATION';  // Harmonisé v3.1
          output.adapted_dosage = "5-10 gouttes dans bol d'eau chaude, 10min x 2-3/jour";
          output.conversion_note = `✅ HE - Voie ORL: ${voieConfig.nom}`;
          break;
        default:
          output.adapted_form = "HE";
          output.adapted_form_code = 'HE';
          output.adapted_dosage = plant.dosage;
          output.conversion_note = "✅ Conforme: HE disponible";
      }
      output.alert_level = 'NONE';
    } else {
      output.alert_level = 'CRITICAL';
      output.conversion_note = `⛔ HE non disponible pour ${plant.name_fr}`;
    }
  }

  // -----------------------------------------
  // CAS E: EPF (Extraits de Plantes Fraîches)
  // -----------------------------------------
  else if (formIn.includes('EPF') || formIn.includes('EXTRAIT') && formIn.includes('FRAICH')) {
    if (dbEntry.formes_dispo.includes('EPF')) {
      output.adapted_form = "EPF";
      output.adapted_dosage = POSOLOGIES_TUNISIE.epf.adulte;
      output.conversion_note = "✅ Conforme: EPF disponible (liste restreinte Tunisie)";
      output.alert_level = 'NONE';
    } else {
      // Fallback vers microsphères ou EPS si EPF non dispo
      if (dbEntry.formes_dispo.includes('MICROSPHERES')) {
        output.adapted_form = "Microsphères (Gélules)";
        output.adapted_dosage = POSOLOGIES_TUNISIE.microspheres.standard;
        output.conversion_note = "⚠️ EPF non dispo → Substitution par Microsphères";
        output.alert_level = 'INFO';
      } else if (dbEntry.formes_dispo.includes('EPS')) {
        output.adapted_form = "EPS";
        output.adapted_dosage = POSOLOGIES_TUNISIE.eps.standard;
        output.conversion_note = "⚠️ EPF non dispo → Substitution par EPS";
        output.alert_level = 'INFO';
      } else {
        output.alert_level = 'WARNING';
        output.conversion_note = `⚠️ EPF non dispo. Formes dispo: ${dbEntry.formes_dispo.join(', ')}`;
      }
    }
  }

  // -----------------------------------------
  // CAS F: FORME INCONNUE
  // -----------------------------------------
  else {
    output.adapted_form = plant.form + " (?)";
    output.adapted_dosage = plant.dosage;
    output.alert_level = 'WARNING';
    output.conversion_note = `⚠️ Forme galénique non reconnue: "${plant.form}"`;
  }

  // =========================================
  // VÉRIFICATION MUST_FORMS (v2.1)
  // =========================================
  // Vérifie si la plante a une forme galénique OBLIGATOIRE
  const mustInfo = getMustForm(plant.plant_id) || getMustForm(plant.name_latin);

  if (mustInfo) {
    // CAS 1: La forme adaptée n'est pas définie (ex: EPS non dispo) → forcer la forme MUST
    if (!output.adapted_form && dbEntry?.formes_dispo.includes(mustInfo.forme)) {
      output.adapted_form = mustInfo.forme === 'MACERAT_CONCENTRE'
        ? "Macérat Concentré (Mère)"
        : mustInfo.forme;
      output.adapted_dosage = getPosologieForMust(mustInfo.forme);
      output.is_available_tunisia = true;
      output.alert_level = mustInfo.level === 'ABSOLUTE' ? 'INFO' : 'INFO';
      output.conversion_note = `✅ Plante MUST: ${mustInfo.nom_francais} prescrit en ${mustInfo.forme} (forme obligatoire)`;
    }
    // CAS 2: La forme adaptée est définie mais différente de la forme MUST
    else if (output.adapted_form) {
      const adaptedFormNormalized = normalizeFormForMust(output.adapted_form);

      if (adaptedFormNormalized !== mustInfo.forme) {
        const warning = getConversionWarning(plant.plant_id, adaptedFormNormalized);

        if (warning.level === 'CRITICAL') {
          // ABSOLUTE: Bloquer la conversion et forcer la forme MUST
          if (dbEntry?.formes_dispo.includes(mustInfo.forme)) {
            output.adapted_form = mustInfo.forme === 'MACERAT_CONCENTRE'
              ? "Macérat Concentré (Mère)"
              : mustInfo.forme;
            output.adapted_dosage = getPosologieForMust(mustInfo.forme);
            output.alert_level = 'CRITICAL';
            output.conversion_note = `${warning.message} → Forme forcée: ${mustInfo.forme}`;
          } else {
            output.alert_level = 'CRITICAL';
            output.conversion_note = `${warning.message} | ⚠️ Forme ${mustInfo.forme} non disponible!`;
          }
        } else if (warning.level === 'WARNING') {
          // STRONG: Avertir mais ne pas bloquer
          if (output.alert_level !== 'CRITICAL') {
            output.alert_level = 'WARNING';
          }
          output.conversion_note = output.conversion_note
            ? `${output.conversion_note} | ${warning.message}`
            : warning.message;
        }
      }
    }
  }

  return output;
}

/**
 * Normalise une forme adaptée vers le type GalenicForm pour comparaison MUST
 */
function normalizeFormForMust(form: string): GalenicForm {
  const formUpper = form.toUpperCase();
  if (formUpper.includes('MICROSPH') || formUpper.includes('GÉLULE') || formUpper.includes('GELULE')) {
    return 'MICROSPHERES';
  }
  if (formUpper.includes('MACERAT') || formUpper.includes('MACÉRAT') || formUpper.includes('MG') || formUpper.includes('BOURGEON')) {
    return 'MACERAT_CONCENTRE';
  }
  if (formUpper.includes('EPS')) {
    return 'EPS';
  }
  if (formUpper.includes('HE') || formUpper.includes('HUILE')) {
    return 'HE';
  }
  if (formUpper.includes('EPF')) {
    return 'EPF';
  }
  return 'MICROSPHERES'; // Default
}

/**
 * Retourne la posologie pour une forme MUST
 */
function getPosologieForMust(forme: GalenicForm): string {
  switch (forme) {
    case 'MACERAT_CONCENTRE':
      return POSOLOGIES_TUNISIE.macerat_concentre.adulte;
    case 'HE':
      return POSOLOGIES_TUNISIE.he.voie_orale;
    case 'EPS':
      return POSOLOGIES_TUNISIE.eps.standard;
    case 'EPF':
      return POSOLOGIES_TUNISIE.epf.adulte;
    case 'MICROSPHERES':
    default:
      return POSOLOGIES_TUNISIE.microspheres.standard;
  }
}

/**
 * Adapte un oligoélément (généralement disponible)
 */
function adaptOligo(oligo: OligoInput): OligoOutput {
  return {
    ...oligo,
    is_available_tunisia: true, // Les oligos sont généralement disponibles
    alert_level: 'NONE'
  };
}

// =============================================================================
// 7. FONCTION PRINCIPALE D'EXPORT
// =============================================================================

/**
 * FONCTION PRINCIPALE: Convertit une prescription complète au format Tunisie
 * 
 * @param input - Prescription JSON générée par l'IA (format France)
 * @returns Prescription adaptée au contexte tunisien
 */
export function adaptPrescriptionToTunisia(input: PrescriptionInput): PrescriptionOutput {
  const output: PrescriptionOutput = {
    global_strategy_summary: input.global_strategy_summary,
    priority_axis: input.priority_axis,
    prescription: {
      symptomatic: [],
      neuro_endocrine: [],
      ans: [],
      drainage: [],
      oligos: []
    },
    meta: {
      conversion_date: new Date().toISOString(),
      total_plants: 0,
      available_count: 0,
      warnings_count: 0,
      critical_count: 0,
      conversions_applied: []
    }
  };

  // Convertir chaque dimension
  const plantDimensions = ['symptomatic', 'neuro_endocrine', 'ans', 'drainage'] as const;

  plantDimensions.forEach(dim => {
    if (input.prescription[dim] && Array.isArray(input.prescription[dim])) {
      output.prescription[dim] = input.prescription[dim].map(plant => {
        const adapted = adaptPlant(plant);
        
        // Compteurs pour meta
        output.meta.total_plants++;
        if (adapted.is_available_tunisia) output.meta.available_count++;
        if (adapted.alert_level === 'WARNING') output.meta.warnings_count++;
        if (adapted.alert_level === 'CRITICAL') output.meta.critical_count++;
        if (adapted.conversion_note && adapted.alert_level !== 'NONE') {
          output.meta.conversions_applied.push(`${adapted.name_fr}: ${adapted.conversion_note}`);
        }
        
        return adapted;
      });
    }
  });

  // Convertir les oligoéléments
  if (input.prescription.oligos && Array.isArray(input.prescription.oligos)) {
    output.prescription.oligos = input.prescription.oligos.map(oligo => adaptOligo(oligo));
  }

  return output;
}

// =============================================================================
// 8. FONCTIONS UTILITAIRES EXPORTÉES
// =============================================================================

/**
 * Vérifie si une plante est disponible en Tunisie
 */
export function isAvailableInTunisia(plantId: string): boolean {
  const cleanId = sanitizeId(plantId);
  return TUNISIA_DB.has(cleanId);
}

/**
 * Retourne les formes disponibles pour une plante
 */
export function getAvailableForms(plantId: string): FormeTunisie[] {
  const cleanId = sanitizeId(plantId);
  const entry = TUNISIA_DB.get(cleanId);
  return entry?.formes_dispo || [];
}

/**
 * Retourne les informations d'une plante
 */
export function getPlantInfo(plantId: string): TunisiaPlantProfile | null {
  const cleanId = sanitizeId(plantId);
  return TUNISIA_DB.get(cleanId) || null;
}

/**
 * Retourne le nombre total de plantes dans la base
 */
export function getTotalPlantsCount(): number {
  return TUNISIA_DB.size;
}

/**
 * Recherche des plantes par nom (français ou latin)
 */
export function searchPlants(query: string): TunisiaPlantProfile[] {
  const results: TunisiaPlantProfile[] = [];
  const queryLower = query.toLowerCase();
  
  TUNISIA_DB.forEach((profile) => {
    if (
      profile.nom_fr.toLowerCase().includes(queryLower) ||
      profile.nom_latin.toLowerCase().includes(queryLower)
    ) {
      results.push(profile);
    }
  });

  return results;
}

/**
 * Retourne la liste des produits tunisiens disponibles formatée pour le chat
 * Utilisé pour enrichir le contexte des Assistants lors des questions de substitution
 */
export function getTunisianProductsContext(): string {
  const categories: Record<string, string[]> = {
    'MICROSPHÈRES': [],
    'MACÉRAT CONCENTRÉ (Bourgeons)': [],
    'EPS (Extraits de Plantes Standardisés)': [],
    'EPF (Extraits de Plantes Fraîches)': [],
    'HE (Huiles Essentielles)': [],
  };

  TUNISIA_DB.forEach((profile, id) => {
    const forms = profile.formes_dispo;
    if (forms.includes('MICROSPHERES')) {
      categories['MICROSPHÈRES'].push(`${profile.nom_fr} (${profile.nom_latin})`);
    }
    if (forms.includes('MACERAT_CONCENTRE')) {
      categories['MACÉRAT CONCENTRÉ (Bourgeons)'].push(`${profile.nom_fr} (${profile.nom_latin})`);
    }
    if (forms.includes('EPS')) {
      categories['EPS (Extraits de Plantes Standardisés)'].push(`${profile.nom_fr} (${profile.nom_latin})`);
    }
    if (forms.includes('EPF')) {
      categories['EPF (Extraits de Plantes Fraîches)'].push(`${profile.nom_fr} (${profile.nom_latin})`);
    }
    if (forms.includes('HE')) {
      categories['HE (Huiles Essentielles)'].push(`${profile.nom_fr} (${profile.nom_latin})`);
    }
  });

  let context = `=== PRODUITS DISPONIBLES EN TUNISIE ===\n\n`;

  for (const [category, plants] of Object.entries(categories)) {
    if (plants.length > 0) {
      context += `📦 ${category} (${plants.length} produits):\n`;
      context += plants.slice(0, 30).join(', '); // Limiter pour éviter trop de contexte
      if (plants.length > 30) {
        context += `, ... et ${plants.length - 30} autres`;
      }
      context += '\n\n';
    }
  }

  context += `\n💡 RÈGLES DE CONVERSION TUNISIE:\n`;
  context += `- TM (France) → Microsphères (2-3 gél/jour)\n`;
  context += `- MG 1DH (France) → Macérat Concentré (15 gouttes/jour, 5j/7)\n`;
  context += `- EPS : identique (5ml/jour)\n`;
  context += `- HE : identique\n`;

  return context;
}

/**
 * Recherche les alternatives tunisiennes pour une plante donnée
 */
export function findTunisianAlternatives(plantName: string): { found: boolean; product?: TunisiaPlantProfile; forms: string[] } {
  const queryLower = plantName.toLowerCase();

  let bestMatch: TunisiaPlantProfile | undefined;

  TUNISIA_DB.forEach((profile) => {
    if (
      profile.nom_fr.toLowerCase().includes(queryLower) ||
      profile.nom_latin.toLowerCase().includes(queryLower) ||
      queryLower.includes(profile.nom_fr.toLowerCase().split(' ')[0])
    ) {
      bestMatch = profile;
    }
  });

  if (bestMatch) {
    return {
      found: true,
      product: bestMatch,
      forms: bestMatch.formes_dispo.map(f => {
        switch(f) {
          case 'MICROSPHERES': return 'Microsphères';
          case 'MACERAT_CONCENTRE': return 'Macérat Concentré';
          case 'EPS': return 'EPS';
          case 'EPF': return 'EPF';
          case 'HE': return 'Huile Essentielle';
          default: return f;
        }
      })
    };
  }

  return { found: false, forms: [] };
}
