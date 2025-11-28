"use client";
// ========================================
// COMPOSANT - Formulaire création plante Phytodex
// ========================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PhytodexPlantForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    latinName: "",
    family: "",
    mainVernacularName: "",
    otherVernacularNames: "",
    region: "",
    mainActions: "",
    mainIndications: "",
    usualForms: "",
    officinalAvailability: "",
    safetyNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.latinName.trim()) {
      setError("Le nom latin est obligatoire");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/phytodex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const plant = await res.json();
        router.push(`/phytodex/${plant.id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Section Identification */}
        <Card>
          <CardHeader>
            <CardTitle>Identification</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Nom latin <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.latinName}
                    onChange={(e) => setForm({ ...form, latinName: e.target.value })}
                    placeholder="Ex: Rosmarinus officinalis"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Famille botanique
                  </label>
                  <input
                    type="text"
                    value={form.family}
                    onChange={(e) => setForm({ ...form, family: e.target.value })}
                    placeholder="Ex: Lamiaceae"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Nom vernaculaire principal
                  </label>
                  <input
                    type="text"
                    value={form.mainVernacularName}
                    onChange={(e) => setForm({ ...form, mainVernacularName: e.target.value })}
                    placeholder="Ex: إكليل الجبل (Klil el jbel)"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Autres noms
                  </label>
                  <input
                    type="text"
                    value={form.otherVernacularNames}
                    onChange={(e) => setForm({ ...form, otherVernacularNames: e.target.value })}
                    placeholder="Noms séparés par virgules"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                  Région / Zone géographique
                </label>
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  placeholder="Ex: Nord Tunisie, Cap Bon, Sud / zones arides..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Actions & Indications */}
        <Card>
          <CardHeader>
            <CardTitle>Actions & Indications</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                  Actions principales
                </label>
                <textarea
                  value={form.mainActions}
                  onChange={(e) => setForm({ ...form, mainActions: e.target.value })}
                  placeholder="Ex: Adaptogène, cholérétique, léger tonique, antioxydant..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                    resize: "vertical",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                  Indications principales
                </label>
                <textarea
                  value={form.mainIndications}
                  onChange={(e) => setForm({ ...form, mainIndications: e.target.value })}
                  placeholder="Ex: Fatigue fonctionnelle, troubles digestifs légers, soutien hépatique..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Formes & Disponibilité */}
        <Card>
          <CardHeader>
            <CardTitle>Formes & Disponibilité</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                  Formes habituelles
                </label>
                <input
                  type="text"
                  value={form.usualForms}
                  onChange={(e) => setForm({ ...form, usualForms: e.target.value })}
                  placeholder="Ex: Infusion, gélules, HE, teinture-mère..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                  Disponibilité en officine (Tunisie)
                </label>
                <input
                  type="text"
                  value={form.officinalAvailability}
                  onChange={(e) => setForm({ ...form, officinalAvailability: e.target.value })}
                  placeholder="Ex: Disponible en herboristerie, HE en pharmacie..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                Notes de sécurité
              </label>
              <textarea
                value={form.safetyNotes}
                onChange={(e) => setForm({ ...form, safetyNotes: e.target.value })}
                placeholder="Contre-indications, précautions d'emploi, interactions médicamenteuses connues..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                  resize: "vertical",
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Erreur */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/phytodex")}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            }}
          >
            {loading ? "Création..." : "Créer la plante"}
          </Button>
        </div>
      </div>
    </form>
  );
}
