import React, { useEffect, useRef, useState, useCallback } from "react";
import { storage } from "@/utils/storage";

import { logger } from "@/utils/logger";

import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

type WorkOption = {
    id: string;
    title: string;
};

type WorksResponse = WorkOption[] | { data?: WorkOption[] };

type TensorLike = {
    dataSync: () => Float32Array | Int32Array | Uint8Array;
};

type ClassifierLike = {
    addExample: (activation: TensorLike, classId: string) => void;
    getClassifierDataset: () => Record<string, TensorLike>;
    dispose: () => void;
};

type MobileNetLike = {
    infer: (input: HTMLVideoElement, embedding?: boolean) => TensorLike;
};

export const AdminScannerTrainer: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId, hasPermission } = useAuth(); // Assuming admin is scoped to tenant
    const canManageChatAi = hasPermission("manage_chat_ai");
    const videoRef = useRef<HTMLVideoElement>(null);
    const [classifier, setClassifier] = useState<ClassifierLike | null>(null);
    const [net, setNet] = useState<MobileNetLike | null>(null);
    const [loading, setLoading] = useState(true);
    const [works, setWorks] = useState<WorkOption[]>([]);
    const [selectedWorkId, setSelectedWorkId] = useState<string>("");
    const [exampleCounts, setExampleCounts] = useState<Record<string, number>>({});
    const [training, setTraining] = useState(false);


    const startCamera = useCallback(async () => {
        if (videoRef.current) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }, []);

    useEffect(() => {
        if (!canManageChatAi) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const init = async () => {
            try {
                const [tf, mobilenet, knnClassifier] = await Promise.all([
                    import("@tensorflow/tfjs"),
                    import("@tensorflow-models/mobilenet"),
                    import("@tensorflow-models/knn-classifier"),
                ]);
                await Promise.all([
                    import("@tensorflow/tfjs-backend-webgl"),
                    import("@tensorflow/tfjs-backend-cpu"),
                ]);
                // Ensure TFJS backend is ready
                await tf.ready();

                const loadedNet = await mobilenet.load();
                const loadedClassifier = knnClassifier.create();

                if (isMounted) {
                    setNet(loadedNet);
                    setClassifier(loadedClassifier as unknown as ClassifierLike);
                    // console.debug("Model loaded");
                } else {
                    // Cleanup if unmounted before load finish
                    loadedClassifier.dispose();
                }

                // Load works
                if (tenantId && isMounted) {
                    const res = await api.get<WorksResponse>("/works", { params: { tenantId } });
                    setWorks(Array.isArray(res.data) ? res.data : (res.data.data || []));
                }

                if (isMounted) setLoading(false);
                if (isMounted) startCamera();

            } catch (err) {
                logger.error("Error init trainer", err);
            }
        };
        init();

        return () => {
            isMounted = false;
            stopCamera();
            // Cleanup tensors
            setClassifier(prev => {
                if (prev) {
                    prev.dispose();
                    // console.debug("Classifier disposed");
                }
                return null;
            });
        };
    }, [canManageChatAi, startCamera, stopCamera, tenantId]);


    if (!canManageChatAi) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <XCircle size={64} className="text-red-500 mb-6 opacity-20" />
          <h2 className="text-2xl font-black text-white mb-2">Treinamento Visual Restrito</h2>
          <p className="text-zinc-500 max-w-sm">Usuario sem a flag <strong>manage_chat_ai</strong> necessaria para treinar a inteligencia visual do scanner.</p>
        </div>
      );
    }

    const addExample = async () => {
        if (!selectedWorkId || !net || !classifier || !videoRef.current) return;

        setTraining(true);
        const activation = net.infer(videoRef.current, true);
        classifier.addExample(activation, selectedWorkId);

        setExampleCounts(prev => ({
            ...prev,
            [selectedWorkId]: (prev[selectedWorkId] || 0) + 1
        }));

        // Simulate a small delay for visual feedback
        setTimeout(() => setTraining(false), 200);
    };

    const saveModel = async () => {
        if (!classifier) return;

        const dataset = classifier.getClassifierDataset();
        // Convert tensors to arrays for storage
        const datasetObj: Record<string, number[]> = {};
        Object.keys(dataset).forEach((key) => {
            const data = dataset[key].dataSync();
            // We need to convert Float32Array to normal array for JSON.stringify
            datasetObj[key] = Array.from(data);
        });

        try {
            await api.put(`/scanner/models/${tenantId}`, {
                tenantId,
                dataset: datasetObj,
                exampleCounts,
                updatedAt: new Date().toISOString(),
            });
            storage.remove(`scanner_model_${tenantId}`);
            toast.success("Modelo sincronizado com o backend.");
        } catch (remoteError) {
            logger.error("Error syncing scanner model", remoteError);
            try {
                const jsonStr = JSON.stringify(datasetObj);
                storage.set(`scanner_model_${tenantId}`, jsonStr);
                toast("Backend indisponível. Modelo salvo localmente nesta máquina.");
            } catch (localError) {
                logger.error(localError);
                toast.error("Erro ao salvar modelo. Configure o endpoint de scanner ou reduza o dataset.");
            }
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h1 className="section-title">{t("admin.scanner.title", "Treinamento do Scanner Visual")}</h1>


            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                {/* Camera Feed */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ padding: "1rem", textAlign: "center" }}>
                    <div style={{ position: "relative", width: "100%", height: "300px", background: "#000", borderRadius: "0.5rem", overflow: "hidden", marginBottom: "1rem" }}>
                        <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                        {training && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,255,0,0.3)" }}>
                                <span style={{ color: "white", fontWeight: "bold", fontSize: "1.5rem" }}>+1 Exemplo</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ padding: "1rem" }}>
                    <h3>Selecionar Obra</h3>
                    <select
                        className="input"
                        value={selectedWorkId}
                        onChange={e => setSelectedWorkId(e.target.value)}
                        style={{ marginBottom: "1rem" }}
                    >
                        <option value="">Selecione uma obra...</option>
                        {works.map(w => (
                            <option key={w.id} value={w.id}>{w.title}</option>
                        ))}
                    </select>

                    <button
                        className={`btn btn-primary ${(!selectedWorkId || loading) ? "opacity-50" : ""}`}
                        disabled={!selectedWorkId || loading}
                        onClick={addExample}
                        style={{ width: "100%", marginBottom: "1rem", fontSize: "1.2rem", padding: "1rem" }}
                    >
                        📸 Capturar Exemplo
                    </button>

                    <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>{t("admin.scannertrainer.dicaTirePeloMenos10FotosDeNgulosDiferent", `
                        Dica: Tire pelo menos 10 fotos de ângulos diferentes para cada obra.
                    `)}</p>

                    <h4>Exemplos Capturados:</h4>
                    <ul style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #eee", padding: "0.5rem", borderRadius: "0.5rem" }}>
                        {works.map(w => {
                            const count = exampleCounts[w.id] || 0;
                            if (count === 0) return null;
                            return (
                                <li key={w.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0" }}>
                                    <span>{w.title}</span>
                                    <span style={{ fontWeight: "bold", color: count >= 10 ? "green" : "orange" }}>{count} img</span>
                                </li>
                            );
                        })}
                    </ul>

                    <button
                        className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"
                        onClick={saveModel}
                        style={{ width: "100%", marginTop: "1rem" }}
                    >
                        💾 Salvar Modelo
                    </button>
                </div>
            </div>
        </div>
    );
};
