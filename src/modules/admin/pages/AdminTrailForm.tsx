import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    padding: "0.75rem",
    background: "var(--bg-card)",
    border: "1px solid var(--border-subtle)",
    marginBottom: "0.5rem",
    borderRadius: "var(--radius-sm)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "grab"
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>:: {title}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // evita drag
          onRemove();
        }}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--text-secondary)",
          cursor: "pointer",
          fontSize: "1.2rem"
        }}
      >
        &times;
      </button>
    </div>
  );
}

export const AdminTrailForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Initial state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [allWorks, setAllWorks] = useState<{ id: string; title: string }[]>([]);
  const [selectedWorks, setSelectedWorks] = useState<{ id: string; title: string }[]>([]);
  const [workToAdd, setWorkToAdd] = useState("");

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
          const t = res.data as { title: string; description: string; works?: { work: { id: string; title: string } }[] };
          setName(t.title);
          setDescription(t.description);
          if (t.works) {
            setSelectedWorks(t.works.map(tw => ({
              id: tw.work.id,
              title: tw.work.title
            })));
          }
        })
        .catch(err => {
          console.error("Erro ao carregar trilha", err);
          alert(t("common.error"));
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

    if (!tenantId) return;

    const payload = {
      title: name,
      description,
      active,
      workIds: selectedWorks.map(w => w.id), // enviar IDs na ordem
      tenantId
    };

    try {
      if (id) {
        await api.put(`/trails/${id}`, payload);
      } else {
        await api.post("/trails", payload);
      }
      navigate("/admin/trilhas");
    } catch (error) {
      console.error("Erro ao salvar trilha", error);
      alert(t("common.error"));
    }
  };

  return (
    <div>
      <h1 className="section-title">
        {isEdit ? t("admin.trailForm.editTitle") : t("admin.trailForm.newTitle")}
      </h1>
      <p className="section-subtitle">
        {t("admin.trailForm.subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 800 }}>
        <div className="form-group">
          <label htmlFor="name">{t("admin.trailForm.labels.name")}</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("admin.trailForm.placeholders.name")}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">{t("admin.trailForm.labels.description")}</label>
          <textarea
            id="description"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <span className="form-label" style={{ marginBottom: 0 }}>{t("admin.trails.status.active")}</span>
          </label>
        </div>

        <div className="form-group">
          <label>{t("admin.trailForm.labels.works")}</label>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <select
              className="input"
              value={workToAdd}
              onChange={(e) => setWorkToAdd(e.target.value)}
            >
              <option value="">{t("admin.trailForm.selectWork")}</option>
              {allWorks.map(w => (
                <option key={w.id} value={w.id}>{w.title}</option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary" onClick={handleAddWork}>
              {t("admin.trailForm.add")}
            </button>
          </div>
        </div>

        <section>
          <h2 className="card-title" style={{ marginBottom: "0.5rem" }}>
            {t("admin.trailForm.orderTitle")}
          </h2>
          <p className="card-subtitle">
            {t("admin.trailForm.orderSubtitle")}
          </p>
          <div
            style={{
              marginTop: "0.75rem",
              maxHeight: "280px",
              overflowY: "auto",
              borderRadius: "0.75rem",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              padding: "0.5rem"
            }}
          >
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
              <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                {t("admin.trailForm.empty")}
              </p>
            )}
          </div>
        </section>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "2rem"
          }}
        >
          <button type="submit" className="btn btn-primary">
            {t("common.save")}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/trilhas")}
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};
