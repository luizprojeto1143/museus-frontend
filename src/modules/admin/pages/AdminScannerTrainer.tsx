import React, { useEffect, useRef, useState, useCallback } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useTranslation } from "react-i18next";

export const AdminScannerTrainer: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth(); // Assuming admin is scoped to tenant
    const videoRef = useRef<HTMLVideoElement>(null);
    const [classifier, setClassifier] = useState<knnClassifier.KNNClassifier | null>(null);
    const [net, setNet] = useState<mobilenet.MobileNet | null>(null);
    const [loading, setLoading] = useState(true);
    const [works, setWorks] = useState<{ id: string; title: string }[]>([]);
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
            stream.getTracks().forEach(t => t.stop());
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            try {
                const loadedNet = await mobilenet.load();
                const loadedClassifier = knnClassifier.create();

                if (isMounted) {
                    setNet(loadedNet);
                    setClassifier(loadedClassifier);
                    console.log("Model loaded");
                } else {
                    // Cleanup if unmounted before load finish
                    loadedClassifier.dispose();
                }

                // Load works
                if (tenantId && isMounted) {
                    const res = await api.get("/works", { params: { tenantId } });
                    // API returns { data: works[], pagination: {} }
                    setWorks(Array.isArray(res.data) ? res.data : (res.data.data || []));
                }

                if (isMounted) setLoading(false);
                if (isMounted) startCamera();

            } catch (err) {
                console.error("Error init trainer", err);
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
                    console.log("Classifier disposed");
                }
                return null;
            });
        };
    }, [tenantId, startCamera, stopCamera]);



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
        // Saving KNN classifier is tricky because it stores tensors.
        // For a hackathon/demo, we can save the *dataset* (activations) or just keep in memory if checking on same device.
        // A robust way: Convert dataset to arrayBuffer, save to DB/LocalStore.
        if (!classifier) return;

        const dataset = classifier.getClassifierDataset();
        // Convert tensors to arrays for storage
        const datasetObj: Record<string, number[]> = {};
        Object.keys(dataset).forEach((key) => {
            const data = dataset[key].dataSync();
            // We need to convert Float32Array to normal array for JSON.stringify
            datasetObj[key] = Array.from(data);
        });

        // This can be HUGE. For MVP we might hit localStorage limits.
        // Let's try saving to localStorage first, but handle error.
        try {
            const jsonStr = JSON.stringify(datasetObj);
            localStorage.setItem(`scanner_model_${tenantId}`, jsonStr);
            alert("Modelo salvo localmente! (Visitante no mesmo navegador poderá usar)");
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar: modelo muito grande para localStorage. Em produção usaríamos IndexedDB ou upload.");
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h1 className="section-title">{t("admin.scanner.title", "Treinamento do Scanner Visual")}</h1>
            <p className="section-subtitle">{t("admin.scanner.subtitle", "Ensine a IA a reconhecer as obras apontando a câmera.")}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                {/* Camera Feed */}
                <div className="card" style={{ padding: "1rem", textAlign: "center" }}>
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
                <div className="card" style={{ padding: "1rem" }}>
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

                    <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
                        Dica: Tire pelo menos 10 fotos de ângulos diferentes para cada obra.
                    </p>

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
                        className="btn btn-secondary"
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
