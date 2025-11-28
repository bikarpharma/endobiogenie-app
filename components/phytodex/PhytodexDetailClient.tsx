"use client";
// ========================================
// COMPOSANT CLIENT - Détail Phytodex avec édition
// ========================================
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EvidenceLevel, SourceType } from "@prisma/client";
import { PlantImageHeader } from "./PlantImage";

interface TraditionalUse {
  id: number;
  indicationCategory: string | null;
  indicationDetail: string;
  partUsed: string | null;
  preparation: string | null;
  dosageNotes: string | null;
  evidenceLevel: EvidenceLevel;
  source: {
    id: number;
    type: SourceType;
    citation: string;
  };
}

interface PhytodexPlant {
  id: number;
  latinName: string;
  family: string | null;
  mainVernacularName: string | null;
  arabicName: string | null;
  otherVernacularNames: string | null;
  region: string | null;
  partUsed: string | null;
  mainActions: string | null;
  mainIndications: string | null;
  usualForms: string | null;
  officinalAvailability: string | null;
  safetyNotes: string | null;
  traditionalUses: TraditionalUse[];
}

interface Source {
  id: number;
  type: SourceType;
  citation: string;
}

interface Props {
  plant: PhytodexPlant;
  sources: Source[];
}

const EVIDENCE_LEVEL_LABELS: Record<EvidenceLevel, { label: string; color: string }> = {
  TRADITION_ONLY: { label: "Tradition", color: "#f59e0b" },
  PRECLINICAL_DATA: { label: "Préclinique", color: "#3b82f6" },
  SOME_CLINICAL_DATA: { label: "Données cliniques", color: "#10b981" },
};

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  BOOK: "Ouvrage",
  THESIS: "Thèse",
  ARTICLE: "Article",
  FIELD_INTERVIEW: "Enquête terrain",
  REPORT: "Rapport",
};

