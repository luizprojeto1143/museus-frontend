import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { Button, Card, Badge } from "../../../components/ui";
import { Shield, User, Mail, Lock, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const PERMISSION_FLAGS = [
  { id: "manage_works", label: "Gerenciar Obras", description: "Cadastrar, editar e excluir acervo" },
  { id: "manage_events", label: "Gerenciar Eventos", description: "Criar exposições e eventos" },
  { id: "manage_trails", label: "Gerenciar Trilhas", description: "Criar percursos curados" },
  { id: "view_analytics", label: "Ver Analytics", description: "Acesso a relatórios e dados" },
  { id: "manage_scanner", label: "Operar Scanner/Check-in", description: "Validar ingressos e vestígios" },
  { id: "manage_chat_ai", label: "Treinar IA", description: "Configurar base de conhecimento da IA" },
  { id: "manage_guestbook", label: "Moderar Livro de Visitas", description: "Aprovar comentários e reviews" },
  { id: "manage_shop", label: "Gerenciar Loja", description: "Controle de itens e pedidos" },
  { id: "manage_gamification", label: "Gamificação", description: "Caça ao tesouro, conquistas e cupons" },
  { id: "manage_institutional", label: "Gestão Institucional", description: "Editais, projetos e prestadores" },
  { id: "manage_operations", label: "Gestão de Equipamentos", description: "Espaços, equipamentos e agenda" },
  { id: "manage_marketing", label: "IA & Marketing", description: "Descrições IA, Instagram e traduções" },
  { id: "manage_roadmap", label: "Novas Funcionalidades (2026)", description: "Quizzes, timelines e comunidade" },
];

export const AdminCollaboratorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantId } = useAuth();
  const { t } = useTranslation();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "COLLABORATOR" as "COLLABORATOR" | "PRODUCER",
    permissions: {} as Record<string, boolean>
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/users/${id}`)
        .then(res => {
          setFormData({
            name: res.data.name,
            email: res.data.email,
            password: "", 
            role: res.data.role || "COLLABORATOR",
            permissions: res.data.permissions || {}
          });
        })
        .catch(() => toast.error("Erro ao carregar usuário"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tenantId: tenantId
      };

      if (isEdit) {
        if (!payload.password) delete (payload as any).password;
        await api.put(`/users/${id}`, payload);
        toast.success("Usuário atualizado!");
      } else {
        await api.post("/users", payload);
        toast.success("Usuário criado com sucesso!");
      }
      navigate("/admin/usuarios");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao salvar usuário");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (flagId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [flagId]: !prev.permissions[flagId]
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-10">
        <h1 className="section-title">
          {isEdit ? "Editar Integrante da Equipe" : "Novo Integrante da Equipe"}
        </h1>
        <p className="text-muted text-sm">
          Defina as credenciais, o cargo e o nível de acesso para este membro do museu.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-fd text-white flex items-center gap-2">
              <User size={18} className="text-gold" /> Informações Básicas
            </h2>

            <div className="space-y-4">
              <div>
                <label className="sidebar-label-premium">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="sidebar-label-premium">Cargo / Função</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-gold outline-none transition-all"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="COLLABORATOR">Colaborador (Equipe Interna)</option>
                  <option value="PRODUCER">Produtor Cultural (Exposições/Eventos)</option>
                </select>
              </div>

              <div>
                <label className="sidebar-label-premium">Email de Acesso</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    type="email"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="joao@museu.com"
                  />
                </div>
              </div>

              <div>
                <label className="sidebar-label-premium">Senha {isEdit && "(deixe em branco para manter)"}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    type="password"
                    required={!isEdit}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold outline-none transition-all"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-fd text-white flex items-center gap-2">
              <Shield size={18} className="text-gold" /> Permissões (Flags)
            </h2>

            <div className="space-y-3">
              {PERMISSION_FLAGS.map(flag => (
                <div 
                  key={flag.id}
                  onClick={() => togglePermission(flag.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    formData.permissions[flag.id] 
                      ? 'bg-gold/10 border-gold/40' 
                      : 'bg-black/20 border-white/5 opacity-60 grayscale'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-white">{flag.label}</div>
                    <div className="text-[10px] text-muted">{flag.description}</div>
                  </div>
                  {formData.permissions[flag.id] ? (
                    <CheckCircle2 className="text-gold" size={20} />
                  ) : (
                    <XCircle className="text-white/20" size={20} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="glass" onClick={() => navigate("/admin/usuarios")}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            isLoading={loading}
            className="!px-10"
          >
            {isEdit ? "Salvar Alterações" : "Criar Acesso"}
          </Button>
        </div>
      </form>
    </div>
  );
};
