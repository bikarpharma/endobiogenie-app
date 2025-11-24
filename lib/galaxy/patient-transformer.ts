import { BdfIndexes } from "@/lib/bdf/calculateIndexes";

interface GraphNode {
  id: string;
  group: "Master" | "Glande" | "Organe" | "Symptome";
  val: number;      // Taille du noeud (Importance clinique)
  color: string;    // ROUGE (Hyper), BLEU (Hypo), VERT (Normal)
  status: string;   // Texte affiché (ex: "BLOCAGE")
  pulsing: boolean; // Si ça clignote (Urgence)
}

interface GraphLink {
  source: string;
  target: string;
  name: string;     // ex: "Inhibe", "Surcharge"
  color: string;
  width: number;
  particles: boolean; // Si on voit le flux bouger
}

export function transformPatientData(
  scores: Record<string, number>, // Tes scores interrogatoire (0-100)
  bdf: BdfIndexes                 // Tes index biologiques calculés
) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // --- 1. LE CERVEAU (Toujours présent) ---
  nodes.push({
    id: "Hypothalamus",
    group: "Master",
    val: 40,
    color: "#cbd5e1", // Gris neutre (le chef)
    status: "Commande",
    pulsing: false
  });

  // --- 2. AXE CORTICOTROPE (ADAPTATION) ---
  const adrenalStatus = bdf.adrenal.status || 'ADAPTE';
  let adrenalColor = "#10b981"; // Vert
  let adrenalSize = 20;
  let adrenalPulse = false;

  if (adrenalStatus === 'HYPER' || scores.corticotrope > 70) {
    adrenalColor = "#ef4444"; // ROUGE (Danger)
    adrenalSize = 50;         // Enorme
    adrenalPulse = true;

    // Lien Causal : Stress -> Hypothalamus (Surcharge)
    links.push({
      source: "Surrénales",
      target: "Hypothalamus",
      name: "Surcharge",
      color: "#ef4444",
      width: 4,
      particles: true
    });
  }
  else if (adrenalStatus === 'EPUISEMENT') {
    adrenalColor = "#3b82f6"; // BLEU (Froid/Arrêt)
    adrenalSize = 15;         // Atrophié
  }

  nodes.push({
    id: "Surrénales",
    group: "Glande",
    val: adrenalSize,
    color: adrenalColor,
    status: adrenalStatus,
    pulsing: adrenalPulse
  });

  // --- 3. AXE THYRÉOTROPE ---
  const thyroidStatus = bdf.thyroid.status || 'EUTHYROID';
  let thyroidColor = "#10b981";

  if (thyroidStatus === 'BLOCAGE' || thyroidStatus === 'HYPO') {
    thyroidColor = "#3b82f6"; // Bleu (Ralenti)

    // SCÉNARIO CLÉ : Si Stress (Rouge) ET Thyroïde Bloquée (Bleu)
    if (adrenalColor === "#ef4444") {
      links.push({
        source: "Surrénales",
        target: "Thyroïde",
        name: "Inhibition Cortisol",
        color: "#f59e0b", // Orange (Lien toxique)
        width: 3,
        particles: true
      });
    }
  } else if (thyroidStatus === 'HYPER') {
    thyroidColor = "#ef4444";
  }

  nodes.push({
    id: "Thyroïde",
    group: "Glande",
    val: thyroidStatus === 'EUTHYROID' ? 25 : 35, // Grossit si pathologique
    color: thyroidColor,
    status: thyroidStatus,
    pulsing: thyroidStatus === 'HYPER'
  });

  // --- 4. LE FOIE (MÉTABOLISME) ---
  // Si résistance insuline ou problème hépatique
  if (bdf.metabolic.status === 'RESISTANCE' || (scores.digestif && scores.digestif > 60)) {
     nodes.push({
       id: "Foie",
       group: "Organe",
       val: 40,
       color: "#f97316",
       status: "CONGESTION",
       pulsing: false
     }); // Orange

     // Le Foie souffre à cause du Stress ?
     if (adrenalStatus === 'HYPER') {
        links.push({
          source: "Surrénales",
          target: "Foie",
          name: "Glucocorticoïdes",
          color: "#ef4444",
          width: 2,
          particles: false
        });
     }
  } else {
     nodes.push({
       id: "Foie",
       group: "Organe",
       val: 20,
       color: "#10b981",
       status: "DRAINAGE OK",
       pulsing: false
     });
  }

  // Connexions structurelles de base (pour que le graphe se tienne)
  if (!links.find(l => l.target === "Surrénales")) {
    links.push({
      source: "Hypothalamus",
      target: "Surrénales",
      name: "ACTH",
      color: "#64748b",
      width: 1,
      particles: false
    });
  }
  if (!links.find(l => l.target === "Thyroïde")) {
    links.push({
      source: "Hypothalamus",
      target: "Thyroïde",
      name: "TSH",
      color: "#64748b",
      width: 1,
      particles: false
    });
  }

  return { nodes, links };
}
