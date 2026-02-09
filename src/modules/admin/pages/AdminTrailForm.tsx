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
import { ArrowLeft, Save, Plus, GripVertical, X, Music, Video, ToggleLeft, ToggleRight } from "lucide-react";

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
      className="flex items-center justify-between p-3 mb-2 bg-gray-800 border border-gray-700 rounded-lg group hover:border-gold/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <GripVertical size={20} className="text-gray-500 cursor-grab active:cursor-grabbing" />
        <span className="text-gray-200">{title}</span>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // evita drag
          onRemove();
        }}
        className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export const AdminTrailForm: React.FC = () => {
  const { t } = useTranslation();
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

  useEffect(() => {

    if (tenantId) {
      api.get("/works", { params: { tenantId } }).then(res => {
        // API returns { data: works[], pagination: {} }
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
            // Backend returns works as flat array: [{ id, title, ... }]
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
      workIds: selectedWorks.map(w => w.id), // enviar IDs na ordem
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

  const [isUploading, setIsUploading] = useState(false);

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
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin/trilhas")} className="p-2">
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="section-title">
            {isEdit ? t("admin.trailForm.editTitle") : t("admin.trailForm.newTitle")}
          </h1>
          <p className="section-subtitle">
            {t("admin.trailForm.subtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="card-title mb-6">Informações Gerais</h2>

          <Input
            label={t("admin.trailForm.labels.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("admin.trailForm.placeholders.name")}
            required
          />

          <Textarea
            label={t("admin.trailForm.labels.description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="flex items-center gap-3 mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 w-fit">
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`transition-colors ${active ? "text-gold" : "text-gray-500"}`}
            >
              {active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
            <span className={`font-medium ${active ? "text-gold" : "text-gray-400"}`}>
              {active ? "Trilha Ativa" : "Trilha Inativa"}
            </span>
          </div>
        </div>

        {/* MULTIMEDIA SECTION */}
        <div className="card">
          <h3 className="card-title flex items-center gap-2 mb-6">
            <Music size={20} className="text-gold" /> Mídia da Trilha
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Áudio-Guia da Trilha (Arquivo)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, "audio", setAudioUrl)}
                className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-gray-800 file:text-gold
                        hover:file:bg-gray-700 mb-2
                    "
              />
              {isUploading && <p className="text-xs text-gold animate-pulse">Enviando arquivo...</p>}
              {audioUrl && (
                <div className="mt-2 bg-gray-800/50 p-2 rounded-lg">
                  <audio controls src={audioUrl} className="w-full h-8" />
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">✓ Áudio carregado</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Áudio de introdução da trilha que será reproduzido para os visitantes.
              </p>
            </div>

            <div>
              <Input
                label="URL do Vídeo (MP4 ou YouTube)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                leftIcon={<Video size={16} />}
              />
              <p className="text-xs text-gray-500 mt-1">
                Vídeo de apresentação da trilha.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title mb-2">{t("admin.trailForm.labels.works")}</h2>
          <p className="text-sm text-gray-400 mb-6">
            Adicione e ordene as obras que farão parte desta trilha.
          </p>

          <div className="flex gap-2 mb-6">
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
              leftIcon={<Plus size={18} />}
              disabled={!workToAdd}
            >
              {t("admin.trailForm.add")}
            </Button>
          </div>

          <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-4 min-h-[200px]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              {t("admin.trailForm.orderTitle")}
            </h3>

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
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                <p>{t("admin.trailForm.empty")}</p>
                <p className="text-xs mt-1">Adicione obras acima para começar</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/trilhas")}
            disabled={saving}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            isLoading={saving}
            leftIcon={<Save size={18} />}
          >
            {t("common.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};
