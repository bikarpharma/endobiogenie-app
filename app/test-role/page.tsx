// Page de test pour vérifier le rôle de l'utilisateur
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TestRolePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ padding: "40px", fontFamily: "monospace" }}>
      <h1>🔍 Test du Rôle Utilisateur</h1>

      <div style={{
        background: "#f0f0f0",
        padding: "20px",
        borderRadius: "8px",
        marginTop: "20px"
      }}>
        <h2>Informations de session :</h2>
        <p><strong>Email :</strong> {session.user.email}</p>
        <p><strong>ID :</strong> {session.user.id}</p>
        <p><strong>Rôle actuel :</strong> <span style={{
          fontSize: "24px",
          color: session.user.role === "ADMIN" ? "green" : "red"
        }}>{session.user.role}</span></p>
      </div>

      {session.user.role === "ADMIN" ? (
        <div style={{
          marginTop: "20px",
          padding: "20px",
          background: "#d4edda",
          borderRadius: "8px"
        }}>
          ✅ <strong>Vous êtes ADMIN !</strong> Le lien Admin devrait être visible.
        </div>
      ) : (
        <div style={{
          marginTop: "20px",
          padding: "20px",
          background: "#f8d7da",
          borderRadius: "8px"
        }}>
          ❌ <strong>Vous êtes USER.</strong> Le rôle n'a pas été mis à jour correctement.
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <a href="/" style={{
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px"
        }}>
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}
