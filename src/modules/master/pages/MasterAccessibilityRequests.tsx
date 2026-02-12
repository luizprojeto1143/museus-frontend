import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { Accessibility, Upload, CheckCircle, Clock, Video, FileAudio, AlertCircle, X } from "lucide-react";
import "./MasterShared.css";

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
            alert(t("master.accessibility.errorLoad"));
        } finally {
            setLoading(false);
        }
    };

    const handleFulfill = async () => {
        if (!selectedRequest) return;

        // Validation
        const needsLibras = selectedRequest.type === "LIBRAS" || selectedRequest.type === "BOTH";
        const needsAudio = selectedRequest.type === "AUDIO_DESC" || selectedRequest.type === "BOTH";

        if (needsLibras && !librasFile) return alert(t("master.accessibility.uploadCheckLibras"));
        if (needsAudio && !audioFile) return alert(t("master.accessibility.uploadCheckAudio"));

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
            alert(t("master.accessibility.success"));
            setSelectedRequest(null);
            setLibrasFile(null);
            setAudioFile(null);
            setProgress(0);
            loadRequests();
        } catch (error) {
            console.error(error);
            alert(t("master.accessibility.errorSubmit"));
        } finally {
            setUploading(false);
        }
    };

    const pendingRequests = requests.filter(r => r.status === "PENDING");
    const completedRequests = requests.filter(r => r.status === "COMPLETED");

    return (
        <div className="master-page-container">
            {/* HERO SECTION */}
            <section className="master-hero">
                <div className="master-hero-content">
                    <span className="master-badge">
                        ♿ Acessibilidade
                    </span>
                    <h1 className="master-title">
                        Solicitações de Acessibilidade
                    </h1>
                    <p className="master-subtitle">
                        Gerencie pedidos de Libras e Audiodescrição dos museus e envie os arquivos processados.
                    </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Accessibility size={24} color="#facc15" />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{pendingRequests.length}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendentes</div>
                    </div>
                </div>
            </section>

            {loading ? (
                <div className="master-card" style={{ textAlign: "center", padding: "4rem" }}>
                    <p style={{ color: "#94a3b8" }}>{t("common.loading")}</p>
                </div>
            ) : (
                <>
                    {/* PENDING REQUESTS */}
                    <div className="master-card" style={{ marginBottom: "2rem" }}>
                        <div className="master-card-header">
                            <div className="master-icon-wrapper master-icon-yellow">
                                <Clock size={24} />
                            </div>
                            <h3>Solicitações Pendentes ({pendingRequests.length})</h3>
                        </div>

                        {pendingRequests.length === 0 ? (
                            <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                                <CheckCircle size={48} style={{ margin: "0 auto 1rem auto", color: "#22c55e", opacity: 0.5 }} />
                                <p>Nenhuma solicitação pendente.</p>
                            </div>
                        ) : (
                            <div className="master-table-container">
                                <table className="master-table">
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
                                                    <span className="master-badge" style={{
                                                        background: req.type === "LIBRAS" ? "rgba(59, 130, 246, 0.2)" : "rgba(249, 115, 22, 0.2)",
                                                        color: req.type === "LIBRAS" ? "#60a5fa" : "#fb923c",
                                                        border: "none"
                                                    }}>
                                                        {req.type === "BOTH" ? "Libras + Áudio" : req.type}
                                                    </span>
                                                </td>
                                                <td style={{ maxWidth: "200px", color: "#94a3b8", fontSize: "0.9rem" }}>{req.notes || "-"}</td>
                                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="master-btn btn-primary"
                                                        style={{ padding: '0.5rem 1rem', width: 'auto', fontSize: '0.85rem' }}
                                                        onClick={() => {
                                                            setSelectedRequest(req);
                                                            setLibrasFile(null);
                                                            setAudioFile(null);
                                                            setProgress(0);
                                                        }}
                                                    >
                                                        <Upload size={14} />
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

                    {/* HISTORY (Collapsed or Simplified) */}
                    <div className="master-card">
                        <div className="master-card-header">
                            <div className="master-icon-wrapper master-icon-blue">
                                <CheckCircle size={24} />
                            </div>
                            <h3>Histórico de Atendimentos</h3>
                        </div>
                        <div style={{ padding: "1rem", color: "#94a3b8" }}>
                            <p>{completedRequests.length} solicitações já foram atendidas.</p>
                        </div>
                    </div>
                </>
            )}



            // ... (rest of imports and component setup)

            {/* FULFILL MODAL */}
            {selectedRequest && (
                <div style={{
                    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
                    padding: "1rem"
                }}>
                    <div className="master-card" style={{ width: "100%", maxWidth: "900px", margin: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: "1.25rem", color: '#fff', marginBottom: '0.5rem' }}>
                                    Atender Solicitação
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
                                    {selectedRequest.tenant.name} • {selectedRequest.work.title}
                                </p>
                            </div>
                            <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', overflow: 'hidden', height: '100%' }}>
                            {/* LEFT COLUMN: WORK CONTEXT */}
                            <div style={{ flex: 1, padding: '1.5rem', borderRight: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto' }}>
                                <h4 style={{ color: '#fbbf24', fontSize: '0.9rem', uppercase: true, fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={14} /> CONTEXTO DA OBRA
                                </h4>

                                {selectedRequest.work.imageUrl && (
                                    <img
                                        src={selectedRequest.work.imageUrl}
                                        alt={selectedRequest.work.title}
                                        style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', objectFit: 'cover', maxHeight: '200px' }}
                                    />
                                )}

                                {selectedRequest.work.audioUrl && (
                                    <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Áudio Guia Original:</p>
                                        <audio controls src={selectedRequest.work.audioUrl} style={{ width: '100%', height: '32px' }} />
                                    </div>
                                )}

                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Descrição:</p>
                                    <p style={{ fontSize: '0.9rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                        {selectedRequest.work.description || "Sem descrição disponível."}
                                    </p>
                                </div>

                                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Notas do Solicitante:</p>
                                    <blockquote style={{ borderLeft: '3px solid #64748b', margin: 0, paddingLeft: '1rem', fontSize: '0.9rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                                        "{selectedRequest.notes || "Sem observações."}"
                                    </blockquote>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: FULFILLMENT FORM */}
                            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="master-badge" style={{ alignSelf: 'flex-start', margin: 0 }}>
                                    SOLICITADO: {selectedRequest.type === "BOTH" ? "LIBRAS + AUDIODESCRIÇÃO" : selectedRequest.type}
                                </div>

                                {(selectedRequest.type === "LIBRAS" || selectedRequest.type === "BOTH") && (
                                    <div className="master-input-group">
                                        <label>Arquivo de Libras (.mp4)</label>
                                        <div style={{
                                            border: '2px dashed #334155',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            transition: 'all 0.2s',
                                            background: librasFile ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                            borderColor: librasFile ? '#22c55e' : '#334155'
                                        }}>
                                            <input
                                                type="file"
                                                id="libras-upload"
                                                accept="video/*"
                                                onChange={e => setLibrasFile(e.target.files?.[0] || null)}
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="libras-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                <Video size={32} color={librasFile ? "#4ade80" : "#94a3b8"} />
                                                {librasFile ? (
                                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>{librasFile.name}</span>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>Clique para selecionar vídeo</span>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {(selectedRequest.type === "AUDIO_DESC" || selectedRequest.type === "BOTH") && (
                                    <div className="master-input-group">
                                        <label>Arquivo de Áudio (.mp3)</label>
                                        <div style={{
                                            border: '2px dashed #334155',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            transition: 'all 0.2s',
                                            background: audioFile ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                            borderColor: audioFile ? '#22c55e' : '#334155'
                                        }}>
                                            <input
                                                type="file"
                                                id="audio-upload"
                                                accept="audio/*"
                                                onChange={e => setAudioFile(e.target.files?.[0] || null)}
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="audio-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                                <FileAudio size={32} color={audioFile ? "#4ade80" : "#94a3b8"} />
                                                {audioFile ? (
                                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>{audioFile.name}</span>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>Clique para selecionar áudio</span>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {uploading && (
                                    <div style={{ marginTop: "1rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: '0.9rem', color: '#cbd5e1' }}>
                                            <span>Enviando arquivos...</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div style={{ width: "100%", height: "6px", backgroundColor: "#334155", borderRadius: "3px", overflow: "hidden" }}>
                                            <div style={{ width: `${progress}%`, height: "100%", backgroundColor: "#3b82f6", transition: "width 0.3s ease" }}></div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "1rem", marginTop: "auto", justifyContent: "flex-end", paddingTop: '2rem' }}>
                                    <button
                                        className="master-btn btn-secondary"
                                        onClick={() => setSelectedRequest(null)}
                                        disabled={uploading}
                                        style={{ width: 'auto', border: '1px solid #334155', color: '#94a3b8' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="master-btn btn-primary"
                                        onClick={handleFulfill}
                                        disabled={uploading || (selectedRequest.type === "BOTH" && (!librasFile || !audioFile)) || (selectedRequest.type === "LIBRAS" && !librasFile) || (selectedRequest.type === "AUDIO_DESC" && !audioFile)}
                                        style={{ width: 'auto' }}
                                    >
                                        {uploading ? "Processando..." : "Concluir Solicitação"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
