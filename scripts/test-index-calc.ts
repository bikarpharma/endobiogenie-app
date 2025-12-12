import { calculateAllIndexes } from '../lib/bdf/calculateIndexes';

const inputs = {
  GB: 5.9,
  GR: 4.82,
  VS: 8,
  CPK: 52,
  LDH: 148,
  TSH: 2.4,
  CA: 2.28,
  MONO: 8,
  K: 3.6,
  BASO: 0.5,
  PLT: 195,
  HB: 13.2,
  LYMPH: 31,
  EOS: 1.5,
  NEUT: 58
};

const result = calculateAllIndexes(inputs);

console.log('=== Résultats du calcul ===');
console.log('Index Thyroïdien:', JSON.stringify(result.indexes.idx_thyroidien, null, 2));
console.log('Index Adaptation:', JSON.stringify(result.indexes.idx_adaptation, null, 2));
console.log('Index Génital:', JSON.stringify(result.indexes.idx_genital, null, 2));
console.log('Index Starter:', JSON.stringify(result.indexes.idx_starter, null, 2));
console.log('IML:', JSON.stringify(result.indexes.idx_mobilisation_leucocytes, null, 2));
console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
