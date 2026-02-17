import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import { ArrowLeft, Save, Plus, GripVertical, X, Music, Video, ToggleLeft, ToggleRight, Map, CheckCircle2 } from "lucide-react";
import { useTerminology } from "../../../hooks/useTerminology";
import "./AdminShared.css";

// Componente auxiliar para item ordenável
function SortableItem({ id, title, onRemove }: { id: string; title: string; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center justify-between p-4 mb-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl group hover:border-[var(--accent-gold)] transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-4">
        <GripVertical size={20} className="text-[var(--fg-muted)] group-hover:text-[var(--accent-gold)] transition-colors" />
        <span className="text-[var(--fg-main)] font-medium">{title}</span>
      </div>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()} // Important to prevent drag start
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-2 text-[var(--fg-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export const AdminTrailForm: React.FC = () => {
  const { t } = useTranslation();
  const term = useTerminology();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const { addToast } = useToast();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Initial state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [allWorks, setAllWorks] = useState<{ id: string; title: string }[]>([]);
  const [selectedWorks, setSelectedWorks] = useState<{ id: string; title: string }[]>([]);
  const [workToAdd, setWorkToAdd] = useState("");
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (tenantId) {
      api.get("/works", { params: { tenantId } }).then(res => {
        const worksData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setAllWorks((worksData as { id: string; title: string }[]).map(w => ({ id: w.id, title: w.title })));
      });
    }

    if (isEdit) {
      api.get(`/trails/${id}`)
        .then(res => {
          const trail = res.data as { title: string; description: string; active?: boolean; audioUrl?: string; videoUrl?: string; works?: { id: string; title: string }[] };
          setName(trail.title);
          setDescription(trail.description);
          setActive(trail.active !== false);
          setAudioUrl(trail.audioUrl || "");
          setVideoUrl(trail.videoUrl || "");
          if (trail.works && Array.isArray(trail.works)) {
            setSelectedWorks(trail.works.map(w => ({
              id: w.id,
              title: w.title
            })));
          }
        })
        .catch(err => {
          console.error("Erro ao carregar trilha", err);
          addToast("Erro ao carregar trilha", "error");
        });
    }
  }, [id, isEdit, tenantId, t]);

  const handleAddWork = () => {
    if (!workToAdd) return;
    const work = allWorks.find(w => w.id === workToAdd);
    if (work && !selectedWorks.find(sw => sw.id === work.id)) {
      setSelectedWorks([...selectedWorks, work]);
    }
    setWorkToAdd("");
  };

  const handleRemoveWork = (workId: string) => {
    setSelectedWorks(selectedWorks.filter(w => w.id !== workId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = selectedWorks.findIndex(w => w.id === active.id);
      const newIndex = selectedWorks.findIndex(w => w.id === over.id);
      setSelectedWorks(arrayMove(selectedWorks, oldIndex, newIndex));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantId) {
      addToast("Erro de autenticação", "error");
      return;
    }

    setSaving(true);
    const payload = {
      title: name,
      description,
      active,
      audioUrl: audioUrl || null,
      videoUrl: videoUrl || null,
      workIds: selectedWorks.map(w => w.id),
      tenantId
    };

    try {
      if (id) {
        await api.put(`/trails/${id}`, payload);
      } else {
        await api.post("/trails", payload);
      }
      addToast(id ? "Trilha atualizada com sucesso!" : "Trilha criada com sucesso!", "success");
      navigate("/admin/trilhas");
    } catch (error) {
      console.error("Erro ao salvar trilha", error);
      addToast("Erro ao salvar trilha. Verifique os dados.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "audio", setter: (val: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        setIsUploading(true);
        const res = await api.post(`/upload/${type}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setter(res.data.url);
        addToast("Arquivo enviado com sucesso!", "success");
      } catch (error) {
        console.error(`Error uploading ${type}`, error);
        addToast("Erro ao enviar arquivo.", "error");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={() => navigate("/admin/trilhas")} variant="ghost" className="btn-ghost w-12 h-12 rounded-full p-0 flex items-center justify-center">
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="section-title">
            {isEdit ? t("admin.trailForm.editTitle") : t("admin.trailForm.newTitle")}
          </h1>
          <p className="text-[var(--fg-muted)]">
            Gerencie o roteiro e as obras desta trilha.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Info Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-subtle)] pb-4">
            <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
              <Map className="text-[var(--accent-gold)]" size={24} />
            </div>
            <h3 className="card-title mb-0">Informações Gerais</h3>
          </div>

          <div className="flex flex-col gap-6">
            <div className="form-group">
              <label className="form-label">{t("admin.trailForm.labels.name")}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("admin.trailForm.placeholders.name")}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t("admin.trailForm.labels.description")}</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] w-fit">
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`transition-colors ${active ? "text-[var(--accent-gold)]" : "text-[var(--fg-muted)]"}`}
              >
                {active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
              <span className={`font-medium ${active ? "text-[var(--fg-main)]" : "text-[var(--fg-muted)]"}`}>
                {active ? "Trilha Ativa" : "Trilha Inativa"}
              </span>
            </div>
          </div>
        </div>

        {/* Multimedia Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-subtle)] pb-4">
            <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
              <Music className="text-[var(--accent-gold)]" size={24} />
            </div>
            <h3 className="card-title mb-0">Mídia {term.trail === "Trilha" ? "da Trilha" : "do Roteiro"}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="form-group">
              <label className="form-label">Áudio-Guia</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, "audio", setAudioUrl)}
                  className="
                        block w-full text-sm text-[var(--fg-muted)]
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[var(--bg-surface-active)] file:text-[var(--accent-gold)]
                        file:cursor-pointer hover:file:bg-[var(--bg-surface-hover)]
                        cursor-pointer
                        bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)]
                    "
                />
              </div>

              {isUploading && <p className="text-xs text-[var(--accent-gold)] animate-pulse mt-2">Enviando arquivo...</p>}

              {audioUrl && (
                <div className="mt-4 bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <audio controls src={audioUrl} className="w-full h-8" />
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1 font-medium">
                    <CheckCircle2 size={12} /> Áudio carregado
                  </p>
                </div>
              )}
              <p className="text-xs text-[var(--fg-tertiary)] mt-3 leading-relaxed">
                Áudio de introdução {term.trail === "Trilha" ? "da trilha" : "do roteiro"} que será reproduzido para os {term.visitors.toLowerCase()}.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">URL do Vídeo (MP4 ou YouTube)</label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                leftIcon={<Video size={16} />}
              />
              <p className="text-xs text-[var(--fg-tertiary)] mt-2">
                Vídeo de apresentação {term.trail === "Trilha" ? "da trilha" : "do roteiro"}.
              </p>
            </div>
          </div>
        </div>

        {/* Works Card */}
        <div className="card">
          <div className="flex justify-between items-end mb-4 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[rgba(212,175,55,0.1)]">
                <Map className="text-[var(--accent-gold)]" size={24} />
              </div>
              <div>
                <h3 className="card-title mb-1">{t("admin.trailForm.labels.works")}</h3>
                <p className="text-sm text-[var(--fg-muted)]">
                  Adicione e ordene as obras que farão parte desta trilha.
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--accent-gold)] font-mono">
              {selectedWorks.length} obras
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Select
              value={workToAdd}
              onChange={(e) => setWorkToAdd(e.target.value)}
              containerClassName="flex-1 mb-0"
            >
              <option value="">{t("admin.trailForm.selectWork")}</option>
              {allWorks.map(w => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </Select>
            <Button
              type="button"
              onClick={handleAddWork}
              className="btn-secondary"
              disabled={!workToAdd}
            >
              <Plus size={18} />
            </Button>
          </div>

          <div className="bg-[rgba(0,0,0,0.2)] rounded-2xl border border-[var(--border-subtle)] p-4 min-h-[300px]">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedWorks} strategy={verticalListSortingStrategy}>
                {selectedWorks.map((work) => (
                  <SortableItem
                    key={work.id}
                    id={work.id}
                    title={work.title}
                    onRemove={() => handleRemoveWork(work.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {selectedWorks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-[var(--fg-tertiary)]">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
                  <Map className="text-[var(--fg-muted)]" size={24} />
                </div>
                <p className="font-medium">{t("admin.trailForm.empty")}</p>
                <p className="text-xs mt-1">Selecione e adicione obras acima para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate("/admin/trilhas")}
            className="btn-ghost"
            disabled={saving}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="btn-primary px-8"
            leftIcon={saving ? undefined : <Save size={18} />}
          >
            {saving ? 'Salvando...' : t("common.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};

