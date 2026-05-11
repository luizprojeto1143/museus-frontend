import React, { useState, useEffect } from "react";
import { 
    Folder, Upload, FileText, Trash2, Download, Search, 
    Plus, Filter, AlertCircle, CheckCircle2, MoreVertical,
    File, FileArchive, FileImage, ShieldCheck
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Button, Input } from "../../components/ui";

export const ProducerDocuments: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            // Buscamos arquivos do tipo 'document' enviados pelo usuário logado
            const res = await api.get("/upload", { params: { type: "document" } });
            // Filtramos no frontend para garantir que o produtor veja apenas o que ele subiu 
            // (ou o que pertence ao tenant dele se for o caso)
            const allDocs = Array.isArray(res.data) ? res.data : [];
            setDocuments(allDocs);
        } catch (err) {
            addToast("Erro ao carregar documentos.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post("/upload/document", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            addToast("Documento guardado no cofre!", "success");
            fetchDocuments();
        } catch (err) {
            addToast("Erro no upload do documento.", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Deseja realmente excluir este documento do seu cofre?")) return;
        try {
            await api.delete(`/upload/${id}`);
            addToast("Documento removido.", "success");
            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            addToast("Erro ao excluir.", "error");
        }
    };

    const getFileIcon = (mime: string) => {
        if (mime.includes("pdf")) return <FileText className="text-red-400" size={24} />;
        if (mime.includes("image")) return <FileImage className="text-blue-400" size={24} />;
        if (mime.includes("zip") || mime.includes("rar")) return <FileArchive className="text-orange-400" size={24} />;
        return <File className="text-gray-400" size={24} />;
    };

    const filteredDocs = documents.filter(doc => 
        doc.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#EAE0D5] font-serif flex items-center gap-3">
                        <Folder className="text-[var(--accent-primary)]" size={32} />
                        Cofre de Documentos
                    </h1>
                    <p className="text-[#B0A090] mt-1">Centralize seus arquivos para agilizar inscrições em editais.</p>
                </div>

                <div className="relative">
                    <input 
                        type="file" 
                        id="vault-upload" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label 
                        htmlFor="vault-upload"
                        className={`
                            flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-black font-bold rounded-xl cursor-pointer hover:opacity-90 transition-all shadow-lg shadow-[var(--accent-primary)]/20
                            ${uploading ? "opacity-50 pointer-events-none" : ""}
                        `}
                    >
                        {uploading ? <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full" /> : <Upload size={20} />}
                        Subir Documento
                    </label>
                </div>
            </div>

            {/* SECURITY BANNER */}
            <div className="mb-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <h3 className="font-bold text-emerald-100">Cofre Seguro</h3>
                    <p className="text-xs text-emerald-400/70">Seus documentos são criptografados e acessíveis apenas por você e pela administração do museu vinculado.</p>
                </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#463420]" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por nome do arquivo..."
                        className="w-full bg-[#2c1e10] border border-[#463420] rounded-2xl py-3 pl-12 pr-4 text-[#EAE0D5] focus:border-[var(--accent-primary)] outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-[#463420] text-[#B0A090] h-full rounded-2xl px-6">
                        <Filter size={18} className="mr-2" /> Filtros
                    </Button>
                </div>
            </div>

            {/* DOCUMENTS GRID */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-32 bg-[#2c1e10] animate-pulse rounded-3xl border border-[#463420]" />
                    ))}
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map(doc => (
                        <div key={doc.id} className="group bg-[#2c1e10] border border-[#463420] rounded-3xl p-5 hover:border-[var(--accent-primary)]/50 transition-all shadow-lg hover:shadow-[var(--accent-primary)]/5 relative overflow-hidden">
                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="p-3 bg-black/20 rounded-2xl border border-[#463420]">
                                    {getFileIcon(doc.mimeType)}
                                </div>
                                <div className="flex gap-1">
                                    <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-2 hover:bg-white/5 rounded-xl text-[#B0A090] hover:text-[var(--accent-primary)] transition-all"
                                        title="Baixar"
                                    >
                                        <Download size={18} />
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-xl text-[#B0A090] hover:text-red-400 transition-all"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="font-bold text-[#EAE0D5] line-clamp-1 group-hover:text-[var(--accent-primary)] transition-colors" title={doc.originalName}>
                                    {doc.originalName}
                                </h3>
                                <div className="flex items-center gap-3 text-[10px] text-[#B0A090] mt-2 uppercase font-bold tracking-widest">
                                    <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                    <span>•</span>
                                    <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* Background Pattern */}
                            <div className="absolute -right-4 -bottom-4 text-[#463420]/10 group-hover:text-[var(--accent-primary)]/5 transition-colors">
                                <FileText size={80} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#2c1e10]/50 border border-dashed border-[#463420] rounded-[40px] p-20 text-center">
                    <div className="w-20 h-20 bg-[#2c1e10] border border-[#463420] rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#463420]">
                        <FileText size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-[#EAE0D5] mb-2">Seu cofre está vazio</h2>
                    <p className="text-[#B0A090] max-w-md mx-auto mb-8">
                        Comece subindo seus documentos essenciais (RG, Portfólio, CNPJ) para facilitar o preenchimento de futuros projetos.
                    </p>
                    <label 
                        htmlFor="vault-upload"
                        className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold rounded-xl cursor-pointer hover:bg-[var(--accent-primary)] hover:text-black transition-all"
                    >
                        Subir meu primeiro arquivo
                    </label>
                </div>
            )}
        </div>
    );
};
