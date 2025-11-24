"use client";

import { useState } from "react";
import type { OrdonnanceStructuree, RecommandationTherapeutique, TherapeuticScope, NiveauSecurite } from "@/lib/ordonnance/types";

// ========================================
// TYPES & UTILITAIRES UI
// ========================================

type OrdonnancePanelProps = {
  ordonnance: OrdonnanceStructuree | null;
  loading?: boolean;
};

// Code couleur pédagogique pour la sécurité
const getSecurityStyles = (niveau?: NiveauSecurite) => {
  switch (niveau) {
    case 'interdit': return { borderLeft: "4px solid #ef4444", bg: "#fef2f2" };
    case 'precaution': return { borderLeft: "4px solid #f59e0b", bg: "#fffbeb" };
    default: return { borderLeft: "4px solid transparent", bg: "white" };
  }
};

// Titre dynamique selon scope
function getVolet2Title(scope?: TherapeuticScope): { title: string; description: string; emoji: string } {
  if (!scope) return { title: "VOLET 2 - PHYTOTHÉRAPIE ÉLARGIE", description: "Approche intégrative", emoji: "🌱" };

  const scopes = [];
  if (scope.planteMedicinale) scopes.push("Phytothérapie");
  if (scope.gemmotherapie) scopes.push("Gemmothérapie");
  if (scope.aromatherapie) scopes.push("Aromathérapie");

  if (scopes.length === 1) {
    if (scope.gemmotherapie) return { title: "VOLET 2 - GEMMOTHÉRAPIE", description: "Macérats de bourgeons", emoji: "🌿" };
    if (scope.aromatherapie) return { title: "VOLET 2 - AROMATHÉRAPIE", description: "Huiles essentielles", emoji: "💧" };
  }
  return { title: "VOLET 2 - PHYTOTHÉRAPIE ÉLARGIE", description: scopes.join(", "), emoji: "🌱" };
}

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

