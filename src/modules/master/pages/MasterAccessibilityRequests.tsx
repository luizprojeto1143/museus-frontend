import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";

interface AccessRequest {
    id: string;
    type: string;
    status: string;
    notes: string;
    workId: string;
    work: { title: string; id: string };
    tenant: { name: string; slug: string };
    createdAt: string;
}

export const MasterAccessibilityRequests: React.FC = () => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Upload State
    const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [fileType, setFileType] = useState<"LIBRAS" | "AUDIO">("LIBRAS");

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const res = await api.get("/accessibility/master");
            setRequests(res.data);
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar solicitações");
        } finally {
            setLoading(false);
        }
    };

    const handleFulfill = async () => {
        if (!selectedRequest || !uploadFile) return;

        try {
            setUploading(true);

            // 1. Upload File
            const formData = new FormData();
            formData.append("file", uploadFile);
            const uploadRes = await api.post(`/upload/${fileType === "LIBRAS" ? "video" : "audio"}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const fileUrl = uploadRes.data.url;

            // 2. Fulfill Request
            await api.post(`/accessibility/${selectedRequest.id}/fulfill`, {
                fileUrl,
                fileType, // LIBRAS or AUDIO
                masterNotes: "Arquivo enviado pelo Master via Painel"
            });

            alert("Arquivo enviado e obra atualizada!");
            setSelectedRequest(null);
            setUploadFile(null);
            loadRequests(); // Refresh
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar arquivo");
        } finally {
            setUploading(false);
        }
    };

    const pendingRequests = requests.filter(r => r.status === "PENDING");
    const completedRequests = requests.filter(r => r.status === "COMPLETED");

    return (
        <div>
            <h1 className="section-title">Solicitações de Acessibilidade</h1>
            <p className="section-subtitle">Gerencie pedidos de Libras e Audiodescrição dos museus.</p>

            {loading ? (
                <p>Carregando...</p>
            ) : (
                <>
                    <div className="card mb-4" style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#d4af37" }}>Pendentes ({pendingRequests.length})</h2>

                        {pendingRequests.length === 0 ? (
                            <p style={{ color: "#9ca3af" }}>Nenhuma solicitação pendente.</p>
                        ) : (
                            <div className="responsive-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Museu</th>
                                            <th>Obra</th>
                                            <th>Tipo</th>
                                            <th>Obs</th>
                                            <th>Data</th>
                                            <th>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRequests.map(req => (
                                            <tr key={req.id}>
                                                <td>{req.tenant.name}</td>
                                                <td>{req.work.title}</td>
                                                <td>
                                                    <span className={`badge ${req.type === "LIBRAS" ? "badge-blue" : "badge-orange"}`}>
                                                        {req.type === "BOTH" ? "Libras + Áudio" : req.type}
                                                    </span>
                                                </td>
                                                <td style={{ maxWidth: "200px" }}>{req.notes || "-"}</td>
                                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => {
                                                            setSelectedRequest(req);
                                                            setFileType(req.type === "AUDIO_DESC" ? "AUDIO" : "LIBRAS");
                                                        }}
                                                    >
                                                        Atender
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Histórico</h2>
                        {/* Simple list of completed... */}
                        <p style={{ color: "#9ca3af" }}>{completedRequests.length} solicitações atendidas.</p>
                    </div>
                </>
            )}

            {/* Fulfill Modal */}
            {selectedRequest && (
                <div className="modal-overlay" style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "1.5rem" }}>
                        <h3 className="section-title" style={{ fontSize: "1.1rem" }}>
                            Atender Solicitação: {selectedRequest.work.title}
                        </h3>
                        <p style={{ marginBottom: "1rem", opacity: 0.8 }}>{selectedRequest.tenant.name}</p>

                        <div className="form-group">
                            <label>Tipo de Arquivo a Enviar</label>
                            <select
                                className="input"
                                value={fileType}
                                onChange={e => setFileType(e.target.value as any)}
                                style={{ width: "100%" }}
                            >
                                <option value="LIBRAS">Vídeo de Libras (.mp4)</option>
                                <option value="AUDIO">Audiodescrição (.mp3)</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginTop: "1rem" }}>
                            <label>Selecionar Arquivo</label>
                            <input
                                type="file"
                                className="input"
                                onChange={e => setUploadFile(e.target.files?.[0] || null)}
                                accept={fileType === "LIBRAS" ? "video/*" : "audio/*"}
                                style={{ width: "100%" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setSelectedRequest(null)}
                                disabled={uploading}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn"
                                onClick={handleFulfill}
                                disabled={!uploadFile || uploading}
                            >
                                {uploading ? "Enviando..." : "Enviar e Finalizar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
