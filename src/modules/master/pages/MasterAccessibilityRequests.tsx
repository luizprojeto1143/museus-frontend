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
    // Upload State
    const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
    const [librasFile, setLibrasFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0); // 0-100

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
        if (!selectedRequest) return;

        // Validation
        const needsLibras = selectedRequest.type === "LIBRAS" || selectedRequest.type === "BOTH";
        const needsAudio = selectedRequest.type === "AUDIO_DESC" || selectedRequest.type === "BOTH";

        if (needsLibras && !librasFile) return alert("Selecione o arquivo de Libras");
        if (needsAudio && !audioFile) return alert("Selecione o arquivo de Áudio");

        try {
            setUploading(true);
            setProgress(10);

            // Upload Helpers
            let uploadedLibrasUrl = "";
            let uploadedAudioUrl = "";

            // 1. Upload Libras if needed
            if (librasFile) {
                const formData = new FormData();
                formData.append("file", librasFile);

                const res = await api.post("/upload/video", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        const p = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                        // Map 0-100 to 10-50 range for first file or split progress
                        setProgress(needsAudio ? Math.round(p / 2) : p);
                    }
                });
                uploadedLibrasUrl = res.data.url;
            }

            // 2. Upload Audio if needed
            if (audioFile) {
                const formData = new FormData();
                formData.append("file", audioFile);

                const res = await api.post("/upload/audio", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        const p = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                        // Map to 50-100 range if both, or 0-100 if only audio
                        setProgress(needsLibras ? 50 + Math.round(p / 2) : p);
                    }
                });
                uploadedAudioUrl = res.data.url;
            }

            setProgress(95);

            // 3. Fulfill Request
            await api.post(`/accessibility/${selectedRequest.id}/fulfill`, {
                librasUrl: uploadedLibrasUrl,
                audioUrl: uploadedAudioUrl,
                masterNotes: "Arquivos enviados pelo Master via Painel"
            });

            setProgress(100);
            alert("Solicitação concluída com sucesso!");
            setSelectedRequest(null);
            setLibrasFile(null);
            setAudioFile(null);
            setProgress(0);
            loadRequests();
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar arquivos");
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
                                                            setLibrasFile(null);
                                                            setAudioFile(null);
                                                            setProgress(0);
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
                            Atender: {selectedRequest.work.title}
                        </h3>
                        <p style={{ marginBottom: "1rem", opacity: 0.8 }}>
                            {selectedRequest.tenant.name} • Solicitado: <strong>{selectedRequest.type === "BOTH" ? "Libras + Áudio" : selectedRequest.type}</strong>
                        </p>

                        {(selectedRequest.type === "LIBRAS" || selectedRequest.type === "BOTH") && (
                            <div className="form-group" style={{ marginBottom: "1rem" }}>
                                <label>Arquivo de Libras (.mp4)</label>
                                <input
                                    type="file"
                                    className="input"
                                    accept="video/*"
                                    onChange={e => setLibrasFile(e.target.files?.[0] || null)}
                                    style={{ width: "100%" }}
                                />
                                {librasFile && <small style={{ color: "#4ade80" }}>✓ Selecionado: {librasFile.name}</small>}
                            </div>
                        )}

                        {(selectedRequest.type === "AUDIO_DESC" || selectedRequest.type === "BOTH") && (
                            <div className="form-group" style={{ marginBottom: "1rem" }}>
                                <label>Arquivo de Áudio (.mp3)</label>
                                <input
                                    type="file"
                                    className="input"
                                    accept="audio/*"
                                    onChange={e => setAudioFile(e.target.files?.[0] || null)}
                                    style={{ width: "100%" }}
                                />
                                {audioFile && <small style={{ color: "#4ade80" }}>✓ Selecionado: {audioFile.name}</small>}
                            </div>
                        )}

                        {uploading && (
                            <div style={{ marginTop: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span>Enviando...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div style={{ width: "100%", height: "8px", backgroundColor: "#374151", borderRadius: "4px", overflow: "hidden" }}>
                                    <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#d4af37", transition: "width 0.3s ease" }}></div>
                                </div>
                            </div>
                        )}

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
                                disabled={uploading || (selectedRequest.type === "BOTH" && (!librasFile || !audioFile)) || (selectedRequest.type === "LIBRAS" && !librasFile) || (selectedRequest.type === "AUDIO_DESC" && !audioFile)}
                            >
                                {uploading ? "Processando..." : "Concluir Solicitação"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
