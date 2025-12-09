import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface UploadedFile {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  usedIn: Array<{ type: string; id: string; title: string }>;
}

export const AdminUploads: React.FC = () => {
  const { tenantId } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<"all" | "image" | "audio" | "video">("all");



  const loadFiles = React.useCallback(async () => {
    try {
      const res = await api.get(`/uploads?tenantId=${tenantId}`);
      setFiles(res.data);
    } catch {
      console.error("Erro ao carregar arquivos");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tenantId", tenantId || "");

    try {
      await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      loadFiles();
      alert("Arquivo enviado com sucesso!");
    } catch {
      alert("Erro ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, usedIn: UploadedFile["usedIn"]) => {
    if (usedIn.length > 0) {
      const confirm = window.confirm(
        `Este arquivo está sendo usado em ${usedIn.length} item(ns). Tem certeza que deseja excluir?`
      );
      if (!confirm) return;
    }

    try {
      await api.delete(`/uploads/${id}`);
      loadFiles();
    } catch {
      alert("Erro ao excluir arquivo");
    }
  };

  const filteredFiles = files.filter(f => {
    if (filter === "all") return true;
    return f.type.startsWith(filter);
  });

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 className="section-title">📤 Uploads</h1>
          <p className="section-subtitle">
            Gerencie todos os arquivos do museu
          </p>
        </div>
        <button
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={uploading}
          className="btn btn-primary"
        >
          {uploading ? "Enviando..." : "+ Novo Upload"}
        </button>
        <input
          id="file-upload"
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            Array.from(e.target.files || []).forEach(handleUpload);
            e.target.value = "";
          }}
        />
      </div>

      {/* Stats */}
      <div className="card-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-value">{files.length}</div>
          <div className="stat-label">Total de Arquivos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatSize(totalSize)}</div>
          <div className="stat-label">Espaço Usado</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{files.filter(f => f.type.startsWith("image")).length}</div>
          <div className="stat-label">Imagens</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "btn btn-primary" : "btn btn-secondary"}
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
          >
            Todos ({files.length})
          </button>
          <button
            onClick={() => setFilter("image")}
            className={filter === "image" ? "btn btn-primary" : "btn btn-secondary"}
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
          >
            Imagens ({files.filter(f => f.type.startsWith("image")).length})
          </button>
          <button
            onClick={() => setFilter("audio")}
            className={filter === "audio" ? "btn btn-primary" : "btn btn-secondary"}
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
          >
            Áudios ({files.filter(f => f.type.startsWith("audio")).length})
          </button>
          <button
            onClick={() => setFilter("video")}
            className={filter === "video" ? "btn btn-primary" : "btn btn-secondary"}
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
          >
            Vídeos ({files.filter(f => f.type.startsWith("video")).length})
          </button>
        </div>
      </div>

      {loading && <p>Carregando arquivos...</p>}

      {!loading && filteredFiles.length === 0 && (
        <div className="card">
          <p>Nenhum arquivo encontrado.</p>
        </div>
      )}

      {!loading && filteredFiles.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {filteredFiles.map((file) => (
            <div key={file.id} className="card" style={{ padding: "1rem" }}>
              {/* Preview */}
              <div
                style={{
                  width: "100%",
                  height: "150px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1rem",
                  background: file.type.startsWith("image")
                    ? `url(${file.url}) center/cover`
                    : "linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(42, 24, 16, 0.8))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  border: "1px solid var(--border-subtle)"
                }}
              >
                {!file.type.startsWith("image") && (
                  file.type.startsWith("audio") ? "🎵" :
                    file.type.startsWith("video") ? "🎬" : "📄"
                )}
              </div>

              {/* Info */}
              <div style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.25rem", wordBreak: "break-all" }}>
                  {file.filename}
                </div>
                <div style={{ color: "var(--fg-soft)", fontSize: "0.75rem" }}>
                  {formatSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Usado em */}
              {file.usedIn.length > 0 && (
                <div style={{ marginBottom: "0.75rem", fontSize: "0.75rem" }}>
                  <div style={{ color: "var(--fg-soft)", marginBottom: "0.25rem" }}>
                    Usado em:
                  </div>
                  {file.usedIn.map((usage, idx) => (
                    <div key={idx} className="badge" style={{ marginRight: "0.25rem", marginBottom: "0.25rem" }}>
                      {usage.type}: {usage.title}
                    </div>
                  ))}
                </div>
              )}

              {/* Ações */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: "0.8rem", textAlign: "center" }}
                >
                  Ver
                </a>
                <button
                  onClick={() => handleDelete(file.id, file.usedIn)}
                  className="btn"
                  style={{
                    padding: "0.5rem",
                    fontSize: "0.8rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "#ef4444",
                    border: "1px solid #ef4444"
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
