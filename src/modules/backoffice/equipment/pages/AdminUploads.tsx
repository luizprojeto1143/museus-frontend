import React, { useEffect, useState, useCallback } from "react";
import { logger } from "@/utils/logger";

import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { validateFile, UPLOAD_PRESETS, formatFileSize, getFileTypeLabel } from "../../../../utils/uploadValidator";
import { 
  Button, 
  Card, 
  Badge, 
  AnimatedCounter, 
  AnimateIn,
  ModelViewer,
  EmptyState
} from "@/components/ui";
import { 
  Plus, 
  Search, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon, 
  Music, 
  Video, 
  Box, 
  Brain, 
  HardDrive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/cn";

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

export const AdminUploads: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<"all" | "image" | "audio" | "video" | "model">("all");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadFiles = React.useCallback(async () => {
    try {
      const res = await api.get(`/upload?tenantId=${tenantId}`);
      setFiles(res.data);
    } catch {
      logger.error("Erro ao carregar arquivos");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (file: File) => {
    // ─── Validate before sending ────────────────────────────
    const validation = validateFile(file, UPLOAD_PRESETS.general);

    if (!validation.valid) {
      logger.warn("Alert:", `❌ Arquivo inválido: ${validation.error}`);
      return;
    }

    if (validation.warning) {
      const proceed = window.confirm(
        `⚠️ ${validation.warning}\n\nDeseja continuar com o upload?`
      );
      if (!proceed) return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tenantId", tenantId || "");

    try {
      await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      loadFiles();
      logger.warn("Alert:", t("admin.uploads.success"));
    } catch {
      logger.warn("Alert:", t("common.error"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, usedIn?: string | null) => {
    if (usedIn) {
      const confirm = window.confirm(
        t("admin.uploads.deleteConfirmUsed")
      );
      if (!confirm) return;
    }

    try {
      await api.delete(`/upload/${id}`);
      loadFiles();
    } catch {
      logger.warn("Alert:", t("common.error"));
    }
  };

  const handleToggleAi = async (id: string, current: boolean) => {
    try {
      // Otimistic Update
      setFiles(prev => prev.map(f => f.id === id ? { ...f, useInAi: !current } : f));

      await api.patch(`/upload/${id}`, { useInAi: !current });
    } catch (err) {
      logger.error(err);
      logger.warn("Alert:", "Erro ao atualizar status IA");
      loadFiles(); // Revert
    }
  };

  const filteredFiles = files.filter(f => {
    if (filter === "all") return true;
    return f.type.toLowerCase().includes(filter);
  });

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const formatSize = (bytes: number) => {
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
                    valid.forEach(handleUpload);
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
            onClick={() => setFilter(cat.id as unknown)}
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
                                    onClick={() => handleDelete(file.id, file.usedIn)}
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
    </div>
  );
};
