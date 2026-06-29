import React, { useState, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { FileText, Upload, CheckCircle, Clock, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";

export const ProviderInvoices: React.FC = () => {
    const { userId } = useAuth();
    const [executions, setExecutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [nfNumber, setNfNumber] = useState("");

    useEffect(() => {
        fetchExecutions();
    }, []);

    const fetchExecutions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/providers/me/executions');
            setExecutions(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar serviços prestados.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (executionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!nfNumber) {
            toast.error("Preencha o número da Nota Fiscal primeiro");
            return;
        }

        try {
            setUploadingId(executionId);
            
            // Dummy upload logic (in real life, upload to S3 first)
            const fakeUrl = `https://storage.culturaviva.gov.br/nfs/${file.name}`;
            
            await api.put(`/accessibility-execution/${executionId}/nota-fiscal`, {
                notaFiscalUrl: fakeUrl,
                notaFiscalNumber: nfNumber,
                notaFiscalDate: new Date().toISOString()
            });

            toast.success("Nota Fiscal enviada com sucesso!");
            setNfNumber("");
            fetchExecutions();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar Nota Fiscal");
        } finally {
            setUploadingId(null);
        }
    };

    const formatCurrency = (amount: any) => {
        const num = Number(amount || 0);
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (loading) return <div className="text-white p-8">Carregando...</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Notas Fiscais (NFS-e)</h1>
            <p className="text-gray-400">Anexe suas notas fiscais referentes aos serviços de acessibilidade LBI aprovados para liberar o repasse.</p>

            <div className="grid gap-4 mt-8">
                {executions.length === 0 ? (
                    <div className="text-gray-500 text-center p-8 bg-[#1a1108] rounded-2xl">
                        Nenhum serviço prestado encontrado.
                    </div>
                ) : (
                    executions.map(exec => (
                        <div key={exec.id} className="bg-[#1a1108] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-white font-bold text-lg">{exec.project?.title || "Serviço LBI"}</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                                        {exec.serviceType}
                                    </span>
                                    <span className="text-xs bg-white/5 text-gray-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                        <DollarSign size={12} /> {formatCurrency(exec.approvedBudget)}
                                    </span>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                        exec.status === 'VALIDATED' ? 'bg-green-500/10 text-green-400' :
                                        exec.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-400' :
                                        'bg-amber-500/10 text-amber-400'
                                    }`}>
                                        {exec.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                {exec.notaFiscalUrl ? (
                                    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-4 py-2 rounded-xl">
                                        <CheckCircle size={18} />
                                        <span className="text-xs font-bold uppercase tracking-widest">NF Enviada ({exec.notaFiscalNumber})</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Número da NF" 
                                            className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 min-h-[44px] text-white text-sm"
                                            value={uploadingId === exec.id ? nfNumber : (nfNumber && uploadingId === null ? nfNumber : '')}
                                            onChange={(e) => setNfNumber(e.target.value)}
                                        />
                                        <label className={`cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 min-h-[44px] rounded-xl flex items-center justify-center gap-2 transition-colors ${uploadingId === exec.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                            {uploadingId === exec.id ? <Clock size={16} className="animate-spin" /> : <Upload size={16} />}
                                            <span className="text-xs font-bold uppercase tracking-widest">
                                                {uploadingId === exec.id ? 'Enviando...' : 'Anexar NF (PDF)'}
                                            </span>
                                            <input 
                                                type="file" 
                                                accept=".pdf,image/*" 
                                                className="hidden" 
                                                onChange={(e) => handleUpload(exec.id, e)} 
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
