import React, { useState } from "react";
import { api } from "../../../api/client";
import { Button, Input, Textarea } from "../../../components/ui";
import { Upload, Camera, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./SubmitWorkModal.css";

interface SubmitWorkModalProps {
    spaceId?: string;
    onClose: () => void;
}

export const SubmitWorkModal: React.FC<SubmitWorkModalProps> = ({ spaceId, onClose }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post("/roadmap-family/submissions", {
                title,
                description,
                imageUrl,
                spaceId
            });
            setIsSuccess(true);
            setTimeout(onClose, 3000);
        } catch (err) {
            console.error("Erro ao submeter obra:", err);
            alert("Erro ao enviar sua contribuição. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="submission-overlay">
            <motion.div
                className="submission-card glass"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
            >
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.form
                            key="form"
                            exit={{ opacity: 0, scale: 0.9 }}
                            onSubmit={handleSubmit}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-2xl font-bold">Contribuir com Obra</h1>
                                <button type="button" onClick={onClose} className="opacity-50 hover:opacity-100">&times;</button>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Título da Obra"
                                    placeholder="Ex: Minha interpretação da Serra"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />

                                <Textarea
                                    label="Sua história / Descrição"
                                    placeholder="Conte-nos por que esta obra é importante ou o que ela representa."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                />

                                <div className="image-upload-area">
                                    {imageUrl ? (
                                        <div className="preview-container">
                                            <img src={imageUrl} alt="Preview" />
                                            <button type="button" onClick={() => setImageUrl("")} className="remove-img">&times;</button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <Camera size={32} className="opacity-30 mb-2" />
                                            <p className="text-xs opacity-50">Cole a URL da imagem ou use o botão de upload (Simulado)</p>
                                            <Input
                                                placeholder="https://imagem.com/foto.jpg"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                className="mt-2 text-xs"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    className="btn-primary-gradient flex-1"
                                    leftIcon={<Send size={18} />}
                                >
                                    Enviar para Curadoria
                                </Button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="submission-success"
                        >
                            <div className="success-icon-bg">
                                <CheckCircle size={64} className="text-green-500" />
                            </div>
                            <h1>Agradecemos sua contribuição!</h1>
                            <p>Sua obra foi enviada para o nosso conselho curador. Se aprovada, ela aparecerá na galeria oficial do museu.</p>
                            <Button onClick={onClose} className="btn-primary-gradient w-full mt-6">
                                Entendido
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
