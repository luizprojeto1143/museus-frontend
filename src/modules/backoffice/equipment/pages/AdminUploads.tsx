import React, { useEffect, useState } from "react";
import { logger } from "@/utils/logger";

import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { validateFile, UPLOAD_PRESETS, formatFileSize, getFileTypeLabel } from "../../../../utils/uploadValidator";
import { Button, Card, Badge, AnimatedCounter, ModelViewer } from "@/components/ui";
import { Plus, Trash2, ExternalLink, Image as ImageIcon, Music, Video, Box, Brain, HardDrive } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "react-hot-toast";
import { isAxiosError } from "axios";
import { z } from "zod";

interface UploadedFile {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  usedIn?: string | null;
  usedInId?: string | null;
  usedInTitle?: string | null; // Optional if backend ever sends it
  usageList?: Array<{ type: string; id: string; title: string }>; // For frontend compatibility
  useInAi?: boolean;
}

type UploadFilter = "all" | "image" | "audio" | "video" | "model";

interface UploadResponse {
  id?: string;
  url?: string;
  file?: UploadedFile;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

const uploadContextSchema = z.object({
  tenantId: z.string().trim().min(1, "Tenant não identificado para upload.")
});

const uploadIdSchema = z.string().trim().min(1, "Arquivo inválido.");

function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || error.response?.data?.error || fallback;
  }
  return fallback;
}

