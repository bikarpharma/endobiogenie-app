// ========================================
// MOTEUR DE RAISONNEMENT THÉRAPEUTIQUE
// Refactor Learning System (itergIA)
// ========================================
// Implémentation des 4 étapes du raisonnement endobiogénique
// + Enrichissement pédagogique des recommandations

import { v4 as uuidv4 } from "uuid";
import type {
  AxePerturbation,
  RecommandationTherapeutique,
  RaisonnementTherapeutique,
  TherapeuticScope,
  AlerteTherapeutique,
  ContextePedagogique,
  NiveauSecurite,
} from "./types";
import type { IndexResults, LabValues } from "@/lib/bdf/types";
import { SEUILS_BDF, PLANTES_PAR_AXE, VECTORSTORES } from "./constants";
import { generateClinicalSynthesis } from "./openaiDirect";

export class TherapeuticReasoningEngine {
  /**
   * LEARNING SYSTEM: Enrichir une recommandation avec le contexte pédagogique
   * Explique le lien Index → Axe → Plante
   */
  private enrichirContextePedagogique(
    rec: RecommandationTherapeutique,
    axe: AxePerturbation,
    indexes: IndexResults
  ): RecommandationTherapeutique {
    // Déterminer l'index déclencheur pour cet axe
    let indexDeclencheur: string | undefined;

    if (axe.axe === 'thyroidien' && indexes?.indexThyroidien?.value != null) {
      indexDeclencheur = `Index Thyroïdien (${indexes.indexThyroidien.value.toFixed(2)})`;
    } else if (axe.axe === 'corticotrope' && indexes?.indexAdaptation?.value != null) {
      indexDeclencheur = `Index Adaptation (${indexes.indexAdaptation.value.toFixed(2)})`;
    } else if ((axe.axe === 'genital' || axe.axe === 'gonadotrope') && indexes?.indexGenital?.value != null) {
      indexDeclencheur = `Index Génital (${indexes.indexGenital.value.toFixed(0)})`;
    }

    // Déterminer la confiance IA selon la source
    let confianceIA: 'haute' | 'moyenne' | 'faible' = 'moyenne';
    if (rec.sourceVectorstore === 'endobiogenie') {
      confianceIA = 'haute';
    } else if (rec.sourceVectorstore === 'code') {
      confianceIA = 'faible'; // Fallback codé en dur
    }

    const pedagogie: ContextePedagogique = {
      indexDeclencheur,
      scorePerturbation: axe.score,
      actionSurAxe: rec.mecanisme, // Le mécanisme explique déjà l'action
      confianceIA,
    };

    return {
      ...rec,
      pedagogie,
      niveauSecurite: this.evaluerNiveauSecurite(rec),
    };
  }

  /**
   * LEARNING SYSTEM: Évaluer le niveau de sécurité d'une recommandation
   * Pour code couleur UI (Vert/Orange/Rouge)
   */
  private evaluerNiveauSecurite(rec: RecommandationTherapeutique): NiveauSecurite {
    // ROUGE (interdit) : CI critiques
    if (rec.CI.length > 0 && rec.CI.some(ci =>
      ci.toLowerCase().includes('grossesse') ||
      ci.toLowerCase().includes('allaitement') ||
      ci.toLowerCase().includes('cancer')
    )) {
      return 'interdit';
    }

    // ORANGE (précaution) : Interactions ou CI modérées
    if (rec.interactions.length > 0 || rec.CI.length > 0) {
      return 'precaution';
    }

    // VERT (sûr) : Pas de CI ni interaction connue
    return 'sur';
  }

  /**
   * ÉTAPE 1: Analyser les index BdF et identifier les axes perturbés
   */
  analyzeAxesPerturbations(
    indexes: IndexResults,
    inputs: LabValues
  ): {
    axes: AxePerturbation[];
    hypotheses: string[];
  } {
    const axes: AxePerturbation[] = [];

    // ==========================================
    // ANALYSE INDEX THYROÏDIEN
    // ==========================================
    if (indexes?.indexThyroidien?.value != null) {
      const valeur = indexes.indexThyroidien.value;

      if (valeur < SEUILS_BDF.indexThyroidien.hypo) {
        axes.push({
          axe: "thyroidien",
          niveau: "hypo",
          score: Math.min(10, Math.round((2.0 - valeur) * 4)), // Score plus élevé si très bas
          justification: `Index thyroïdien ${valeur.toFixed(
            2
          )} < ${
            SEUILS_BDF.indexThyroidien.hypo
          } = rendement fonctionnel thyroïdien réduit`,
        });
      } else if (valeur > SEUILS_BDF.indexThyroidien.hyper) {
        axes.push({
          axe: "thyroidien",
          niveau: "hyper",
          score: Math.min(10, Math.round((valeur - 3.5) * 3)),
          justification: `Index thyroïdien ${valeur.toFixed(
            2
          )} > ${
            SEUILS_BDF.indexThyroidien.hyper
          } = hyperstimulation thyroïdienne`,
        });
      }
    }

    // ==========================================
    // ANALYSE INDEX ADAPTATION
    // ==========================================
    if (indexes?.indexAdaptation?.value != null) {
      const valeur = indexes.indexAdaptation.value;

      if (valeur < SEUILS_BDF.indexAdaptation.hyper) {
        axes.push({
          axe: "corticotrope",
          niveau: "hyper",
          score: Math.min(10, Math.round((0.7 - valeur) * 12)),
          justification: `Index adaptation ${valeur.toFixed(
            2
          )} < ${
            SEUILS_BDF.indexAdaptation.hyper
          } = orientation ACTH/cortisol dominante (stress)`,
        });
      } else if (valeur > 1.3) {
        axes.push({
          axe: "gonadotrope",
          niveau: "hyper",
          score: Math.min(10, Math.round((valeur - 1.3) * 6)),
          justification: `Index adaptation ${valeur.toFixed(
            2
          )} > 1.3 = orientation FSH/œstrogènes dominante`,
        });
      }
    }

    // ==========================================
    // ANALYSE INDEX GÉNITAL
    // ==========================================
    if (indexes?.indexGenital?.value != null) {
      const valeur = indexes.indexGenital.value;

      if (valeur > SEUILS_BDF.indexGenital.hyper) {
        axes.push({
          axe: "genital",
          niveau: "desequilibre",
          score: Math.min(10, Math.round((valeur - 600) / 50)),
          justification: `Index génital ${valeur.toFixed(
            0
          )} > ${
            SEUILS_BDF.indexGenital.hyper
          } = empreinte androgénique tissulaire marquée`,
        });
      } else if (valeur < SEUILS_BDF.indexGenital.hypo) {
        axes.push({
          axe: "genital",
          niveau: "desequilibre",
          score: Math.min(10, Math.round((SEUILS_BDF.indexGenital.hypo - valeur) / 50)),
          justification: `Index génital ${valeur.toFixed(
            0
          )} < ${SEUILS_BDF.indexGenital.hypo} = empreinte œstrogénique relative dominante`,
        });
      }
    }

    // ==========================================
    // ANALYSE TURN-OVER TISSULAIRE
    // ==========================================
    if (indexes?.turnover?.value != null) {
      const valeur = indexes.turnover.value;

      if (valeur > SEUILS_BDF.turnover.eleve) {
        axes.push({
          axe: "somatotrope",
          niveau: "hyper",
          score: Math.min(10, Math.round((valeur - 100) / 20)),
          justification: `Turn-over tissulaire ${valeur.toFixed(
            1
          )} > ${
            SEUILS_BDF.turnover.eleve
          } = renouvellement sur-sollicité (risque saturation)`,
        });
      }
    }

    // ==========================================
    // ANALYSE RENDEMENT THYROÏDIEN
    // ==========================================
    if (indexes?.rendementThyroidien?.value != null) {
      const valeur = indexes.rendementThyroidien.value;

      if (valeur < 1.0) {
        // Déjà capturé par index thyroïdien, mais on peut affiner
        const axeThyro = axes.find((a) => a.axe === "thyroidien");
        if (axeThyro) {
          axeThyro.justification += ` | Rendement ${valeur.toFixed(
            2
          )} très faible`;
          axeThyro.score = Math.min(10, axeThyro.score + 1);
        }
      }
    }

    // ==========================================
    // GÉNÉRER HYPOTHÈSES RÉGULATRICES
    // ==========================================
    const hypotheses = this.generateHypotheses(axes);

    return { axes, hypotheses };
  }

