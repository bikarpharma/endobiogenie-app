/**
 * ============================================================================
 * INTEGRIA - TUNISIAN ADAPTER MIDDLEWARE v2.0 (Production Ready)
 * ============================================================================
 * 
 * Ce module est le "Douanier Logistique". Il reçoit une prescription théorique
 * (Format France/Endobiogénie) et la convertit en format exécutable pour la Tunisie.
 * 
 * RÈGLES CRITIQUES :
 * 1. TM (France) → Microsphères (Tunisie) : 1g micro = 10g TM
 * 2. MG 1DH (France) → Macérat Concentré (Tunisie) : Division dose par 10
 * 3. EPS & HE : Pas de conversion (Identité)
 * 4. Disponibilité : Vérification stricte via ID normalisé
 * 
 * POSOLOGIES TUNISIE :
 * - Microsphères : 2-3 gélules/jour (400mg ou 600mg)
 * - Macérat Concentré : 15 gouttes/jour, 5 JOURS SUR 7
 * - EPS : 5ml/jour (flacon 180ml = 3 plantes × 60ml)
 * - HE : Identique France
 * ============================================================================
 */

// =============================================================================
// 1. TYPES & INTERFACES
// =============================================================================

/** Formes galéniques France (input) */
export type FormeFrance = 'TM' | 'MG 1DH' | 'EPS' | 'HE';

/** Formes galéniques Tunisie (output) */
export type FormeTunisie = 'MICROSPHERES' | 'MACERAT_CONCENTRE' | 'EPS' | 'HE' | 'EPF';

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
}

/** Plante en sortie (adaptée Tunisie) */
export interface PlantOutput extends PlantInput {
  // Disponibilité
  is_available_tunisia: boolean;
  available_forms?: FormeTunisie[];
  
  // Conversion
  original_form: string;
  original_dosage: string;
  adapted_form: string | null;
  adapted_dosage: string | null;
  conversion_note: string | null;
  
  // Alertes
  alert_level: AlertLevel;
  
