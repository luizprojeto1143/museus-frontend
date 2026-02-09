import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Camera, ArrowLeft, StopCircle, Brain, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import "./VisualScanner.css";

export const VisualScannerPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { addToast } = useToast();
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
                    if (isMounted) setStatus("Scan offline disponível.");
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
                addToast(t("visitor.scan.permission", "Precisamos de permissão para acessar a câmera"), "error");
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
        <div className="visual-scanner-container bg-[#0a0a0c]">
            <div className="visual-scanner-video-area">
                <video
                    ref={videoRef}
                    className="visual-scanner-video"
                    playsInline
                    muted
                />

                {!scanning && !loading && (
                    <div className="visual-scanner-start-overlay backdrop-blur-md">
                        <div className="visual-scanner-start-content flex flex-col items-center">
                            <div className="bg-blue-500/20 p-6 rounded-full mb-6">
                                <Brain size={48} className="text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{t("visitor.visualScanner.title", "Scanner de Obras (IA)")}</h2>
                            <p className="text-slate-400 text-center max-w-[280px] mb-8 leading-relaxed">
                                {t("visitor.visualScanner.instruction", "Aponte para uma obra para que nossa IA a identifique automaticamente.")}
                            </p>
                            <Button
                                onClick={startCamera}
                                leftIcon={<Camera size={22} />}
                                className="w-full max-w-[240px] py-6 text-lg rounded-2xl shadow-xl shadow-blue-500/20"
                            >
                                {t("visitor.visualScanner.startCamera", "Iniciar Câmera")}
                            </Button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="visual-scanner-loading-overlay backdrop-blur-sm">
                        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                        <p className="text-white font-medium">{status}</p>
                    </div>
                )}

                {match && (
                    <div className="visual-scanner-match-card animate-slideUp">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-500/10 p-2 rounded-lg">
                                <Brain className="text-green-400" size={20} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="text-lg font-bold text-white truncate">{worksMap[match.label] || "Obra Detectada"}</h3>
                                <p className="text-xs text-slate-500">IA Confidence: {(match.conf * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate(`/obras/${match.label}`)}
                            className="w-full py-4 rounded-xl"
                        >
                            {t("visitor.visualScanner.viewDetails", "Ver Detalhes")}
                        </Button>
                    </div>
                )}
            </div>

            <div className="visual-scanner-footer flex justify-between p-6">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    leftIcon={<ArrowLeft size={18} />}
                    className="w-auto px-6 border-white/10 text-white/70 hover:bg-white/5"
                >
                    {t("common.back", "Voltar")}
                </Button>
                {scanning && (
                    <Button
                        onClick={stopCamera}
                        leftIcon={<StopCircle size={18} />}
                        className="w-auto px-6 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    >
                        {t("visitor.visualScanner.stopCamera", "Parar")}
                    </Button>
                )}
            </div>
        </div>
    );
};
