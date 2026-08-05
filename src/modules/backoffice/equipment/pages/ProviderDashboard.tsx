import React from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Package, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const ProviderDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parceiros e Prestadores</h1>
          <p className="text-gray-500">Gerencie cadastros reais de parceiros, produtos e servicos vinculados ao equipamento.</p>
        </div>
        <Button onClick={() => navigate("/admin/parceiros-roteiro")} rightIcon={<ArrowRight size={18} />}>
          Abrir Parceiros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <Users className="text-indigo-500 mb-4" size={28} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cadastro de Parceiros</h2>
          <p className="text-sm text-gray-500 mt-2">
            Inclua restaurantes, guias, lojas e servicos associados aos roteiros culturais.
          </p>
        </Card>

        <Card className="p-6">
          <Package className="text-blue-500 mb-4" size={28} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Produtos e Experiencias</h2>
          <p className="text-sm text-gray-500 mt-2">
            Organize ofertas que podem aparecer nos roteiros e nas jornadas dos visitantes.
          </p>
        </Card>

        <Card className="p-6">
          <Activity className="text-emerald-500 mb-4" size={28} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Operacao Real</h2>
          <p className="text-sm text-gray-500 mt-2">
            Este painel nao usa dados simulados. Indicadores financeiros entram quando as APIs de parceiros forem ativadas.
          </p>
        </Card>
      </div>
    </div>
  );
};
