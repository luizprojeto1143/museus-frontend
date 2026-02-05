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
          <p className="section-subtitle">
            {t("admin.visitors.subtitle")}
          </p>
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
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>{t("admin.visitors.table.name")}</th>
                <th>{t("admin.visitors.table.email")}</th>
                <th>{t("admin.visitors.table.age")}</th>
                <th>{t("admin.visitors.table.xp")}</th>
                <th>{t("admin.visitors.table.trails")}</th>
                <th>{t("admin.visitors.table.works")}</th>
                <th>{t("admin.visitors.table.lastAccess")}</th>
                <th>{t("admin.visitors.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td style={{ fontWeight: 600 }}>{visitor.name || "-"}</td>
                  <td>{visitor.email || "-"}</td>
                  <td>{visitor.age || "-"}</td>
                  <td>
                    <span className="badge">{visitor.xp} XP</span>
                  </td>
                  <td>{visitor.trailsCompleted || 0}</td>
                  <td>{visitor.worksVisited || 0}</td>
                  <td style={{ fontSize: "0.85rem" }}>
                    {new Date(visitor.lastAccessAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link
                      to={`/admin/visitantes/${visitor.id}`}
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                    >
                      {t("admin.visitors.viewDetails")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
