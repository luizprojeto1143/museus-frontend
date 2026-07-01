import React, { useState, useEffect } from "react";
import { api } from "../../../../api/client";
import { toast } from "react-hot-toast";
import { Award, Printer, Download, Eye, X } from "lucide-react";
import { Button } from "../../../../components/ui";

interface Certificate {
  id: string;
  certificateNumber: string;
  certificateUrl: string;
  title: string | null;
  description: string | null;
  issuedAt: string;
  contract: {
    sponsorName: string;
    opportunity: {
      title: string;
    };
  };
}

export const SponsorCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sponsor-portal/certificates");
      setCertificates(res.data);
    } catch (err) {
      toast.error("Erro ao carregar certificados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-white italic tracking-tight">Certificados Culturais</h1>
        <p className="text-slate-400 mt-1">Visualize e emita seus certificados oficiais de apoio e incentivo à cultura municipal.</p>
      </div>

      {loading ? (
        <div className="p-20 text-center animate-pulse text-amber-500 font-bold italic">Buscando certificados...</div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map(cert => (
            <div key={cert.id} className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Award size={24} />
                </div>
                <h3 className="text-lg font-black text-white">{cert.title || "Certificado de Incentivo"}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{cert.contract.opportunity.title}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{cert.description || "Reconhecimento oficial de parceria cultural."}</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye size={14} /> Visualizar
                </button>
                <a 
                  href={cert.certificateUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 py-3.5 rounded-xl bg-amber-500 text-black font-black text-xs flex items-center justify-center gap-1.5 hover:bg-amber-600 transition-all text-center"
                >
                  <Printer size={14} /> Imprimir
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="premium-glass p-12 rounded-[40px] border-white/5 text-center text-slate-500 italic py-24">
          Nenhum certificado emitido para seus contratos até o momento.
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#fdfbf7] text-[#1b120a] p-12 rounded-[32px] border-[8px] border-[#d4af37] shadow-2xl flex flex-col items-center text-center space-y-6 select-none font-serif">
            
            <button 
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 bg-[#1b120a] text-white rounded-full hover:scale-105 transition-transform"
            >
              <X size={16} />
            </button>

            {/* Decorative frame inner border */}
            <div className="w-full border border-[#d4af37]/30 p-8 flex flex-col items-center space-y-6">
              <span className="text-[11px] font-sans font-bold tracking-[0.4em] text-[#d4af37] uppercase">PREFEITURA MUNICIPAL</span>
              
              <Award size={48} className="text-[#d4af37]" />

              <h2 className="text-4xl font-black italic text-[#1b120a] tracking-tight">Certificado de Apoio Cultural</h2>

              <p className="max-w-2xl text-lg leading-relaxed text-[#403020] font-sans font-light">
                Certificamos para os devidos fins de direito e incentivo fiscal que a empresa <strong className="font-bold text-[#1b120a]">{selectedCert.contract.sponsorName}</strong> contribuiu financeiramente de forma relevante e ativa para o fomento cultural do município no projeto <strong className="font-bold text-[#1b120a]">{selectedCert.contract.opportunity.title}</strong>.
              </p>

              <div className="pt-8 grid grid-cols-2 gap-20 w-full max-w-lg text-xs font-sans text-[#8c7e70]">
                <div className="border-t border-[#1b120a]/30 pt-4 flex flex-col items-center gap-1">
                  <span className="font-bold text-[#1b120a]">SECRETARIA MUNICIPAL DE CULTURA</span>
                  <span>Assinatura Digitalizada</span>
                </div>
                <div className="border-t border-[#1b120a]/30 pt-4 flex flex-col items-center gap-1">
                  <span className="font-bold text-[#1b120a]">CULTURA VIVA</span>
                  <span>Autenticação Eletrônica</span>
                </div>
              </div>

              <div className="pt-4 font-sans text-[10px] text-slate-400 uppercase tracking-widest">
                Nº de Série: {selectedCert.certificateNumber} • Emitido em: {new Date(selectedCert.issuedAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
