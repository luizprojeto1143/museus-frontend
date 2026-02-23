import React from "react";
import { Briefcase } from "lucide-react";

export const ProviderServices: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 bg-[#9f7aea]/10 text-[#9f7aea] rounded-full flex items-center justify-center mb-6">
                <Briefcase size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Meus Serviços</h1>
            <p className="text-[#b794f4] max-w-md">Liste e gerencie os serviços de acessibilidade que você oferece.</p>
        </div>
    );
};
