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
      className="flex items-center justify-between p-4 mb-3 bg-zinc-900/50 border border-white/10 rounded-xl group hover:border-gold/50 transition-all cursor-grab active:cursor-grabbing backdrop-blur-sm"
    >
      <div className="flex items-center gap-4">
        <GripVertical size={20} className="text-zinc-600 group-hover:text-gold transition-colors" />
        <span className="text-zinc-200 font-medium">{title}</span>
      </div>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()} // Important to prevent drag start
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
    <div className="max-w-5xl mx-auto pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/trilhas")}
          className="w-10 h-10 p-0 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 transition-colors"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {isEdit ? t("admin.trailForm.editTitle") : t("admin.trailForm.newTitle")}
          </h1>
          <p className="text-zinc-400 text-sm font-medium mt-1">
            Gerencie o roteiro e as obras desta trilha.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Map className="text-gold" size={20} /> Informações Gerais
          </h2>

          <Input
            label={t("admin.trailForm.labels.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("admin.trailForm.placeholders.name")}
            required
            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
          />

          <Textarea
            label={t("admin.trailForm.labels.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
          />

          <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-white/5 w-fit">
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`transition-colors ${active ? "text-gold" : "text-zinc-600"}`}
            >
              {active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
            <span className={`font-medium ${active ? "text-white" : "text-zinc-500"}`}>
              {active ? "Trilha Ativa" : "Trilha Inativa"}
            </span>
          </div>
        </div>

        {/* MULTIMEDIA SECTION */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Music size={20} className="text-gold" /> Mídia {term.trail === "Trilha" ? "da Trilha" : "do Roteiro"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Áudio-Guia {term.trail === "Trilha" ? "da Trilha" : "do Roteiro"} (Arquivo)</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, "audio", setAudioUrl)}
                  className="
                        block w-full text-sm text-zinc-400
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-zinc-800 file:text-gold
                        file:cursor-pointer hover:file:bg-zinc-700
                        cursor-pointer
                    "
                />
              </div>

              {isUploading && <p className="text-xs text-gold animate-pulse mt-2">Enviando arquivo...</p>}

              {audioUrl && (
                <div className="mt-4 bg-zinc-900 p-3 rounded-xl border border-white/5">
                  <audio controls src={audioUrl} className="w-full h-8" />
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1 font-medium">
                    <CheckCircle2 size={12} /> Áudio carregado
                  </p>
                </div>
              )}
              <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
                Áudio de introdução {term.trail === "Trilha" ? "da trilha" : "do roteiro"} que será reproduzido para os {term.visitors.toLowerCase()}.
              </p>
            </div>

            <div>
              <Input
                label="URL do Vídeo (MP4 ou YouTube)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                leftIcon={<Video size={16} />}
                className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Vídeo de apresentação {term.trail === "Trilha" ? "da trilha" : "do roteiro"}.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">{t("admin.trailForm.labels.works")}</h2>
              <p className="text-sm text-zinc-400">
                Adicione e ordene as obras que farão parte desta trilha.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-xs text-zinc-400 font-mono">
              {selectedWorks.length} obras
            </div>
          </div>

          <div className="flex gap-3">
            <Select
              value={workToAdd}
              onChange={(e) => setWorkToAdd(e.target.value)}
              containerClassName="flex-1 mb-0"
              className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
            >
              <option value="">{t("admin.trailForm.selectWork")}</option>
              {allWorks.map(w => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </Select>
            <Button
              type="button"
              onClick={handleAddWork}
              className="bg-zinc-800 hover:bg-zinc-700 text-white"
              disabled={!workToAdd}
            >
              <Plus size={18} />
            </Button>
          </div>

          <div className="bg-zinc-950/30 rounded-2xl border border-white/5 p-4 min-h-[300px]">
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
              <div className="flex flex-col items-center justify-center h-full py-12 text-zinc-500">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-white/5">
                  <Map className="text-zinc-700" size={24} />
                </div>
                <p className="font-medium">{t("admin.trailForm.empty")}</p>
                <p className="text-xs mt-1">Selecione e adicione obras acima para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-4">
          <div className="max-w-4xl mx-auto bg-zinc-900/90 border border-white/10 p-2 pr-3 pl-4 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-xl pointer-events-auto">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate("/admin/trilhas")}
              className="text-zinc-400 hover:text-white px-4 h-12 hover:bg-white/5"
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="px-8 h-12 rounded-xl font-bold text-base shadow-lg shadow-gold/20 bg-gold hover:bg-gold/90 text-black border-none"
                leftIcon={saving ? undefined : <Save size={18} />}
              >
                {saving ? 'Salvando...' : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
