import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { Button } from '../../../components/ui/Button';
import { Plus, Edit, Trash, FileText } from 'lucide-react';

export const CertificateTemplates: React.FC = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const res = await api.get('/certificate-templates');
            setTemplates(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este modelo?')) return;
        try {
            await api.delete(`/certificate-templates/${id}`);
            loadTemplates(); // Reload
        } catch (err) {
            alert('Erro ao excluir');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Modelos de Certificado</h1>
                <div className="space-x-2">
                    <Button variant="outline" onClick={() => navigate('/admin/certificates/rules')}>
                        🤖 Regras e Automação
                    </Button>
                    <Button onClick={() => navigate('/admin/certificates/new')}>
                        <Plus size={20} className="mr-2" /> Novo Modelo
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map(t => (
                    <div key={t.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                        <div
                            className="h-40 bg-gray-100 rounded mb-4 bg-cover bg-center"
                            style={{ backgroundImage: t.backgroundUrl ? `url(${t.backgroundUrl})` : 'none' }}
                        >
                            {!t.backgroundUrl && (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    <FileText size={48} />
                                </div>
                            )}
                        </div>
                        <h3 className="font-bold text-lg">{t.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{t.elements?.length || 0} elementos</p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(`/admin/certificates/edit/${t.id}`)}
                                className="flex-1 p-2 bg-blue-50 text-blue-600 rounded flex items-center justify-center hover:bg-blue-100"
                            >
                                <Edit size={16} className="mr-2" /> Editar
                            </button>
                            <button
                                onClick={() => handleDelete(t.id)}
                                className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-3 text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed">
                        <h3 className="text-xl text-gray-500">Nenhum modelo criado ainda</h3>
                        <Button onClick={() => navigate('/admin/certificates/new')} className="mt-4">
                            Criar Primeiro Modelo
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