  /**
   * Convertir les axes RAG (strings) en AxePerturbation avec scoring
   */
  private convertRagAxesToPerturbations(
    ragAxes: string[],
    indexes: IndexResults
  ): AxePerturbation[] {
    const axes: AxePerturbation[] = [];

    for (const axeStr of ragAxes) {
      const axeLower = axeStr.toLowerCase();

      // Thyroïdien
      if (axeLower.includes("thyro") || axeLower.includes("thyréo")) {
        const indexValue = indexes.indexThyroidien.value;
        const niveau = indexValue !== null && indexValue < 2.0 ? "hypo" : "hyper";
        const score = indexValue !== null
          ? Math.min(10, Math.abs(2.5 - indexValue) * 3)
          : 5;

        axes.push({
          axe: "thyroidien",
          niveau,
          score: Math.round(score),
          justification: `Axe identifié par RAG: ${axeStr}`,
        });
      }

      // Corticotrope
      if (axeLower.includes("cortico") || axeLower.includes("acth") || axeLower.includes("stress")) {
        const indexValue = indexes.indexAdaptation.value;
        const niveau = indexValue !== null && indexValue < 0.7 ? "hyper" : "hypo";
        const score = indexValue !== null
          ? Math.min(10, Math.abs(0.7 - indexValue) * 10)
          : 5;

        axes.push({
          axe: "corticotrope",
          niveau,
          score: Math.round(score),
          justification: `Axe identifié par RAG: ${axeStr}`,
        });
      }

      // Génital
      if (axeLower.includes("génital") || axeLower.includes("genital") ||
          axeLower.includes("oestro") || axeLower.includes("andro")) {
        const indexValue = indexes.indexGenital.value;
        const niveau = indexValue !== null && indexValue > 600 ? "hyper" : "desequilibre";
        const score = 5;

        axes.push({
          axe: "genital",
          niveau,
          score,
          justification: `Axe identifié par RAG: ${axeStr}`,
        });
      }
    }

    // Si aucun axe détecté spécifiquement mais RAG a identifié des axes,
    // créer un axe générique
    if (axes.length === 0 && ragAxes.length > 0) {
      axes.push({
        axe: "thyroidien",
        niveau: "desequilibre",
        score: 5,
        justification: `Axes RAG: ${ragAxes.join(", ")}`,
      });
    }

    return axes;
  }

  /**
   * Générer des hypothèses régulatrices basées sur les axes perturbés
   */
  private generateHypotheses(axes: AxePerturbation[]): string[] {
    const hypotheses: string[] = [];

    // Trier par score décroissant
    const axesSorted = [...axes].sort((a, b) => b.score - a.score);

    for (const axe of axesSorted) {
      switch (axe.axe) {
        case "thyroidien":
          if (axe.niveau === "hypo") {
            hypotheses.push(
              "Soutenir le rendement fonctionnel thyroïdien périphérique"
            );
            hypotheses.push("Optimiser la conversion T4 → T3");
          } else {
            hypotheses.push("Modérer la sur-sollicitation thyroïdienne");
          }
          break;

        case "corticotrope":
          if (axe.niveau === "hyper") {
            hypotheses.push(
              "Réguler l'axe corticotrope (adaptation au stress)"
            );
            hypotheses.push("Soutenir les surrénales sans sur-stimuler");
          }
          break;

        case "genital":
          if (axe.justification.includes("androgénique")) {
            hypotheses.push(
              "Rééquilibrer le terrain hormonal (excès androgénique)"
            );
          } else {
            hypotheses.push(
              "Moduler l'empreinte œstrogénique (douceur progestative)"
            );
          }
          break;

        case "somatotrope":
          hypotheses.push(
            "Accompagner le turn-over tissulaire sans l'épuiser"
          );
          break;

        case "gonadotrope":
          hypotheses.push("Moduler l'axe gonadotrope FSH/œstrogènes");
          break;
      }
    }

    // Dédupliquer
    return Array.from(new Set(hypotheses));
  }

