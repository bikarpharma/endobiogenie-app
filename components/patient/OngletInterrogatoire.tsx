"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";
import type { AxeType, AxeInterpretation } from "@/lib/interrogatoire/axeInterpretation";
import { BoutonInterpretrerAxe } from "@/components/interrogatoire/BoutonInterpretrerAxe";
import { TerrainSynthesisCard } from "@/components/clinical/TerrainSynthesisCard";

// ========================================
// TOOLTIPS EXPERTS PAR AXE ENDOBIOGÉNIQUE
// ========================================
const AXES_TOOLTIPS: Record<string, { titre: string; description: string; signesCles: string[] }> = {
  neuro: {
    titre: "Axe Neurovégétatif (SNA)",
    description: "Évalue l'équilibre sympathique/parasympathique. Un déséquilibre est la 1ère composante du terrain précritique.",
    signesCles: [
      "Hyper-sympathique: palpitations, insomnie, transpiration",
      "Hyper-parasympathique: hypotension, bradycardie, infections récidivantes",
      "Instabilité: alternance des deux"
    ]
  },
  adaptatif: {
    titre: "Axe Corticotrope (Adaptation)",
    description: "Le 'chef d'orchestre' de l'organisme. Évalue la capacité d'adaptation au stress via cortisol/DHEA.",
    signesCles: [
      "Insuffisance: fatigue matinale, envies sucre/sel, hypotension",
      "Sur-sollicitation: stress chronique, irritabilité, réveil 1h-3h",
      "Épuisement: les deux combinés"
    ]
  },
  thyro: {
    titre: "Axe Thyréotrope",
    description: "Régule le métabolisme de base. Couplage important avec axe gonadotrope (œstrogènes → TSH).",
    signesCles: [
      "Insuffisance: frilosité, constipation, prise poids, fatigue",
      "Sur-sollicitation: intolérance chaleur, perte poids, nervosité",
      "Saisonnier: symptômes aggravés automne-hiver"
    ]
  },
  gonado: {
    titre: "Axe Gonadotrope",
    description: "Hormones sexuelles. Couplage avec thyroïde. Les pauses génitales (~7 ans) sont des périodes à risque.",
    signesCles: [
      "Femme - Hyperœstrogénie: SPM, ménorragies, mastodynies",
      "Femme - Hypo-œstrogénie: sécheresse, bouffées chaleur",
      "Homme: libido, érections matinales, prostate"
    ]
  },
  somato: {
    titre: "Axe Somatotrope",
    description: "Hormone de croissance et IGF-1. Important pour récupération et anabolisme tissulaire.",
    signesCles: [
      "Insuffisance: cicatrisation lente, fonte musculaire, fatigue",
      "Sur-sollicitation: hypoglycémies réactionnelles",
      "Turn-over tissulaire"
    ]
  },
  digestif: {
    titre: "Axe Digestif & Émonctoriel",
    description: "Fonction hépatobiliaire et intestinale. La congestion hépatique est la 3ème composante du terrain précritique.",
    signesCles: [
      "Congestion hépatique: réveil 1h-3h, cholestérol élevé",
      "Insuffisance digestive: ballonnements, digestion lente",
      "'En cas de doute, drainer l'émonctoire-clé'"
    ]
  },
  immuno: {
    titre: "Axe Immuno-inflammatoire",
    description: "Équilibre Th1/Th2. Terrain atopique vs auto-immun.",
    signesCles: [
      "Terrain atopique (Th2): allergies, asthme, eczéma",
      "Terrain auto-immun (Th1): inflammation chronique",
      "Infections récidivantes: immunité cellulaire faible"
    ]
  }
};

type PatientData = {
  id: string;
  numeroPatient: string;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  sexe: string | null;
  atcdMedicaux: string | null;
  traitements: string | null;
  contreindicationsMajeures?: any;
};

