"use client";

import { useState, useMemo } from "react";

// ========================================
// DONNÉES EXPERT
// Correspondances symptômes → terrain endobiogénique
// Mapping avec les VRAIS IDs du formulaire
// ========================================

interface CorrespondanceTerrain {
  questionIds: string[];  // IDs réels des questions
  signe: string;
  terrain: string;
  axe: string;
  traitement?: string;
  tooltip: string;
}

const CORRESPONDANCES_TERRAIN: CorrespondanceTerrain[] = [
  // ========== AXE CORTICOTROPE (Adaptatif) ==========
  {
    questionIds: ["neuro_reveil_nocturne", "sommeil_reveil_nocturne"],
    signe: "Réveil nocturne 3h-4h",
    terrain: "Congestion hépatique + Hypercortisolisme",
    axe: "corticotrope",
    traitement: "Drainage hépatique (Desmodium, Chrysantellum)",
    tooltip: "Réveil entre 3h-4h avec anxiété ou transpiration: Le foie travaille intensément. Terrain de congestion hépatobiliaire avec possible hypercortisolisme nocturne. Indication: drainage hépatique prioritaire."
  },
  {
    questionIds: ["cortico_coup_pompe", "cortico_sel"],
    signe: "Envies de sucré/salé",
    terrain: "Hypoglycémie réactionnelle + Insuffisance surrénale",
    axe: "corticotrope",
    traitement: "Ribes nigrum MG + Eleuthérocoque + Magnésium",
    tooltip: "Coups de pompe avec envies de sucre (11h/17h) ou envies de sel: Signe classique d'insuffisance corticotrope. L'organisme cherche à compenser la fatigue surrénalienne."
  },
  {
    questionIds: ["cortico_fatigue_matin"],
    signe: "Fatigue matinale",
    terrain: "Pic de cortisol matinal absent ou insuffisant",
    axe: "corticotrope",
    traitement: "Ribes nigrum MG (matin), Vitamine C, Adaptogènes",
    tooltip: "Fatigue importante dès le réveil qui s'améliore le soir: Le pic de cortisol de 6h-8h est déficient. Signe cardinal d'insuffisance corticotrope. Ribes nigrum le matin mimera ce pic."
  },
  {
    questionIds: ["cortico_hypotension"],
    signe: "Hypotension orthostatique",
    terrain: "Insuffisance surrénalienne + Hypo-aldostéronisme",
    axe: "corticotrope",
    traitement: "Réglisse (attention HTA), Ribes nigrum",
    tooltip: "Vertiges en passant de la position couchée à debout: Manque de tonus vasculaire par déficit surrénalien (Adrénaline/Aldostérone)."
  },
  {
    questionIds: ["cortico_douleurs"],
    signe: "Douleurs inflammatoires migrantes",
    terrain: "Insuffisance anti-inflammatoire naturelle",
    axe: "corticotrope",
    traitement: "Ribes nigrum MG + Curcuma + Oméga-3",
    tooltip: "Douleurs inflammatoires récurrentes qui 'voyagent': Le cortisol est l'anti-inflammatoire naturel. S'il est bas ou inefficace, l'inflammation flambe."
  },

  // ========== AXE THYRÉOTROPE ==========
  {
    questionIds: ["thyro_frilosite", "thyro_sensation_froid_extremites", "neuro_alpha_froid"],
    signe: "Frilosité / Extrémités froides",
    terrain: "Hypothyroïdie fonctionnelle",
    axe: "thyréotrope",
    traitement: "Fucus, Iode naturel, Sélénium",
    tooltip: "Frilosité marquée ou mains/pieds froids: Hypométabolisme par insuffisance thyréotrope. La T3 basse réduit la thermogenèse. Vérifier aussi le fer (cofacteur de la conversion T4→T3)."
  },
  {
    questionIds: ["thyro_transit_lent", "neuro_alpha_constipation"],
    signe: "Transit lent / Constipation",
    terrain: "Ralentissement thyroïdien du transit",
    axe: "thyréotrope",
    traitement: "Fucus + Magnésium + Fibres",
    tooltip: "Constipation chronique avec selles sèches: Peut être thyroïdienne (hypométabolisme digestif). Vérifier les autres signes thyroïdiens: frilosité, fatigue, peau sèche."
  },
  {
    questionIds: ["thyro_prise_poids_facile"],
    signe: "Prise de poids facile",
    terrain: "Hypofonction thyroïdienne périphérique",
    axe: "thyréotrope",
    traitement: "Soutien thyroïdien + Drainage hépatique",
    tooltip: "Prise de poids même avec peu de calories: Conversion T4→T3 ralentie, métabolisme basal diminué."
  },
  {
    questionIds: ["thyro_chute_cheveux", "thyro_ongles_fragiles", "thyro_sourcils_externes"],
    signe: "Altération des phanères",
    terrain: "Insuffisance métabolique thyroïdienne",
    axe: "thyréotrope",
    traitement: "Sélénium + Zinc + Silice",
    tooltip: "Chute de cheveux, ongles cassants, perte du tiers externe des sourcils (signe de Hertoghe): Marqueurs d'insuffisance métabolique thyroïdienne."
  },

  // ========== AXE NEUROVÉGÉTATIF ==========
  {
    questionIds: ["neuro_beta_palpitations", "thyro_tachycardie_repos"],
    signe: "Palpitations",
    terrain: "Déséquilibre vagal/sympathique - Hypersensibilité Bêta",
    axe: "SNA (Sympathique Bêta)",
    traitement: "Magnésium + Aubépine + Passiflore",
    tooltip: "Palpitations au repos ou au moindre stress: Hypersensibilité des récepteurs Bêta-1 cardiaques à l'adrénaline."
  },
  {
    questionIds: ["neuro_para_salivation", "neuro_para_nausee", "neuro_para_nez_bouche"],
    signe: "Hypertonie vagale",
    terrain: "Terrain hyper-parasympathique",
    axe: "SNA (Parasympathique)",
    traitement: "Drainage hépatique + Ribes nigrum",
    tooltip: "Hypersalivation, mal des transports, nez bouché après les repas: Hyper-réflexivité vagale. Terrain précritique fréquent dans les infections récidivantes."
  },
  {
    questionIds: ["neuro_sommeil_endormissement", "neuro_alpha_mental"],
    signe: "Difficultés d'endormissement",
    terrain: "Dominance Sympathique Alpha",
    axe: "SNA (Sympathique Alpha)",
    traitement: "Passiflore + Eschscholzia + Magnésium soir",
    tooltip: "Plus de 30 min à s'endormir, pensées qui tournent en boucle: Hypervigilance cérébrale médiée par la noradrénaline. Incapacité à lâcher prise."
  },
  {
    questionIds: ["neuro_beta_emotivite", "neuro_beta_tremblements"],
    signe: "Hyper-émotivité / Tremblements",
    terrain: "Hypersensibilité Bêta-sympathique",
    axe: "SNA (Sympathique Bêta)",
    traitement: "Aubépine + Mélisse + Magnésium",
    tooltip: "Rougissement, larmes faciles, tremblements fins des mains: Réactivité vasomotrice de surface et excitation neuromusculaire périphérique."
  },

  // ========== AXE GONADOTROPE ==========
  {
    questionIds: ["gonado_menorragie", "gonado_regles_abondantes"],
    signe: "Règles abondantes",
    terrain: "Hyperœstrogénie avec sur-prolifération endomètre",
    axe: "gonadotrope",
    traitement: "Gattilier (2ème partie cycle), Achillée millefeuille",
    tooltip: "Ménorragies: Hyperœstrogénie relative par rapport à la progestérone. L'endomètre prolifère trop. Le Gattilier en phase lutéale rééquilibre."
  },
  {
    questionIds: ["gonado_spm", "gonado_mastodynie"],
    signe: "SPM / Mastodynies",
    terrain: "Hyperœstrogénie relative",
    axe: "gonadotrope",
    traitement: "Gattilier + Onagre + Drainage hépatique",
    tooltip: "Syndrome prémenstruel, seins douloureux avant les règles: Déséquilibre œstrogènes/progestérone avec insuffisance de la phase lutéale."
  },

  // ========== TERRAIN IMMUNO-INFLAMMATOIRE ==========
  {
    questionIds: ["immuno_allergies", "immuno_rhinite", "immuno_eczema"],
    signe: "Terrain allergique/atopique",
    terrain: "Déséquilibre Th2 + Insuffisance surrénale",
    axe: "immuno + corticotrope",
    traitement: "Ribes nigrum MG + Plantago + Desensibilisation terrain",
    tooltip: "Allergies, rhinite, eczéma: Terrain atopique (Th2) souvent couplé à une insuffisance surrénalienne. Le Ribes nigrum est le 'cortisone-like' végétal."
  },
  {
    questionIds: ["immuno_infections_recidivantes", "immuno_rhumes_frequents"],
    signe: "Infections récidivantes",
    terrain: "Terrain précritique: Hyper-para + Congestion hépatobiliaire + Insuffisance surrénale",
    axe: "corticotrope + SNA",
    traitement: "Ribes nigrum MG + Drainage hépatique + Échinacée",
    tooltip: "Les 3 composantes du terrain précritique sont présentes. Principe: 'En cas de doute, drainer l'émonctoire-clé'. Priorité au drainage hépatique."
  }
];

