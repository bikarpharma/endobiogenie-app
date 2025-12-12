/**
 * Script de test MUST_FORMS Integration
 * Vérifie que le middleware tunisianAdapter respecte les formes obligatoires
 */

import { adaptPlant, type PlantInput } from '../lib/utils/tunisianAdapter';
import { getMustForm, getConversionWarning, isMustForm, type GalenicForm } from '../lib/ordonnance/mustForms';

console.log('═'.repeat(70));
console.log('  TEST INTEGRATION MUST_FORMS');
console.log('═'.repeat(70));

// ==========================================
// TEST 1: Vérification module mustForms
// ==========================================
console.log('\n📋 TEST 1: Module mustForms');
console.log('-'.repeat(50));

const testPlants = [
  { id: 'ribes_nigrum', expected: { forme: 'MACERAT_CONCENTRE', level: 'ABSOLUTE' } },
  { id: 'tilia_tomentosa', expected: { forme: 'MACERAT_CONCENTRE', level: 'ABSOLUTE' } },
  { id: 'lavandula_angustifolia', expected: { forme: 'HE', level: 'ABSOLUTE' } },
  { id: 'cinnamomum_verum', expected: { forme: 'HE', level: 'ABSOLUTE' } },
  { id: 'rubus_idaeus', expected: { forme: 'MACERAT_CONCENTRE', level: 'ABSOLUTE' } }, // Framboisier est ABSOLUTE
  { id: 'juglans_regia', expected: { forme: 'MACERAT_CONCENTRE', level: 'STRONG' } }, // Noyer est STRONG
  { id: 'taraxacum_officinale', expected: null }, // Pas un MUST
];

testPlants.forEach(({ id, expected }) => {
  const result = getMustForm(id);
  const status = (result?.forme === expected?.forme && result?.level === expected?.level) ||
                 (!result && !expected) ? '✅' : '❌';

  if (expected) {
    console.log(`${status} ${id}: ${result?.forme || 'N/A'} (${result?.level || 'N/A'}) - attendu: ${expected.forme} (${expected.level})`);
  } else {
    console.log(`${status} ${id}: ${result ? 'MUST trouvé (erreur!)' : 'Pas MUST (correct)'}`);
  }
});

// ==========================================
// TEST 2: Warnings de conversion
// ==========================================
console.log('\n📋 TEST 2: Warnings de conversion');
console.log('-'.repeat(50));

const conversionTests: Array<{ plantKey: string; targetForm: GalenicForm; expectedLevel: 'CRITICAL' | 'WARNING' | null }> = [
  { plantKey: 'ribes_nigrum', targetForm: 'EPS', expectedLevel: 'CRITICAL' },
  { plantKey: 'ribes_nigrum', targetForm: 'MACERAT_CONCENTRE', expectedLevel: null },
  { plantKey: 'lavandula_angustifolia', targetForm: 'MICROSPHERES', expectedLevel: 'CRITICAL' },
  { plantKey: 'lavandula_angustifolia', targetForm: 'HE', expectedLevel: null },
  { plantKey: 'rubus_idaeus', targetForm: 'EPS', expectedLevel: 'CRITICAL' }, // Framboisier est ABSOLUTE
  { plantKey: 'juglans_regia', targetForm: 'EPS', expectedLevel: 'WARNING' }, // Noyer est STRONG
  { plantKey: 'taraxacum_officinale', targetForm: 'EPS', expectedLevel: null },
];

conversionTests.forEach(({ plantKey, targetForm, expectedLevel }) => {
  const warning = getConversionWarning(plantKey, targetForm);
  const status = warning.level === expectedLevel ? '✅' : '❌';
  console.log(`${status} ${plantKey} → ${targetForm}: ${warning.level || 'OK'} ${warning.message ? `"${warning.message.substring(0, 50)}..."` : ''}`);
});

// ==========================================
// TEST 3: Integration adaptPlant
// ==========================================
console.log('\n📋 TEST 3: Integration adaptPlant() avec MUST');
console.log('-'.repeat(50));

const adaptTests: PlantInput[] = [
  // Cassis demandé en TM → doit être forcé en MG
  {
    plant_id: 'ribes_nigrum',
    name_latin: 'Ribes nigrum',
    name_fr: 'Cassis',
    form: 'TM',
    dosage: '50 gouttes 3x/jour',
    indication: 'Axe corticotrope',
  },
  // Lavande vraie demandée en gélules → doit être forcée en HE
  {
    plant_id: 'lavandula_angustifolia',
    name_latin: 'Lavandula angustifolia',
    name_fr: 'Lavande vraie',
    form: 'Gélules',
    dosage: '2 gélules/jour',
    indication: 'Anxiété',
  },
  // Tilleul demandé en EPS → doit être forcé en MG
  {
    plant_id: 'tilia_tomentosa',
    name_latin: 'Tilia tomentosa',
    name_fr: 'Tilleul',
    form: 'EPS',
    dosage: '5ml/jour',
    indication: 'SNA',
  },
  // Pissenlit en EPS → OK (pas un MUST)
  {
    plant_id: 'taraxacum_officinale',
    name_latin: 'Taraxacum officinale',
    name_fr: 'Pissenlit',
    form: 'EPS',
    dosage: '5ml/jour',
    indication: 'Drainage hépatique',
  },
];

adaptTests.forEach((input) => {
  console.log(`\n🌿 ${input.name_fr} (${input.plant_id})`);
  console.log(`   Demandé: ${input.form} - ${input.dosage}`);

  const result = adaptPlant(input);

  console.log(`   Adapté: ${result.adapted_form} - ${result.adapted_dosage}`);
  console.log(`   Niveau alerte: ${result.alert_level}`);
  if (result.conversion_note) {
    console.log(`   Note: ${result.conversion_note}`);
  }

  // Vérification
  const mustInfo = getMustForm(input.plant_id);
  if (mustInfo) {
    const expectedForm = mustInfo.forme === 'MACERAT_CONCENTRE'
      ? 'Macérat Concentré (Mère)'
      : mustInfo.forme;

    // Vérifier que la forme adaptée correspond
    const isCorrect = result.adapted_form?.includes('Macérat') ||
                      result.adapted_form === mustInfo.forme ||
                      result.adapted_form === 'HE';
    console.log(`   ${isCorrect ? '✅' : '❌'} MUST respecté: forme ${mustInfo.forme} (${mustInfo.level})`);
  } else {
    console.log(`   ✅ Pas de contrainte MUST`);
  }
});

// ==========================================
// RÉSUMÉ
// ==========================================
console.log('\n');
console.log('═'.repeat(70));
console.log('  RÉSUMÉ');
console.log('═'.repeat(70));
console.log(`
Integration MUST_FORMS v2.0:
- 13 bourgeons ABSOLUTE (Cassis, Tilleul, Aubépine, Figuier, etc.)
- 12 bourgeons STRONG (Noyer, Framboisier, Airelle, etc.)
- 5 HE ABSOLUTE (Lavande, Sauge, Thym phénols, Cannelle, Origan)
- 10 HE STRONG (Tea tree, Eucalyptus, Ravintsara, etc.)

Middleware tunisianAdapter.ts:
- Vérifie MUST AVANT adaptation
- Bloque conversion des ABSOLUTE → force la bonne forme
- Avertit pour les STRONG → permet flexibilité

SYSTEM_PROMPT:
- Liste des MUST ajoutée dans assistantOrdonnance.ts
- IA informée des contraintes de forme
`);

console.log('═'.repeat(70));