export function OngletInterrogatoire({ patient }: { patient: PatientData }) {
  const router = useRouter();
  const [interrogatoire, setInterrogatoire] = useState<InterrogatoireEndobiogenique | null>(null);
  const [interpretations, setInterpretations] = useState<Record<string, AxeInterpretation>>({});
  const [loading, setLoading] = useState(true);
  const [interpretingAll, setInterpretingAll] = useState(false);

  // Calculer l'âge du patient
  const age = patient.dateNaissance
    ? Math.floor((new Date().getTime() - new Date(patient.dateNaissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : undefined;

  // Charger l'interrogatoire et les interprétations au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger l'interrogatoire
        const interroRes = await fetch(`/api/interrogatoire/update?patientId=${patient.id}`);
        const interroData = await interroRes.json();
        if (interroData.interrogatoire) {
          setInterrogatoire(interroData.interrogatoire);
        }

        // Charger toutes les interprétations existantes
        const interpRes = await fetch(`/api/interrogatoire/interpret?patientId=${patient.id}`);
        if (interpRes.ok) {
          const interpData = await interpRes.json();
          const interpMap: Record<string, AxeInterpretation> = {};
          interpData.interpretations?.forEach((interp: AxeInterpretation) => {
            interpMap[interp.axe] = interp;
          });
          setInterpretations(interpMap);
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patient.id]);

  // Gérer l'interprétation de tous les axes
  const handleInterpretAll = async () => {
    console.log("🔵 [DEBUG] handleInterpretAll appelé");
    console.log("🔵 [DEBUG] interrogatoire:", interrogatoire);
    console.log("🔵 [DEBUG] interrogatoire stringifié:", JSON.stringify(interrogatoire, null, 2));

    if (!interrogatoire || !interrogatoire.v2) {
      console.error("❌ [DEBUG] Aucun interrogatoire v2 disponible");
      alert("Erreur : Aucun interrogatoire au format v2 trouvé. Veuillez remplir l'interrogatoire.");
      return;
    }

    setInterpretingAll(true);
    console.log("🔵 [DEBUG] setInterpretingAll(true)");

    // Utiliser uniquement le format v2
    const answersByAxis = interrogatoire.v2?.answersByAxis || {};
    console.log("🔵 [DEBUG] answersByAxis:", answersByAxis);
    console.log("🔵 [DEBUG] answersByAxis stringifié:", JSON.stringify(answersByAxis, null, 2));

    const axes: { axe: AxeType; data: Record<string, any> }[] = [
      { axe: "neurovegetatif", data: answersByAxis.neuro || {} },
      { axe: "adaptatif", data: answersByAxis.adaptatif || {} },
      { axe: "thyroidien", data: answersByAxis.thyro || {} },
      { axe: "gonadique", data: answersByAxis.gonado || {} },
      { axe: "somatotrope", data: answersByAxis.somato || {} },
      { axe: "digestif", data: answersByAxis.digestif || {} },
      { axe: "cardiometabolique", data: answersByAxis.cardioMetabo || {} },
      { axe: "dermato", data: answersByAxis.dermato || {} },
      { axe: "immuno", data: answersByAxis.immuno || {} },
    ];

    // Filtrer seulement les axes qui ont des données
    const axesWithData = axes.filter(a => Object.keys(a.data).length > 0);

    console.log(`🤖 Interprétation de ${axesWithData.length} axes avec données...`);
    console.log("🔵 [DEBUG] axes avec données:", axesWithData.map(a => a.axe));

    if (axesWithData.length === 0) {
      alert("Aucun axe rempli à interpréter. Veuillez d'abord remplir l'interrogatoire.");
      setInterpretingAll(false);
      return;
    }

    try {
      // Interpréter tous les axes en parallèle
      const promises = axesWithData.map(({ axe, data }) => {
        console.log(`🔵 [DEBUG] Envoi requête pour axe: ${axe}`);
        return fetch("/api/interrogatoire/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: patient.id,
            axe,
            reponsesAxe: data,
            sexe: interrogatoire.v2?.sexe,
            age,
            antecedents: patient.atcdMedicaux || undefined,
            traitements: patient.traitements || undefined,
            contreindicationsMajeures: patient.contreindicationsMajeures
              ? (typeof patient.contreindicationsMajeures === 'string'
                  ? JSON.parse(patient.contreindicationsMajeures)
                  : patient.contreindicationsMajeures)
              : undefined,
          }),
        }).then(res => {
          console.log(`🔵 [DEBUG] Réponse reçue pour ${axe}:`, res.status);
          return res.json();
        });
      });

      const results = await Promise.all(promises);
      console.log("🔵 [DEBUG] Tous les résultats:", results);

      // Mettre à jour les interprétations
      const newInterpretations: Record<string, AxeInterpretation> = { ...interpretations };
      results.forEach((result) => {
        if (result.interpretation) {
          newInterpretations[result.interpretation.axe] = result.interpretation;
        } else if (result.error) {
          console.error(`❌ Erreur pour un axe:`, result.error);
        }
      });
      setInterpretations(newInterpretations);

      console.log(`✅ ${results.length} axes interprétés avec succès`);
      alert(`✅ ${results.length} axes interprétés avec succès !`);

    } catch (error) {
      console.error("❌ Erreur lors de l'interprétation de tous les axes:", error);
      alert(`Erreur lors de l'interprétation : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setInterpretingAll(false);
      console.log("🔵 [DEBUG] setInterpretingAll(false)");
    }
  };

  // Callback quand une interprétation est terminée
  const handleInterpretationComplete = (interpretation: AxeInterpretation) => {
    setInterpretations(prev => ({
      ...prev,
      [interpretation.axe]: interpretation,
    }));
  };

  // Fonction helper pour formater les valeurs
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return String(value);
  };

  // Mapping axe → clé tooltip
  const axeToTooltipKey: Record<AxeType, string> = {
    neurovegetatif: "neuro",
    adaptatif: "adaptatif",
    thyroidien: "thyro",
    gonadique: "gonado",
    somatotrope: "somato",
    digestif: "digestif",
    cardiometabolique: "digestif",
    dermato: "immuno",
    immuno: "immuno",
  };

  // Couleurs par axe pour l'effet visuel
  const axeColors: Record<string, { gradient: string; border: string; glow: string }> = {
    neurovegetatif: { gradient: "linear-gradient(135deg, #a855f7, #7c3aed)", border: "#a855f7", glow: "rgba(168, 85, 247, 0.3)" },
    adaptatif: { gradient: "linear-gradient(135deg, #f59e0b, #d97706)", border: "#f59e0b", glow: "rgba(245, 158, 11, 0.3)" },
    thyroidien: { gradient: "linear-gradient(135deg, #3b82f6, #2563eb)", border: "#3b82f6", glow: "rgba(59, 130, 246, 0.3)" },
    gonadique: { gradient: "linear-gradient(135deg, #ec4899, #db2777)", border: "#ec4899", glow: "rgba(236, 72, 153, 0.3)" },
    somatotrope: { gradient: "linear-gradient(135deg, #10b981, #059669)", border: "#10b981", glow: "rgba(16, 185, 129, 0.3)" },
    digestif: { gradient: "linear-gradient(135deg, #84cc16, #65a30d)", border: "#84cc16", glow: "rgba(132, 204, 22, 0.3)" },
    cardiometabolique: { gradient: "linear-gradient(135deg, #ef4444, #dc2626)", border: "#ef4444", glow: "rgba(239, 68, 68, 0.3)" },
    dermato: { gradient: "linear-gradient(135deg, #f97316, #ea580c)", border: "#f97316", glow: "rgba(249, 115, 22, 0.3)" },
    immuno: { gradient: "linear-gradient(135deg, #06b6d4, #0891b2)", border: "#06b6d4", glow: "rgba(6, 182, 212, 0.3)" },
  };

  // État pour le tooltip actif
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Fonction pour afficher un axe avec bouton d'interprétation
  const renderAxe = (titre: string, axe: AxeType, data: Record<string, any> | undefined, icon?: string) => {
    if (!data || Object.keys(data).length === 0) return null;

    const tooltipKey = axeToTooltipKey[axe];
    const tooltipInfo = AXES_TOOLTIPS[tooltipKey];
    const colors = axeColors[axe] || { gradient: "linear-gradient(135deg, #6b7280, #4b5563)", border: "#6b7280", glow: "rgba(107, 114, 128, 0.3)" };
    const isTooltipActive = activeTooltip === axe;

    return (
      <div style={{
        background: "white",
        border: `2px solid ${isTooltipActive ? colors.border : "#e5e7eb"}`,
        borderRadius: "12px",
        padding: "0",
        marginBottom: "16px",
        overflow: "hidden",
        boxShadow: isTooltipActive ? `0 4px 20px ${colors.glow}` : "0 1px 3px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease"
      }}>
        {/* Header avec gradient */}
        <div
          style={{
            background: colors.gradient,
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: tooltipInfo ? "pointer" : "default"
          }}
          onClick={() => tooltipInfo && setActiveTooltip(isTooltipActive ? null : axe)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {icon && (
              <span style={{
                fontSize: "1.8rem",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
              }}>
                {icon}
              </span>
            )}
            <div>
              <h3 style={{
                fontSize: "1.15rem",
                fontWeight: "700",
                margin: 0,
                color: "white",
                textShadow: "0 1px 2px rgba(0,0,0,0.2)"
              }}>
                {titre}
              </h3>
              {tooltipInfo && (
                <div style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.8)",
                  marginTop: "2px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  <span>💡</span> Cliquez pour l'expertise endobiogénique
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Badge nombre de réponses */}
            <span style={{
              background: "rgba(255,255,255,0.25)",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.8rem",
              color: "white",
              fontWeight: "600"
            }}>
              {Object.keys(data).length} réponses
            </span>

            {/* Bouton d'interprétation pour cet axe */}
            {interrogatoire && (
              <BoutonInterpretrerAxe
                patientId={patient.id}
                axe={axe}
                reponsesAxe={data}
                sexe={interrogatoire.sexe as "H" | "F"}
                age={age}
                antecedents={patient.atcdMedicaux || undefined}
                traitements={patient.traitements || undefined}
                contreindicationsMajeures={
                  patient.contreindicationsMajeures
                    ? (typeof patient.contreindicationsMajeures === 'string'
                        ? JSON.parse(patient.contreindicationsMajeures)
                        : patient.contreindicationsMajeures)
                    : undefined
                }
                existingInterpretation={interpretations[axe]}
                onInterpretationComplete={handleInterpretationComplete}
              />
            )}
          </div>
        </div>

        {/* Tooltip Expert Endobiogénique */}
        {tooltipInfo && isTooltipActive && (
          <div style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{
                background: "rgba(251, 191, 36, 0.2)",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <span style={{ fontSize: "1.2rem" }}>📖</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: "#fbbf24",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  marginBottom: "6px"
                }}>
                  {tooltipInfo.titre}
                </div>
                <div style={{
                  color: "#e2e8f0",
                  fontSize: "0.85rem",
                  lineHeight: "1.5",
                  marginBottom: "12px"
                }}>
                  {tooltipInfo.description}
                </div>
                <div style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "8px",
                  padding: "10px 12px"
                }}>
                  <div style={{ color: "#10b981", fontWeight: "600", fontSize: "0.75rem", marginBottom: "6px" }}>
                    🔍 Signes clés à rechercher
                  </div>
                  <ul style={{ margin: 0, paddingLeft: "16px", color: "#6ee7b7", fontSize: "0.8rem", lineHeight: "1.6" }}>
                    {tooltipInfo.signesCles.map((signe, idx) => (
                      <li key={idx}>{signe}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Données de l'axe */}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
            {Object.entries(data).map(([key, value]) => {
              const formattedValue = formatValue(value);
              const isPositive = value === "oui" || value === true || value === "souvent" || value === "toujours";
              const isNegative = value === "non" || value === false || value === "jamais";

              return (
                <div key={key} style={{
                  padding: "10px 14px",
                  background: isPositive ? "rgba(16, 185, 129, 0.08)" : isNegative ? "#f9fafb" : "#f9fafb",
                  border: isPositive ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ color: "#4b5563", fontWeight: "500" }}>
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span style={{
                    color: isPositive ? "#059669" : isNegative ? "#9ca3af" : "#1f2937",
                    fontWeight: isPositive ? "600" : "400",
                    padding: isPositive ? "2px 8px" : "0",
                    background: isPositive ? "rgba(16, 185, 129, 0.15)" : "transparent",
                    borderRadius: "4px"
                  }}>
                    {formattedValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
        Chargement de l'interrogatoire...
      </div>
    );
  }

  if (!interrogatoire) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Introduction */}
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", marginBottom: "12px", color: "#1e40af" }}>
            🩺 Interrogatoire Endobiogénique
          </h2>
          <p style={{ color: "#1e40af", lineHeight: "1.6", marginBottom: "12px" }}>
            L'interrogatoire endobiogénique permet de collecter les données cliniques sur 8 axes
            fonctionnels du patient. Ces informations seront fusionnées avec les données BdF et le RAG
            pour générer des ordonnances plus précises et personnalisées.
          </p>
          <p style={{ color: "#1e40af", lineHeight: "1.6", fontSize: "0.95rem" }}>
            <strong>8 axes évalués :</strong> Neurovégétatif, Adaptatif, Thyroïdien, Gonadique,
            Digestif & Métabolique, Immuno-inflammatoire, Rythmes biologiques, Axes de vie
          </p>
        </div>

        {/* Carte d'accès */}
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📋</div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#1f2937" }}>
            Remplir l'interrogatoire complet
          </h3>
          <p style={{ color: "#6b7280", marginBottom: "24px", lineHeight: "1.6" }}>
            Accédez au formulaire complet pour documenter l'interrogatoire clinique de{" "}
            <strong>
              {patient.nom} {patient.prenom}
            </strong>
            . Le formulaire comporte 8 sections thématiques avec sauvegarde automatique.
          </p>

          <button
            onClick={() => router.push(`/patients/${patient.id}/interrogatoire`)}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "14px 32px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1d4ed8";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2563eb";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
          >
            Ouvrir le formulaire d'interrogatoire
          </button>
        </div>

        {/* Informations supplémentaires */}
        <div
          style={{
            marginTop: "24px",
            padding: "20px",
            background: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h4 style={{ fontSize: "1rem", marginBottom: "12px", color: "#374151" }}>
            💡 À savoir
          </h4>
          <ul style={{ color: "#6b7280", lineHeight: "1.8", paddingLeft: "20px" }}>
            <li>Le formulaire comprend environ 150 questions cliniques</li>
            <li>
              La saisie est organisée en 8 onglets thématiques pour faciliter la navigation
            </li>
            <li>Les données sont sauvegardées automatiquement à chaque modification</li>
            <li>
              L'interrogatoire peut être rempli progressivement sur plusieurs sessions
            </li>
            <li>
              Ces données seront utilisées lors de la génération d'ordonnances intelligentes
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Affichage détaillé de l'interrogatoire
  // Récupérer les données depuis le format v2
  const answersByAxis = interrogatoire.v2?.answersByAxis || {};

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* En-tête avec effet WAOOUH */}
      <div style={{
        background: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
        color: "white",
        borderRadius: "16px",
        padding: "28px 32px",
        marginBottom: "24px",
        boxShadow: "0 10px 40px rgba(5, 150, 105, 0.3)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Effet décoratif */}
        <div style={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-30%",
          left: "10%",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
          borderRadius: "50%"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{
                fontSize: "1.75rem",
                fontWeight: "800",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}>
                <span style={{ fontSize: "2rem" }}>🩺</span>
                Interrogatoire Endobiogénique
              </h2>
              <p style={{ fontSize: "1rem", opacity: 0.9, marginBottom: "4px" }}>
                <strong>{patient.nom} {patient.prenom}</strong> •
                {interrogatoire.v2?.sexe === 'H' ? ' Homme' : ' Femme'}
                {age && ` • ${age} ans`}
              </p>
              <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                Complété le {interrogatoire.date_creation
                  ? new Date(interrogatoire.date_creation).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Date inconnue'}
              </p>
            </div>

            {/* Badge de statut */}
            <div style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              borderRadius: "12px",
              padding: "16px 20px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.3)"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "4px" }}>✅</div>
              <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>Complété</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                {Object.values(answersByAxis).reduce((acc, axis) => acc + Object.keys(axis || {}).length, 0)} réponses
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          🎯 CARTE SYNTHÈSE TERRAIN ENDOBIOGÉNIQUE
          ======================================== */}
      <TerrainSynthesisCard
        answersByAxis={answersByAxis}
        sexe={interrogatoire.v2?.sexe as "H" | "F"}
        age={age}
      />

      {/* Boutons d'action */}
      <div style={{ marginBottom: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <button
          onClick={handleInterpretAll}
          disabled={interpretingAll}
          style={{
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "10px 20px",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: interpretingAll ? "wait" : "pointer",
            transition: "all 0.2s",
            opacity: interpretingAll ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!interpretingAll) e.currentTarget.style.background = "#059669";
          }}
          onMouseLeave={(e) => {
            if (!interpretingAll) e.currentTarget.style.background = "#10b981";
          }}
        >
          {interpretingAll ? "⏳ Interprétation en cours..." : "🤖 Interpréter tous les axes"}
        </button>

        <button
          onClick={() => router.push(`/patients/${patient.id}/interrogatoire`)}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "10px 20px",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1d4ed8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#2563eb";
          }}
        >
          Modifier l'interrogatoire
        </button>
      </div>

      {/* ========================================
          📊 BARRE DE NAVIGATION VISUELLE DES AXES
          ======================================== */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "24px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}>
        <h3 style={{
          fontSize: "1rem",
          fontWeight: "600",
          color: "#374151",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>📊</span> Vue d'ensemble des axes documentés
        </h3>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px"
        }}>
          {([
            { key: "neuro" as const, label: "Neurovégétatif", icon: "🧠", color: "#a855f7" },
            { key: "adaptatif" as const, label: "Adaptatif", icon: "😰", color: "#f59e0b" },
            { key: "thyro" as const, label: "Thyroïdien", icon: "🦋", color: "#3b82f6" },
            { key: "gonado" as const, label: "Gonadique", icon: "🌸", color: "#ec4899" },
            { key: "somato" as const, label: "Somatotrope", icon: "💪", color: "#10b981" },
            { key: "digestif" as const, label: "Digestif", icon: "🍽️", color: "#84cc16" },
            { key: "cardioMetabo" as const, label: "Cardiométabolique", icon: "❤️", color: "#ef4444" },
            { key: "dermato" as const, label: "Dermato", icon: "🧴", color: "#f97316" },
            { key: "immuno" as const, label: "Immuno", icon: "🛡️", color: "#06b6d4" },
          ] as const).map(axe => {
            const data = answersByAxis[axe.key];
            const count = data ? Object.keys(data).length : 0;
            const hasData = count > 0;
            const hasInterpretation = interpretations[axe.key as AxeType];

            return (
              <div
                key={axe.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  borderRadius: "20px",
                  background: hasData ? `${axe.color}15` : "#f3f4f6",
                  border: `2px solid ${hasData ? axe.color : "#e5e7eb"}`,
                  opacity: hasData ? 1 : 0.5,
                  transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{axe.icon}</span>
                <span style={{
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: hasData ? axe.color : "#9ca3af"
                }}>
                  {axe.label}
                </span>
                {hasData && (
                  <span style={{
                    background: axe.color,
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    padding: "2px 6px",
                    borderRadius: "8px"
                  }}>
                    {count}
                  </span>
                )}
                {hasInterpretation && (
                  <span style={{ fontSize: "0.8rem" }} title="Interprété par IA">✨</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Axes détaillés - FORMAT V2 */}
      <div>
        {renderAxe("Axe Neurovégétatif", "neurovegetatif", answersByAxis.neuro, "🧠")}
        {renderAxe("Axe Adaptatif (Stress)", "adaptatif", answersByAxis.adaptatif, "😰")}
        {renderAxe("Axe Thyroïdien", "thyroidien", answersByAxis.thyro, "🦋")}
        {renderAxe("Axe Gonadique", "gonadique", answersByAxis.gonado, "🌸")}
        {renderAxe("Axe Somatotrope", "somatotrope", answersByAxis.somato, "💪")}
        {renderAxe("Axe Digestif", "digestif", answersByAxis.digestif, "🍽️")}
        {renderAxe("Axe Cardiométabolique", "cardiometabolique", answersByAxis.cardioMetabo, "❤️")}
        {renderAxe("Axe Dermato", "dermato", answersByAxis.dermato, "🧴")}
        {renderAxe("Axe Immuno-inflammatoire", "immuno", answersByAxis.immuno, "🛡️")}
      </div>

      {/* Footer avec source */}
      <div style={{
        marginTop: "32px",
        padding: "16px 20px",
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        textAlign: "center"
      }}>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
          📖 <strong>Approche:</strong> Médecine Endobiogénique — Analyse fonctionnelle intégrative
        </p>
        <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "4px" }}>
          "Rien n'est rien" — Chaque symptôme peut être la clé du terrain endobiogénique
        </p>
      </div>
    </div>
  );
}
