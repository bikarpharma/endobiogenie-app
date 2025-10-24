// ========================================
// PAGE D'INSCRIPTION - /register
// ========================================
// 📖 Explication simple :
// Cette page affiche un formulaire d'inscription (nom, email, password).
// Quand l'utilisateur clique sur "Créer mon compte" :
// 1. On envoie les données à /api/auth/register
// 2. Si OK, on redirige vers /login
// 3. Si erreur (email déjà utilisé), on affiche un message

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Envoyer les données au serveur
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }

      // Inscription réussie : rediriger vers la page de connexion
      router.push("/login?registered=true");
    } catch (e) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* En-tête */}
        <div className="auth-header">
          <span className="logo">🌿</span>
          <h1>Inscription</h1>
          <p>Créer votre compte</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={onSubmit} className="auth-form">
          {/* Message d'erreur */}
          {error && <div className="error-message">{error}</div>}

          {/* Champ Nom */}
          <div className="form-group">
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* Champ Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
              autoComplete="new-password"
            />
            <small>Minimum 6 caractères</small>
          </div>

          {/* Bouton de soumission */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        {/* Lien vers la connexion */}
        <div className="auth-footer">
          Déjà un compte ?{" "}
          <Link href="/login" className="link">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
