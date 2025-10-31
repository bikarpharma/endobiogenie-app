"use client";

import { useState } from "react";
import { OngletApercu } from "./OngletApercu";
import { OngletIdentite } from "./OngletIdentite";
import { OngletAnalyses } from "./OngletAnalyses";
import { OngletConsultations } from "./OngletConsultations";

type Tab = "apercu" | "identite" | "analyses" | "consultations";

interface PatientData {
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
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  bdfAnalyses: any[];
  consultations: any[];
  anthropometries: any[];
}

export function PatientDetailClient({ patient }: { patient: PatientData }) {
  const [activeTab, setActiveTab] = useState<Tab>("apercu");

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* En-tête avec nom du patient et numéro */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: "8px",
            }}
          >
            {patient.prenom} {patient.nom}
          </h1>
          <div style={{ fontSize: "16px", color: "#6b7280" }}>
            N° {patient.numeroPatient}
          </div>
        </div>
        <button
          onClick={() => alert("Fonction d'édition à implémenter")}
          style={{
            padding: "12px 24px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ✏️ Modifier
        </button>
      </div>

      {/* Barre de navigation des onglets */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "32px",
        }}
      >
        <button
          onClick={() => setActiveTab("apercu")}
          style={{
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            borderBottom:
              activeTab === "apercu"
                ? "3px solid #2563eb"
                : "3px solid transparent",
            color: activeTab === "apercu" ? "#2563eb" : "#6b7280",
            transition: "all 0.2s",
          }}
        >
          📊 Aperçu
        </button>
        <button
          onClick={() => setActiveTab("identite")}
          style={{
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            borderBottom:
              activeTab === "identite"
                ? "3px solid #2563eb"
                : "3px solid transparent",
            color: activeTab === "identite" ? "#2563eb" : "#6b7280",
            transition: "all 0.2s",
          }}
        >
          👤 Identité & ATCD
        </button>
        <button
          onClick={() => setActiveTab("analyses")}
          style={{
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            borderBottom:
              activeTab === "analyses"
                ? "3px solid #2563eb"
                : "3px solid transparent",
            color: activeTab === "analyses" ? "#2563eb" : "#6b7280",
            transition: "all 0.2s",
          }}
        >
          🧬 Analyses BdF
        </button>
        <button
          onClick={() => setActiveTab("consultations")}
          style={{
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            borderBottom:
              activeTab === "consultations"
                ? "3px solid #2563eb"
                : "3px solid transparent",
            color: activeTab === "consultations" ? "#2563eb" : "#6b7280",
            transition: "all 0.2s",
          }}
        >
          📋 Consultations
        </button>
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeTab === "apercu" && <OngletApercu patient={patient} />}
        {activeTab === "identite" && <OngletIdentite patient={patient} />}
        {activeTab === "analyses" && <OngletAnalyses patient={patient} />}
        {activeTab === "consultations" && (
          <OngletConsultations patient={patient} />
        )}
      </div>
    </div>
  );
}
