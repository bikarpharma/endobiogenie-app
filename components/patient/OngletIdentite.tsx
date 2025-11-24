"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OngletIdentite({ patient }: { patient: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nom: patient.nom || "",
    prenom: patient.prenom || "",
    dateNaissance: patient.dateNaissance ? new Date(patient.dateNaissance).toISOString().split("T")[0] : "",
    sexe: patient.sexe || "",
    telephone: patient.telephone || "",
    email: patient.email || "",
    allergies: patient.allergies || "",
    atcdMedicaux: patient.atcdMedicaux || "",
    atcdChirurgicaux: patient.atcdChirurgicaux || "",
    traitements: patient.traitements || "",
    notes: patient.notes || "",
  });

  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la sauvegarde");
      }

      alert("✅ Informations mises à jour avec succès");
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      alert(`❌ Erreur : ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      nom: patient.nom || "",
      prenom: patient.prenom || "",
      dateNaissance: patient.dateNaissance ? new Date(patient.dateNaissance).toISOString().split("T")[0] : "",
      sexe: patient.sexe || "",
      telephone: patient.telephone || "",
      email: patient.email || "",
      allergies: patient.allergies || "",
      atcdMedicaux: patient.atcdMedicaux || "",
      atcdChirurgicaux: patient.atcdChirurgicaux || "",
      traitements: patient.traitements || "",
      notes: patient.notes || "",
    });
    setIsEditing(false);
  };

  return (
    <div>
      {/* Boutons éditer / sauvegarder / annuler */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginBottom: "24px" }}>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
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
        ) : (
          <>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              style={{
                padding: "10px 20px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              ✖️ Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: "10px 20px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
            </button>
          </>
        )}
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

          {/* Nom */}
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>Nom</div>
            {isEditing ? (
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "2px solid #2563eb",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              />
            ) : (
              <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.nom}</div>
            )}
          </div>

          {/* Prénom */}
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>Prénom</div>
            {isEditing ? (
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "2px solid #2563eb",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              />
            ) : (
              <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.prenom}</div>
            )}
          </div>

          {/* Date de naissance */}
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>
              Date de naissance
            </div>
            {isEditing ? (
              <input
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "2px solid #2563eb",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              />
            ) : (
              <div style={{ fontWeight: "600", color: "#1f2937" }}>
                {patient.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString("fr-FR") : "-"}
              </div>
            )}
          </div>

          {/* Sexe */}
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>Sexe</div>
            {isEditing ? (
              <select
                value={formData.sexe}
                onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "2px solid #2563eb",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              >
                <option value="">Non renseigné</option>
                <option value="H">Homme</option>
                <option value="F">Femme</option>
              </select>
            ) : (
              <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.sexe || "-"}</div>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>Téléphone</div>
            {isEditing ? (
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "2px solid #2563eb",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              />
            ) : (
              <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.telephone || "-"}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "4px" }}>Email</div>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "2px solid #2563eb",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              />
            ) : (
              <div style={{ fontWeight: "600", color: "#1f2937" }}>{patient.email || "-"}</div>
            )}
          </div>

          {/* Consentement RGPD (non éditable) */}
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
          {isEditing ? (
            <textarea
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #dc2626",
                borderRadius: "8px",
                fontSize: "0.9rem",
                lineHeight: "1.6",
                background: "#fee2e2",
                color: "#7f1d1d",
              }}
              placeholder="Listez les allergies du patient..."
            />
          ) : patient.allergies ? (
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
          {isEditing ? (
            <textarea
              value={formData.atcdMedicaux}
              onChange={(e) => setFormData({ ...formData, atcdMedicaux: e.target.value })}
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #2563eb",
                borderRadius: "8px",
                fontSize: "0.9rem",
                lineHeight: "1.6",
              }}
              placeholder="Antécédents médicaux..."
            />
          ) : patient.atcdMedicaux ? (
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
          {isEditing ? (
            <textarea
              value={formData.atcdChirurgicaux}
              onChange={(e) => setFormData({ ...formData, atcdChirurgicaux: e.target.value })}
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #2563eb",
                borderRadius: "8px",
                fontSize: "0.9rem",
                lineHeight: "1.6",
              }}
              placeholder="Antécédents chirurgicaux..."
            />
          ) : patient.atcdChirurgicaux ? (
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
          {isEditing ? (
            <textarea
              value={formData.traitements}
              onChange={(e) => setFormData({ ...formData, traitements: e.target.value })}
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #2563eb",
                borderRadius: "8px",
                fontSize: "0.9rem",
                lineHeight: "1.6",
              }}
              placeholder="Traitements en cours..."
            />
          ) : patient.traitements ? (
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

      {/* Section Contexte clinique enrichi (pour ordonnances IA) */}
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
          🧬 Contexte clinique enrichi (Ordonnances IA)
        </h3>

        {/* Pathologies associées */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            🏥 Pathologies associées
          </div>
          {patient.pathologiesAssociees && Array.isArray(patient.pathologiesAssociees) && patient.pathologiesAssociees.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {patient.pathologiesAssociees.map((pathologie: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    padding: "6px 12px",
                    background: "#fef3c7",
                    border: "1px solid #fbbf24",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    color: "#78350f",
                  }}
                >
                  {pathologie}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Aucune pathologie renseignée</div>
          )}
        </div>

        {/* Symptômes actuels */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            🔍 Symptômes actuels
          </div>
          {patient.symptomesActuels && Array.isArray(patient.symptomesActuels) && patient.symptomesActuels.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {patient.symptomesActuels.map((symptome: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    padding: "6px 12px",
                    background: "#dbeafe",
                    border: "1px solid #3b82f6",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    color: "#1e40af",
                  }}
                >
                  {symptome}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Aucun symptôme renseigné</div>
          )}
        </div>

        {/* Autres bilans biologiques */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            🔬 Autres bilans biologiques
          </div>
          {patient.autresBilans && typeof patient.autresBilans === "object" && Object.keys(patient.autresBilans).length > 0 ? (
            <div
              style={{
                background: "#f0fdf4",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #10b981",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                {Object.entries(patient.autresBilans).map(([key, value]: [string, any]) => (
                  <div key={key}>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "2px" }}>
                      {key}
                    </div>
                    <div style={{ fontWeight: "600", color: "#065f46" }}>
                      {value} {["alat", "asat"].includes(key.toLowerCase()) ? "UI/L" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color: "#9ca3af", fontStyle: "italic" }}>Aucun bilan complémentaire renseigné</div>
          )}
        </div>
      </div>

      {/* Section Notes */}
      {(isEditing || patient.notes) && (
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
          {isEditing ? (
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={6}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #fbbf24",
                borderRadius: "8px",
                fontSize: "0.9rem",
                lineHeight: "1.6",
                background: "#fef3c7",
                color: "#78350f",
              }}
              placeholder="Notes libres sur le patient..."
            />
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}