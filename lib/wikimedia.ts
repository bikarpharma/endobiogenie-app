/**
 * Service Wikimedia Commons - Récupération d'images de plantes
 *
 * Utilise l'API Wikimedia Commons pour trouver des photos botaniques
 * basées sur le nom latin des plantes.
 */

const WIKIMEDIA_API = "https://commons.wikimedia.org/w/api.php";
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";

interface WikimediaImage {
  url: string;
  thumbUrl: string;
  title: string;
  author?: string;
  license?: string;
}

/**
 * Recherche une image sur Wikimedia Commons par nom latin
 */
export async function searchWikimediaImage(
  latinName: string
): Promise<WikimediaImage | null> {
  try {
    // Nettoyer le nom latin (enlever L., etc.)
    const cleanName = latinName
      .replace(/\s+L\.?\s*$/, "")
      .replace(/\s+\(.*\)/, "")
      .trim();

    // 1. D'abord essayer Wikipedia pour l'image principale de l'article
    const wikiImage = await getWikipediaMainImage(cleanName);
    if (wikiImage) return wikiImage;

    // 2. Sinon chercher sur Wikimedia Commons
    const commonsImage = await searchCommonsImage(cleanName);
    if (commonsImage) return commonsImage;

    return null;
  } catch (error) {
    console.error(`Erreur Wikimedia pour "${latinName}":`, error);
    return null;
  }
}

/**
 * Récupère l'image principale d'un article Wikipedia
 */
async function getWikipediaMainImage(
  searchTerm: string
): Promise<WikimediaImage | null> {
  try {
    // Rechercher l'article Wikipedia
    const searchUrl = new URL(WIKIPEDIA_API);
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");
    searchUrl.searchParams.set("titles", searchTerm);
    searchUrl.searchParams.set("prop", "pageimages|pageterms");
    searchUrl.searchParams.set("piprop", "original|thumbnail");
    searchUrl.searchParams.set("pithumbsize", "400");
    searchUrl.searchParams.set("redirects", "1");

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    const pages = data.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as {
      original?: { source: string };
      thumbnail?: { source: string };
      title?: string;
    };

    if (page.original?.source || page.thumbnail?.source) {
      return {
        url: page.original?.source || page.thumbnail?.source || "",
        thumbUrl: page.thumbnail?.source || page.original?.source || "",
        title: page.title || searchTerm,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Recherche une image sur Wikimedia Commons
 */
async function searchCommonsImage(
  searchTerm: string
): Promise<WikimediaImage | null> {
  try {
    const searchUrl = new URL(WIKIMEDIA_API);
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");
    searchUrl.searchParams.set("generator", "search");
    searchUrl.searchParams.set("gsrnamespace", "6"); // File namespace
    searchUrl.searchParams.set("gsrsearch", `${searchTerm} plant`);
    searchUrl.searchParams.set("gsrlimit", "5");
    searchUrl.searchParams.set("prop", "imageinfo");
    searchUrl.searchParams.set("iiprop", "url|extmetadata");
    searchUrl.searchParams.set("iiurlwidth", "400");

    const response = await fetch(searchUrl.toString());
    const data = await response.json();

    const pages = data.query?.pages;
    if (!pages) return null;

    // Trouver la première image valide (pas un SVG ou icône)
    for (const page of Object.values(pages) as Array<{
      title?: string;
      imageinfo?: Array<{
        url?: string;
        thumburl?: string;
        extmetadata?: {
          Artist?: { value?: string };
          LicenseShortName?: { value?: string };
        };
      }>;
    }>) {
      const info = page.imageinfo?.[0];
      if (!info?.url) continue;

      // Ignorer les SVG, icônes, logos
      const url = info.url.toLowerCase();
      if (url.endsWith(".svg") || url.includes("icon") || url.includes("logo")) {
        continue;
      }

      return {
        url: info.url,
        thumbUrl: info.thumburl || info.url,
        title: page.title || searchTerm,
        author: info.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, ""),
        license: info.extmetadata?.LicenseShortName?.value,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Génère une URL de placeholder si aucune image n'est trouvée
 */
export function getPlaceholderImage(latinName: string): string {
  // Utiliser une couleur basée sur le nom pour différencier
  const hash = latinName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;

  // Retourner une URL de placeholder avec les initiales
  const initials = latinName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="hsl(${hue}, 30%, 90%)"/>
      <text x="200" y="200" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial" font-size="120" fill="hsl(${hue}, 40%, 40%)">
        ${initials}
      </text>
      <text x="200" y="320" text-anchor="middle" font-family="Arial" font-size="24" fill="hsl(${hue}, 30%, 50%)">
        🌿
      </text>
    </svg>
  `)}`;
}

/**
 * Cache simple en mémoire pour éviter les appels répétés
 */
const imageCache = new Map<string, WikimediaImage | null>();

export async function getCachedPlantImage(
  latinName: string
): Promise<WikimediaImage | null> {
  if (imageCache.has(latinName)) {
    return imageCache.get(latinName) || null;
  }

  const image = await searchWikimediaImage(latinName);
  imageCache.set(latinName, image);
  return image;
}
