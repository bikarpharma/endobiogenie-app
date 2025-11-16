"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InterrogatoireEndobiogenique } from "@/lib/interrogatoire/types";

type PatientData = {
  id: string;
  numeroPatient: string;
  nom: string;
  prenom: string;
};

export function OngletInterrogatoire({ patient }: { patient: PatientData }) {
  const router = useRouter();
  const [interrogatoire, setInterrogatoire] = useState<InterrogatoireEndobiogenique | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger l'interrogatoire au montage du composant
  useEffect(() => {
    const loadInterrogatoire = async () => {
      try {
        const res = await fetch(`/api/interrogatoire/update?patientId=${patient.id}`);
        const data = await res.json();
        if (data.interrogatoire) {
          setInterrogatoire(data.interrogatoire);
        }
      } catch (error) {
        console.error('Erreur chargement interrogatoire:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInterrogatoire();
  }, [patient.id]);

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
        {loading ? (
          <div>Chargement...</div>
        ) : interrogatoire ? (
          // Interrogatoire existe - Afficher résumé
          <>
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>✅</div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#059669" }}>
              Interrogatoire complété
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "24px", lineHeight: "1.6" }}>
              L'interrogatoire de{" "}
              <strong>
                {patient.nom} {patient.prenom}
              </strong>{" "}
              a été rempli le{" "}
              <strong>
                {interrogatoire.date_creation
                  ? new Date(interrogatoire.date_creation).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Date inconnue'}
              </strong>
            </p>

            {/* Résumé rapide */}
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "24px",
              textAlign: "left"
            }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "12px", color: "#059669" }}>
                📊 Données enregistrées
              </h4>
              <ul style={{ color: "#047857", fontSize: "0.9rem", lineHeight: "1.8", paddingLeft: "20px" }}>
                <li>Sexe : {interrogatoire.sexe === 'H' ? 'Homme' : 'Femme'}</li>
                <li>Axe Neurovégétatif : {Object.keys(interrogatoire.axeNeuroVegetatif || {}).length} réponses</li>
                <li>Axe Adaptatif : {Object.keys(interrogatoire.axeAdaptatif || {}).length} réponses</li>
                <li>Axe Thyroïdien : {Object.keys(interrogatoire.axeThyroidien || {}).length} réponses</li>
                <li>Axe Gonadique : {Object.keys(interrogatoire.sexe === 'F' ? (interrogatoire.axeGonadiqueFemme || {}) : (interrogatoire.axeGonadiqueHomme || {})).length} réponses</li>
                <li>Axe Digestif & Métabolique : {Object.keys(interrogatoire.axeDigestifMetabolique || {}).length} réponses</li>
                <li>Axe Immuno-inflammatoire : {Object.keys(interrogatoire.axeImmunoInflammatoire || {}).length} réponses</li>
                <li>Rythmes biologiques : {Object.keys(interrogatoire.rythmes || {}).length} réponses</li>
                <li>Axes de vie : {Object.keys(interrogatoire.axesDeVie || {}).length} réponses</li>
              </ul>
            </div>

            <button
              onClick={() => router.push(`/patients/${patient.id}/interrogatoire`)}
              style={{
                background: "#059669",
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
                e.currentTarget.style.background = "#047857";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#059669";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              ✏️ Modifier l'interrogatoire
            </button>
          </>
        ) : (
          // Aucun interrogatoire - Afficher bouton remplir
          <>
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
              Ouvrir le formulaire d'interrogatoire →
            </button>

            <div style={{ marginTop: "20px" }}>
              <Link
                href={`/patients/${patient.id}/interrogatoire`}
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Accès direct au formulaire
              </Link>
            </div>
          </>
        )}
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
