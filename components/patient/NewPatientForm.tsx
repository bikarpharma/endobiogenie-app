"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type BdfAnalysisData = {
  inputs: Record<string, number>;
  indexes: Array<{ name: string; value: number; comment: string }>;
  summary: string;
  axes: string[];
  ragText?: string;
};

export function NewPatientForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingBdf, setPendingBdf] = useState<BdfAnalysisData | null>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    dateNaissance: "",
    sexe: "",
    telephone: "",
    email: "",
    allergies: "",
    atcdMedicaux: "",
    atcdChirurgicaux: "",
    traitements: "",
    notes: "",
    // Nouveaux champs pour contexte enrichi ordonnance
    pathologiesAssociees: [] as string[],
    symptomesActuels: [] as string[],
    autresBilans: {} as Record<string, number>,
  });

  // États locaux pour saisie pathologies/symptômes
  const [newPathologie, setNewPathologie] = useState("");
  const [newSymptome, setNewSymptome] = useState("");

  // États locaux pour autres bilans
  const [newBilanKey, setNewBilanKey] = useState("");
  const [newBilanValue, setNewBilanValue] = useState("");

  // Récupérer l'analyse BdF en attente au chargement
  useEffect(() => {
    const pendingAnalysis = sessionStorage.getItem("pendingBdfAnalysis");
    if (pendingAnalysis) {
      try {
        const analysis = JSON.parse(pendingAnalysis);
        setPendingBdf(analysis);
        console.log("✅ Analyse BdF en attente récupérée:", analysis);
      } catch (e) {
        console.error("❌ Erreur parsing BdF:", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation minimale : nom et prénom requis
      if (!formData.nom.trim() || !formData.prenom.trim()) {
        throw new Error("Le nom et le prénom sont obligatoires");
      }

      // Créer le patient avec l'analyse BdF si disponible
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Inclure les cookies d'authentification
        body: JSON.stringify({
          ...formData,
          dateNaissance: formData.dateNaissance || null,
          bdfAnalysis: pendingBdf, // Passer l'analyse BdF
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création");
      }

      const data = await response.json();
      console.log("✅ Patient créé:", data.patient);

      // Nettoyer le sessionStorage
      sessionStorage.removeItem("pendingBdfAnalysis");

      // Rediriger vers la fiche patient
      router.push(`/patients/${data.patient.id}`);
    } catch (err: any) {
      console.error("❌ Erreur:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Alerte si analyse BdF en attente */}
      {pendingBdf && (
        <div
          style={{
            background: "#dbeafe",
            border: "2px solid #3b82f6",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.5rem" }}>🧬</span>
            <div>
              <div style={{ fontWeight: "600", color: "#1e40af", marginBottom: "4px" }}>
                Analyse BdF en attente d'association
              </div>
              <div style={{ fontSize: "0.9rem", color: "#1e40af" }}>
                Cette analyse sera automatiquement associée au nouveau patient
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "2px solid #dc2626",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "24px",
            color: "#991b1b",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Carte du formulaire */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "32px",
        }}
      >
        {/* SECTION 1 : Identité */}
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "24px",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "12px",
          }}
        >
          👤 Identité
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
          {/* Nom */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              Nom <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
              placeholder="Dupont"
            />
          </div>

          {/* Prénom */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              Prénom <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
              placeholder="Marie"
            />
          </div>

          {/* Date de naissance */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              Date de naissance
            </label>
            <input
              type="date"
              name="dateNaissance"
              value={formData.dateNaissance}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Sexe */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              Sexe
            </label>
            <select
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            >
              <option value="">-- Sélectionner --</option>
              <option value="H">Homme</option>
              <option value="F">Femme</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Téléphone */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              Téléphone
            </label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
              placeholder="06 12 34 56 78"
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
              placeholder="marie.dupont@example.com"
            />
          </div>
        </div>

        {/* SECTION 2 : Antécédents */}
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "24px",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "12px",
          }}
        >
          📋 Antécédents & Allergies
        </h3>

        <div style={{ display: "grid", gap: "20px", marginBottom: "32px" }}>
          {/* Allergies */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              ⚠️ Allergies
            </label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows={2}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                fontFamily: "inherit",
              }}
              placeholder="Pénicilline, Arachides..."
            />
          </div>

          {/* ATCD Médicaux */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              Antécédents médicaux
            </label>
            <textarea
              name="atcdMedicaux"
              value={formData.atcdMedicaux}
              onChange={handleChange}
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                fontFamily: "inherit",
              }}
              placeholder="Hypertension artérielle, Diabète..."
            />
          </div>

          {/* ATCD Chirurgicaux */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              Antécédents chirurgicaux
            </label>
            <textarea
              name="atcdChirurgicaux"
              value={formData.atcdChirurgicaux}
              onChange={handleChange}
              rows={2}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                fontFamily: "inherit",
              }}
              placeholder="Appendicectomie en 2010..."
            />
          </div>

          {/* Traitements en cours */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              💊 Traitements en cours
            </label>
            <textarea
              name="traitements"
              value={formData.traitements}
              onChange={handleChange}
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                fontFamily: "inherit",
              }}
              placeholder="Lisinopril 10mg/jour..."
            />
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              📝 Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                fontFamily: "inherit",
              }}
              placeholder="Notes complémentaires sur le patient..."
            />
          </div>
        </div>

        {/* SECTION 3 : Contexte clinique enrichi (pour ordonnances IA) */}
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "24px",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "12px",
          }}
        >
          🧬 Contexte clinique enrichi (Ordonnances IA)
        </h3>

        <div style={{ display: "grid", gap: "20px", marginBottom: "32px" }}>
          {/* Pathologies associées */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              🏥 Pathologies associées
            </label>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={newPathologie}
                  onChange={(e) => setNewPathologie(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newPathologie.trim()) {
                        setFormData({
                          ...formData,
                          pathologiesAssociees: [...formData.pathologiesAssociees, newPathologie.trim()],
                        });
                        setNewPathologie("");
                      }
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                  placeholder="Ex: Diabète Type 2, Hypothyroïdie..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newPathologie.trim()) {
                      setFormData({
                        ...formData,
                        pathologiesAssociees: [...formData.pathologiesAssociees, newPathologie.trim()],
                      });
                      setNewPathologie("");
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  + Ajouter
                </button>
              </div>
            </div>
            {formData.pathologiesAssociees.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {formData.pathologiesAssociees.map((pathologie, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "6px 12px",
                      background: "#fef3c7",
                      border: "1px solid #fbbf24",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "#78350f",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {pathologie}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          pathologiesAssociees: formData.pathologiesAssociees.filter((_, i) => i !== idx),
                        });
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#78350f",
                        cursor: "pointer",
                        padding: "0 4px",
                        fontSize: "1rem",
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Symptômes actuels */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              🔍 Symptômes actuels
            </label>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={newSymptome}
                  onChange={(e) => setNewSymptome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (newSymptome.trim()) {
                        setFormData({
                          ...formData,
                          symptomesActuels: [...formData.symptomesActuels, newSymptome.trim()],
                        });
                        setNewSymptome("");
                      }
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                  placeholder="Ex: Fatigue chronique, Troubles digestifs..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSymptome.trim()) {
                      setFormData({
                        ...formData,
                        symptomesActuels: [...formData.symptomesActuels, newSymptome.trim()],
                      });
                      setNewSymptome("");
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  + Ajouter
                </button>
              </div>
            </div>
            {formData.symptomesActuels.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {formData.symptomesActuels.map((symptome, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "6px 12px",
                      background: "#dbeafe",
                      border: "1px solid #3b82f6",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "#1e40af",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {symptome}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          symptomesActuels: formData.symptomesActuels.filter((_, i) => i !== idx),
                        });
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1e40af",
                        cursor: "pointer",
                        padding: "0 4px",
                        fontSize: "1rem",
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Autres bilans biologiques */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "#374151" }}>
              🔬 Autres bilans biologiques
            </label>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: "8px" }}>
                <input
                  type="text"
                  value={newBilanKey}
                  onChange={(e) => setNewBilanKey(e.target.value)}
                  style={{
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                  placeholder="Ex: ALAT, ASAT, Vitamine D..."
                />
                <input
                  type="number"
                  step="0.01"
                  value={newBilanValue}
                  onChange={(e) => setNewBilanValue(e.target.value)}
                  style={{
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                  }}
                  placeholder="Valeur"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newBilanKey.trim() && newBilanValue) {
                      setFormData({
                        ...formData,
                        autresBilans: {
                          ...formData.autresBilans,
                          [newBilanKey.trim()]: parseFloat(newBilanValue),
                        },
                      });
                      setNewBilanKey("");
                      setNewBilanValue("");
                    }
                  }}
                  style={{
                    padding: "10px 20px",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  + Ajouter
                </button>
              </div>
            </div>
            {Object.keys(formData.autresBilans).length > 0 && (
              <div
                style={{
                  background: "#f0fdf4",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #10b981",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  {Object.entries(formData.autresBilans).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        background: "white",
                        borderRadius: "6px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{key}</div>
                        <div style={{ fontWeight: "600", color: "#065f46" }}>
                          {value} {["alat", "asat"].includes(key.toLowerCase()) ? "UI/L" : ""}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newBilans = { ...formData.autresBilans };
                          delete newBilans[key];
                          setFormData({
                            ...formData,
                            autresBilans: newBilans,
                          });
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          padding: "0 4px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: "white",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: loading ? "#93c5fd" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 15px rgba(102, 126, 234, 0.4)",
            }}
          >
            {loading ? "Création en cours..." : pendingBdf ? "Créer et associer BdF" : "Créer le patient"}
          </button>
        </div>
      </div>
    </form>
  );
}
