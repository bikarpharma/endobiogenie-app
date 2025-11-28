/**
 * API Route - Récupération image Wikimedia par nom latin
 * GET /api/phytodex/image?latinName=...
 */
import { NextRequest, NextResponse } from "next/server";
import { searchWikimediaImage, getPlaceholderImage } from "@/lib/wikimedia";

// Cache en mémoire pour éviter les appels répétés
const imageCache = new Map<string, { url: string; thumbUrl: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 heure

export async function GET(req: NextRequest) {
  try {
    const latinName = req.nextUrl.searchParams.get("latinName");

    if (!latinName) {
      return NextResponse.json({ error: "latinName requis" }, { status: 400 });
    }

    // Vérifier le cache
    const cached = imageCache.get(latinName);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        url: cached.url,
        thumbUrl: cached.thumbUrl,
        cached: true,
      });
    }

    // Chercher sur Wikimedia
    const image = await searchWikimediaImage(latinName);

    if (image) {
      // Mettre en cache
      imageCache.set(latinName, {
        url: image.url,
        thumbUrl: image.thumbUrl,
        timestamp: Date.now(),
      });

      return NextResponse.json({
        url: image.url,
        thumbUrl: image.thumbUrl,
        title: image.title,
        cached: false,
      });
    }

    // Retourner un placeholder
    const placeholder = getPlaceholderImage(latinName);
    return NextResponse.json({
      url: placeholder,
      thumbUrl: placeholder,
      isPlaceholder: true,
    });
  } catch (error) {
    console.error("Erreur récupération image:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
