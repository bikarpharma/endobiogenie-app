"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";
import type { AxeType, AxeInterpretation } from "@/lib/interrogatoire/axeInterpretation";
import { BoutonInterpretrerAxe } from "@/components/interrogatoire/BoutonInterpretrerAxe";

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
            sexe: interrogatoire.v2.sexe,
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

  // Fonction pour afficher un axe avec bouton d'interprétation
  const renderAxe = (titre: string, axe: AxeType, data: Record<string, any> | undefined, icon?: string) => {
    if (!data || Object.keys(data).length === 0) return null;

    return (
      <div style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", margin: 0, color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
            {icon && <span style={{ fontSize: "1.3rem" }}>{icon}</span>} {titre}
          </h3>

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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "12px" }}>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} style={{
              padding: "8px 12px",
              background: "#f9fafb",
              borderRadius: "6px",
              fontSize: "0.9rem"
            }}>
              <span style={{ color: "#6b7280", fontWeight: "500" }}>
                {key.replace(/_/g, ' ')}:
              </span>{' '}
              <span style={{ color: "#1f2937" }}>{formatValue(value)}</span>
            </div>
          ))}
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
            onClick={() => router.push(`/${patient.id}/interrogatoire`)}
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
            Ouvrir le formulaire d'interrogatoire →
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
      {/* En-tête */}
      <div style={{
        background: "#059669",
        color: "white",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "24px"
      }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
          ✅ Interrogatoire Endobiogénique
        </h2>
        <p style={{ fontSize: "0.95rem", opacity: 0.9 }}>
          Patient: {patient.nom} {patient.prenom} •
          Sexe: {interrogatoire.v2?.sexe === 'H' ? 'Homme' : 'Femme'} •
          Rempli le {interrogatoire.date_creation
            ? new Date(interrogatoire.date_creation).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })
            : 'Date inconnue'}
        </p>
      </div>

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
          onClick={() => router.push(`/${patient.id}/interrogatoire`)}
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
          ✏️ Modifier l'interrogatoire
        </button>
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
    </div>
  );
}
