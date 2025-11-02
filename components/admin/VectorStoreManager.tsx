// ========================================
// COMPOSANT VECTOR STORE MANAGER
// ========================================
// 📖 Explication simple :
// Interface complète pour gérer les Vector Stores et les fichiers

"use client";

import { useEffect, useState } from "react";
import { FileUploader } from "./FileUploader";

type VectorStore = {
  id: string;
  name: string;
  file_counts: {
    total: number;
  };
  created_at: number;
};

type VectorStoreFile = {
  id: string;
  vector_store_id: string;
  created_at: number;
  status: string;
};

export function VectorStoreManager() {
  const [vectorStores, setVectorStores] = useState<VectorStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [files, setFiles] = useState<VectorStoreFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [error, setError] = useState("");

  // Charger la liste des Vector Stores
  useEffect(() => {
    loadVectorStores();
  }, []);

  // Charger les fichiers quand un Vector Store est sélectionné
  useEffect(() => {
    if (selectedStore) {
      loadFiles(selectedStore);
    }
  }, [selectedStore]);

  async function loadVectorStores() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/vector-stores");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de chargement");
      }

      setVectorStores(data.vectorStores || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadFiles(vectorStoreId: string) {
    try {
      const res = await fetch(`/api/admin/vector-stores/${vectorStoreId}/files`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setFiles(data.files || []);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function createVectorStore() {
    if (!newStoreName.trim()) return;

    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/vector-stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStoreName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setNewStoreName("");
      await loadVectorStores();
      setSelectedStore(data.vectorStore.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function deleteFile(fileId: string) {
    if (!selectedStore) return;
    if (!confirm("Voulez-vous vraiment supprimer ce fichier ?")) return;

    try {
      const res = await fetch(
        `/api/admin/vector-stores/${selectedStore}/files/${fileId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      // Recharger la liste
      await loadFiles(selectedStore);
      await loadVectorStores();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function handleFileUploaded() {
    if (selectedStore) {
      loadFiles(selectedStore);
      loadVectorStores();
    }
  }

  return (
    <div className="admin-content">
      {error && (
        <div className="error-message" style={{ marginBottom: "20px" }}>
          ❌ {error}
        </div>
      )}

      {/* Section: Créer un nouveau Vector Store */}
      <div className="admin-section">
        <h2>📦 Créer une nouvelle collection</h2>
        <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
          <input
            type="text"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            placeholder="Nom de la collection (ex: Articles 2025)"
            className="admin-input"
            disabled={creating}
          />
          <button
            onClick={createVectorStore}
            disabled={creating || !newStoreName.trim()}
            className="btn btn-primary"
          >
            {creating ? "Création..." : "Créer"}
          </button>
        </div>
      </div>

      {/* Section: Liste des Vector Stores */}
      <div className="admin-section">
        <h2>📚 Collections existantes ({vectorStores.length})</h2>
        {loading ? (
          <p className="muted">Chargement...</p>
        ) : vectorStores.length === 0 ? (
          <p className="muted">Aucune collection. Créez-en une ci-dessus.</p>
        ) : (
          <div className="vector-store-list">
            {vectorStores.map((store) => (
              <div
                key={store.id}
                className={`vector-store-card ${
                  selectedStore === store.id ? "selected" : ""
                }`}
                onClick={() => setSelectedStore(store.id)}
              >
                <div>
                  <strong>{store.name}</strong>
                  <div className="muted" style={{ fontSize: "12px" }}>
                    ID: {store.id}
                  </div>
                </div>
                <div className="badge-count">
                  {store.file_counts.total} fichier
                  {store.file_counts.total > 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section: Détails d'un Vector Store sélectionné */}
      {selectedStore && (
        <>
          <div className="admin-section">
            <h2>📤 Uploader un document</h2>
            <FileUploader
              vectorStoreId={selectedStore}
              onFileUploaded={handleFileUploaded}
            />
          </div>

          <div className="admin-section">
            <h2>📄 Fichiers ({files.length})</h2>
            {files.length === 0 ? (
              <p className="muted">Aucun fichier dans cette collection.</p>
            ) : (
              <div className="file-list">
                {files.map((file) => (
                  <div key={file.id} className="file-item">
                    <div>
                      <span className="file-id">{file.id}</span>
                      <div className="muted" style={{ fontSize: "12px" }}>
                        Status: {file.status}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="btn btn-ghost btn-sm"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
