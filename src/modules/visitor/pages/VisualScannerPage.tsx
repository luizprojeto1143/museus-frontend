import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Camera, ArrowLeft, StopCircle } from "lucide-react";
import "./VisualScanner.css";

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

        if (classifier && classifier.getNumClasses() > 0 && net) {
            try {
                const activation = net.infer(videoRef.current, true);
                const result = await classifier.predictClass(activation);

                const confidence = result.confidences[result.label] || 0;
                if (confidence > 0.8) {
                    setMatch({ label: result.label, conf: confidence });
                } else {
                    setMatch(null);
                }
                activation.dispose();
            } catch (e) {
                console.error("Error predicting", e);
            }
        }

        if (scanning) requestAnimationFrame(scanLoop);
    };

    const [worksMap, setWorksMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if (tenantId) {
            api.get("/works", { params: { tenantId, limit: 100 } })
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

    if (!tenantId) return <div className="visual-scanner-no-tenant">Selecione um museu.</div>;

    return (
        <div className="visual-scanner-container">
            <div className="visual-scanner-video-area">
                <video
                    ref={videoRef}
                    className="visual-scanner-video"
                    playsInline
                    muted
                />

                {!scanning && !loading && (
                    <div className="visual-scanner-start-overlay">
                        <div className="visual-scanner-start-content">
                            <div className="visual-scanner-start-icon">🤖</div>
                            <h2 className="visual-scanner-start-title">{t("visitor.visualScanner.title", "Scanner de Obras (IA)")}</h2>
                            <p className="visual-scanner-start-instruction">{t("visitor.visualScanner.instruction", "A IA identificará a obra automaticamente (Requer treinamento)")}</p>
                            <button onClick={startCamera} className="visual-scanner-start-btn">
                                <Camera size={22} />
                                {t("visitor.visualScanner.startCamera", "Iniciar Câmera")}
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="visual-scanner-loading-overlay">
                        <div className="visual-scanner-spinner"></div>
                        <p className="visual-scanner-loading-text">{status}</p>
                    </div>
                )}

                {match && (
                    <div className="visual-scanner-match-card">
                        <h3 className="visual-scanner-match-title">{worksMap[match.label] || "Obra Detectada"}</h3>
                        <p className="visual-scanner-match-id">ID: {match.label}</p>
                        <p className="visual-scanner-match-confidence">
                            Confiança: <span className="visual-scanner-confidence-value">{(match.conf * 100).toFixed(0)}%</span>
                        </p>
                        <button
                            onClick={() => navigate(`/obras/${match.label}`)}
                            className="visual-scanner-view-btn"
                        >
                            {t("visitor.visualScanner.viewDetails", "Ver Detalhes")}
                        </button>
                    </div>
                )}
            </div>

            <div className="visual-scanner-footer">
                <button onClick={() => navigate(-1)} className="visual-scanner-back-btn">
                    <ArrowLeft size={16} /> {t("common.back", "Voltar")}
                </button>
                {scanning && (
                    <button onClick={stopCamera} className="visual-scanner-stop-btn">
                        <StopCircle size={16} /> {t("visitor.visualScanner.stopCamera", "Parar")}
                    </button>
                )}
            </div>
        </div>
    );
};
