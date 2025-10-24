// ========================================
// COMPOSANT FILE UPLOADER
// ========================================
// 📖 Explication simple :
// Composant d'upload de fichiers avec drag & drop

"use client";

import { useState } from "react";

type FileUploaderProps = {
  vectorStoreId: string;
  onFileUploaded: () => void;
};

export function FileUploader({ vectorStoreId, onFileUploaded }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

  async function handleUpload(file: File) {
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".md")) {
      setError("Type de fichier non supporté. Utilisez PDF, TXT, MD ou DOCX.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/vector-stores/${vectorStoreId}/files`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur d'upload");
      }

      setSuccess(`✅ Fichier "${file.name}" uploadé avec succès !`);
      onFileUploaded();

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input
    e.target.value = "";
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }

  return (
    <div>
      {error && (
        <div className="error-message" style={{ marginBottom: "12px" }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ marginBottom: "12px" }}>
          {success}
        </div>
      )}

      <div
        className={`upload-zone ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div>
            <div className="spinner"></div>
            <p>Upload en cours...</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📁</div>
            <p>
              <strong>Glissez-déposez un fichier ici</strong>
            </p>
            <p className="muted" style={{ fontSize: "14px", marginTop: "8px" }}>
              ou
            </p>
            <label className="btn btn-primary" style={{ marginTop: "12px", cursor: "pointer" }}>
              Choisir un fichier
              <input
                type="file"
                onChange={handleFileInput}
                accept=".pdf,.txt,.md,.docx"
                style={{ display: "none" }}
                disabled={uploading}
              />
            </label>
            <p className="muted" style={{ fontSize: "12px", marginTop: "12px" }}>
              Formats acceptés : PDF, TXT, MD, DOCX
            </p>
          </>
        )}
      </div>
    </div>
  );
}
