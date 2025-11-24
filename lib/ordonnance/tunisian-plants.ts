// lib/ordonnance/tunisian-plants.ts

export interface LocalPlant {
  id: string;
  latinName: string;
  commonName: string;
  vernacularName: string; // Nom en Derja/Arabe
  chemotype?: string;
  axes: string[]; // Axes cibles
  form: "TISANE" | "HE" | "POUDRE" | "SIROP";
  availability: "HIGH" | "MEDIUM" | "LOW"; // Facilité à trouver en Tunisie
  note: string;
}

export const TUNISIAN_PHARMACOPOEIA: LocalPlant[] = [
  {
    id: "rosmarinus_cineole",
    latinName: "Rosmarinus officinalis",
    commonName: "Romarin",
    vernacularName: "Klil (إكليل)",
    chemotype: "CT 1,8-Cinéole",
    axes: ["corticotrope", "hepatique"],
    form: "TISANE",
    availability: "HIGH",
    note: "Le Klil tunisien est très riche en cinéole. Excellent stimulant du foie et des surrénales. À utiliser en infusion le matin."
  },
  {
    id: "artemisia_herba_alba",
    latinName: "Artemisia herba-alba",
    commonName: "Armoise blanche",
    vernacularName: "Chih (شييح)",
    axes: ["metabolique", "parasympathique"],
    form: "TISANE",
    availability: "HIGH",
    note: "Plante majeure du désert. Puissant régulateur du sucre (diabète) et antiparasitaire. Attention : goût très amer, cures courtes."
  },
  {
    id: "thymus_capitatus",
    latinName: "Thymus capitatus",
    commonName: "Thym à têtes",
    vernacularName: "Zaatar (زعتر)",
    chemotype: "CT Carvacrol",
    axes: ["immuno", "corticotrope"],
    form: "TISANE", // Ou HE
    availability: "HIGH",
    note: "Le Zaatar local est très fort (Carvacrol). C'est un 'antibiotique' naturel et un tonique puissant. Attention aux hypertendus."
  },
  {
    id: "myrtus_communis",
    latinName: "Myrtus communis",
    commonName: "Myrte",
    vernacularName: "Rihane (ريحان)",
    axes: ["thyreotrope", "respiratoire"],
    form: "TISANE",
    availability: "MEDIUM",
    note: "Le Rihane soutient la fonction thyroïdienne douce et calme les poumons."
  },
  {
    id: "pistacia_lentiscus",
    latinName: "Pistacia lentiscus",
    commonName: "Lentisque Pistachier",
    vernacularName: "Dharw (ضرو)",
    axes: ["veineux", "hepatique"],
    form: "HE", // Ou Huile végétale fixe
    availability: "HIGH",
    note: "L'huile de Dharw est excellente pour la congestion veineuse (prostate, hémorroïdes) et l'estomac."
  },
  {
    id: "mentha_pulegium",
    latinName: "Mentha pulegium",
    commonName: "Menthe Pouliot",
    vernacularName: "Fliyou (فليو)",
    axes: ["respiratoire", "neuro"],
    form: "TISANE",
    availability: "HIGH",
    note: "Débloque le diaphragme et calme la toux spasmodique. Attention : toxique à haute dose en HE."
  },
  {
    id: "trigonella_foenum",
    latinName: "Trigonella foenum-graecum",
    commonName: "Fenugrec",
    vernacularName: "Helba (حلبة)",
    axes: ["metabolique", "anabolisme"],
    form: "POUDRE", // Graines
    availability: "HIGH",
    note: "La Helba est la plante de la reconstruction (anabolisme). Indispensable pour la résistance à l'insuline."
  }
];

// Fonction utilitaire pour trouver une alternative locale
export function findLocalAlternative(axisNeeded: string): LocalPlant | undefined {
  // Cherche une plante dispo (HIGH) qui traite l'axe demandé
  return TUNISIAN_PHARMACOPOEIA.find(p => p.axes.includes(axisNeeded) && p.availability === "HIGH");
}