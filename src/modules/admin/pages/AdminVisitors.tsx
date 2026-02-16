import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface Visitor {
  id: string;
  name: string;
  email: string;
  age?: number;
  xp: number;
  trailsCompleted: number;
  worksVisited: number;
  eventsAccessed: number;
  firstAccessAt: string;
  lastAccessAt: string;
}

export const AdminVisitors: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");



  const loadVisitors = React.useCallback(async () => {
    try {
      const res = await api.get(`/visitors?tenantId=${tenantId}`);
      // The API returns { data: Visitor[], pagination: ... }
      // We need to extract the data array
      setVisitors(res.data.data || []);
    } catch (err) {
      console.error("Erro ao carregar visitantes", err);
      setVisitors([]); // Ensure it's always an array on error
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const filteredVisitors = visitors.filter(v =>
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const csv = [
      [
        t("admin.visitors.table.name"),
        t("admin.visitors.table.email"),
        t("admin.visitors.table.age"),
        t("admin.visitors.table.xp"),
        t("admin.visitors.table.trails"),
        t("admin.visitors.table.works"),
        "Primeiro Acesso",
        t("admin.visitors.table.lastAccess")
      ],
      ...filteredVisitors.map(v => [
        v.name,
        v.email,
        v.age || "",
        v.xp,
        v.trailsCompleted,
        v.worksVisited,
        new Date(v.firstAccessAt).toLocaleDateString(),
        new Date(v.lastAccessAt).toLocaleDateString()
      ])
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitantes-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 className="section-title">👥 {t("admin.visitors.title")}</h1>

        </div>
        <button onClick={handleExportCSV} className="btn btn-secondary">
          📥 {t("admin.visitors.exportCSV")}
        </button>
      </div>

      {/* Stats Rápidas */}
      <div className="card-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-value">{visitors.length}</div>
          <div className="stat-label">{t("admin.visitors.totalVisitors")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round(visitors.reduce((acc, v) => acc + v.xp, 0) / visitors.length) || 0}
          </div>
          <div className="stat-label">{t("admin.visitors.avgXP")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round(visitors.reduce((acc, v) => acc + (v.age || 0), 0) / visitors.filter(v => v.age).length) || 0}
          </div>
          <div className="stat-label">{t("admin.visitors.avgAge")}</div>
        </div>
      </div>

      {/* Busca */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
        <input
          type="text"
          placeholder={`🔍 ${t("admin.visitors.searchPlaceholder")}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            background: "rgba(42, 24, 16, 0.3)"
          }}
        />
      </div>

      {loading && <p>{t("admin.visitors.loading")}</p>}

      {!loading && filteredVisitors.length === 0 && (
        <div className="card">
          <p>{t("admin.visitors.noData")}</p>
        </div>
      )}

      {!loading && filteredVisitors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVisitors.map((visitor) => (
            <div key={visitor.id} className="card relative group hover:border-[#d4af37] transition-all duration-300">
              <div className="absolute top-0 right-0 p-4">
                <span className="badge bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
                  {visitor.xp} XP
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8860b] text-[#1a1108] flex items-center justify-center font-bold text-xl shadow-lg shadow-[#d4af37]/20">
                  {visitor.name ? visitor.name.charAt(0).toUpperCase() : "?"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#EAE0D5] line-clamp-1" title={visitor.name}>{visitor.name || "Visitante sem nome"}</h3>
                  <p className="text-xs text-[#8b7355] line-clamp-1" title={visitor.email}>{visitor.email || "Sem e-mail"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-[#0f0a05]/30 rounded-lg border border-[#463420]">
                <div className="text-center">
                  <div className="text-xs text-[#8b7355] uppercase">Idade</div>
                  <div className="font-bold text-[#EAE0D5]">{visitor.age || "-"}</div>
                </div>
                <div className="text-center border-l border-[#463420]">
                  <div className="text-xs text-[#8b7355] uppercase">Trilhas</div>
                  <div className="font-bold text-[#EAE0D5]">{visitor.trailsCompleted}</div>
                </div>
                <div className="text-center border-l border-[#463420]">
                  <div className="text-xs text-[#8b7355] uppercase">Obras</div>
                  <div className="font-bold text-[#EAE0D5]">{visitor.worksVisited}</div>
                </div>
              </div>

              <div className="text-xs text-[#8b7355] mb-4 flex justify-between">
                <span>Primeiro: {new Date(visitor.firstAccessAt).toLocaleDateString()}</span>
                <span>Último: {new Date(visitor.lastAccessAt).toLocaleDateString()}</span>
              </div>

              <Link
                to={`/admin/visitantes/${visitor.id}`}
                className="w-full block text-center py-2.5 rounded bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 font-bold hover:bg-[#d4af37] hover:text-[#1a1108] transition-all"
              >
                {t("admin.visitors.viewDetails")}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