export function PhytodexDetailClient({ plant, sources }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddUse, setShowAddUse] = useState(false);
  const [loading, setLoading] = useState(false);

  // État du formulaire d'édition plante
  const [editForm, setEditForm] = useState({
    latinName: plant.latinName,
    family: plant.family || "",
    mainVernacularName: plant.mainVernacularName || "",
    arabicName: plant.arabicName || "",
    otherVernacularNames: plant.otherVernacularNames || "",
    region: plant.region || "",
    partUsed: plant.partUsed || "",
    mainActions: plant.mainActions || "",
    mainIndications: plant.mainIndications || "",
    usualForms: plant.usualForms || "",
    officinalAvailability: plant.officinalAvailability || "",
    safetyNotes: plant.safetyNotes || "",
  });

  // État du formulaire d'ajout d'usage
  const [useForm, setUseForm] = useState({
    indicationCategory: "",
    indicationDetail: "",
    partUsed: "",
    preparation: "",
    dosageNotes: "",
    evidenceLevel: "TRADITION_ONLY" as EvidenceLevel,
    sourceId: "",
    newSourceType: "BOOK" as SourceType,
    newSourceCitation: "",
  });

  const handleSavePlant = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/phytodex/${plant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUse = async () => {
    if (!useForm.indicationDetail) {
      alert("Le détail de l'indication est obligatoire");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        indicationCategory: useForm.indicationCategory || null,
        indicationDetail: useForm.indicationDetail,
        partUsed: useForm.partUsed || null,
        preparation: useForm.preparation || null,
        dosageNotes: useForm.dosageNotes || null,
        evidenceLevel: useForm.evidenceLevel,
      };

      if (useForm.sourceId) {
        body.sourceId = parseInt(useForm.sourceId);
      } else if (useForm.newSourceCitation) {
        body.sourceType = useForm.newSourceType;
        body.sourceCitation = useForm.newSourceCitation;
      } else {
        alert("Veuillez sélectionner ou créer une source");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/phytodex/${plant.id}/uses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowAddUse(false);
        setUseForm({
          indicationCategory: "",
          indicationDetail: "",
          partUsed: "",
          preparation: "",
          dosageNotes: "",
          evidenceLevel: "TRADITION_ONLY",
          sourceId: "",
          newSourceType: "BOOK",
          newSourceCitation: "",
        });
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de l'ajout");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUse = async (useId: number) => {
    if (!confirm("Supprimer cet usage traditionnel ?")) return;

    try {
      const res = await fetch(`/api/phytodex/${plant.id}/uses?useId=${useId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur réseau");
    }
  };

  // Regrouper les usages par catégorie
  const usesByCategory = plant.traditionalUses.reduce(
    (acc, use) => {
      const cat = use.indicationCategory || "Non catégorisé";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(use);
      return acc;
    },
    {} as Record<string, TraditionalUse[]>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header avec image */}
      <PlantImageHeader
        latinName={plant.latinName}
        vernacularName={plant.mainVernacularName || plant.otherVernacularNames || undefined}
      />

      {/* Section 1: Identification & Contexte */}
      <Card>
        <CardHeader style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <CardTitle>Identification & Contexte</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Annuler" : "Modifier"}
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Nom latin *
                  </label>
                  <input
                    type="text"
                    value={editForm.latinName}
                    onChange={(e) => setEditForm({ ...editForm, latinName: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Famille
                  </label>
                  <input
                    type="text"
                    value={editForm.family}
                    onChange={(e) => setEditForm({ ...editForm, family: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Nom français
                  </label>
                  <input
                    type="text"
                    value={editForm.mainVernacularName}
                    onChange={(e) => setEditForm({ ...editForm, mainVernacularName: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Nom arabe
                  </label>
                  <input
                    type="text"
                    value={editForm.arabicName}
                    onChange={(e) => setEditForm({ ...editForm, arabicName: e.target.value })}
                    placeholder="مثال: شندقورة"
                    dir="rtl"
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", fontFamily: "Arial, sans-serif" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Nom vernaculaire tunisien
                  </label>
                  <input
                    type="text"
                    value={editForm.otherVernacularNames}
                    onChange={(e) => setEditForm({ ...editForm, otherVernacularNames: e.target.value })}
                    placeholder="Ex: Chandgoura, Akhilia..."
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Partie utilisée (Drogue)
                  </label>
                  <input
                    type="text"
                    value={editForm.partUsed}
                    onChange={(e) => setEditForm({ ...editForm, partUsed: e.target.value })}
                    placeholder="Ex: Feuille, Sommité fleurie, Racine..."
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Région
                  </label>
                  <input
                    type="text"
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                    placeholder="Ex: Nord Tunisie, Cap Bon..."
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                    Formes habituelles
                  </label>
                  <input
                    type="text"
                    value={editForm.usualForms}
                    onChange={(e) => setEditForm({ ...editForm, usualForms: e.target.value })}
                    placeholder="Ex: Infusion, gélules, HE..."
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                  Disponibilité en officine
                </label>
                <input
                  type="text"
                  value={editForm.officinalAvailability}
                  onChange={(e) => setEditForm({ ...editForm, officinalAvailability: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSavePlant} disabled={loading}>
                  {loading ? "..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                <span style={{ color: "#6b7280" }}>Nom latin</span>
                <span><em>{plant.latinName}</em></span>
              </div>
              {plant.family && (
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Famille</span>
                  <span>{plant.family}</span>
                </div>
              )}
              {plant.mainVernacularName && (
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Nom français</span>
                  <span>{plant.mainVernacularName}</span>
                </div>
              )}
              {plant.otherVernacularNames && (
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Nom vernaculaire</span>
                  <span style={{ fontWeight: "500" }}>{plant.otherVernacularNames}</span>
                </div>
              )}
              {plant.arabicName && (
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Nom arabe</span>
                  <span style={{ fontFamily: "Arial, sans-serif", fontSize: "1.3rem", direction: "rtl", color: "#059669", fontWeight: "600" }}>
                    {plant.arabicName}
                  </span>
                </div>
              )}
              {plant.region && (
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Région</span>
                  <Badge variant="secondary">{plant.region}</Badge>
                </div>
              )}
              {plant.partUsed && (
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Partie utilisée</span>
                  <span>{plant.partUsed}</span>
                </div>
              )}
              {plant.usualForms && (
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Formes habituelles</span>
                  <span>{plant.usualForms}</span>
                </div>
              )}
              {plant.officinalAvailability && (
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Disponibilité</span>
                  <span>{plant.officinalAvailability}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Actions & Indications */}
      <Card>
        <CardHeader>
          <CardTitle>Actions & Indications (synthèse)</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                  Actions principales
                </label>
                <textarea
                  value={editForm.mainActions}
                  onChange={(e) => setEditForm({ ...editForm, mainActions: e.target.value })}
                  placeholder="Ex: Adaptogène, cholérétique, léger tonique..."
                  rows={3}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                  Indications principales
                </label>
                <textarea
                  value={editForm.mainIndications}
                  onChange={(e) => setEditForm({ ...editForm, mainIndications: e.target.value })}
                  placeholder="Ex: Fatigue fonctionnelle, troubles digestifs légers..."
                  rows={3}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {plant.mainActions ? (
                <div>
                  <h4 style={{ fontWeight: "600", marginBottom: "8px", color: "#059669" }}>Actions</h4>
                  <p style={{ color: "#374151" }}>{plant.mainActions}</p>
                </div>
              ) : null}
              {plant.mainIndications ? (
                <div>
                  <h4 style={{ fontWeight: "600", marginBottom: "8px", color: "#059669" }}>Indications</h4>
                  <p style={{ color: "#374151" }}>{plant.mainIndications}</p>
                </div>
              ) : null}
              {!plant.mainActions && !plant.mainIndications && (
                <p style={{ color: "#9ca3af", fontStyle: "italic" }}>Aucune information renseignée</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Usages traditionnels */}
      <Card>
        <CardHeader style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <CardTitle>Usages traditionnels (informatifs)</CardTitle>
          <Button onClick={() => setShowAddUse(!showAddUse)} size="sm">
            {showAddUse ? "Annuler" : "+ Ajouter"}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Disclaimer */}
          <div
            style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#92400e" }}>
              <strong>Avertissement :</strong> Les informations ci-dessous sont issues de la médecine traditionnelle
              (Tunisie / Maghreb) et sont fournies à titre informatif. Elles ne constituent pas une recommandation
              thérapeutique et ne sont pas intégrées au moteur d&apos;aide à la décision clinique d&apos;IntegrIA.
            </p>
          </div>

          {/* Formulaire d'ajout */}
          {showAddUse && (
            <div
              style={{
                background: "#f9fafb",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h4 style={{ marginBottom: "16px", fontWeight: "600" }}>Nouvel usage traditionnel</h4>
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>
                      Catégorie
                    </label>
                    <input
                      type="text"
                      value={useForm.indicationCategory}
                      onChange={(e) => setUseForm({ ...useForm, indicationCategory: e.target.value })}
                      placeholder="Ex: Digestif, Respiratoire..."
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>
                      Partie utilisée
                    </label>
                    <input
                      type="text"
                      value={useForm.partUsed}
                      onChange={(e) => setUseForm({ ...useForm, partUsed: e.target.value })}
                      placeholder="Ex: Feuille, Sommité fleurie..."
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>
                    Détail de l&apos;indication *
                  </label>
                  <textarea
                    value={useForm.indicationDetail}
                    onChange={(e) => setUseForm({ ...useForm, indicationDetail: e.target.value })}
                    placeholder="Ex: Tisane pour ballonnements post-prandiaux..."
                    rows={2}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>
                      Préparation
                    </label>
                    <input
                      type="text"
                      value={useForm.preparation}
                      onChange={(e) => setUseForm({ ...useForm, preparation: e.target.value })}
                      placeholder="Ex: Infusion 10 min..."
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>
                      Niveau de preuve *
                    </label>
                    <select
                      value={useForm.evidenceLevel}
                      onChange={(e) => setUseForm({ ...useForm, evidenceLevel: e.target.value as EvidenceLevel })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    >
                      <option value="TRADITION_ONLY">Tradition uniquement</option>
                      <option value="PRECLINICAL_DATA">Données précliniques</option>
                      <option value="SOME_CLINICAL_DATA">Données cliniques</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem" }}>
                    Notes de dosage
                  </label>
                  <textarea
                    value={useForm.dosageNotes}
                    onChange={(e) => setUseForm({ ...useForm, dosageNotes: e.target.value })}
                    rows={2}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                  />
                </div>

                {/* Source */}
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                    Source bibliographique *
                  </label>
                  <div style={{ display: "grid", gap: "8px" }}>
                    <select
                      value={useForm.sourceId}
                      onChange={(e) => setUseForm({ ...useForm, sourceId: e.target.value, newSourceCitation: "" })}
                      style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                    >
                      <option value="">-- Sélectionner une source existante --</option>
                      {sources.map((s) => (
                        <option key={s.id} value={s.id}>
                          [{SOURCE_TYPE_LABELS[s.type]}] {s.citation.substring(0, 80)}...
                        </option>
                      ))}
                    </select>
                    <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>ou créer une nouvelle</div>
                    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                      <select
                        value={useForm.newSourceType}
                        onChange={(e) => setUseForm({ ...useForm, newSourceType: e.target.value as SourceType, sourceId: "" })}
                        disabled={!!useForm.sourceId}
                        style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                      >
                        <option value="BOOK">Ouvrage</option>
                        <option value="THESIS">Thèse</option>
                        <option value="ARTICLE">Article</option>
                        <option value="FIELD_INTERVIEW">Enquête terrain</option>
                        <option value="REPORT">Rapport</option>
                      </select>
                      <input
                        type="text"
                        value={useForm.newSourceCitation}
                        onChange={(e) => setUseForm({ ...useForm, newSourceCitation: e.target.value, sourceId: "" })}
                        placeholder="Citation complète de la source..."
                        disabled={!!useForm.sourceId}
                        style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <Button variant="outline" onClick={() => setShowAddUse(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddUse} disabled={loading}>
                    {loading ? "..." : "Ajouter l'usage"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Liste des usages par catégorie */}
          {Object.keys(usesByCategory).length === 0 ? (
            <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
              Aucun usage traditionnel documenté pour cette plante.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {Object.entries(usesByCategory).map(([category, uses]) => (
                <div key={category}>
                  <h4 style={{ fontWeight: "600", marginBottom: "12px", color: "#374151" }}>
                    {category}
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {uses.map((use) => (
                      <div
                        key={use.id}
                        style={{
                          background: "#f9fafb",
                          padding: "16px",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <Badge
                              style={{
                                background: EVIDENCE_LEVEL_LABELS[use.evidenceLevel].color,
                                color: "white",
                              }}
                            >
                              {EVIDENCE_LEVEL_LABELS[use.evidenceLevel].label}
                            </Badge>
                            {use.partUsed && <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>({use.partUsed})</span>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUse(use.id)}
                            style={{ color: "#ef4444" }}
                          >
                            Suppr.
                          </Button>
                        </div>
                        <p style={{ marginBottom: "8px", color: "#374151" }}>{use.indicationDetail}</p>
                        {use.preparation && (
                          <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "4px" }}>
                            <strong>Préparation :</strong> {use.preparation}
                          </p>
                        )}
                        {use.dosageNotes && (
                          <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "8px" }}>
                            <strong>Dosage :</strong> {use.dosageNotes}
                          </p>
                        )}
                        <p style={{ fontSize: "0.8rem", color: "#9ca3af", fontStyle: "italic" }}>
                          Source : [{SOURCE_TYPE_LABELS[use.source.type]}] {use.source.citation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4: Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle>Sécurité (notes générales)</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <textarea
              value={editForm.safetyNotes}
              onChange={(e) => setEditForm({ ...editForm, safetyNotes: e.target.value })}
              placeholder="Contre-indications, précautions, interactions..."
              rows={4}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
            />
          ) : plant.safetyNotes ? (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <p style={{ margin: 0, color: "#991b1b" }}>{plant.safetyNotes}</p>
            </div>
          ) : (
            <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
              Aucune note de sécurité renseignée.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