export function OrdonnancePanel({ ordonnance, loading }: OrdonnancePanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    volet1: true, volet2: true, volet3: true, volet4: true, volet5: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", borderRadius: "12px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px", animation: "pulse 2s infinite" }}>🧬</div>
          <p style={{ fontSize: "1.1rem", color: "#6b7280", fontWeight: "500" }}>Raisonnement Endobiogénique en cours...</p>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginTop: "8px" }}>Analyse des Axes → Fusion Clinique → Vérification Sécurité</p>
        </div>
      </div>
    );
  }

  // --- Empty State ---
  if (!ordonnance) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", borderRadius: "12px" }}>
        <div style={{ textAlign: "center", padding: "48px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🎓</div>
          <h3 style={{ fontSize: "1.3rem", fontWeight: "600", color: "#1f2937" }}>Mode Apprentissage Actif</h3>
          <p style={{ fontSize: "0.95rem", color: "#6b7280", marginTop: "8px" }}>Générez une ordonnance pour visualiser le lien<br/>entre la biologie et la thérapeutique.</p>
        </div>
      </div>
    );
  }

  const statutColor = ordonnance.statut === 'validee' ? { bg: "#d1fae5", text: "#065f46" } : { bg: "#fef3c7", text: "#92400e" };

  return (
    <div style={{ display: "flex", flexDirection: "column", background: "white", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", overflow: "hidden" }}>

      {/* Header Pédagogique */}
      <div style={{ padding: "24px", background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)", color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.5px" }}>Ordonnance Endobiogénique</h2>
            <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              {new Date(ordonnance.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <span style={{ padding: "6px 12px", background: statutColor.bg, color: statutColor.text, borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
            {ordonnance.statut}
          </span>
        </div>

        {ordonnance.syntheseClinique && (
          <div style={{ background: "rgba(255, 255, 255, 0.1)", padding: "16px", borderRadius: "8px", borderLeft: "4px solid rgba(255,255,255,0.5)" }}>
            <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", opacity: 0.8, marginBottom: "8px", fontWeight: "600" }}>Synthèse du Terrain</h4>
            <p style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>{ordonnance.syntheseClinique}</p>
          </div>
        )}
      </div>

      {/* Contenu des Volets */}
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>

        <VoletSection
          title="VOLET 1 - ENDOBIOGÉNIE (Canon)"
          emoji="🛡️"
          color="#059669"
          recommendations={ordonnance.voletEndobiogenique}
          expanded={expandedSections.volet1}
          onToggle={() => toggleSection("volet1")}
          description="Traitement de fond des déséquilibres neuro-endocriniens majeurs"
          badge="Priorité Absolue"
        />

        {/* VOLET 2 - PHYTOTHÉRAPIE: Filtrer par type 'plante' */}
        {(() => {
          const phytoRecommendations = ordonnance.voletPhytoElargi?.filter(rec => rec.type === 'plante') || [];
          return phytoRecommendations.length > 0 && (
            <VoletSection
              title="VOLET 2 - PHYTOTHÉRAPIE ÉLARGIE"
              emoji="🌿"
              color="#059669"
              recommendations={phytoRecommendations}
              expanded={expandedSections.volet2}
              onToggle={() => toggleSection("volet2")}
              description="Extension symptomatique et fonctionnelle"
              badge="Soutien"
            />
          );
        })()}

        {/* VOLET 3 - GEMMOTHÉRAPIE: Filtrer par type 'gemmo' */}
        {(() => {
          const gemmoRecommendations = ordonnance.voletPhytoElargi?.filter(rec => rec.type === 'gemmo') || [];
          return gemmoRecommendations.length > 0 && (
            <VoletSection
              title="VOLET 3 - GEMMOTHÉRAPIE"
              emoji="🌱"
              color="#10b981"
              recommendations={gemmoRecommendations}
              expanded={expandedSections.volet3}
              onToggle={() => toggleSection("volet3")}
              description="Macérats de bourgeons"
              badge="Drainage"
            />
          );
        })()}

        {/* VOLET 4 - AROMATHÉRAPIE: Filtrer par type 'HE' */}
        {(() => {
          const aromaRecommendations = ordonnance.voletPhytoElargi?.filter(rec => rec.type === 'HE') || [];
          return aromaRecommendations.length > 0 && (
            <VoletSection
              title="VOLET 4 - AROMATHÉRAPIE"
              emoji="💧"
              color="#3b82f6"
              recommendations={aromaRecommendations}
              expanded={expandedSections.volet4}
              onToggle={() => toggleSection("volet4")}
              description="Huiles essentielles"
              badge="Ciblé"
            />
          );
        })()}

        {/* VOLET 5 - MICRO-NUTRITION: N'afficher QUE si micro-nutrition est sélectionnée ET des recommandations existent */}
        {ordonnance.scope?.micronutrition && ordonnance.voletComplements && ordonnance.voletComplements.length > 0 && (
          <VoletSection
            title="VOLET 5 - MICRO-NUTRITION"
            emoji="💊"
            color="#7c3aed"
            recommendations={ordonnance.voletComplements}
            expanded={expandedSections.volet5}
            onToggle={() => toggleSection("volet5")}
            description="Correction des carences et cofacteurs enzymatiques"
            badge="Terrain"
          />
        )}

        {/* Blocs Conseils & Surveillance */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {ordonnance.conseilsAssocies && ordonnance.conseilsAssocies.length > 0 && (
            <div style={{ padding: "16px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px" }}>
              <h4 style={{ color: "#92400e", fontWeight: "600", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>💡 Hygiène de vie</h4>
              <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "0.85rem", color: "#78350f" }}>
                {ordonnance.conseilsAssocies.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
          {ordonnance.surveillanceBiologique && ordonnance.surveillanceBiologique.length > 0 && (
            <div style={{ padding: "16px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px" }}>
              <h4 style={{ color: "#1e40af", fontWeight: "600", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>🔬 Surveillance</h4>
              <ul style={{ paddingLeft: "20px", margin: 0, fontSize: "0.85rem", color: "#1e3a8a" }}>
                {ordonnance.surveillanceBiologique.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ padding: "16px 24px", background: "#f9fafb", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Made with Endobiogeny AI • v2.1</span>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", color: "#374151", fontWeight: "600", cursor: "pointer" }}>📋 Copier</button>
          <button style={{ padding: "8px 16px", borderRadius: "6px", background: "#2563eb", color: "white", border: "none", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 4px rgba(37,99,235,0.3)" }}>🖨️ Imprimer</button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// SOUS-COMPOSANTS
// ========================================

function VoletSection({ title, emoji, color, recommendations, expanded, onToggle, description, badge }: any) {
  const isEmpty = recommendations.length === 0;

  return (
    <div style={{ border: `1px solid ${isEmpty ? "#e5e7eb" : color}`, borderRadius: "12px", overflow: "hidden", transition: "all 0.2s" }}>
      <div onClick={onToggle} style={{ padding: "16px 20px", background: isEmpty ? "#f9fafb" : `${color}10`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>{emoji}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#111827", margin: 0 }}>{title}</h3>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: color, background: "white", padding: "2px 6px", borderRadius: "4px", border: `1px solid ${color}` }}>{badge}</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "2px 0 0 0" }}>{description}</p>
          </div>
        </div>
        <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "white", border: "1px solid #e5e7eb", fontSize: "0.8rem", fontWeight: "600" }}>
          {recommendations.length}
        </div>
      </div>

      {expanded && !isEmpty && (
        <div style={{ padding: "0", background: "#f3f4f6", display: "grid", gap: "1px" }}>
          {recommendations.map((rec: RecommandationTherapeutique, idx: number) => (
            <RecommandationCard key={rec.id} recommendation={rec} index={idx} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}

// ========================================
// CARTE D'APPRENTISSAGE (LEARNING CARD)
// ========================================

function RecommandationCard({ recommendation, index, color }: { recommendation: RecommandationTherapeutique, index: number, color: string }) {
  const [showDetails, setShowDetails] = useState(false);
  const [hovered, setHovered] = useState(false);

  const securityStyle = getSecurityStyles(recommendation.niveauSecurite);
  const pedago = recommendation.pedagogie;

  return (
    <div style={{ background: securityStyle.bg, padding: "16px 20px", borderLeft: securityStyle.borderLeft }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>

        <div style={{ flex: 1 }}>
          {/* Ligne Supérieure : Substance + Badge Intention */}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
            {/* Numéro */}
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#e5e7eb", color: "#6b7280", fontSize: "0.7rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>{index + 1}</span>

            {/* Nom Substance */}
            <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1f2937", margin: 0 }}>{recommendation.substance}</h4>

            {/* Forme Galénique */}
            <span style={{ fontSize: "0.75rem", padding: "2px 8px", background: "#f3f4f6", borderRadius: "4px", color: "#4b5563", fontWeight: "500" }}>{recommendation.forme}</span>

            {/* --- LEARNING COMPONENT : BADGE PÉDAGOGIQUE --- */}
            {pedago && (
              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <span style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "4px 10px", background: `${color}15`, color: color,
                  borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", cursor: "help", border: `1px solid ${color}30`
                }}>
                  🎯 {pedago.actionSurAxe}
                </span>

                {/* TOOLTIP EXPLIQUE LE "POURQUOI" */}
                {hovered && (
                  <div style={{
                    position: "absolute", bottom: "130%", left: "0", width: "280px",
                    background: "#1f2937", color: "white", padding: "12px", borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)", zIndex: 50, fontSize: "0.8rem", lineHeight: "1.4"
                  }}>
                    <div style={{ marginBottom: "6px", fontWeight: "700", color: "#60a5fa" }}>Pourquoi cette plante ?</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>Index déclencheur :</span>
                      <span style={{ fontWeight: "600" }}>{pedago.indexDeclencheur || "Analyse globale"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>Score perturbation :</span>
                      <span style={{ fontWeight: "600", color: pedago.scorePerturbation > 7 ? "#f87171" : "#fbbf24" }}>
                        {pedago.scorePerturbation}/10
                      </span>
                    </div>
                    <div style={{ borderTop: "1px solid #374151", paddingTop: "6px", fontStyle: "italic", color: "#9ca3af" }}>
                      "{pedago.actionSurAxe}"
                    </div>
                    <div style={{ position: "absolute", top: "100%", left: "20px", borderWidth: "6px", borderStyle: "solid", borderColor: "#1f2937 transparent transparent transparent" }}></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ligne Posologie */}
          <div style={{ display: "flex", gap: "16px", fontSize: "0.9rem", color: "#374151", marginBottom: "10px" }}>
            <div><strong>📅 {recommendation.posologie}</strong></div>
            <div style={{ color: "#6b7280" }}>Durée : {recommendation.duree}</div>
          </div>

          {/* Zone Détails (Expandable) */}
          {showDetails && (
            <div style={{ marginTop: "12px", padding: "12px", background: "white", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.85rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#6b7280" }}>Mécanisme :</span>
                <span style={{ fontWeight: "500", color: "#111827" }}>{recommendation.mecanisme}</span>

                {pedago?.constituantsClefs && pedago.constituantsClefs.length > 0 && (
                  <>
                    <span style={{ color: "#6b7280" }}>Chimie :</span>
                    <span style={{ color: "#059669" }}>{pedago.constituantsClefs.join(", ")}</span>
                  </>
                )}
              </div>

              {recommendation.CI && recommendation.CI.length > 0 && (
                <div style={{ marginTop: "8px", padding: "8px", background: "#fef2f2", borderRadius: "6px", color: "#ef4444", fontSize: "0.8rem", display: "flex", gap: "8px" }}>
                  <strong>⚠️ Contre-indications gérées :</strong> {recommendation.CI.join(", ")}
                </div>
              )}
            </div>
          )}

          <button onClick={() => setShowDetails(!showDetails)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            {showDetails ? "Masquer l'analyse détaillée" : "Voir le raisonnement clinique"}
          </button>
        </div>

        {/* Priorité Badge */}
        <div style={{ marginLeft: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#9ca3af", marginBottom: "2px" }}>PRIORITÉ</div>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: recommendation.priorite === 1 ? "#ef4444" : recommendation.priorite === 2 ? "#f59e0b" : "#6366f1", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
            {recommendation.priorite}
          </div>
        </div>
      </div>
    </div>
  );
}
