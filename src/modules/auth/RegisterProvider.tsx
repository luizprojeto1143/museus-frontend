import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { 
    Briefcase, ShieldCheck, Mail, Lock, User, 
    ArrowRight, CheckCircle2, DollarSign, Zap,
    Star, Globe, Info
} from "lucide-react";
import { Button, Input, Badge } from "../../components/ui";
import { useToast } from "../../contexts/ToastContext";

export const RegisterProvider: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        serviceType: "OTHER",
        description: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            addToast("As senhas não coincidem.", "error");
            return;
        }

        setLoading(true);
        try {
            // Register as a provider
            const response = await api.post("/auth/register-provider", {
                ...formData,
                services: [formData.serviceType]
            });
            
            if (response.data.checkoutUrl) {
                addToast("Cadastro realizado! Redirecionando para o pagamento da assinatura...", "success");
                // Wait a bit for the toast
                setTimeout(() => {
                    window.location.href = response.data.checkoutUrl;
                }, 1500);
            } else {
                addToast("Cadastro realizado! Bem-vindo à rede de prestadores.", "success");
                navigate("/login");
            }
        } catch (err: any) {
            addToast(err.response?.data?.message || "Erro ao realizar cadastro.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#05050c] text-[#f5e6d3] flex flex-col lg:flex-row overflow-hidden">
            
            {/* LEFT SIDE: VALUE PROPOSITION */}
            <div className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center relative bg-[#0a0a14]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(159,122,234,0.1),transparent)] opacity-50" />
                
                <Link to="/" className="relative z-10 flex items-center gap-3 mb-16 group">
                    <div className="w-10 h-10 bg-[#9f7aea] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#9f7aea]/20">
                        <Briefcase size={20} />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white uppercase group-hover:text-[#9f7aea] transition-colors">
                        Cultura Viva <span className="text-[#9f7aea]">Network</span>
                    </span>
                </Link>

                <div className="relative z-10 max-w-md">
                    <Badge variant="outline" className="mb-6 border-[#9f7aea]/30 text-[#9f7aea] uppercase tracking-widest font-bold">Oportunidade</Badge>
                    <h1 className="text-5xl lg:text-7xl font-black text-white leading-none mb-8 tracking-tighter italic">
                        Trabalhe na <br />
                        <span className="text-[#9f7aea]">Cultura.</span>
                    </h1>
                    <p className="text-xl text-[#b794f4] mb-12 leading-relaxed">
                        Conectamos prestadores de serviços aos maiores projetos culturais da cidade. Seja visto por centenas de produtores.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#9f7aea] group-hover:bg-[#9f7aea] group-hover:text-white transition-all">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Investimento Inteligente</h4>
                                <p className="text-sm text-[#b794f4]">Apenas R$ 50,00/mês para estar no topo da vitrine.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#9f7aea] group-hover:bg-[#9f7aea] group-hover:text-white transition-all">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Contratação Direta</h4>
                                <p className="text-sm text-[#b794f4]">Receba pedidos de orçamento direto no seu Dashboard.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: REGISTRATION FORM */}
            <div className="lg:w-1/2 bg-[#0a0a14] p-12 lg:p-24 flex flex-col justify-center border-l border-white/5 relative">
                <div className="max-w-md w-full mx-auto relative z-10">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-white mb-2">Crie seu Perfil</h2>
                        <p className="text-[#b794f4]">Preencha os dados profissionais para começar.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <Input 
                            label="Nome Profissional / Empresa"
                            name="name"
                            placeholder="Ex: João Som & Luz"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            leftIcon={<User size={18} className="text-[#9f7aea]" />}
                            className="bg-white/5 border-white/10 text-white focus:border-[#9f7aea]"
                        />
                        <Input 
                            label="E-mail"
                            type="email"
                            name="email"
                            placeholder="contato@empresa.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            leftIcon={<Mail size={18} className="text-[#9f7aea]" />}
                            className="bg-white/5 border-white/10 text-white focus:border-[#9f7aea]"
                        />
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#b794f4] uppercase tracking-widest">Sua Especialidade</label>
                            <select 
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleChange}
                                className="w-full bg-[#0a0a14] border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[#9f7aea]/50 transition-all outline-none"
                            >
                                <option value="LIBRAS_INTERPRETATION">Intérprete de Libras</option>
                                <option value="AUDIO_DESCRIPTION">Audiodescrição</option>
                                <option value="CAPTIONING">Legendagem / Transcrição</option>
                                <option value="BRAILLE">Acessibilidade Física / Braille</option>
                                <option value="OTHER">Outros Serviços Culturais</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="Senha"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                leftIcon={<Lock size={18} className="text-[#9f7aea]" />}
                                className="bg-white/5 border-white/10 text-white focus:border-[#9f7aea]"
                            />
                            <Input 
                                label="Confirmar"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                leftIcon={<ShieldCheck size={18} className="text-[#9f7aea]" />}
                                className="bg-white/5 border-white/10 text-white focus:border-[#9f7aea]"
                            />
                        </div>

                        <div className="p-4 bg-[#9f7aea]/10 border border-[#9f7aea]/20 rounded-2xl flex gap-3 text-[#b794f4] text-xs leading-relaxed">
                            <Info size={20} className="shrink-0 text-[#9f7aea]" />
                            <div>
                                <span className="font-bold text-white block mb-1">Informação de Assinatura</span>
                                Ao se cadastrar, você concorda com a taxa mensal de <strong>R$ 50,00</strong> para manutenção do seu perfil na rede de fomento. O primeiro pagamento será solicitado após o login.
                            </div>
                        </div>

                        <Button 
                            type="submit"
                            isLoading={loading}
                            className="w-full h-14 bg-[#9f7aea] hover:bg-[#805ad5] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#9f7aea]/20 mt-4"
                        >
                            Criar Meu Perfil Profissional
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-[#b794f4]">
                            Já tem uma conta? <Link to="/login" className="text-white font-bold hover:text-[#9f7aea]">Fazer Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