export const AdminUploads: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<UploadFilter>("all");
  const [pendingUpload, setPendingUpload] = useState<{ file: File; warning: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UploadedFile | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadFiles = React.useCallback(async () => {
    try {
      const validation = uploadContextSchema.safeParse({ tenantId });
      if (!validation.success) {
        setFiles([]);
        return;
      }

      const res = await api.get<UploadedFile[]>("/upload", { params: { tenantId: validation.data.tenantId } });
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      logger.error("Erro ao carregar arquivos", error);
      toast.error(getApiErrorMessage(error, "Erro ao carregar arquivos."));
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (file: File, force = false) => {
    const validation = validateFile(file, UPLOAD_PRESETS.general);

    if (!validation.valid) {
      toast.error(`Arquivo inválido: ${validation.error}`);
      return;
    }

    if (validation.warning && !force) {
      setPendingUpload({ file, warning: validation.warning });
      return;
    }

    setPendingUpload(null);
    const context = uploadContextSchema.safeParse({ tenantId });
    if (!context.success) {
      toast.error(context.error.issues[0]?.message || "Tenant não identificado para upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tenantId", context.data.tenantId);

    try {
      const res = await api.post<UploadResponse>("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (!res.data.url && !res.data.id && !res.data.file) throw new Error("Upload sem confirmação de retorno.");
      loadFiles();
      toast.success(t("admin.uploads.success"));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("common.error")));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const validation = uploadIdSchema.safeParse(deleteTarget.id);
    if (!validation.success) return toast.error(validation.error.issues[0]?.message || "Arquivo inválido.");

    try {
      await api.delete(`/upload/${validation.data}`);
      loadFiles();
      setDeleteTarget(null);
      toast.success("Arquivo excluído.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("common.error")));
    }
  };

  const handleToggleAi = async (id: string, current: boolean) => {
    const validation = uploadIdSchema.safeParse(id);
    if (!validation.success) return toast.error(validation.error.issues[0]?.message || "Arquivo inválido.");

    try {
      setFiles(prev => prev.map(f => f.id === validation.data ? { ...f, useInAi: !current } : f));
      await api.patch(`/upload/${validation.data}`, { useInAi: !current });
      toast.success(!current ? "Arquivo ativado para IA." : "Arquivo removido do treino de IA.");
    } catch (err) {
      logger.error(err instanceof Error ? err.message : "Erro ao atualizar status IA");
      toast.error(getApiErrorMessage(err, "Erro ao atualizar status IA"));
      loadFiles();
    }
  };

  const filteredFiles = files.filter(f => {
    if (filter === "all") return true;
    return f.type.toLowerCase().includes(filter);
  });

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const _formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <Badge variant="outline" className="text-[var(--accent-primary)] mb-4 border-[var(--accent-primary)]/30">
            Assets & Media
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter text-white">{t("admin.uploads.title")}</h1>
          <p className="text-slate-400 font-medium mt-4 max-w-lg">
            Repositório centralizado de mídias, guias de áudio e artefatos 3D.
          </p>
        </div>
        <div className="flex items-center gap-4">
            <Button
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploading}
                size="lg"
                className="h-16 px-10 rounded-2xl font-black uppercase text-xs tracking-widest"
                leftIcon={<Plus size={18} />}
            >
                {uploading ? t("common.uploading") : t("admin.uploads.newUpload")}
            </Button>
            <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                multiple
                accept="image/*,audio/*,video/*,.glb,.gltf"
                className="hidden"
                onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    const valid = selected.filter(f => f.size > 0);
                    valid.forEach(file => handleUpload(file));
                    e.target.value = "";
                }}
            />
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t("admin.uploads.stats.total"), value: files.length, icon: HardDrive, color: 'blue' },
          { label: t("admin.uploads.stats.usedSpace"), value: totalSize / (1024 * 1024), icon: HardDrive, color: 'purple', unit: ' MB' },
          { label: t("admin.uploads.stats.images"), value: files.filter(f => f.type.startsWith("image")).length, icon: ImageIcon, color: 'gold' },
          { label: "Acervo 3D", value: files.filter(f => f.type.toLowerCase().includes("model") || f.filename.endsWith(".glb")).length, icon: Box, color: 'green' },
        ].map((stat, i) => (
          <Card key={i} animated glow className="p-8 border-white/5 bg-black/20 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <stat.icon size={20} className="text-slate-400" />
            </div>
            <div className="text-3xl font-black tracking-tighter text-white leading-none mb-1">
              <AnimatedCounter value={stat.value} />
              {stat.unit && <span className="text-sm opacity-50 ml-1">{stat.unit}</span>}
            </div>
            <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{stat.label}</span>
          </Card>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex bg-[var(--bg-surface)] p-2 rounded-2xl border border-[var(--border-subtle)] gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: t("common.all"), icon: <HardDrive size={14} />, count: files.length },
          { id: "image", label: t("common.images"), icon: <ImageIcon size={14} />, count: files.filter(f => f.type.startsWith("image")).length },
          { id: "audio", label: t("common.audios"), icon: <Music size={14} />, count: files.filter(f => f.type.startsWith("audio")).length },
          { id: "video", label: t("common.videos"), icon: <Video size={14} />, count: files.filter(f => f.type.startsWith("video")).length },
          { id: "model", label: "Modelos 3D", icon: <Box size={14} />, count: files.filter(f => f.type.toLowerCase().includes("model") || f.filename.endsWith(".glb")).length }
        ].map(cat => (
          <Button
            key={cat.id}
            variant={filter === cat.id ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter(cat.id as UploadFilter)}
            className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap"
            leftIcon={cat.icon}
          >
            {cat.label} ({cat.count})
          </Button>
        ))}
      </div>

      {loading && <p>{t("common.loading")}</p>}

      {!loading && filteredFiles.length === 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors">
          <p>{t("common.noResults")}</p>
        </div>
      )}

      {!loading && filteredFiles.length > 0 && (
        <motion.div 
            variants={staggerContainer(0.1, 0.2)}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8"
        >
          {filteredFiles.map((file) => {
            const is3D = file.type.toLowerCase().includes("model") || file.filename.endsWith(".glb") || file.filename.endsWith(".gltf");
            const isImg = file.type.startsWith("image");

            return (
              <motion.div key={file.id} variants={staggerItem}>
                <Card animated glow className="h-full flex flex-col group overflow-hidden border-white/5 bg-white/5">
                  <div className="relative h-48 overflow-hidden bg-slate-900 flex items-center justify-center">
                    {isImg ? (
                        <img src={file.url} alt={file.filename} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : is3D ? (
                        <div className="w-full h-full">
                           <ModelViewer url={file.url} className="w-full h-full pointer-events-none" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-500">
                           {file.type.includes("audio") ? <Music size={48} /> : <Video size={48} />}
                        </div>
                    )}
                    <Badge variant="glass" className="absolute top-4 left-4 font-black uppercase text-[9px] tracking-widest backdrop-blur-md">
                        {getFileTypeLabel(file.type)}
                    </Badge>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-white font-bold text-sm mb-1 truncate tracking-tight">{file.filename}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-4 mt-auto">
                        {file.usedIn && (
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Vinculado a</span>
                                <span className="text-xs text-slate-300 font-bold truncate block">{file.usedIn} ID: {file.usedInId}</span>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                             <Button
                                variant={file.useInAi ? "primary" : "glass"}
                                size="sm"
                                onClick={() => handleToggleAi(file.id, !!file.useInAi)}
                                className="w-full h-10 font-bold text-[10px] uppercase tracking-widest border-white/5"
                                leftIcon={<Brain size={14} />}
                             >
                                {file.useInAi ? "✓ Ativo para IA" : "Usar no Treino IA"}
                             </Button>
                             
                             <div className="flex gap-2">
                                 <Button
                                    variant="glass"
                                    size="sm"
                                    className="flex-1 h-10 font-bold text-[10px] uppercase tracking-widest border-white/5"
                                    onClick={() => window.open(file.url, '_blank')}
                                    leftIcon={<ExternalLink size={14} />}
                                 >
                                    Ver
                                 </Button>
                                 <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 w-10 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-500 border-none"
                                    onClick={() => setDeleteTarget(file)}
                                 >
                                    <Trash2 size={16} />
                                 </Button>
                             </div>
                        </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
      {(pendingUpload || deleteTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
            {pendingUpload ? (
              <>
                <h3 className="text-lg font-bold text-white">Continuar upload?</h3>
                <p className="mt-2 text-sm text-slate-400">{pendingUpload.warning}</p>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="glass" onClick={() => setPendingUpload(null)}>Cancelar</Button>
                  <Button onClick={() => handleUpload(pendingUpload.file, true)}>Continuar</Button>
                </div>
              </>
            ) : deleteTarget ? (
              <>
                <h3 className="text-lg font-bold text-white">Excluir arquivo?</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {deleteTarget.usedIn ? t("admin.uploads.deleteConfirmUsed") : `Remover ${deleteTarget.filename}?`}
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="glass" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
                  <Button variant="danger" onClick={handleDelete}>Excluir</Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