// ========================================
// PHASES DE VIE (Recyclage endocrinien)
// ========================================

interface PhaseVie {
  phase: number;
  nom: string;
  ageDebut: number;
  ageFin: number;
  programmeGeneral: string;
  risques: string[];
  tooltip: string;
}

const PHASES_VIE: PhaseVie[] = [
  {
    phase: 3,
    nom: "Petite enfance",
    ageDebut: 0,
    ageFin: 1,
    programmeGeneral: "Axe somatotrope",
    risques: ["Croissance rapide", "Vulnérabilité infections"],
    tooltip: "Phase somatotrope. Para-sympathique prédominant. Poids x2 à 5 mois, x3 à 12 mois. Croissance maximale postnatale."
  },
  {
    phase: 4,
    nom: "Enfance",
    ageDebut: 1,
    ageFin: 11,
    programmeGeneral: "Axe somatotrope (Thyroïde puis Corticoïdes)",
    risques: ["1-7 ans: croissance linéaire", "8-11 ans: prise de poids pré-pubertaire normale"],
    tooltip: "1-4 ans: Thyroïde métabolique. 5-7 ans: Thyroïde tissulaire. 8-11 ans: DHEA et corticoïdes - c'est normal de prendre du poids avant la puberté."
  },
  {
    phase: 5,
    nom: "Adolescence",
    ageDebut: 12,
    ageFin: 21,
    programmeGeneral: "Axe gonadotrope sous direction somatotrope",
    risques: ["Instabilité hormonale", "Acné", "Troubles du cycle"],
    tooltip: "Fin du façonnage extérieur. Caractéristiques sexuelles secondaires. La personnalité se finalise à la fin de cette phase."
  },
  {
    phase: 6,
    nom: "Âge adulte",
    ageDebut: 22,
    ageFin: 46,
    programmeGeneral: "Axe gonadotrope",
    risques: ["Pause génitale 28-31 ans", "Pause génitale 39-43 ans", "Risque kystes/fibromes/thyroïdite"],
    tooltip: "Pauses génitales tous les ~7 ans. L'émancipation/individuation se fait vers 28-31 ans. Risque d'états adaptatifs aux pauses: kystes, fibromes, thyroïdite."
  },
  {
    phase: 7,
    nom: "Gonadopause",
    ageDebut: 47,
    ageFin: 120,
    programmeGeneral: "Restructuration gonadotrope",
    risques: ["Restructuration majeure", "Impact structure/fonction/personnalité"],
    tooltip: "Femmes: fin fertilité. Hommes: baisse fertilité. La restructuration peut impacter la structure, la fonction ET la personnalité plus qu'aux autres périodes."
  }
];

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