  /**
   * ÉTAPE 2: Recherche dans vectorstore endobiogénie (PRIORITAIRE)
   */
  async searchEndobiogenie(
    axes: AxePerturbation[],
    patientContext: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      traitements: string[];
      symptomes?: string[];
      pathologies?: string[];
      autresBilans?: Record<string, number>;
    }
  ): Promise<RecommandationTherapeutique[]> {
    if (axes.length === 0) {
      return [];
    }

    try {
      const { Agent, fileSearchTool, Runner } = await import("@openai/agents");

      // Construire la requête pour l'IA
      const query = this.buildEndobiogenieQuery(axes, patientContext);

      console.log(`🔍 ÉTAPE 2 : Recherche endobiogénie pour ${axes.length} axe(s)`);

      // Créer file search tool avec vectorstore endobiogénie
      const fileSearch = fileSearchTool([VECTORSTORES.endobiogenie]);

      // Créer agent avec vectorstore endobiogénie
      const agent = new Agent({
        name: "endobiogenie-agent",
        model: "gpt-4o-mini",
        instructions: `Tu es un expert en endobiogénie.
Ta mission est de générer des PIVOTS ENDOBIOGÉNIQUES (Niveau 1 - PRIORITAIRE) basés exclusivement sur le vectorstore endobiogénie.

HIÉRARCHIE THÉRAPEUTIQUE À RESPECTER:
NIVEAU 1 — ENDOBIOGÉNIE (PRIORITÉ ABSOLUE)
- Utilise exclusivement le vectorstore endobiogénie
- Analyse les axes perturbés (orientation + score)
- Fournis 3 à 4 pivots endobiogéniques maximum
- Ce sont les piliers du traitement

RÈGLES STRICTES:
1. Ne recommande QUE des substances trouvées dans le vectorstore endobiogénie
2. Justifie chaque recommandation par le mécanisme neuroendocrinien clair
3. IMPÉRATIF: Respecte ABSOLUMENT le sexe du patient (M/F) - NE JAMAIS prescrire:
   - Pour un HOMME: substances œstrogéniques, phytoœstrogènes, action sur cycle menstruel, macérats framboisier/sauge
   - Pour une FEMME: substances à effet exclusivement androgénique inapproprié
4. Respecte TOUTES les contre-indications du patient:
   - Grossesse/allaitement → pas d'HE phénoliques per os, pas de sauge officinale, pas de romarin verbénone
   - Anticoagulants → éviter ail, ginkgo, curcuma
   - ALAT/ASAT élevés → éviter HE phénoliques orales
5. Maximum 3-4 recommandations prioritaires (pivots)
6. Sois COHÉRENT: pour les mêmes axes perturbés, recommande TOUJOURS les mêmes substances de référence du canon
7. Aucune contradiction interne autorisée (ex: pro-thyroïde vs anti-thyroïde)
8. Aucun doublon autorisé (chaque substance une seule fois)

RÈGLES DE POSOLOGIE ENDOBIOGÉNIQUE (CRUCIAL):
La posologie doit TOUJOURS être exprimée en DOSE UNITAIRE PAR PRISE (mL ou gouttes), JAMAIS en volume total de préparation.
Équivalence: 1 mL = 20 gouttes

Dosages standards pour ADULTES (TM/MG à dilution D1):
- Effet de MODÉRATION: 1 à 3 mL, 1 à 3 fois par jour (ex: "2 mL matin et soir")
- Effet de RÉGULATION: 3 à 5 mL, 2 à 4 fois par jour (ex: "4 mL matin, midi et soir")
- Effet de CONTRÔLE: 4 à 15 mL, 2 à 4 fois par jour (ex: "5 mL trois fois par jour")

INTERDIT: Ne JAMAIS indiquer "60 mL" ou "80 mL" qui sont des volumes TOTAUX de flacon, pas des doses.
CORRECT: "5 mL matin et soir" ou "50 gouttes matin et midi" (= 2,5 mL par prise)
INCORRECT: "60 mL deux fois par jour" (volume aberrant pour une prise)

FORMAT DE SORTIE STRICT:
Retourne un JSON array UNIQUEMENT (pas de texte avant/après):
[
  {
    "substance": "Nom latin exact",
    "forme": "TM|EPS|MG",
    "posologie": "dose unitaire par prise (ex: 2 mL matin et soir)",
    "duree": "durée en jours ou semaines (ex: 21 jours, 3 semaines)",
    "axeCible": "axe neuroendocrinien ciblé",
    "mecanisme": "mécanisme neuroendocrinien précis",
    "CI": ["liste contre-indications"],
    "interactions": ["liste interactions"]
  }
]

STYLE: Professionnel, concis, orienté mécanismes, aucun texte inutile.`,
        tools: [fileSearch],
      });

      // Exécuter la requête
      const runner = new Runner();
      const result = await runner.run(agent, [
        {
          role: "user",
          content: [{ type: "input_text", text: query }],
        },
      ]);

      // Parser la réponse
      const recommandations = this.parseEndobiogenieResponse(
        result.finalOutput || "",
        patientContext
      );

      console.log(`✅ ÉTAPE 2 : ${recommandations.length} recommandation(s) endobiogénie trouvée(s)`);

      return recommandations;
    } catch (error) {
      console.error("❌ Erreur ÉTAPE 2 (searchEndobiogenie):", error);

      // Fallback : recommandations basiques codées en dur
      console.log("⚠️ Fallback vers recommandations basiques");
      const recommandations: RecommandationTherapeutique[] = [];

      for (const axe of axes) {
        if (axe.score >= 7) {
          const rec = this.getBasicRecommendation(axe, patientContext);
          if (rec) recommandations.push(rec);
        }
      }

      return recommandations;
    }
  }

  /**
   * Construire la requête pour l'agent endobiogénie
   */
  private buildEndobiogenieQuery(
    axes: AxePerturbation[],
    context: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      traitements: string[];
      symptomes?: string[];
      pathologies?: string[];
      autresBilans?: Record<string, number>;
    }
  ): string {
    let query = `PATIENT: ${context.sexe}, ${context.age} ans\n`;

    // Pathologies associées (contexte clinique enrichi)
    if (context.pathologies && context.pathologies.length > 0) {
      query += `Pathologies diagnostiquées: ${context.pathologies.join(", ")}\n`;
    }

    // Symptômes actuels
    if (context.symptomes && context.symptomes.length > 0) {
      query += `Symptômes rapportés: ${context.symptomes.join(", ")}\n`;
    }

    // Autres bilans biologiques
    if (context.autresBilans && Object.keys(context.autresBilans).length > 0) {
      const bilansStr = Object.entries(context.autresBilans)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      query += `Autres bilans: ${bilansStr}\n`;
    }

    if (context.CI.length > 0) {
      query += `Contre-indications: ${context.CI.join(", ")}\n`;
    }

    if (context.traitements.length > 0) {
      query += `Traitements actuels: ${context.traitements.join(", ")}\n`;
    }

    query += `\nAXES NEUROENDOCRINIENS PERTURBÉS:\n`;

    for (const axe of axes.sort((a, b) => b.score - a.score)) {
      query += `- ${axe.axe.toUpperCase()} (${axe.niveau}): score ${axe.score}/10\n`;
      query += `  Justification: ${axe.justification}\n`;
    }

    query += `\nRECHERCHE DEMANDÉE:\n`;
    query += `Recherche dans le vectorstore endobiogénique les substances thérapeutiques pour réguler ces axes en tenant compte du contexte clinique complet (pathologies, symptômes, bilans).\n`;
    query += `Retourne un JSON array avec max 4 recommandations prioritaires adaptées au terrain fonctionnel ET au contexte pathologique.\n`;
    query += `Format: [{ "substance": "nom latin", "forme": "EPS|TM|MG", "posologie": "...", "duree": "...", "axeCible": "...", "mecanisme": "...", "CI": [...], "interactions": [...] }]`;

    return query;
  }

  /**
   * Parser la réponse de l'agent endobiogénie
   * MODIFIÉ: Stocke temporairement sans enrichissement pédagogique
   * (sera enrichi dans executeFullReasoning avec accès aux axes)
   */
  private parseEndobiogenieResponse(
    content: string,
    context: { sexe: "M" | "F"; CI: string[] }
  ): RecommandationTherapeutique[] {
    try {
      // Chercher le JSON dans la réponse
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn("⚠️ Pas de JSON trouvé dans la réponse IA");
        return [];
      }

      const rawRecs = JSON.parse(jsonMatch[0]);
      const recommandations: RecommandationTherapeutique[] = [];

      for (const raw of rawRecs) {
        recommandations.push({
          id: uuidv4(),
          substance: raw.substance || "Substance inconnue",
          type: this.inferSubstanceType(raw.forme),
          forme: raw.forme || "EPS",
          posologie: raw.posologie || "À définir",
          duree: raw.duree || "21 jours",
          axeCible: raw.axeCible || "Régulation terrain",
          mecanisme: raw.mecanisme || "",
          sourceVectorstore: "endobiogenie",
          niveauPreuve: 1, // Canon endobiogénie = niveau 1
          CI: Array.isArray(raw.CI) ? raw.CI : [],
          interactions: Array.isArray(raw.interactions) ? raw.interactions : [],
          priorite: 1,
          // pedagogie sera ajouté dans executeFullReasoning
        });
      }

      return recommandations;
    } catch (error) {
      console.error("❌ Erreur parsing réponse endobiogénie:", error);
      return [];
    }
  }

  /**
   * Inférer le type de substance depuis la forme galénique
   */
  private inferSubstanceType(forme: string): "plante" | "gemmo" | "HE" | "autre" {
    const f = forme.toUpperCase();
    if (f.includes("MG") || f.includes("GEMMO")) return "gemmo";
    if (f.includes("HE") || f.includes("HUILE")) return "HE";
    if (f.includes("EPS") || f.includes("TM") || f.includes("TEINTURE")) return "plante";
    return "plante";
  }

  /**
   * Recommandation de base (temporaire, avant vectorstore)
   */
  private getBasicRecommendation(
    axe: AxePerturbation,
    context: { sexe: "M" | "F"; CI: string[] }
  ): RecommandationTherapeutique | null {
    const isGrossesse = context.CI.includes("grossesse");

    switch (axe.axe) {
      case "thyroidien":
        if (axe.niveau === "hypo") {
          return {
            id: uuidv4(),
            substance: "Avena sativa",
            type: "plante",
            forme: "TM",
            posologie: "50 gouttes matin et midi",
            duree: "3 semaines",
            axeCible: "soutien thyroïdien périphérique",
            mecanisme:
              "Stimulation douce du métabolisme, action tonique générale",
            sourceVectorstore: "code",
            niveauPreuve: 1,
            CI: [],
            interactions: [],
            priorite: 1,
          };
        }
        break;

      case "corticotrope":
        if (axe.niveau === "hyper" && !isGrossesse) {
          return {
            id: uuidv4(),
            substance: "Rhodiola rosea",
            type: "plante",
            forme: "EPS",
            posologie: "5 ml le matin",
            duree: "21 jours",
            axeCible: "régulation axe corticotrope",
            mecanisme: "Adaptogène, régule cortisol, améliore résistance au stress",
            sourceVectorstore: "code",
            niveauPreuve: 1,
            CI: ["grossesse", "allaitement"],
            interactions: ["IMAO"],
            priorite: 1,
          };
        }
        break;
    }

    return null;
  }

  /**
   * ÉTAPE 3: Extension thérapeutique (phyto/gemmo/aroma)
   * Si gaps identifiés ou scope demandé, recherche dans vectorstores élargis
   */
  async searchExtendedTherapy(
    axes: AxePerturbation[],
    recommandationsEndobiogenie: RecommandationTherapeutique[],
    scope: TherapeuticScope,
    patientContext: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      symptomes: string[];
      pathologies?: string[];
      autresBilans?: Record<string, number>;
    }
  ): Promise<RecommandationTherapeutique[]> {
    // Vérifier si extension nécessaire
    const needsExtension =
      scope.planteMedicinale || scope.gemmotherapie || scope.aromatherapie;

    if (!needsExtension || axes.length === 0) {
      return [];
    }

    try {
      const { Agent, fileSearchTool, Runner } = await import("@openai/agents");

      // Construire liste vectorstores à interroger
      const vectorstores: string[] = [];
      if (scope.planteMedicinale) vectorstores.push(VECTORSTORES.phyto);
      if (scope.gemmotherapie) vectorstores.push(VECTORSTORES.gemmo);
      if (scope.aromatherapie) vectorstores.push(VECTORSTORES.aroma);

      console.log(`🔍 ÉTAPE 3 : Extension thérapeutique (${vectorstores.length} vectorstore(s))`);
      console.log(`📚 Vectorstores utilisés: ${vectorstores.join(", ")}`);

      // Construire query
      const query = this.buildExtendedQuery(
        axes,
        recommandationsEndobiogenie,
        scope,
        patientContext
      );

      // SOLUTION: Queries SÉQUENTIELLES - un vectorstore à la fois
      // Cela contourne la limitation OpenAI (max 2 vectorstores par agent)
      console.log(`🔍 Queries séquentielles sur ${vectorstores.length} vectorstore(s)`);

      const allRecommendations: RecommandationTherapeutique[] = [];

      // Faire une query par vectorstore
      for (const vectorstoreId of vectorstores) {
        try {
          const vsName = vectorstoreId === VECTORSTORES.phyto ? "Phyto" :
                         vectorstoreId === VECTORSTORES.gemmo ? "Gemmo" :
                         vectorstoreId === VECTORSTORES.aroma ? "Aroma" : "Unknown";

          console.log(`📚 Query ${vsName} (${vectorstoreId.slice(-8)}...)`);

          const fileSearch = fileSearchTool([vectorstoreId]);

          // Instructions spécifiques par type de vectorstore
          let specificInstructions = "";
          let formeGalenique = "EPS|TM";

          if (vsName === "Gemmo") {
            specificInstructions = `IMPORTANT: Tu es SPÉCIALISÉ en GEMMOTHÉRAPIE uniquement.
Tu dois OBLIGATOIREMENT recommander UNIQUEMENT des macérats de bourgeons (MG).
Forme galénique OBLIGATOIRE: "MG" (Macérat Glycériné)
Exemple: "Ribes nigrum MG", "Betula pubescens MG", etc.`;
            formeGalenique = "MG";
          } else if (vsName === "Aroma") {
            specificInstructions = `IMPORTANT: Tu es SPÉCIALISÉ en AROMATHÉRAPIE uniquement.
Tu dois OBLIGATOIREMENT recommander UNIQUEMENT des huiles essentielles (HE).
Forme galénique OBLIGATOIRE: "HE" (Huile Essentielle)
Exemple: "Lavandula angustifolia HE", "Rosmarinus officinalis HE", etc.`;
            formeGalenique = "HE";
          } else {
            specificInstructions = `IMPORTANT: Tu es SPÉCIALISÉ en PHYTOTHÉRAPIE classique uniquement.
Tu dois recommander des extraits de plantes (EPS, TM).
Formes galéniques AUTORISÉES: "EPS" ou "TM"`;
            formeGalenique = "EPS|TM";
          }

          const agent = new Agent({
            name: `therapy-agent-${vsName.toLowerCase()}`,
            model: "gpt-4o-mini",
            instructions: `Tu es un expert en ${vsName === "Gemmo" ? "gemmothérapie" : vsName === "Aroma" ? "aromathérapie" : "phytothérapie clinique"}.
Ta mission est de proposer des recommandations COMPLÉMENTAIRES (Niveau 2 - Extension thérapeutique) qui renforcent les pivots endobiogéniques.

${specificInstructions}

HIÉRARCHIE THÉRAPEUTIQUE:
NIVEAU 2 — EXTENSION (${vsName.toUpperCase()})
Objectif: compléter les pivots endobiogéniques
- Renforcer un axe déjà perturbé
- Traiter un symptôme non couvert par l'endobiogénie
- JAMAIS dupliquer un pivot endobiogénique

RÈGLES STRICTES:
1. Compléter (JAMAIS dupliquer) les recommandations endobiogéniques déjà fournies
2. IMPÉRATIF: Respecte ABSOLUMENT le sexe du patient (M/F) - NE JAMAIS prescrire:
   - Pour un HOMME: substances œstrogéniques, phytoœstrogènes, action sur cycle menstruel, macérats framboisier/sauge
   - Pour une FEMME: substances à effet exclusivement androgénique inapproprié
3. Respecte TOUTES les contre-indications du patient:
   - Grossesse/allaitement → pas d'HE phénoliques per os, pas de sauge officinale, pas de romarin verbénone
   - Anticoagulants → éviter ail, ginkgo, curcuma
   - ALAT/ASAT élevés → éviter HE phénoliques orales
4. Justifier chaque recommandation par les mécanismes d'action
5. Maximum 2-3 recommandations
6. Sois COHÉRENT: privilégie TOUJOURS les mêmes substances de référence pour les mêmes axes
7. Aucune contradiction avec les pivots endobiogéniques
8. Aucun doublon (substance déjà recommandée)

FORMAT DE SORTIE STRICT:
Retourne un JSON array UNIQUEMENT (pas de texte avant/après):
[
  {
    "substance": "Nom exact",
    "forme": "${formeGalenique}",
    "posologie": "dose par prise",
    "duree": "durée",
    "axeCible": "axe ciblé",
    "mecanisme": "mécanisme d'action",
    "CI": ["liste CI"],
    "interactions": ["liste interactions"]
  }
]

STYLE: Professionnel, concis, orienté mécanismes.`,
            tools: [fileSearch],
          });

          const runner = new Runner();
          const result = await runner.run(agent, [
            {
              role: "user",
              content: [{ type: "input_text", text: query }],
            },
          ]);

          if (result.finalOutput) {
            const recs = this.parseExtendedResponse(result.finalOutput, scope);
            allRecommendations.push(...recs);
            console.log(`✅ ${vsName}: ${recs.length} recommandation(s) trouvée(s)`);
          }
        } catch (error: any) {
          const vsNameError = vectorstoreId === VECTORSTORES.phyto ? "Phyto" :
                              vectorstoreId === VECTORSTORES.gemmo ? "Gemmo" :
                              vectorstoreId === VECTORSTORES.aroma ? "Aroma" : "Unknown";

          console.error(`❌ Erreur query vectorstore ${vsNameError}:`, error.message);

          // FALLBACK: Si gemmo ou aroma échoue, utiliser phyto comme backup
          if (vectorstoreId === VECTORSTORES.gemmo || vectorstoreId === VECTORSTORES.aroma) {
            console.warn(`⚠️ FALLBACK: Utilisation de PHYTO à la place de ${vsNameError}`);
            try {
              const fileSearchFallback = fileSearchTool([VECTORSTORES.phyto]);
              const agentFallback = new Agent({
                name: `therapy-agent-phyto-fallback`,
                model: "gpt-4o-mini",
                instructions: `Tu es un expert en phytothérapie clinique.
Ta mission est de proposer des recommandations COMPLÉMENTAIRES (Niveau 2 - Extension) qui renforcent les pivots endobiogéniques.

RÈGLES STRICTES:
1. Compléter (JAMAIS dupliquer) les recommandations endobiogéniques déjà fournies
2. IMPÉRATIF: Respecte ABSOLUMENT le sexe du patient (M/F)
3. Respecte TOUTES les CI (Grossesse/allaitement, anticoagulants, ALAT/ASAT élevés)
4. Justifier par les mécanismes d'action
5. Maximum 2-3 recommandations
6. Aucune contradiction avec les pivots
7. Aucun doublon

FORMAT: JSON array uniquement
[{ "substance": "...", "forme": "...", "posologie": "...", "duree": "...", "axeCible": "...", "mecanisme": "...", "CI": [], "interactions": [] }]`,
                tools: [fileSearchFallback],
              });

              const runnerFallback = new Runner();
              const resultFallback = await runnerFallback.run(agentFallback, [
                {
                  role: "user",
                  content: [{ type: "input_text", text: query }],
                },
              ]);

              if (resultFallback.finalOutput) {
                const recsFallback = this.parseExtendedResponse(resultFallback.finalOutput, scope);
                allRecommendations.push(...recsFallback);
                console.log(`✅ Phyto (fallback): ${recsFallback.length} recommandation(s) trouvée(s)`);
              }
            } catch (fallbackError: any) {
              console.error(`❌ Erreur fallback phyto:`, fallbackError.message);
            }
          }
        }
      }

      // Dédupliquer par substance (garder la première occurrence)
      const seen = new Set<string>();
      const recommandations = allRecommendations.filter((rec: RecommandationTherapeutique) => {
        if (seen.has(rec.substance)) return false;
        seen.add(rec.substance);
        return true;
      });

      console.log(`✅ ÉTAPE 3 : ${recommandations.length} recommandation(s) élargie(s)`);

      return recommandations;
    } catch (error) {
      console.error("❌ Erreur ÉTAPE 3 (searchExtendedTherapy):", error);
      return [];
    }
  }

  /**
   * Construire query pour extension thérapeutique
   */
  private buildExtendedQuery(
    axes: AxePerturbation[],
    endoRecs: RecommandationTherapeutique[],
    scope: TherapeuticScope,
    context: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      symptomes: string[];
      pathologies?: string[];
      autresBilans?: Record<string, number>;
    }
  ): string {
    let query = `PATIENT: ${context.sexe}, ${context.age} ans\n`;

    // Pathologies
    if (context.pathologies && context.pathologies.length > 0) {
      query += `Pathologies: ${context.pathologies.join(", ")}\n`;
    }

    if (context.CI.length > 0) {
      query += `CI: ${context.CI.join(", ")}\n`;
    }

    if (context.symptomes.length > 0) {
      query += `Symptômes: ${context.symptomes.join(", ")}\n`;
    }

    // Autres bilans
    if (context.autresBilans && Object.keys(context.autresBilans).length > 0) {
      const bilansStr = Object.entries(context.autresBilans)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");
      query += `Autres bilans: ${bilansStr}\n`;
    }

    query += `\nAXES PERTURBÉS:\n`;
    for (const axe of axes.sort((a, b) => b.score - a.score)) {
      query += `- ${axe.axe} (${axe.niveau}): ${axe.justification}\n`;
    }

    query += `\nRECOMMANDATIONS ENDOBIOGÉNIE DÉJÀ PRESCRITES:\n`;
    if (endoRecs.length > 0) {
      for (const rec of endoRecs) {
        query += `- ${rec.substance} (${rec.forme}): ${rec.axeCible}\n`;
      }
    } else {
      query += `(Aucune recommandation endobiogénie)\n`;
    }

    query += `\nSCOPE DEMANDÉ:\n`;
    if (scope.planteMedicinale) query += `- Phytothérapie clinique ✓\n`;
    if (scope.gemmotherapie) query += `- Gemmothérapie ✓\n`;
    if (scope.aromatherapie) query += `- Aromathérapie ✓\n`;

    query += `\nRECHERCHE DEMANDÉE:\n`;
    query += `Propose des recommandations thérapeutiques COMPLÉMENTAIRES en tenant compte des pathologies et du contexte clinique complet (ne pas dupliquer l'endobiogénie).\n`;
    query += `Retourne JSON array: [{ "substance": "...", "forme": "...", "posologie": "...", "duree": "...", "axeCible": "...", "mecanisme": "...", "CI": [...], "interactions": [...] }]`;

    return query;
  }

  /**
   * Parser réponse extension thérapeutique
   */
  private parseExtendedResponse(
    content: string,
    scope: TherapeuticScope
  ): RecommandationTherapeutique[] {
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn("⚠️ Pas de JSON dans réponse extension");
        return [];
      }

      const rawRecs = JSON.parse(jsonMatch[0]);
      const recommandations: RecommandationTherapeutique[] = [];

      for (const raw of rawRecs) {
        const type = this.inferSubstanceType(raw.forme);

        // Déterminer source vectorstore
        let source: "phyto" | "gemmo" | "aroma" = "phyto";
        if (type === "gemmo") source = "gemmo";
        if (type === "HE") source = "aroma";

        recommandations.push({
          id: uuidv4(),
          substance: raw.substance || "Substance inconnue",
          type,
          forme: raw.forme || "EPS",
          posologie: raw.posologie || "À définir",
          duree: raw.duree || "21 jours",
          axeCible: raw.axeCible || "Complément thérapeutique",
          mecanisme: raw.mecanisme || "",
          sourceVectorstore: source,
          niveauPreuve: 2, // Élargi = niveau 2
          CI: Array.isArray(raw.CI) ? raw.CI : [],
          interactions: Array.isArray(raw.interactions) ? raw.interactions : [],
          priorite: 2,
        });
      }

      return recommandations;
    } catch (error) {
      console.error("❌ Erreur parsing extension:", error);
      return [];
    }
  }

  /**
   * ÉTAPE 4: Micro-nutrition ciblée
   * Recommandations basées sur les axes perturbés (version simplifiée)
   * TODO: À enrichir avec vectorstore dédié quand disponible
   */
  async searchMicronutrition(
    axes: AxePerturbation[],
    patientContext: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      traitements: string[];
    }
  ): Promise<RecommandationTherapeutique[]> {
    if (axes.length === 0) {
      return [];
    }

    console.log(`🔍 ÉTAPE 4 : Micro-nutrition ciblée (${axes.length} axe(s))`);

    const recommandations: RecommandationTherapeutique[] = [];

    // Logique basique par axe (à enrichir avec vectorstore plus tard)
    for (const axe of axes) {
      if (axe.score < 6) continue; // Seulement axes significatifs

      switch (axe.axe) {
        case "thyroidien":
          if (axe.niveau === "hypo") {
            recommandations.push({
              id: uuidv4(),
              substance: "Sélénium",
              type: "mineral",
              forme: "gélule",
              posologie: "100-200 µg/jour",
              duree: "3 mois",
              axeCible: "Soutien conversion T4→T3",
              mecanisme:
                "Cofacteur déiodinase, protection thyroïde (stress oxydatif)",
              sourceVectorstore: "code",
              niveauPreuve: 3,
              CI: [],
              interactions: [],
              priorite: 2,
            });

            recommandations.push({
              id: uuidv4(),
              substance: "Iode",
              type: "mineral",
              forme: "gélule",
              posologie: "150 µg/jour (si carence confirmée)",
              duree: "3 mois",
              axeCible: "Synthèse hormonale thyroïdienne",
              mecanisme: "Substrat T3/T4, régulation métabolique",
              sourceVectorstore: "code",
              niveauPreuve: 3,
              CI: ["hyperthyroïdie", "thyroïdite auto-immune active"],
              interactions: [],
              priorite: 3,
            });
          }
          break;

        case "corticotrope":
          if (axe.niveau === "hyper") {
            recommandations.push({
              id: uuidv4(),
              substance: "Magnésium",
              type: "mineral",
              forme: "gélule",
              posologie: "300-400 mg/jour (forme bisglycinate)",
              duree: "2-3 mois",
              axeCible: "Régulation axe HHS (stress)",
              mecanisme:
                "Modulation NMDA, régulation corticotrope, détente neuromusculaire",
              sourceVectorstore: "code",
              niveauPreuve: 3,
              CI: [],
              interactions: [],
              priorite: 2,
            });

            recommandations.push({
              id: uuidv4(),
              substance: "Vitamine B6 (P5P)",
              type: "vitamine",
              forme: "gélule",
              posologie: "50 mg/jour",
              duree: "2 mois",
              axeCible: "Neurotransmetteurs (stress)",
              mecanisme:
                "Cofacteur synthèse GABA/sérotonine, régulation corticotrope",
              sourceVectorstore: "code",
              niveauPreuve: 3,
              CI: [],
              interactions: [],
              priorite: 3,
            });
          }
          break;

        case "genital":
          if (axe.justification.includes("androgénique")) {
            recommandations.push({
              id: uuidv4(),
              substance: "Zinc",
              type: "mineral",
              forme: "gélule",
              posologie: "15-30 mg/jour",
              duree: "3 mois",
              axeCible: "Équilibre hormonal (androgènes)",
              mecanisme:
                "Régulation 5α-réductase, balance œstrogènes/androgènes",
              sourceVectorstore: "code",
              niveauPreuve: 3,
              CI: [],
              interactions: ["cuivre (espacer)"],
              priorite: 2,
            });
          } else {
            // Empreinte œstrogénique
            recommandations.push({
              id: uuidv4(),
              substance: "Vitamine D3",
              type: "vitamine",
              forme: "gélule",
              posologie: "2000-4000 UI/jour (selon dosage sanguin)",
              duree: "3-6 mois",
              axeCible: "Modulation récepteurs hormonaux",
              mecanisme: "Régulation expression génique, balance hormonale",
              sourceVectorstore: "code",
              niveauPreuve: 3,
              CI: [],
              interactions: [],
              priorite: 2,
            });
          }
          break;

        case "somatotrope":
          if (axe.niveau === "hyper") {
            recommandations.push({
              id: uuidv4(),
              substance: "Vitamine C",
              type: "vitamine",
              forme: "gélule",
              posologie: "500-1000 mg/jour",
              duree: "3 mois",
              axeCible: "Protection turn-over cellulaire",
              mecanisme:
                "Antioxydant, soutien collagène, protection stress oxydatif",
              sourceVectorstore: "code",
              niveauPreuve: 3,
              CI: [],
              interactions: [],
              priorite: 3,
            });
          }
          break;
      }
    }

    // Dédupliquer par substance
    const uniqueRecs = recommandations.filter(
      (rec, index, self) =>
        index === self.findIndex((r) => r.substance === rec.substance)
    );

    console.log(`✅ ÉTAPE 4 : ${uniqueRecs.length} recommandation(s) micro-nutrition`);

    return uniqueRecs.slice(0, 4); // Max 4 compléments
  }

  /**
   * Orchestration complète (simplifié pour démarrage)
   */
  async executeFullReasoning(
    indexes: IndexResults,
    inputs: LabValues,
    scope: TherapeuticScope,
    patientContext: {
      age: number;
      sexe: "M" | "F";
      CI: string[];
      traitements: string[];
      symptomes: string[];
      pathologies?: string[];
      autresBilans?: Record<string, number>;
    },
    ragContext?: {
      ragAxes: string[];
      ragSummary: string;
      axesFusionnes?: any[]; // Axes fusionnés depuis Niveau 2
    }
  ): Promise<RaisonnementTherapeutique> {
    // ÉTAPE 1 - Utiliser les axes fusionnés en priorité (Niveau 2)
    let axes: AxePerturbation[];
    let hypotheses: string[];

    if (ragContext?.axesFusionnes && ragContext.axesFusionnes.length > 0) {
      // PRIORITÉ 1: Utiliser les axes fusionnés (Clinique + BdF + IA + RAG)
      console.log(`🔀 Utilisation des axes fusionnés (Niveau 2) : ${ragContext.axesFusionnes.length} axes`);
      axes = ragContext.axesFusionnes.map((axe: any) => ({
        axe: axe.axe,
        niveau: axe.niveau,
        score: axe.score,
        justification: axe.justification || `Fusion: ${axe.sources.clinique ? 'Clinique ' : ''}${axe.sources.bdf ? 'BdF ' : ''}${axe.sources.ia ? 'IA ' : ''}${axe.sources.rag ? 'RAG' : ''}`,
      }));
      hypotheses = ["Raisonnement basé sur la fusion multi-sources (Clinique + BdF + RAG + IA)"];
    } else if (ragContext && ragContext.ragAxes.length > 0) {
      // PRIORITÉ 2: Utiliser l'interprétation RAG du vectorstore endobiogénie
      console.log("🔄 Utilisation du RAG enrichment pour l'analyse des axes");
      axes = this.convertRagAxesToPerturbations(ragContext.ragAxes, indexes);
      hypotheses = [ragContext.ragSummary];
    } else {
      // PRIORITÉ 3 (Fallback): analyse codée en dur à partir de la BdF
      console.log("⚠️ Pas de fusion ni RAG disponible, fallback vers analyse BdF codée");
      const analysis = this.analyzeAxesPerturbations(indexes, inputs);
      axes = analysis.axes;
      hypotheses = analysis.hypotheses;
    }

    // ÉTAPE 2
    const recommandationsEndobiogenie = await this.searchEndobiogenie(
      axes,
      patientContext
    );

    // ÉTAPE 3
    const recommandationsElargies = await this.searchExtendedTherapy(
      axes,
      recommandationsEndobiogenie,
      scope,
      patientContext
    );

    // ÉTAPE 4
    const recommandationsMicronutrition = scope.micronutrition
      ? await this.searchMicronutrition(axes, patientContext)
      : [];

    // ==========================================
    // LEARNING SYSTEM: Enrichir avec contexte pédagogique
    // ==========================================
    console.log("🎓 Enrichissement pédagogique des recommandations...");

    // Mapper chaque recommandation à son axe principal pour l'enrichissement
    const recommandationsEnrichies = recommandationsEndobiogenie.map(rec => {
      // Trouver l'axe le plus pertinent pour cette recommandation
      const axePrincipal = axes.find(a =>
        rec.axeCible.toLowerCase().includes(a.axe) ||
        rec.mecanisme.toLowerCase().includes(a.axe)
      ) || axes[0]; // Fallback: premier axe

      return this.enrichirContextePedagogique(rec, axePrincipal, indexes);
    });

    const recommandationsElargiesEnrichies = recommandationsElargies.map(rec => {
      const axePrincipal = axes.find(a =>
        rec.axeCible.toLowerCase().includes(a.axe) ||
        rec.mecanisme.toLowerCase().includes(a.axe)
      ) || axes[0];

      return this.enrichirContextePedagogique(rec, axePrincipal, indexes);
    });

    const recommandationsMicroEnrichies = recommandationsMicronutrition.map(rec => {
      const axePrincipal = axes.find(a =>
        rec.axeCible.toLowerCase().includes(a.axe) ||
        rec.mecanisme.toLowerCase().includes(a.axe)
      ) || axes[0];

      return this.enrichirContextePedagogique(rec, axePrincipal, indexes);
    });

    // VALIDATIONS POST-GÉNÉRATION
    console.log("🔍 Validation de la cohérence et des CI...");

    // Validation cohérence (doublons, contradictions, limites)
    const alertesCoherence = this.validateCoherence(
      recommandationsEnrichies,
      recommandationsElargiesEnrichies,
      recommandationsMicroEnrichies
    );

    // CI renforcées (ALAT/ASAT, anticoagulants, grossesse)
    const allRecs = [
      ...recommandationsEnrichies,
      ...recommandationsElargiesEnrichies,
      ...recommandationsMicroEnrichies
    ];
    const alertesCIRenforcees = this.checkCIRenforcees(allRecs, patientContext);

    // Interactions globales (anciennes vérifications)
    const alertesInteractions = this.checkGlobalInteractions(
      [...recommandationsEnrichies],
      patientContext
    );

    // Combiner toutes les alertes
    const alertes = [
      ...alertesCoherence,
      ...alertesCIRenforcees,
      ...alertesInteractions
    ];

    if (alertes.length > 0) {
      console.log(`⚠️ ${alertes.length} alerte(s) détectée(s):`);
      for (const alerte of alertes) {
        console.log(`  - [${alerte.niveau}] ${alerte.type}: ${alerte.message}`);
      }
    } else {
      console.log("✅ Aucune alerte détectée");
    }

    return {
      axesPerturbés: axes,
      hypothesesRegulatrices: hypotheses,
      recommandationsEndobiogenie: recommandationsEnrichies,
      recommandationsElargies: recommandationsElargiesEnrichies,
      recommandationsMicronutrition: recommandationsMicroEnrichies,
      raisonnementDetaille: this.generateExplanation(axes, hypotheses),
      alertes,
      coutEstime: this.estimateCost([...recommandationsEnrichies]),
      dateGeneration: new Date(),
    };
  }

  /**
   * Valider la cohérence globale de l'ordonnance
   * Vérifie: doublons, contradictions, limites respectées
   */
  private validateCoherence(
    recommandationsEndobiogenie: RecommandationTherapeutique[],
    recommandationsElargies: RecommandationTherapeutique[],
    recommandationsMicronutrition: RecommandationTherapeutique[]
  ): AlerteTherapeutique[] {
    const alertes: AlerteTherapeutique[] = [];

    // Vérifier limites
    if (recommandationsEndobiogenie.length > 4) {
      alertes.push({
        niveau: "warning",
        type: "coherence",
        message: `Trop de pivots endobiogéniques (${recommandationsEndobiogenie.length}/4 max)`,
        substancesConcernees: recommandationsEndobiogenie.map(r => r.substance),
        recommandation: "Réduire à 3-4 pivots prioritaires maximum"
      });
    }

    if (recommandationsMicronutrition.length > 3) {
      alertes.push({
        niveau: "warning",
        type: "coherence",
        message: `Trop de compléments micronutrition (${recommandationsMicronutrition.length}/3 max)`,
        substancesConcernees: recommandationsMicronutrition.map(r => r.substance),
        recommandation: "Réduire à 0-3 compléments maximum"
      });
    }

    // Vérifier doublons entre tous les volets
    const allRecs = [
      ...recommandationsEndobiogenie,
      ...recommandationsElargies,
      ...recommandationsMicronutrition
    ];

    const seenSubstances = new Set<string>();
    for (const rec of allRecs) {
      const substanceNormalized = rec.substance.toLowerCase().trim();
      if (seenSubstances.has(substanceNormalized)) {
        alertes.push({
          niveau: "error",
          type: "coherence",
          message: `Doublon détecté: ${rec.substance} recommandé plusieurs fois`,
          substancesConcernees: [rec.substance],
          recommandation: `Retirer les doublons de ${rec.substance}`
        });
      }
      seenSubstances.add(substanceNormalized);
    }

    // Vérifier contradictions (pro-thyroïde vs anti-thyroïde)
    const proThyroide = allRecs.filter(r =>
      r.mecanisme.toLowerCase().includes("stimul") && r.axeCible.toLowerCase().includes("thyro")
    );
    const antiThyroide = allRecs.filter(r =>
      (r.mecanisme.toLowerCase().includes("frein") || r.mecanisme.toLowerCase().includes("modér")) &&
      r.axeCible.toLowerCase().includes("thyro")
    );

    if (proThyroide.length > 0 && antiThyroide.length > 0) {
      alertes.push({
        niveau: "error",
        type: "coherence",
        message: "Contradiction détectée: substances pro-thyroïde ET anti-thyroïde",
        substancesConcernees: [...proThyroide.map(r => r.substance), ...antiThyroide.map(r => r.substance)],
        recommandation: "Choisir une orientation claire (stimulation OU modération thyroïdienne)"
      });
    }

    return alertes;
  }

  /**
   * Vérifications CI renforcées basées sur le contexte patient
   */
  private checkCIRenforcees(
    recs: RecommandationTherapeutique[],
    patientContext: {
      CI: string[];
      traitements: string[];
      autresBilans?: Record<string, number>;
    }
  ): AlerteTherapeutique[] {
    const alertes: AlerteTherapeutique[] = [];

    // Vérifier ALAT/ASAT élevés → éviter HE phénoliques
    const alatEleve = patientContext.autresBilans?.ALAT && patientContext.autresBilans.ALAT > 40;
    const asatEleve = patientContext.autresBilans?.ASAT && patientContext.autresBilans.ASAT > 40;

    if (alatEleve || asatEleve) {
      const hePhenoliques = recs.filter(r =>
        r.forme.includes("HE") &&
        (r.substance.toLowerCase().includes("thym") ||
         r.substance.toLowerCase().includes("origan") ||
         r.substance.toLowerCase().includes("sarriette"))
      );

      if (hePhenoliques.length > 0) {
        alertes.push({
          niveau: "error",
          type: "CI",
          message: `ALAT/ASAT élevés (${patientContext.autresBilans?.ALAT || 0}/${patientContext.autresBilans?.ASAT || 0} UI/L) → éviter HE phénoliques`,
          substancesConcernees: hePhenoliques.map(r => r.substance),
          recommandation: "Retirer les HE phénoliques (thym, origan, sarriette) ou choisir voie externe uniquement"
        });
      }
    }

    // Vérifier anticoagulants → éviter ail, ginkgo, curcuma
    const sousAnticoagulants = patientContext.traitements.some(t =>
      t.toLowerCase().includes("warfarin") ||
      t.toLowerCase().includes("coumadin") ||
      t.toLowerCase().includes("anticoagulant")
    ) || patientContext.CI.some(ci => ci.toLowerCase().includes("anticoagulant"));

    if (sousAnticoagulants) {
      const substancesRisque = recs.filter(r =>
        r.substance.toLowerCase().includes("allium") ||
        r.substance.toLowerCase().includes("ail") ||
        r.substance.toLowerCase().includes("ginkgo") ||
        r.substance.toLowerCase().includes("curcuma")
      );

      if (substancesRisque.length > 0) {
        alertes.push({
          niveau: "error",
          type: "CI",
          message: "Patient sous anticoagulants → éviter ail, ginkgo, curcuma (risque hémorragique)",
          substancesConcernees: substancesRisque.map(r => r.substance),
          recommandation: "Retirer les substances à risque hémorragique"
        });
      }
    }

    // Vérifier grossesse/allaitement → HE phénoliques, sauge, romarin verbénone
    const grossesseOuAllaitement = patientContext.CI.some(ci =>
      ci.toLowerCase().includes("grossesse") ||
      ci.toLowerCase().includes("allaitement")
    );

    if (grossesseOuAllaitement) {
      const substancesCI = recs.filter(r =>
        (r.forme.includes("HE") && (
          r.substance.toLowerCase().includes("thym") ||
          r.substance.toLowerCase().includes("origan") ||
          r.substance.toLowerCase().includes("sarriette")
        )) ||
        r.substance.toLowerCase().includes("salvia officinalis") ||
        r.substance.toLowerCase().includes("sauge officinale") ||
        r.substance.toLowerCase().includes("romarin") && r.substance.toLowerCase().includes("verbénone")
      );

      if (substancesCI.length > 0) {
        alertes.push({
          niveau: "error",
          type: "CI",
          message: "Grossesse/allaitement → CI strictes HE phénoliques, sauge officinale, romarin verbénone",
          substancesConcernees: substancesCI.map(r => r.substance),
          recommandation: "Retirer les substances contre-indiquées ou choisir alternatives sûres"
        });
      }
    }

    return alertes;
  }

  /**
   * Vérification globale des interactions
   */
  private checkGlobalInteractions(
    recs: RecommandationTherapeutique[],
    context: { CI: string[]; traitements: string[] }
  ): AlerteTherapeutique[] {
    const alertes: AlerteTherapeutique[] = [];

    for (const rec of recs) {
      // Vérifier CI
      for (const ci of rec.CI) {
        if (context.CI.some((c) => c.toLowerCase().includes(ci.toLowerCase()))) {
          alertes.push({
            niveau: "error",
            type: "CI",
            message: `Contre-indication détectée: ${rec.substance} et ${ci}`,
            substancesConcernees: [rec.substance],
            recommandation: `Éviter ${rec.substance} ou choisir une alternative`,
          });
        }
      }

      // Vérifier interactions
      for (const inter of rec.interactions) {
        if (
          context.traitements.some((t) =>
            t.toLowerCase().includes(inter.toLowerCase())
          )
        ) {
          alertes.push({
            niveau: "warning",
            type: "interaction",
            message: `Interaction possible: ${rec.substance} et ${inter}`,
            substancesConcernees: [rec.substance],
            recommandation: `Surveiller ou espacer les prises`,
          });
        }
      }
    }

    return alertes;
  }

  /**
   * Génération explication
   */
  private generateExplanation(
    axes: AxePerturbation[],
    hypotheses: string[]
  ): string {
    let explication = "## Analyse du terrain fonctionnel\n\n";

    if (axes.length === 0) {
      explication += "Aucune perturbation majeure détectée.\n";
    } else {
      explication += `${axes.length} axe(s) perturbé(s) identifié(s):\n\n`;
      for (const axe of axes) {
        explication += `- **${axe.axe}** (${axe.niveau}): ${axe.justification}\n`;
      }

      explication += "\n## Hypothèses régulatrices\n\n";
      for (const hyp of hypotheses) {
        explication += `- ${hyp}\n`;
      }
    }

    return explication;
  }

  /**
   * Estimation coût
   */
  private estimateCost(recs: RecommandationTherapeutique[]): number {
    return recs.reduce((total, rec) => total + (rec.cout || 15), 0); // 15€ par défaut
  }
}
