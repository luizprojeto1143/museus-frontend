import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

export const VisualScannerPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(t("visitor.visualScanner.loadingModel", "Carregando modelo de IA..."));
    const [classifier, setClassifier] = useState<knnClassifier.KNNClassifier | null>(null);
    const [net, setNet] = useState<mobilenet.MobileNet | null>(null);
    const [scanning, setScanning] = useState(false);
    const [match, setMatch] = useState<{ label: string; conf: number } | null>(null);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                if (!tenantId) return;


                const loadedNet = await mobilenet.load();
                const loadedClassifier = knnClassifier.create();

                if (isMounted) {
                    setNet(loadedNet);
                    setClassifier(loadedClassifier);
                    setStatus(t("visitor.visualScanner.loadingWorks", "Carregando modelo treinado..."));
                }

                // Load trained model from localStorage
                const savedModel = localStorage.getItem(`scanner_model_${tenantId}`);
                if (savedModel) {
                    try {
                        const datasetObj = JSON.parse(savedModel);
                        const dataset: Record<string, tf.Tensor2D> = {};
                        Object.keys(datasetObj).forEach((key) => {
                            dataset[key] = tf.tensor(datasetObj[key], [datasetObj[key].length / 1024, 1024]);
                        });
                        loadedClassifier.setClassifierDataset(dataset);

                    } catch (e) {
                        console.error("Erro ao carregar modelo", e);
                    }
                } else {

                    if (isMounted) setStatus("Nenhum modelo treinado encontrado. O scanner pode não funcionar.");
                }

                if (isMounted) {
                    setLoading(false);
                    setStatus("");
                }

            } catch (err) {
                console.error("Error initializing scanner:", err);
                if (isMounted) {
                    setStatus(t("common.error", "Erro ao inicializar scanner"));
                    setLoading(false);
                }
            }
        };

        init();

        return () => {
            isMounted = false;
        };
    }, [tenantId, t]);

    const startCamera = async () => {
        if (videoRef.current) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setScanning(true);
                // Start loop
                requestAnimationFrame(scanLoop);
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert(t("visitor.scan.permission", "Precisamos de permissão para acessar a câmera"));
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setScanning(false);
        }
    };

    const scanLoop = async () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) {
            if (scanning) requestAnimationFrame(scanLoop);
            return;
        }

        // Check if we have a classifier with examples
        if (classifier && classifier.getNumClasses() > 0 && net) {
            try {
                const activation = net.infer(videoRef.current, true);
                const result = await classifier.predictClass(activation);

                const confidence = result.confidences[result.label] || 0;
                if (confidence > 0.8) { // 80% confidence threshold
                    setMatch({ label: result.label, conf: confidence });
                } else {
                    setMatch(null);
                }
                activation.dispose(); // Important: dispose tensor to avoid memory leak
            } catch (e) {
                console.error("Error predicting", e);
            }
        }

        if (scanning) requestAnimationFrame(scanLoop);
    };

    const [worksMap, setWorksMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if (tenantId) {
            api.get("/works", { params: { tenantId, limit: 100 } }) // Fetch top 100 for scanner mapping
                .then(res => {
                    const list = res.data.data || [];
                    const mapping: Record<string, string> = {};
                    list.forEach((w: { id: string; title: string }) => {
                        mapping[w.id] = w.title;
                    });
                    setWorksMap(mapping);
                })
                .catch(console.error);
        }

        return () => stopCamera();
    }, [tenantId]);

    if (!tenantId) return <div style={{ padding: "2rem", textAlign: "center" }}>Selecione um museu.</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "black", color: "white" }}>
            <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                <video
                    ref={videoRef}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    playsInline
                    muted
                />

                {!scanning && !loading && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.8)", zIndex: 10 }}>
                        <div style={{ textAlign: "center", padding: "1.5rem" }}>
                            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📷</div>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{t("visitor.visualScanner.title", "Scanner de Obras (IA)")}</h2>
                            <p style={{ color: "#9ca3af", marginBottom: "1.5rem" }}>{t("visitor.visualScanner.instruction", "A IA identificará a obra automaticamente (Requer treinamento)")}</p>
                            <button
                                onClick={startCamera}
                                style={{ backgroundColor: "white", color: "black", padding: "0.75rem 2rem", borderRadius: "9999px", fontWeight: "bold", cursor: "pointer", border: "none" }}
                            >
                                {t("visitor.visualScanner.startCamera", "Iniciar Câmera")}
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "black", zIndex: 20, flexDirection: "column" }}>
                        <div className="spinner" style={{ width: "50px", height: "50px", border: "4px solid #333", borderTopColor: "white", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "1rem" }}></div>
                        <p style={{ color: "white" }}>{status}</p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {match && (
                    <div style={{ position: "absolute", bottom: "2.5rem", left: "1rem", right: "1rem", backgroundColor: "white", color: "black", padding: "1rem", borderRadius: "0.75rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
                        <h3 style={{ fontWeight: "bold", fontSize: "1.125rem" }}>{worksMap[match.label] || "Obra Detectada"}</h3>
                        <p style={{ fontSize: "0.75rem", color: "#999" }}>ID: {match.label}</p>
                        <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>Confiança: {(match.conf * 100).toFixed(0)}%</p>
                        <button
                            onClick={() => navigate(`/obras/${match.label}`)} // Assuming label is ID
                            style={{ marginTop: "0.5rem", width: "100%", backgroundColor: "#2563eb", color: "white", padding: "0.5rem", borderRadius: "0.5rem", fontWeight: "500", border: "none", cursor: "pointer" }}
                        >
                            {t("visitor.visualScanner.viewDetails", "Ver Detalhes")}
                        </button>
                    </div>
                )}
            </div>

            <div style={{ padding: "1rem", backgroundColor: "black", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={() => navigate(-1)} style={{ color: "white", padding: "0.5rem", background: "transparent", border: "none", cursor: "pointer" }}>
                    {t("common.back", "Voltar")}
                </button>
                {scanning && (
                    <button onClick={stopCamera} style={{ color: "#ef4444", fontWeight: "bold", padding: "0.5rem", background: "transparent", border: "none", cursor: "pointer" }}>
                        {t("visitor.visualScanner.stopCamera", "Parar")}
                    </button>
                )}
            </div>
        </div>
    );
};
