"use client";

import { useState } from "react";

export function OngletIdentite({ patient }: { patient: any }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      {/* Bouton éditer */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
        <button
          onClick={() => alert("Fonctionnalité d'édition à venir dans la prochaine version")}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ✏️ Modifier
        </button>
      </div>

      {/* Section Informations personnelles */}
      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "16px",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "8px",
          }}
        >
          👤 Informations personnelles
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
              Numéro patient
            </div>
            <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.numeroPatient}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>Nom</div>
            <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.nom}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
              Prénom
            </div>
            <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.prenom}</div>
          </div>
          {patient.dateNaissance && (
            <div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
                Date de naissance
              </div>
              <div style={{ fontWeight: "600", color: "#1f2937" }}>
                {new Date(patient.dateNaissance).toLocaleDateString("fr-FR")}
              </div>
            </div>
          )}
          {patient.sexe && (
            <div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>Sexe</div>
              <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.sexe}</div>
            </div>
          )}
          {patient.telephone && (
            <div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
                Téléphone
              </div>
              <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.telephone}</div>
            </div>
          )}
          {patient.email && (
            <div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>Email</div>
              <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.email}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
              Consentement RGPD
            </div>
            <div
              style={{
                fontWeight: "600",
                color: patient.consentementRGPD ? "#059669" : "#dc2626",
              }}
            >
              {patient.consentementRGPD ? "✓ Donné" : "✗ Non donné"}
            </div>
          </div>
        </div>
      </div>

      {/* Section ATCD & Allergies */}
      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "16px",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "8px",
          }}
        >
          🏥 ATCD & Allergies
        </h3>

        {/* Allergies */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            🔴 Allergies
          </div>
          {patient.allergies ? (
            <div
              style={{
                background: "#fee2e2",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #dc2626",
                color: "#7f1d1d",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            >
              {patient.allergies}
            </div>
          ) : (
            <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Aucune allergie renseignée</div>
          )}
        </div>

        {/* ATCD médicaux */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            🏥 Antécédents médicaux
          </div>
          {patient.atcdMedicaux ? (
            <div
              style={{
                background: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                color: "#4b5563",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            >
              {patient.atcdMedicaux}
            </div>
          ) : (
            <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Aucun ATCD médical renseigné</div>
          )}
        </div>

        {/* ATCD chirurgicaux */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            🔪 Antécédents chirurgicaux
          </div>
          {patient.atcdChirurgicaux ? (
            <div
              style={{
                background: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                color: "#4b5563",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            >
              {patient.atcdChirurgicaux}
            </div>
          ) : (
            <div style={{ color: "#9ca3af", fontStyle: "italic" }}>
              Aucun ATCD chirurgical renseigné
            </div>
          )}
        </div>

        {/* Traitements en cours */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            💊 Traitements en cours
          </div>
          {patient.traitements ? (
            <div
              style={{
                background: "#dbeafe",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #2563eb",
                color: "#1e40af",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            >
              {patient.traitements}
            </div>
          ) : (
            <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Aucun traitement renseigné</div>
          )}
        </div>
      </div>

      {/* Section Anthropométrie */}
      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "16px",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "8px",
          }}
        >
          📏 Anthropométrie
        </h3>

        {patient.anthropometries && patient.anthropometries.length > 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            {/* En-tête tableau */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "120px 80px 80px 80px 100px 80px",
                padding: "12px 16px",
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
              }}
            >
              <div>Date</div>
              <div>Poids</div>
              <div>Taille</div>
              <div>IMC</div>
              <div>PA</div>
              <div>Pouls</div>
            </div>

            {/* Lignes */}
            {patient.anthropometries.map((anthro: any) => (
              <div
                key={anthro.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 80px 80px 80px 100px 80px",
                  padding: "12px 16px",
                  borderBottom: "1px solid #e5e7eb",
                  fontSize: "0.85rem",
                  color: "#4b5563",
                }}
              >
                <div>{new Date(anthro.date).toLocaleDateString("fr-FR")}</div>
                <div>{anthro.poids ? `${anthro.poids} kg` : "-"}</div>
                <div>{anthro.taille ? `${anthro.taille} cm` : "-"}</div>
                <div style={{ fontWeight: "600" }}>
                  {anthro.imc ? anthro.imc.toFixed(1) : "-"}
                </div>
                <div>
                  {anthro.paSys && anthro.paDia ? `${anthro.paSys}/${anthro.paDia}` : "-"}
                </div>
                <div>{anthro.pouls ? `${anthro.pouls} bpm` : "-"}</div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: "#f9fafb",
              padding: "32px",
              borderRadius: "8px",
              textAlign: "center",
              color: "#6b7280",
              fontStyle: "italic",
            }}
          >
            Aucune mesure anthropométrique enregistrée
          </div>
        )}
      </div>

      {/* Section Notes */}
      {patient.notes && (
        <div style={{ marginBottom: "32px" }}>
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "16px",
              borderBottom: "2px solid #e5e7eb",
              paddingBottom: "8px",
            }}
          >
            📝 Notes
          </h3>
          <div
            style={{
              background: "#fef3c7",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #fbbf24",
              color: "#78350f",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}
          >
            {patient.notes}
          </div>
        </div>
      )}
    </div>
  );
}