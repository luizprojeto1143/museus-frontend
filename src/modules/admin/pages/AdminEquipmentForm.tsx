import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { useToast } from "../../../contexts/ToastContext";
import {
    Landmark, Save, ArrowLeft, Building2, MapPin,
    Tent, Music, Mail, Lock, User, Globe, CheckCircle2,
    FileText, Image as ImageIcon
} from "lucide-react";
import { Button, Input, Select, Checkbox, Textarea } from "../../../components/ui";
import "./AdminShared.css";

type EquipmentType = "MUSEUM" | "CULTURAL_SPACE" | "PRODUCER" | "THEATER" | "GALLERY";

export const AdminEquipmentForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const isNew = id === 'novo' || !id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form Data
    // Basic Info
    const [nome, setNome] = useState("");
    const [slug, setSlug] = useState("");
    const [tipo, setTipo] = useState<EquipmentType>("MUSEUM");
    const [descricao, setDescricao] = useState("");
    const [missao, setMissao] = useState("");

    // Location
    const [endereco, setEndereco] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("MG");
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);

    // Media
    const [fotoCapaUrl, setFotoCapaUrl] = useState("");
    const [logoUrl, setLogoUrl] = useState("");

    // Status
    const [ativo, setAtivo] = useState(true);

    useEffect(() => {
        if (!isNew && id) {
            loadEquipment();
        }
    }, [id, isNew]);

    const loadEquipment = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/equipamentos/public/${id}`);
            const data = res.data;

            setNome(data.nome);
            setSlug(data.slug);
            setTipo(data.tipo);
            setDescricao(data.descricao || "");
            setMissao(data.missao || "");
            setEndereco(data.endereco || "");
            setCidade(data.cidade || "");
            setEstado(data.estado || "MG");
            setLat(data.lat);
            setLng(data.lng);
            setFotoCapaUrl(data.fotoCapaUrl || "");
            setLogoUrl(data.logoUrl || "");
            setAtivo(data.ativo ?? true);

        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar equipamento. Verifique suas permissões.", "error");
            navigate("/admin/equipamentos");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload: any = {
                nome,
                slug,
                tipo,
                descricao,
                missao,
                endereco,
                cidade,
                estado,
                lat,
                lng,
                fotoCapaUrl,
                logoUrl,
                ativo
            };

            if (isNew) {
                await api.post("/equipamentos", payload);
                addToast("Equipamento criado com sucesso!", "success");
            } else {
                await api.put(`/equipamentos/${id}`, payload);
                addToast("Equipamento atualizado com sucesso!", "success");
            }

            navigate("/admin/equipamentos");

        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || "Erro ao salvar equipamento";
            addToast(msg, "error");
        } finally {
            setSaving(false);
        }
    };

    const typeOptions = [
        { value: "MUSEUM", label: "Museu / Memorial", icon: <Landmark size={20} /> },
        { value: "THEATER", label: "Teatro / Cine-teatro", icon: <Music size={20} /> },
        { value: "CULTURAL_SPACE", label: "Centro Cultural", icon: <Building2 size={20} /> },
        { value: "GALLERY", label: "Galeria de Arte", icon: <ImageIcon size={20} /> },
        { value: "PRODUCER", label: "Produtora / Coletivo", icon: <Music size={20} /> }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[var(--bg-root)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[var(--fg-muted)] text-sm">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-form-container">
            {/* Header */}
            <div className="admin-wizard-header">
                <Button
                    onClick={() => navigate("/admin/equipamentos")}
                    variant="ghost"
                    className="p-0 text-[var(--fg-muted)] hover:text-white"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="admin-wizard-title">
                        {isNew ? "Novo Equipamento Cultural" : "Editar Equipamento"}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-24">
                {/* Basic Info */}
                <div className="admin-section">
                    <h3 className="admin-section-title">
                        <Building2 className="text-[var(--accent-gold)]" size={20} /> Identificação
                    </h3>                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <Input
                                label="Nome do Equipamento"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                                placeholder="Ex: Teatro Municipal de Ouro Preto"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <Select
                                label="Tipo de Equipamento"
                                value={tipo}
                                onChange={e => setTipo(e.target.value as any)}
                            >
                                {typeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </Select>
                        </div>

                        <div className="form-group md:col-span-2">
                            <Input
                                label="Identificador Único (Slug)"
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                placeholder="ex: teatro-municipal"
                                required
                                leftIcon={<Globe size={16} />}
                                style={{ fontFamily: 'monospace' }}
                            />
                            <p className="text-xs text-[var(--fg-muted)] mt-2">
                                Usado na URL pública do equipamento.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Description and Mission */}
                <div className="admin-section">
                    <h3 className="admin-section-title">
                        <FileText className="text-[var(--accent-gold)]" size={20} /> Conteúdo Institucional
                    </h3>
                    <div className="space-y-6">
                        <Textarea 
                            label="Descrição"
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                            placeholder="Breve história ou descrição do espaço..."
                            rows={4}
                        />
                        <Textarea 
                            label="Experiência / Missão"
                            value={missao}
                            onChange={e => setMissao(e.target.value)}
                            placeholder="O que o visitante encontrará aqui?"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="admin-section">
                    <h3 className="admin-section-title">
                        <MapPin className="text-[var(--accent-gold)]" size={20} /> Localização
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group md:col-span-2">
                            <Input
                                label="Endereço Completo"
                                value={endereco}
                                onChange={e => setEndereco(e.target.value)}
                                placeholder="Rua, Número, Bairro"
                                leftIcon={<MapPin size={16} />}
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                label="Cidade"
                                value={cidade}
                                onChange={e => setCidade(e.target.value)}
                                placeholder="Ex: Ouro Preto"
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                label="Estado"
                                value={estado}
                                onChange={e => setEstado(e.target.value)}
                                placeholder="Ex: MG"
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                label="Latitude"
                                type="number"
                                step="any"
                                value={lat || ''}
                                onChange={e => setLat(e.target.value ? parseFloat(e.target.value) : null)}
                                placeholder="-20.38..."
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                label="Longitude"
                                type="number"
                                step="any"
                                value={lng || ''}
                                onChange={e => setLng(e.target.value ? parseFloat(e.target.value) : null)}
                                placeholder="-43.50..."
                            />
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="admin-section">
                    <h3 className="admin-section-title">
                        <ImageIcon className="text-[var(--accent-gold)]" size={20} /> Identidade Visual
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <Input
                                label="URL do Logotipo"
                                value={logoUrl}
                                onChange={e => setLogoUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="form-group">
                            <Input
                                label="URL da Foto de Capa"
                                value={fotoCapaUrl}
                                onChange={e => setFotoCapaUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="admin-section">
                    <h3 className="admin-section-title">
                        <CheckCircle2 className="text-[var(--accent-gold)]" size={20} /> Status do Equipamento
                    </h3>
                    <Checkbox
                        label="Equipamento Ativo"
                        description="Equipamentos inativos não aparecem na busca pública nem no portal do visitante."
                        checked={ativo}
                        onChange={e => setAtivo(e.target.checked)}
                    />
                </div>

                <div className="admin-wizard-footer">
                    <div className="admin-wizard-footer-inner">
                        <Button
                            type="button"
                            onClick={() => navigate("/admin/equipamentos")}
                            variant="ghost"
                            className="text-[var(--fg-muted)] hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            isLoading={saving}
                            className="btn-primary"
                            leftIcon={!saving ? <Save size={18} /> : undefined}
                        >
                            {isNew ? "Criar Equipamento" : "Salvar Alterações"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
