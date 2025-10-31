"use client";

import Link from "next/link";
import { calculateAge } from "@/types/patient";

type PatientData = {
  id: string;
  numeroPatient: string;
  nom: string;
  prenom: string;
  dateNaissance: Date | null;
  _count: {
    consultations: number;
  };
};

export function PatientListClient({ patients }: { patients: PatientData[] }) {
  if (patients.length === 0) {
    return (
      <div
        style={{
          background: "#f9fafb",
          padding: "48px",
          borderRadius: "12px",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        <p style={{ fontSize: "1.1rem", marginBottom: "16px" }}>
          Aucun patient enregistré
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          Commencez par créer votre premier dossier patient
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      {/* En-tête du tableau */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 1fr 120px 150px 100px",
          padding: "16px 24px",
          background: "#f9fafb",
          borderBottom: "2px solid #e5e7eb",
          fontWeight: "600",
          fontSize: "0.85rem",
          color: "#374151",
          textTransform: "uppercase",
        }}
      >
        <div>N° Patient</div>
        <div>Nom</div>
        <div>Prénom</div>
        <div>Âge</div>
        <div>Consultations</div>
        <div></div>
      </div>

      {/* Lignes des patients */}
      {patients.map((patient) => {
        const age = patient.dateNaissance
          ? calculateAge(patient.dateNaissance)
          : null;

        return (
          <div
            key={patient.id}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 1fr 120px 150px 100px",
              padding: "16px 24px",
              borderBottom: "1px solid #e5e7eb",
              alignItems: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
            }}
          >
            <div style={{ fontFamily: "monospace", color: "#2563eb", fontWeight: "600" }}>
              {patient.numeroPatient}
            </div>
            <div style={{ fontWeight: "600", color: "#1f2937" }}>
              {patient.nom}
            </div>
            <div style={{ color: "#4b5563" }}>{patient.prenom}</div>
            <div style={{ color: "#6b7280" }}>
              {age !== null ? `${age} ans` : "-"}
            </div>
            <div style={{ color: "#6b7280" }}>
              {patient._count.consultations} consultation{patient._count.consultations > 1 ? "s" : ""}
            </div>
            <div>
              <Link
                href={`/patients/${patient.id}`}
                style={{
                  padding: "6px 12px",
                  background: "#2563eb",
                  color: "white",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                Voir
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