interface TerrainSynthesisCardProps {
  answersByAxis: Record<string, Record<string, any>>;
  sexe: "H" | "F";
  age?: number;
  dateNaissance?: string;
}

interface TerrainDetecte {
  correspondance: CorrespondanceTerrain;
  questionsMatchees: string[];
  priorite: number;
}

export function TerrainSynthesisCard({ answersByAxis, sexe, age, dateNaissance }: TerrainSynthesisCardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("terrains");
  const [hoveredTerrain, setHoveredTerrain] = useState<string | null>(null);

  // Calculer l'âge si pas fourni
  const patientAge = useMemo(() => {
    if (age) return age;
    if (dateNaissance) {
      return Math.floor((new Date().getTime() - new Date(dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }
    return undefined;
  }, [age, dateNaissance]);

  // Déterminer la phase de vie
  const phaseVie = useMemo(() => {
    if (!patientAge) return null;
    return PHASES_VIE.find(p => patientAge >= p.ageDebut && patientAge <= p.ageFin);
  }, [patientAge]);

  // Détecter les terrains à partir des réponses
  const terrainsDetectes = useMemo(() => {
    const detected: TerrainDetecte[] = [];

    // Flatten all answers avec leurs clés
    const allAnswers: Record<string, any> = {};
    Object.values(answersByAxis).forEach(axeAnswers => {
      if (axeAnswers) {
        Object.entries(axeAnswers).forEach(([key, value]) => {
          allAnswers[key] = value;
        });
      }
    });

    // Chercher les correspondances
    CORRESPONDANCES_TERRAIN.forEach(correspondance => {
      const matchedQuestions: string[] = [];

      correspondance.questionIds.forEach(qId => {
        const value = allAnswers[qId];
        if (value !== undefined && value !== null && value !== '') {
          // Vérifier si la réponse est "positive" (indique un problème)
          const isPositive =
            value === true ||
            value === "oui" ||
            value === "Oui" ||
            (typeof value === 'number' && value >= 3) ||  // Scale 1-5, >=3 = souvent
            value === "souvent" ||
            value === "Souvent" ||
            value === "toujours" ||
            value === "Toujours" ||
            value === "Oui légère" ||
            value === "Oui modérée" ||
            value === "Oui importante";

          if (isPositive) {
            matchedQuestions.push(qId);
          }
        }
      });

      if (matchedQuestions.length > 0) {
        detected.push({
          correspondance,
          questionsMatchees: matchedQuestions,
          priorite: correspondance.axe.includes("corticotrope") ? 1 : 2
        });
      }
    });

    return detected.sort((a, b) => a.priorite - b.priorite);
  }, [answersByAxis]);

  // Couleurs par axe
  const axeColors: Record<string, { bg: string; border: string; text: string }> = {
    corticotrope: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
    "thyréotrope": { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
    gonadotrope: { bg: "#fce7f3", border: "#ec4899", text: "#9d174d" },
    SNA: { bg: "#f3e8ff", border: "#a855f7", text: "#6b21a8" },
    immuno: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  };

  const getAxeColor = (axe: string) => {
    for (const [key, colors] of Object.entries(axeColors)) {
      if (axe.toLowerCase().includes(key.toLowerCase())) return colors;
    }
    return { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" };
  };

  // TOUJOURS afficher la carte (pour montrer la phase de vie au minimum)
  return (
    <div style={{
      background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "24px",
      boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px"
      }}>
        <div>
          <h2 style={{
            color: "white",
            fontSize: "1.5rem",
            fontWeight: "700",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <span style={{ fontSize: "2rem" }}>🎯</span>
            Synthèse Terrain Endobiogénique
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "4px" }}>
            Analyse automatique des correspondances symptômes → terrain
          </p>
        </div>

        {terrainsDetectes.length > 0 && (
          <div style={{
            background: "rgba(16, 185, 129, 0.2)",
            border: "1px solid #10b981",
            borderRadius: "20px",
            padding: "8px 16px",
            color: "#10b981",
            fontWeight: "600",
            fontSize: "0.9rem"
          }}>
            {terrainsDetectes.length} terrain{terrainsDetectes.length > 1 ? "s" : ""} détecté{terrainsDetectes.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Phase de vie */}
      {phaseVie && patientAge && (
        <div
          style={{
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.4)",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
            cursor: "help"
          }}
          title={phaseVie.tooltip}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem"
            }}>
              {patientAge < 12 ? "👶" : patientAge < 22 ? "🧑" : patientAge < 47 ? "👤" : "🧓"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                color: "white",
                fontWeight: "600",
                fontSize: "1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                Phase {phaseVie.phase}: {phaseVie.nom}
                <span style={{
                  fontSize: "0.75rem",
                  background: "rgba(255,255,255,0.2)",
                  padding: "2px 8px",
                  borderRadius: "10px"
                }}>
                  {patientAge} ans
                </span>
              </div>
              <div style={{ color: "#a5b4fc", fontSize: "0.85rem", marginTop: "2px" }}>
                Programme: <strong>{phaseVie.programmeGeneral}</strong>
              </div>
            </div>
            <div style={{
              background: "rgba(251, 191, 36, 0.2)",
              border: "1px solid rgba(251, 191, 36, 0.5)",
              borderRadius: "8px",
              padding: "8px 12px",
              maxWidth: "280px"
            }}>
              <div style={{ color: "#fbbf24", fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px" }}>
                ⚠️ Points d'attention pour cette phase
              </div>
              <div style={{ color: "#fde68a", fontSize: "0.8rem" }}>
                {phaseVie.risques.join(" • ")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terrains détectés */}
      {terrainsDetectes.length > 0 ? (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
              cursor: "pointer"
            }}
            onClick={() => setExpandedSection(expandedSection === "terrains" ? null : "terrains")}
          >
            <h3 style={{ color: "white", fontSize: "1.1rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🔬</span> Correspondances Symptômes → Terrain
            </h3>
            <span style={{ color: "#94a3b8", fontSize: "1.2rem" }}>
              {expandedSection === "terrains" ? "▼" : "▶"}
            </span>
          </div>

          {expandedSection === "terrains" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {terrainsDetectes.map((terrain, idx) => {
                const colors = getAxeColor(terrain.correspondance.axe);
                const isHovered = hoveredTerrain === terrain.correspondance.signe;

                return (
                  <div
                    key={idx}
                    style={{
                      background: isHovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                      borderRadius: "12px",
                      padding: "16px",
                      borderLeft: `4px solid ${colors.border}`,
                      transition: "all 0.2s",
                      cursor: "help"
                    }}
                    onMouseEnter={() => setHoveredTerrain(terrain.correspondance.signe)}
                    onMouseLeave={() => setHoveredTerrain(null)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          color: "#e2e8f0",
                          fontWeight: "500",
                          fontSize: "0.85rem",
                          marginBottom: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <span style={{ color: colors.border }}>●</span>
                          {terrain.correspondance.signe}
                        </div>
                        <div style={{
                          color: "white",
                          fontWeight: "600",
                          fontSize: "0.95rem",
                          marginBottom: "6px"
                        }}>
                          → {terrain.correspondance.terrain}
                        </div>
                        <div style={{
                          display: "inline-block",
                          background: colors.bg,
                          color: colors.text,
                          fontSize: "0.7rem",
                          fontWeight: "600",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          textTransform: "uppercase"
                        }}>
                          Axe {terrain.correspondance.axe}
                        </div>
                      </div>
                      {terrain.correspondance.traitement && (
                        <div style={{
                          background: "rgba(16, 185, 129, 0.2)",
                          border: "1px solid rgba(16, 185, 129, 0.4)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          maxWidth: "280px"
                        }}>
                          <div style={{ color: "#10b981", fontSize: "0.7rem", fontWeight: "600", marginBottom: "2px" }}>
                            💊 Traitement suggéré
                          </div>
                          <div style={{ color: "#6ee7b7", fontSize: "0.8rem" }}>
                            {terrain.correspondance.traitement}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tooltip étendu au hover */}
                    {isHovered && (
                      <div style={{
                        background: "rgba(0,0,0,0.4)",
                        borderRadius: "8px",
                        padding: "12px",
                        marginTop: "8px",
                        borderTop: "1px solid rgba(255,255,255,0.1)"
                      }}>
                        <div style={{ color: "#e2e8f0", fontSize: "0.85rem", lineHeight: "1.5" }}>
                          <span style={{ color: "#fbbf24", marginRight: "8px" }}>💡</span>
                          {terrain.correspondance.tooltip}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Message si aucun terrain détecté
        <div style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📋</div>
          <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            Aucun terrain pathologique détecté pour le moment.
            <br />
            <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              Les correspondances apparaîtront automatiquement selon les réponses de l'interrogatoire.
            </span>
          </div>
        </div>
      )}

      {/* Principe clé */}
      <div style={{
        background: "rgba(234, 179, 8, 0.1)",
        border: "1px solid rgba(234, 179, 8, 0.3)",
        borderRadius: "8px",
        padding: "12px 16px",
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <span style={{ fontSize: "1.5rem" }}>💡</span>
        <div>
          <div style={{ color: "#fbbf24", fontWeight: "600", fontSize: "0.85rem" }}>
            Principe thérapeutique
          </div>
          <div style={{ color: "#fde68a", fontSize: "0.8rem", fontStyle: "italic" }}>
            "En cas de doute, drainer l'émonctoire-clé" — La résolution d'UN seul facteur du terrain précritique peut suffire à prévenir la maladie.
          </div>
        </div>
      </div>
    </div>
  );
}
