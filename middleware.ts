// ========================================
// MIDDLEWARE - Protection des routes
// ========================================
// 📖 Explication simple :
// Ce fichier s'exécute AVANT chaque requête.
// Il vérifie :
// 1. Si l'utilisateur est connecté (session)
// 2. Si la page demandée est publique ou privée
// 3. Si non connecté sur page privée → rediriger vers /login
// 4. Si connecté sur /login → rediriger vers /dashboard

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuth = !!req.auth; // true si connecté, false sinon

  // ===== ROUTES PUBLIQUES =====
  // Ces pages sont accessibles sans connexion
  const publicPaths = ["/", "/login", "/register", "/api/auth"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // ===== REDIRECTION 1 : Page privée + non connecté =====
  // Si on essaie d'accéder à /dashboard sans être connecté
  if (!isPublic && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ===== REDIRECTION 2 : Page /login + déjà connecté =====
  // Si on est déjà connecté et qu'on va sur /login, rediriger vers /dashboard
  if (pathname === "/login" && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ===== AJOUTER L'USER ID AUX HEADERS API =====
  // Pour les routes API, ajouter l'userId dans les headers
  if (pathname.startsWith("/api/") && isAuth && req.auth?.user?.id) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", req.auth.user.id);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Sinon, laisser passer
  return NextResponse.next();
});

// ===== CONFIGURATION OPTIMISÉE =====
export const config = {
  // On ignore tout ce qui est statique, image, favicon, mais aussi les fichiers publics courants
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
