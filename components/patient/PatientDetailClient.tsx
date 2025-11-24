"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateAge } from "@/types/patient";
import { OngletApercu } from "./OngletApercu";
import { OngletIdentite } from "./OngletIdentite";
import { OngletInterrogatoire } from "./OngletInterrogatoire";
import { OngletAnalyses } from "./OngletAnalyses";
import { OngletConsultations } from "./OngletConsultations";
import { OngletOrdonnancesIntelligent } from "../ordonnance/OngletOrdonnancesIntelligent";
import { OngletSynthese } from "./OngletSynthese";

type PatientData = {
  id: string;
  numeroPatient: string;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  sexe: string | null;
  telephone: string | null;
  email: string | null;
  notes: string | null;
  allergies: string | null;
  atcdMedicaux: string | null;
  atcdChirurgicaux: string | null;
  traitements: string | null;
  tags: any;
  consentementRGPD: boolean;
  dateConsentement: string | null;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  bdfAnalyses: any[];
  consultations: any[];
  anthropometries: any[];
  ordonnances: any[];
  interrogatoire: any;
};

type Tab = "apercu" | "identite" | "interrogatoire" | "analyses" | "consultations" | "synthese" | "ordonnances";

export function PatientDetailClient({ patient }: { patient: PatientData }) {
  const [activeTab, setActiveTab] = useState<Tab>("apercu");

  const age = patient.dateNaissance ? calculateAge(new Date(patient.dateNaissance)) : null;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "24px" }}>
        <Link
          href="/patients"
          style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.9rem" }}
        >
          ← Retour à la liste des patients
        </Link>
      </div>

      {/* En-tête patient */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "4px" }}>
              {patient.numeroPatient}
            </div>
            <h1 style={{ fontSize: "2rem", marginBottom: "8px", color: "#1f2937", margin: 0 }}>
              {patient.nom} {patient.prenom}
            </h1>
            <div style={{ color: "#6b7280", fontSize: "0.95rem" }}>
              {age !== null && `${age} ans`}
              {patient.sexe && age !== null && " • "}
              {patient.sexe && patient.sexe}
            </div>
          </div>
          {patient.isArchived && (
            <div
              style={{
                padding: "8px 16px",
                background: "#fee2e2",
                color: "#dc2626",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              🗄️ Archivé
            </div>
          )}
        </div>
      </div>

      {/* Système d'onglets */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* Barre d'onglets */}
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          <button
            onClick={() => setActiveTab("apercu")}
            style={{
              flex: 1,
              padding: "16px 24px",
              background: activeTab === "apercu" ? "white" : "transparent",
              border: "none",
              borderBottom: activeTab === "apercu" ? "3px solid #2563eb" : "3px solid transparent",
              fontSize: "0.95rem",
              fontWeight: activeTab === "apercu" ? "600" : "500",
              color: activeTab === "apercu" ? "#2563eb" : "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            📊 Aperçu
          </button>
          <button
            onClick={() => setActiveTab("identite")}
            style={{
              flex: 1,
              padding: "16px 24px",
              background: activeTab === "identite" ? "white" : "transparent",
              border: "none",
              borderBottom: activeTab === "identite" ? "3px solid #2563eb" : "3px solid transparent",
              fontSize: "0.95rem",
              fontWeight: activeTab === "identite" ? "600" : "500",
              color: activeTab === "identite" ? "#2563eb" : "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            👤 Identité & ATCD
          </button>
          <button
            onClick={() => setActiveTab("interrogatoire")}
            style={{
              flex: 1,
              padding: "16px 24px",
              background: activeTab === "interrogatoire" ? "white" : "transparent",
              border: "none",
              borderBottom: activeTab === "interrogatoire" ? "3px solid #2563eb" : "3px solid transparent",
              fontSize: "0.95rem",
              fontWeight: activeTab === "interrogatoire" ? "600" : "500",
              color: activeTab === "interrogatoire" ? "#2563eb" : "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            🩺 Interrogatoire {patient.interrogatoire ? '(1)' : '(0)'}
          </button>
          <button
            onClick={() => setActiveTab("analyses")}
            style={{
              flex: 1,
              padding: "16px 24px",
              background: activeTab === "analyses" ? "white" : "transparent",
              border: "none",
              borderBottom: activeTab === "analyses" ? "3px solid #2563eb" : "3px solid transparent",
              fontSize: "0.95rem",
              fontWeight: activeTab === "analyses" ? "600" : "500",
              color: activeTab === "analyses" ? "#2563eb" : "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            🧬 Analyses BdF ({patient.bdfAnalyses.length})
          </button>
          <button
            onClick={() => setActiveTab("consultations")}
            style={{
              flex: 1,
              padding: "16px 24px",
              background: activeTab === "consultations" ? "white" : "transparent",
              border: "none",
              borderBottom:
                activeTab === "consultations" ? "3px solid #2563eb" : "3px solid transparent",
              fontSize: "0.95rem",
              fontWeight: activeTab === "consultations" ? "600" : "500",
              color: activeTab === "consultations" ? "#2563eb" : "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            📋 Consultations ({patient.consultations.length})
          </button>
          <button
            onClick={() => setActiveTab("synthese")}
            style={{
              flex: 1,
              padding: "16px 24px",
              background: activeTab === "synthese" ? "white" : "transparent",
              border: "none",
              borderBottom: activeTab === "synthese" ? "3px solid #2563eb" : "3px solid transparent",
              fontSize: "0.95rem",
              fontWeight: activeTab === "synthese" ? "600" : "500",
              color: activeTab === "synthese" ? "#2563eb" : "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ⚖️ Synthèse
          </button>
          <button
            onClick={() => setActiveTab("ordonnances")}
            style={{
              flex: 1,
              padding: "16px 24px",
              background: activeTab === "ordonnances" ? "white" : "transparent",
              border: "none",
              borderBottom:
                activeTab === "ordonnances" ? "3px solid #2563eb" : "3px solid transparent",
              fontSize: "0.95rem",
              fontWeight: activeTab === "ordonnances" ? "600" : "500",
              color: activeTab === "ordonnances" ? "#2563eb" : "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            💊 Ordonnances ({patient.ordonnances?.length || 0})
          </button>
        </div>

        {/* Contenu de l'onglet actif */}
        <div style={{ padding: "32px" }}>
          {activeTab === "apercu" && <OngletApercu patient={patient} />}
          {activeTab === "identite" && <OngletIdentite patient={patient} />}
          {activeTab === "interrogatoire" && <OngletInterrogatoire patient={patient} />}
          {activeTab === "analyses" && <OngletAnalyses patient={patient} />}
          {activeTab === "consultations" && <OngletConsultations patient={patient} />}
          {activeTab === "synthese" && <OngletSynthese patient={patient} />}
          {activeTab === "ordonnances" && <OngletOrdonnancesIntelligent patient={patient} />}
        </div>
      </div>
    </div>
  );
}