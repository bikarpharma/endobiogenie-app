"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    patient: PatientData | null;
  }>({ isOpen: false, patient: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (patient: PatientData) => {
    setDeleteModal({ isOpen: true, patient });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.patient) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/patients/${deleteModal.patient.id}?permanent=true`, {
        method: "DELETE",
        headers: {
          "x-user-id": document.cookie
            .split("; ")
            .find((row) => row.startsWith("userId="))
            ?.split("=")[1] || "",
        },
      });

      if (response.ok) {
        setDeleteModal({ isOpen: false, patient: null });
        router.refresh(); // Recharger la liste
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || "Impossible de supprimer le patient"}`);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression du patient");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, patient: null });
  };
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
          gridTemplateColumns: "120px 1fr 1fr 120px 150px 100px 100px",
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
              gridTemplateColumns: "120px 1fr 1fr 120px 150px 100px 100px",
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
            <div>
              <button
                onClick={() => handleDeleteClick(patient)}
                style={{
                  padding: "6px 12px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#dc2626";
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        );
      })}

      {/* Modale de confirmation de suppression */}
      {deleteModal.isOpen && deleteModal.patient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCancelDelete}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icône d'avertissement */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Titre */}
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#1f2937",
                textAlign: "center",
                marginBottom: "12px",
              }}
            >
              Supprimer définitivement ce patient ?
            </h3>

            {/* Message */}
            <p
              style={{
                fontSize: "0.95rem",
                color: "#6b7280",
                textAlign: "center",
                marginBottom: "8px",
              }}
            >
              <strong style={{ color: "#1f2937" }}>
                {deleteModal.patient.prenom} {deleteModal.patient.nom.toUpperCase()}
              </strong>
              <br />
              <span style={{ fontFamily: "monospace", color: "#2563eb", fontSize: "0.9rem" }}>
                {deleteModal.patient.numeroPatient}
              </span>
            </p>

            {/* Avertissement */}
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fbbf24",
                borderRadius: "8px",
                padding: "12px",
                marginTop: "16px",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#92400e",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                <strong>⚠️ Attention :</strong> Cette action est irréversible.
                <br />
                Toutes les données associées (consultations, analyses BdF, ordonnances)
                seront définitivement supprimées.
              </p>
            </div>

            {/* Boutons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) e.currentTarget.style.background = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  opacity: isDeleting ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) e.currentTarget.style.background = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#dc2626";
                }}
              >
                {isDeleting ? "Suppression..." : "Supprimer définitivement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