  // Alternatives si non disponible
  alternatives?: string[];
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
// 2. BASE DE DONNÉES TUNISIENNE (246 plantes)
// =============================================================================

interface TunisiaPlantProfile {
  nom_fr: string;
  nom_latin: string;
  formes_dispo: FormeTunisie[];
}

/**
 * Base de données complète des plantes disponibles en Tunisie
 * Source: Excel "plantes_extraits_complet.xlsx"
 */
const TUNISIA_DB = new Map<string, TunisiaPlantProfile>([
  // === PLANTES CLÉS EN ENDOBIOGÉNIE ===
  
  ['passiflora_incarnata', { nom_fr: 'Passiflore', nom_latin: 'Passiflora incarnata', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['ribes_nigrum', { nom_fr: 'Cassis', nom_latin: 'Ribes nigrum', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['matricaria_recutita', { nom_fr: 'Camomille Matricaire', nom_latin: 'Matricaria recutita', formes_dispo: ['HE', 'MICROSPHERES', 'EPF'] }],
  ['lavandula_angustifolia', { nom_fr: 'Lavande', nom_latin: 'Lavandula angustifolia', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['valeriana_officinalis', { nom_fr: 'Valériane', nom_latin: 'Valeriana officinalis', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['leonurus_cardiaca', { nom_fr: 'Agripaume', nom_latin: 'Leonurus cardiaca', formes_dispo: ['MICROSPHERES'] }],
  ['agrimonia_eupatoria', { nom_fr: 'Aigremoine', nom_latin: 'Agrimonia eupatoria', formes_dispo: ['MICROSPHERES', 'EPF'] }],
  ['alchemilla_vulgaris', { nom_fr: 'Alchémille', nom_latin: 'Alchemilla vulgaris', formes_dispo: ['EPS'] }],
  ['arctium_lappa', { nom_fr: 'Bardane', nom_latin: 'Arctium lappa', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['crataegus_laevigata', { nom_fr: 'Aubépine', nom_latin: 'Crataegus laevigata', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['cynara_scolymus', { nom_fr: 'Artichaut', nom_latin: 'Cynara scolymus', formes_dispo: ['HE', 'MICROSPHERES', 'EPS'] }],
  ['silybum_marianum', { nom_fr: 'Chardon-Marie', nom_latin: 'Silybum marianum', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['taraxacum_officinale', { nom_fr: 'Pissenlit', nom_latin: 'Taraxacum officinale', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['thymus_vulgaris', { nom_fr: 'Thym', nom_latin: 'Thymus vulgaris', formes_dispo: ['MICROSPHERES'] }],
  ['eucalyptus_globulus', { nom_fr: 'Eucalyptus Globuleux', nom_latin: 'Eucalyptus globulus', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['melissa_officinalis', { nom_fr: 'Mélisse', nom_latin: 'Melissa officinalis', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['echinacea_purpurea', { nom_fr: 'Échinacée', nom_latin: 'Echinacea purpurea', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['rhodiola_rosea', { nom_fr: 'Rhodiola', nom_latin: 'Rhodiola rosea', formes_dispo: ['MICROSPHERES', 'EPS', 'EPF'] }],
  ['hamamelis_virginiana', { nom_fr: 'Hamamélis', nom_latin: 'Hamamelis virginiana', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['achillea_millefolium', { nom_fr: 'Millefeuille', nom_latin: 'Achillea millefolium', formes_dispo: ['MICROSPHERES'] }],
  ['vitex_agnus_castus', { nom_fr: 'Gattilier', nom_latin: 'Vitex agnus-castus', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['fumaria_officinalis', { nom_fr: 'Fumeterre', nom_latin: 'Fumaria officinalis', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['viola_tricolor', { nom_fr: 'Pensée Sauvage', nom_latin: 'Viola tricolor', formes_dispo: ['MICROSPHERES'] }],
  ['plantago_lanceolata', { nom_fr: 'Plantain', nom_latin: 'Plantago lanceolata', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS', 'EPF'] }],
  ['avena_sativa', { nom_fr: 'Avoine', nom_latin: 'Avena sativa', formes_dispo: ['MICROSPHERES'] }],
  ['lycopus_europaeus', { nom_fr: 'Lycope', nom_latin: 'Lycopus europaeus', formes_dispo: ['MICROSPHERES', 'EPF'] }],
  ['fabiana_imbricata', { nom_fr: 'Pichi', nom_latin: 'Fabiana imbricata', formes_dispo: ['MICROSPHERES'] }],
  ['lamium_album', { nom_fr: 'Lamier Blanc', nom_latin: 'Lamium album', formes_dispo: ['MICROSPHERES'] }],
  ['malva_sylvestris', { nom_fr: 'Mauve', nom_latin: 'Malva sylvestris', formes_dispo: ['MICROSPHERES'] }],
  ['fragaria_vesca', { nom_fr: 'Fraisier', nom_latin: 'Fragaria vesca', formes_dispo: ['MICROSPHERES'] }],
  ['ginkgo_biloba', { nom_fr: 'Ginkgo Biloba', nom_latin: 'Ginkgo biloba', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['quercus_robur', { nom_fr: 'Chêne', nom_latin: 'Quercus robur', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['eschscholzia_californica', { nom_fr: 'Escholtzia', nom_latin: 'Eschscholzia californica', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['hypericum_perforatum', { nom_fr: 'Millepertuis', nom_latin: 'Hypericum perforatum', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['desmodium_adscendens', { nom_fr: 'Desmodium', nom_latin: 'Desmodium adscendens', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['raphanus_niger', { nom_fr: 'Radis Noir', nom_latin: 'Raphanus niger', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['griffonia_simplicifolia', { nom_fr: 'Griffonia', nom_latin: 'Griffonia simplicifolia', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['filipendula_ulmaria', { nom_fr: 'Reine des Prés', nom_latin: 'Filipendula ulmaria', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['harpagophytum_procumbens', { nom_fr: 'Harpagophytum', nom_latin: 'Harpagophytum procumbens', formes_dispo: ['MICROSPHERES'] }],
  ['inula_helenium', { nom_fr: 'Grande Aunée', nom_latin: 'Inula helenium', formes_dispo: ['MICROSPHERES', 'EPF'] }],
  
  // === MACÉRATS DE BOURGEONS ===
  
  ['tilia_tomentosa', { nom_fr: 'Tilleul', nom_latin: 'Tilia tomentosa', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['cornus_sanguinea', { nom_fr: 'Cornouiller Sanguin', nom_latin: 'Cornus sanguinea', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['sequoiadendron', { nom_fr: 'Séquoia', nom_latin: 'Sequoiadendron giganteum', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['rosa_canina', { nom_fr: 'Églantier', nom_latin: 'Rosa canina', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['rubus_idaeus', { nom_fr: 'Framboisier', nom_latin: 'Rubus idaeus', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['ficus_carica', { nom_fr: 'Figuier', nom_latin: 'Ficus carica', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['juglans_regia', { nom_fr: 'Noyer', nom_latin: 'Juglans regia', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['alnus_glutinosa', { nom_fr: 'Aulne', nom_latin: 'Alnus glutinosa', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['populus_nigra', { nom_fr: 'Peuplier Noir', nom_latin: 'Populus nigra', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['prunus_amygdalus', { nom_fr: 'Amandier', nom_latin: 'Prunus amygdalus', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['betula_pubescens', { nom_fr: 'Bouleau Pubescent', nom_latin: 'Betula pubescens', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['fraxinus_excelsior', { nom_fr: 'Frêne', nom_latin: 'Fraxinus excelsior', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['olea_europea', { nom_fr: 'Olivier', nom_latin: 'Olea europea', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['vitis_vinifera', { nom_fr: 'Vigne Rouge', nom_latin: 'Vitis vinifera', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['aesculus_hippocastanum', { nom_fr: 'Marronnier', nom_latin: 'Aesculus hippocastanum', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['carpinus_betulus', { nom_fr: 'Charme', nom_latin: 'Carpinus betulus', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['fagus_sylvatica', { nom_fr: 'Hêtre', nom_latin: 'Fagus sylvatica', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['sorbus_domestica', { nom_fr: 'Sorbier', nom_latin: 'Sorbus domestica', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['ulmus_glabra', { nom_fr: 'Orme', nom_latin: 'Ulmus glabra', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['viburnum_lantana', { nom_fr: 'Viorne', nom_latin: 'Viburnum lantana', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['vaccinium_vitis_idaea', { nom_fr: 'Airelle', nom_latin: 'Vaccinium vitis-idaea', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['viscum_album', { nom_fr: 'Gui', nom_latin: 'Viscum album', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['tamarix_gallica', { nom_fr: 'Tamaris', nom_latin: 'Tamarix gallica', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['abies_alba', { nom_fr: 'Sapin Blanc', nom_latin: 'Abies alba', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['larix_decidua', { nom_fr: 'Mélèze', nom_latin: 'Larix decidua', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['pinus_mugo', { nom_fr: 'Pin de Montagne', nom_latin: 'Pinus mugo', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['cedrus_libani', { nom_fr: 'Cèdre du Liban', nom_latin: 'Cedrus libani', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['juniperus_communis', { nom_fr: 'Genévrier', nom_latin: 'Juniperus communis', formes_dispo: ['HE', 'MACERAT_CONCENTRE'] }],
  ['citrus_limon', { nom_fr: 'Citron', nom_latin: 'Citrus limon', formes_dispo: ['HE', 'MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['salix_alba', { nom_fr: 'Saule Blanc', nom_latin: 'Salix alba', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['corylus_avellana', { nom_fr: 'Noisetier', nom_latin: 'Corylus avellana', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['castanea_sativa', { nom_fr: 'Châtaignier', nom_latin: 'Castanea sativa', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['morus_nigra', { nom_fr: 'Mûrier Noir', nom_latin: 'Morus nigra', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['acer_campestre', { nom_fr: 'Érable Champêtre', nom_latin: 'Acer campestre', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['salix_purpurea', { nom_fr: 'Saule Pourpre', nom_latin: 'Salix purpurea', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['vaccinium_myrtillus', { nom_fr: 'Myrtille', nom_latin: 'Vaccinium myrtillus', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['rubus_fruticosus', { nom_fr: 'Ronce', nom_latin: 'Rubus fruticosus', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['sambucus_nigra', { nom_fr: 'Sureau', nom_latin: 'Sambucus nigra', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE', 'EPS'] }],
  ['rosmarinus_officinalis', { nom_fr: 'Romarin', nom_latin: 'Rosmarinus officinalis', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['tilia_cordata', { nom_fr: 'Tilleul Aubier', nom_latin: 'Tilia cordata', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['malus_domestica', { nom_fr: 'Pommier', nom_latin: 'Malus domestica', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['eleagnus_rhamnoides', { nom_fr: 'Argousier', nom_latin: 'Eleagnus rhamnoides', formes_dispo: ['MACERAT_CONCENTRE'] }],
  ['calluna_vulgaris', { nom_fr: 'Bruyère', nom_latin: 'Calluna vulgaris', formes_dispo: ['MACERAT_CONCENTRE'] }],
  
  // === HUILES ESSENTIELLES ===
  
  ['cinnamomum_zeylanicum', { nom_fr: 'Cannelle', nom_latin: 'Cinnamomum zeylanicum', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['satureja_montana', { nom_fr: 'Sarriette', nom_latin: 'Satureja montana', formes_dispo: ['HE'] }],
  ['salvia_sclarea', { nom_fr: 'Sauge Sclarée', nom_latin: 'Salvia sclarea', formes_dispo: ['HE', 'EPS'] }],
  ['salvia_officinalis', { nom_fr: 'Sauge', nom_latin: 'Salvia officinalis', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['cupressus_sempervirens', { nom_fr: 'Cyprès', nom_latin: 'Cupressus sempervirens', formes_dispo: ['HE', 'EPS'] }],
  ['melaleuca_leucadendra', { nom_fr: 'Cajeput', nom_latin: 'Melaleuca leucadendra', formes_dispo: ['HE'] }],
  ['melaleuca_alternifolia', { nom_fr: 'Tea Tree', nom_latin: 'Melaleuca alternifolia', formes_dispo: ['HE'] }],
  ['cinnamomum_camphora', { nom_fr: 'Ravintsara', nom_latin: 'Cinnamomum camphora', formes_dispo: ['HE'] }],
  ['eucalyptus_radiata', { nom_fr: 'Eucalyptus Radiée', nom_latin: 'Eucalyptus radiata', formes_dispo: ['HE'] }],
  ['melaleuca_viridiflora', { nom_fr: 'Niaouli', nom_latin: 'Melaleuca viridiflora', formes_dispo: ['HE'] }],
  ['helichrysum_italicum', { nom_fr: 'Hélichryse Italienne', nom_latin: 'Helichrysum italicum', formes_dispo: ['HE'] }],
  ['artemisia_dracunculus', { nom_fr: 'Estragon', nom_latin: 'Artemisia dracunculus', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['citrus_aurantium', { nom_fr: 'Bigarade', nom_latin: 'Citrus aurantium', formes_dispo: ['HE'] }],
  ['mentha_piperita', { nom_fr: 'Menthe Poivrée', nom_latin: 'Mentha piperita', formes_dispo: ['HE'] }],
  ['origanum_compactum', { nom_fr: 'Origan Compact', nom_latin: 'Origanum compactum', formes_dispo: ['HE'] }],
  ['pelargonium_graveolens', { nom_fr: 'Géranium', nom_latin: 'Pelargonium graveolens', formes_dispo: ['HE'] }],
  ['zingiber_officinale', { nom_fr: 'Gingembre', nom_latin: 'Zingiber officinale', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['piper_nigrum', { nom_fr: 'Poivre Noir', nom_latin: 'Piper nigrum', formes_dispo: ['HE'] }],
  ['cananga_odorata', { nom_fr: 'Ylang Ylang', nom_latin: 'Cananga odorata', formes_dispo: ['HE'] }],
  ['laurus_nobilis', { nom_fr: 'Laurier Noble', nom_latin: 'Laurus nobilis', formes_dispo: ['HE'] }],
  ['ocimum_basilicum', { nom_fr: 'Basilic', nom_latin: 'Ocimum basilicum', formes_dispo: ['HE'] }],
  ['origanum_majorana', { nom_fr: 'Marjolaine', nom_latin: 'Origanum majorana', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['citrus_bergamia', { nom_fr: 'Bergamote', nom_latin: 'Citrus bergamia', formes_dispo: ['HE'] }],
  ['citrus_reticulata', { nom_fr: 'Mandarine', nom_latin: 'Citrus reticulata', formes_dispo: ['HE'] }],
  ['citrus_sinensis', { nom_fr: 'Orange Douce', nom_latin: 'Citrus sinensis', formes_dispo: ['HE'] }],
  ['citrus_paradisii', { nom_fr: 'Pamplemousse', nom_latin: 'Citrus paradisii', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['gaultheria_procumbens', { nom_fr: 'Gaulthérie Couchée', nom_latin: 'Gaultheria procumbens', formes_dispo: ['HE'] }],
  ['eugenia_caryophyllus', { nom_fr: 'Girofle', nom_latin: 'Eugenia caryophyllus', formes_dispo: ['HE'] }],
  ['boswellia_carterii', { nom_fr: 'Encens', nom_latin: 'Boswellia carterii', formes_dispo: ['HE'] }],
  ['picea_mariana', { nom_fr: 'Épinette Noire', nom_latin: 'Picea mariana', formes_dispo: ['HE'] }],
  ['cedrus_atlantica', { nom_fr: 'Cèdre Atlas', nom_latin: 'Cedrus atlantica', formes_dispo: ['HE'] }],
  
  // === AUTRES PLANTES ===
  
  ['panax_ginseng', { nom_fr: 'Ginseng', nom_latin: 'Panax ginseng', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['withania_somnifera', { nom_fr: 'Ashwagandha', nom_latin: 'Withania somnifera', formes_dispo: ['MICROSPHERES'] }],
  ['eleutherococcus_senticosus', { nom_fr: 'Éleuthérocoque', nom_latin: 'Eleutherococcus senticosus', formes_dispo: ['MICROSPHERES'] }],
  ['tribulus_terrestris', { nom_fr: 'Tribulus', nom_latin: 'Tribulus terrestris', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['lepidium_meyenii', { nom_fr: 'Maca', nom_latin: 'Lepidium meyenii', formes_dispo: ['MICROSPHERES', 'MACERAT_CONCENTRE'] }],
  ['curcuma_longa', { nom_fr: 'Curcuma', nom_latin: 'Curcuma longa', formes_dispo: ['MICROSPHERES'] }],
  ['glycyrrhiza_glabra', { nom_fr: 'Réglisse', nom_latin: 'Glycyrrhiza glabra', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['humulus_lupulus', { nom_fr: 'Houblon', nom_latin: 'Humulus lupulus', formes_dispo: ['MICROSPHERES'] }],
  ['orthosiphon_aristatus', { nom_fr: 'Orthosiphon', nom_latin: 'Orthosiphon aristatus', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['hieracium_pilosella', { nom_fr: 'Piloselle', nom_latin: 'Hieracium pilosella', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['equisetum_arvense', { nom_fr: 'Prêle', nom_latin: 'Equisetum arvense', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['urtica_dioica', { nom_fr: 'Ortie', nom_latin: 'Urtica dioica', formes_dispo: ['MICROSPHERES'] }],
  ['foeniculum_vulgare', { nom_fr: 'Fenouil', nom_latin: 'Foeniculum vulgare', formes_dispo: ['HE', 'MICROSPHERES'] }],
  ['peumus_boldus', { nom_fr: 'Boldo', nom_latin: 'Peumus boldus', formes_dispo: ['MICROSPHERES'] }],
  ['rhamnus_frangula', { nom_fr: 'Bourdaine', nom_latin: 'Rhamnus frangula', formes_dispo: ['MICROSPHERES'] }],
  ['borago_officinalis', { nom_fr: 'Bourrache', nom_latin: 'Borago officinalis', formes_dispo: ['MICROSPHERES'] }],
  ['melilotus_officinalis', { nom_fr: 'Mélilot', nom_latin: 'Melilotus officinalis', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['scrophularia_nodosa', { nom_fr: 'Scrofulaire', nom_latin: 'Scrophularia nodosa', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['gentiana_lutea', { nom_fr: 'Gentiane', nom_latin: 'Gentiana lutea', formes_dispo: ['MICROSPHERES'] }],
  ['cimicifuga_racemosa', { nom_fr: 'Cimicifuga', nom_latin: 'Cimicifuga racemosa', formes_dispo: ['MICROSPHERES'] }],
  ['paullinia_cupana', { nom_fr: 'Guarana', nom_latin: 'Paullinia cupana', formes_dispo: ['MICROSPHERES', 'EPS'] }],
  ['serenoa_repens', { nom_fr: 'Saw Palmetto', nom_latin: 'Serenoa repens', formes_dispo: ['MICROSPHERES'] }],
  ['pygeum_africanum', { nom_fr: 'Pygeum', nom_latin: 'Pygeum africanum', formes_dispo: ['MICROSPHERES'] }],
]);

// =============================================================================
// 3. CONSTANTES DE POSOLOGIE TUNISIE
// =============================================================================

const POSOLOGIES_TUNISIE = {
  microspheres: {
    standard: "2 gélules matin et soir (400mg/gélule)",
    leger: "1 gélule matin et soir",
    intensif: "2 gélules 3x/jour"
  },
  macerat_concentre: {
    adulte: "15 gouttes le matin à jeun, 5 JOURS SUR 7",
    enfant: "5-10 gouttes le matin à jeun, 5 JOURS SUR 7",
    intensif: "15 gouttes matin et soir, 5 JOURS SUR 7"
  },
  eps: {
    standard: "5 ml le matin dans un peu d'eau",
    flacon_info: "Préparation 180ml = 36 jours de traitement"
  },
  he: {
    voie_orale: "1-2 gouttes sur support, 2-3x/jour",
    voie_cutanee: "Diluée à 5-20% dans huile végétale"
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
function adaptPlant(plant: PlantInput): PlantOutput {
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

  const cleanId = sanitizeId(plant.plant_id);
  const dbEntry = TUNISIA_DB.get(cleanId);

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
  // CAS D: HUILE ESSENTIELLE → HE (Identité)
  // -----------------------------------------
  else if (formIn.includes('HE') || formIn.includes('HUILE')) {
    if (dbEntry.formes_dispo.includes('HE')) {
      output.adapted_form = "HE";
      output.adapted_dosage = plant.dosage; // Garder la même posologie
      output.conversion_note = "✅ Conforme: HE disponible tel quel";
      output.alert_level = 'NONE';
    } else {
      output.alert_level = 'CRITICAL';
      output.conversion_note = `⛔ HE non disponible pour ${plant.name_fr}`;
    }
  }

  // -----------------------------------------
  // CAS E: FORME INCONNUE
  // -----------------------------------------
  else {
    output.adapted_form = plant.form + " (?)";
    output.adapted_dosage = plant.dosage;
    output.alert_level = 'WARNING';
    output.conversion_note = `⚠️ Forme galénique non reconnue: "${plant.form}"`;
  }

  return output;
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
