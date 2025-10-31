// ========================================
// PAGE DÉTAIL FICHE MALADIE - /fiches/[slug]
// ========================================
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFicheBySlug, fichesMaladies } from "@/lib/data/fiches-maladies";

const CATEGORY_COLORS: Record<string, string> = {
  infectieux: "#dc2626",
  nerveux: "#7c3aed",
  cardiovasculaire: "#db2777",
  digestif: "#ea580c",
  immunitaire: "#16a34a",
  urinaire: "#0284c7",
};

export async function generateStaticParams() {
  return fichesMaladies.map((fiche) => ({
    slug: fiche.slug,
  }));
}

export default function FicheDetailPage({ params }: { params: { slug: string } }) {
  const fiche = getFicheBySlug(params.slug);

  if (!fiche) {
    notFound();
  }

  const mainColor = CATEGORY_COLORS[fiche.categorie] || "#3b82f6";

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      {/* Back button */}
      <Link
        href="/fiches"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px",
          color: "#6b7280",
          textDecoration: "none",
          fontSize: "0.95rem",
        }}
      >
        ← Retour aux fiches
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{ marginBottom: "12px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: "16px",
              fontSize: "0.85rem",
              fontWeight: "600",
              background: `${mainColor}15`,
              color: mainColor,
              textTransform: "uppercase",
            }}
          >
            {fiche.categorie}
          </span>
        </div>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "16px", color: "#1f2937" }}>
          {fiche.titre}
        </h1>
      </div>

      {/* Symptômes */}
      <Section title="🎯 Symptômes caractéristiques" color={mainColor}>
        <ul style={{ margin: 0, paddingLeft: "24px", lineHeight: "1.8" }}>
          {fiche.symptomes.map((symptome, i) => (
            <li key={i} style={{ marginBottom: "8px" }}>{symptome}</li>
          ))}
        </ul>
      </Section>

      {/* Endobiogénie */}
      {fiche.endobiogenie && (
        <Section title={`🌿 ${fiche.endobiogenie.titre}`} color="#1e40af">
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ color: "#1e40af" }}>Terrain :</strong>
            <p style={{ margin: "8px 0 0 0", lineHeight: "1.6" }}>{fiche.endobiogenie.terrain}</p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ color: "#1e40af" }}>Axes endobiogéniques :</strong>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "24px", lineHeight: "1.7" }}>
              {fiche.endobiogenie.axes.map((axe, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>{axe}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong style={{ color: "#1e40af" }}>Approche thérapeutique :</strong>
            <p style={{ margin: "8px 0 0 0", lineHeight: "1.6" }}>{fiche.endobiogenie.approche}</p>
          </div>
        </Section>
      )}

      {/* Gemmothérapie */}
      {fiche.gemmotherapie && (
        <Section title={`🌿 ${fiche.gemmotherapie.titre}`} color="#166534">
          {fiche.gemmotherapie.bourgeons.map((bourgeon, i) => (
            <div key={i} style={{
              background: "#f0fdf4",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "12px",
              border: "1px solid #bbf7d0",
            }}>
              <div style={{ fontWeight: "700", color: "#166534", marginBottom: "8px" }}>
                {bourgeon.nom}
              </div>
              <div style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                <strong>Posologie :</strong> {bourgeon.posologie}
              </div>
              <div style={{ fontSize: "0.9rem" }}>
                <strong>Durée :</strong> {bourgeon.duree}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Aromathérapie */}
      {fiche.aromatherapie && (
        <Section title={`🌺 ${fiche.aromatherapie.titre}`} color="#6b21a8">
          {fiche.aromatherapie.huilesEssentielles.map((he, i) => (
            <div key={i} style={{
              background: "#faf5ff",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "12px",
              border: "1px solid #e9d5ff",
            }}>
              <div style={{ fontWeight: "700", color: "#6b21a8", marginBottom: "8px" }}>
                {he.nom}
              </div>
              <div style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                <strong>Voie d'administration :</strong> {he.voie}
              </div>
              <div style={{ fontSize: "0.9rem" }}>
                <strong>Posologie :</strong> {he.posologie}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Phytothérapie */}
      {fiche.phytotherapie && (
        <Section title={`🌿 ${fiche.phytotherapie.titre}`} color="#9a3412">
          {fiche.phytotherapie.plantes.map((plante, i) => (
            <div key={i} style={{
              background: "#fff7ed",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "12px",
              border: "1px solid #fed7aa",
            }}>
              <div style={{ fontWeight: "700", color: "#9a3412", marginBottom: "8px" }}>
                {plante.nom}
              </div>
              <div style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                <strong>Forme :</strong> {plante.forme}
              </div>
              <div style={{ fontSize: "0.9rem" }}>
                <strong>Posologie :</strong> {plante.posologie}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Précautions */}
      <Section title="⚠️ Précautions et contre-indications" color="#dc2626">
        <ul style={{ margin: 0, paddingLeft: "24px", lineHeight: "1.8" }}>
          {fiche.precautions.map((precaution, i) => (
            <li key={i} style={{ marginBottom: "8px" }}>{precaution}</li>
          ))}
        </ul>
      </Section>

      {/* Conseils */}
      <Section title="💡 Conseils hygiéno-diététiques" color="#0891b2">
        <ul style={{ margin: 0, paddingLeft: "24px", lineHeight: "1.8" }}>
          {fiche.conseils.map((conseil, i) => (
            <li key={i} style={{ marginBottom: "8px" }}>{conseil}</li>
          ))}
        </ul>
      </Section>

      {/* Disclaimer */}
      <div style={{
        marginTop: "40px",
        padding: "20px",
        background: "#fef3c7",
        border: "2px solid #fbbf24",
        borderRadius: "12px",
        fontSize: "0.9rem",
        color: "#92400e",
        lineHeight: "1.6",
      }}>
        <strong>⚕️ Avertissement médical :</strong> Les informations de cette fiche sont à titre informatif et éducatif uniquement. Elles ne remplacent pas un avis médical professionnel. Consultez toujours un professionnel de santé avant d'entreprendre un traitement, surtout en cas de symptômes graves, persistants ou chez les personnes vulnérables (femmes enceintes, enfants, personnes âgées).
      </div>

      {/* Back to list */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <Link
          href="/fiches"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            background: mainColor,
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Retour à la liste des fiches
        </Link>
      </div>
    </div>
  );
}

// Component Section helper
function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{
        fontSize: "1.5rem",
        marginBottom: "16px",
        color,
        borderBottom: `3px solid ${color}`,
        paddingBottom: "8px",
      }}>
        {title}
      </h2>
      <div style={{ color: "#374151" }}>
        {children}
      </div>
    </div>
  );
}
