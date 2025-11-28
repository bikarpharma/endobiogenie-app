"use client";
// ========================================
// COMPOSANT - Image de plante avec Wikimedia Commons
// ========================================
import { useState, useEffect } from "react";
import Image from "next/image";

interface PlantImageProps {
  latinName: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

interface WikimediaImage {
  url: string;
  thumbUrl: string;
  title: string;
}

// Dimensions selon la taille
const SIZES = {
  small: { width: 60, height: 60 },
  medium: { width: 120, height: 120 },
  large: { width: 400, height: 300 },
};

/**
 * Génère un placeholder SVG coloré basé sur le nom
 */
function getPlaceholderSvg(latinName: string, size: "small" | "medium" | "large"): string {
  const hash = latinName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const { width, height } = SIZES[size];

  const initials = latinName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const fontSize = size === "small" ? 20 : size === "medium" ? 40 : 80;

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="hsl(${hue}, 35%, 92%)"/>
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" dominant-baseline="middle"
            font-family="Georgia, serif" font-size="${fontSize}" fill="hsl(${hue}, 45%, 35%)" font-style="italic">
        ${initials}
      </text>
    </svg>
  `)}`;
}

export function PlantImage({ latinName, size = "medium", className }: PlantImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { width, height } = SIZES[size];

  useEffect(() => {
    let cancelled = false;

    async function fetchImage() {
      try {
        setLoading(true);
        setError(false);

        // Appel API pour récupérer l'image
        const res = await fetch(`/api/phytodex/image?latinName=${encodeURIComponent(latinName)}`);

        if (!res.ok) {
          throw new Error("Image non trouvée");
        }

        const data: WikimediaImage = await res.json();

        if (!cancelled && data.thumbUrl) {
          setImageUrl(data.thumbUrl);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchImage();

    return () => {
      cancelled = true;
    };
  }, [latinName]);

  const containerStyle: React.CSSProperties = {
    width,
    height,
    borderRadius: size === "small" ? "8px" : size === "medium" ? "12px" : "16px",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#f3f4f6",
    flexShrink: 0,
  };

  // Loading state
  if (loading) {
    return (
      <div style={containerStyle} className={className}>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  // Error ou pas d'image → placeholder
  if (error || !imageUrl) {
    return (
      <div style={containerStyle} className={className}>
        <Image
          src={getPlaceholderSvg(latinName, size)}
          alt={latinName}
          width={width}
          height={height}
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }

  // Image trouvée
  return (
    <div style={containerStyle} className={className}>
      <Image
        src={imageUrl}
        alt={latinName}
        width={width}
        height={height}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
        onError={() => setError(true)}
        unoptimized // Pour les URLs externes Wikimedia
      />
    </div>
  );
}

/**
 * Version simple pour le header de la page détail
 */
export function PlantImageHeader({ latinName, vernacularName }: { latinName: string; vernacularName?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchImage() {
      try {
        const res = await fetch(`/api/phytodex/image?latinName=${encodeURIComponent(latinName)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.url) {
            setImageUrl(data.url);
          }
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchImage();
    return () => { cancelled = true; };
  }, [latinName]);

  const hash = latinName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;

  return (
    <div
      style={{
        position: "relative",
        height: "280px",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "24px",
        background: imageUrl
          ? `url(${imageUrl}) center/cover`
          : `linear-gradient(135deg, hsl(${hue}, 40%, 85%), hsl(${hue}, 50%, 75%))`,
      }}
    >
      {/* Overlay gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Loading shimmer */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite",
          }}
        />
      )}

      {/* Texte */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "24px",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            marginBottom: "4px",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          <em>{latinName}</em>
        </h1>
        {vernacularName && (
          <p
            style={{
              fontSize: "1.2rem",
              opacity: 0.9,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            {vernacularName}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
