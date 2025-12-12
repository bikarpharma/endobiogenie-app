/**
 * ============================================================================
 * VITEST CONFIGURATION
 * ============================================================================
 * 
 * PLACEMENT: /vitest.config.ts (racine du projet)
 * ============================================================================
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Environnement de test
    environment: 'node',
    
    // Globals (describe, it, expect sans import)
    globals: true,
    
    // Pattern des fichiers de test
    include: ['**/*.test.ts', '**/*.test.tsx'],
    
    // Exclure node_modules
    exclude: ['node_modules', '.next', 'dist'],
    
    // Coverage (optionnel)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts'],
    },
    
    // Timeout pour les tests longs
    testTimeout: 10000,
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
