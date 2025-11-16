// ========================================
// PAGE DE CONNEXION - /login
// ========================================
// 📖 Explication simple :
// Cette page affiche un formulaire de connexion (email + password).
// Quand l'utilisateur clique sur "Se connecter" :
// 1. On envoie les données à NextAuth
// 2. Si OK, on redirige vers /dashboard
// 3. Si erreur, on affiche un message

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // Empêcher le rechargement de la page
    setError("");
    setLoading(true);

    try {
      // Appeler NextAuth pour se connecter
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // On gère la redirection nous-mêmes
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      // Connexion réussie : rediriger vers le dashboard
      router.push("/dashboard");
      router.refresh(); // Recharger les données de session
    } catch (e) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* En-tête */}
        <div className="auth-header">
          <Image src="/integria-logo.jpg" alt="IntergIA" width={80} height={80} style={{ borderRadius: "12px", marginBottom: "16px" }} />
          <h1>Connexion</h1>
          <p>IntergIA</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={onSubmit} className="auth-form">
          {/* Message d'erreur */}
          {error && <div className="error-message">{error}</div>}

          {/* Champ Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Champ Mot de passe */}
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          {/* Bouton de soumission */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Lien vers l'inscription */}
        <div className="auth-footer">
          Pas encore de compte ?{" "}
          <Link href="/register" className="link">
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
