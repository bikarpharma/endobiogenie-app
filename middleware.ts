// ========================================
// MIDDLEWARE (EDGE OPTIMISÉ)
// ========================================
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config"; // <-- Import léger uniquement
import { NextResponse } from "next/server";

// On initialise une version "Edge" de NextAuth juste pour le middleware
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuth = !!req.auth; // true si connecté

  // --- DÉBUT SONDE DIAGNOSTIQUE MIDDLEWARE ---
  if (pathname.startsWith("/api/patients")) {
    console.log("🔍 MIDDLEWARE - API Patients appelé");
    console.log("- Path:", pathname);
    console.log("- Auth présente:", isAuth);
    console.log("- Session complète:", req.auth);
    console.log("- User ID:", req.auth?.user?.id);
  }
  // --- FIN SONDE DIAGNOSTIQUE ---

  // ===== ROUTES PUBLIQUES =====
  const publicPaths = ["/", "/login", "/register", "/api/auth"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // 1. Redirection Page privée -> Login
  if (!isPublic && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Redirection Login -> Dashboard
  if (pathname === "/login" && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. User ID dans les Headers API
  if (pathname.startsWith("/api/") && isAuth && req.auth?.user?.id) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", req.auth.user.id);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
});

// ===== CONFIGURATION STRICTE =====
export const config = {
  matcher: [
    /*
     * Match toutes les routes SAUF:
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico, fichiers .png
     * - api/auth/* (NextAuth routes publiques)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};