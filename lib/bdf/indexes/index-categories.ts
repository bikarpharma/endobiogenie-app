export enum IndexCategory {
  AUTONOMIC = "autonomic",          // Système nerveux autonome (SNA)
  ADAPTATION = "adaptation",        // Axe corticotrope (stress)
  GONADIC = "gonadic",             // Ancien (deprecated)
  GONADAL = "gonadal",             // Axe gonadotrope
  THYROID = "thyroid",
  CORTICOTROPE = "corticotrope",   // Ancien (à migrer vers ADAPTATION)
  PLAQUETTAIRE = "plaquettaire",
  GROWTH = "growth",
  STRUCTURE = "structure",
  APOPTOSIS = "apoptosis",
  METABOLIC = "metabolic",
  INFLAMMATORY = "inflammatory",
  SOMATOTROPE = "somatotrope",
  COMPLEX = "complex",             // Index de ratios d'axes
}
