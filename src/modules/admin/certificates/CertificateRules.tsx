import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../api/client';
import { Button } from '../../../components/ui/Button';
import { Plus, Trash, Zap } from 'lucide-react';

export const CertificateRules: React.FC = () => {
    const navigate = useNavigate();
    const [rules, setRules] = useState<any[]>([]);

    const loadRules = async () => {
        try {
            const res = await api.get('/certificate-rules');
            setRules(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadRules();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Automação de Certificados</h1>
                <Button onClick={() => navigate('/admin/certificates/rules/new')}>
                    <Plus size={20} className="mr-2" /> Nova Regra
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-4">Nome da Regra</th>
                            <th className="text-left p-4">Gatilho</th>
                            <th className="text-left p-4">Modelo</th>
                            <th className="text-left p-4">Status</th>
                            <th className="text-right p-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules.map(rule => (
                            <tr key={rule.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{rule.name}</td>
                                <td className="p-4">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                        {rule.triggerType}
                                    </span>
                                </td>
                                <td className="p-4">{rule.actionTemplate?.name || '---'}</td>
                                <td className="p-4">
                                    {rule.active ? (
                                        <span className="text-green-600 font-bold flex items-center">
                                            <Zap size={14} className="mr-1" /> Ativo
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Inativo</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-red-500 hover:text-red-700">
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {rules.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    Nenhuma regra de automação criada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
