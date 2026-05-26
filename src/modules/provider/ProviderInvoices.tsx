import React, { useState, useEffect } from "react";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { FileText, Upload, CheckCircle, Clock } from "lucide-react";
import { toast } from "react-hot-toast";

export const ProviderInvoices: React.FC = () => {
    const { id: userId } = useAuth();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [nfNumber, setNfNumber] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            // In a real scenario, this would list projects where the provider is assigned.
            // For now, we list their own projects or executions. Let's assume they have projects.
            const res = await api.get('/projects/my');
            setProjects(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!nfNumber) {
            toast.error("Preencha o número da Nota Fiscal primeiro");
            return;
        }

        try {
            setUploadingId(projectId);
            
            // Dummy upload logic (in real life, upload to S3 first)
            const fakeUrl = `https://storage.culturaviva.gov.br/nfs/${file.name}`;
            
            await api.post(`/projects/${projectId}/invoice`, {
                notaFiscalUrl: fakeUrl,
                notaFiscalNumber: nfNumber,
                notaFiscalDate: new Date().toISOString()
            });

            toast.success("Nota Fiscal enviada com sucesso!");
            setNfNumber("");
            fetchProjects();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar Nota Fiscal");
        } finally {
            setUploadingId(null);
        }
    };

    if (loading) return <div className="text-white p-8">Carregando...</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Notas Fiscais (NFS-e)</h1>
            <p className="text-gray-400">Anexe suas notas fiscais referentes aos serviços e projetos aprovados para liberar o pagamento pela Secretaria.</p>

            <div className="grid gap-4 mt-8">
                {projects.length === 0 ? (
                    <div className="text-gray-500 text-center p-8 bg-[#1a1108] rounded-2xl">
                        Nenhum projeto ou serviço encontrado.
                    </div>
                ) : (
                    projects.map(project => (
                        <div key={project.id} className="bg-[#1a1108] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-white font-bold text-lg">{project.title}</h3>
                                <p className="text-sm text-gray-400">Status: {project.status}</p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                {project.notaFiscalUrl ? (
                                    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-xl">
                                        <CheckCircle size={18} />
                                        <span className="text-xs font-bold uppercase tracking-widest">NF Enviada ({project.notaFiscalNumber})</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Número da NF" 
                                            className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                            value={uploadingId === project.id ? nfNumber : (nfNumber && uploadingId === null ? nfNumber : '')}
                                            onChange={(e) => setNfNumber(e.target.value)}
                                        />
                                        <label className={`cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${uploadingId === project.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                            {uploadingId === project.id ? <Clock size={16} className="animate-spin" /> : <Upload size={16} />}
                                            <span className="text-xs font-bold uppercase tracking-widest">
                                                {uploadingId === project.id ? 'Enviando...' : 'Anexar NF (PDF)'}
                                            </span>
                                            <input 
                                                type="file" 
                                                accept=".pdf,image/*" 
                                                className="hidden" 
                                                onChange={(e) => handleUpload(project.id, e)} 
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
