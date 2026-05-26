const fs = require('fs');
const path = 'C:\\Users\\luiza\\Documents\\PicWish\\Cultura Viva\\museus-frontend\\src\\modules\\producer\\pages\\ProducerFinance.tsx';
let content = fs.readFileSync(path, 'utf8');

const nfseSection = `            <div className="bg-[#1a1108] border border-[var(--accent-primary)]/20 p-8 rounded-2xl mt-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                        <FileText size={24} className="text-[var(--accent-primary)]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest">Emissão de Notas Fiscais (NFS-e)</h3>
                        <p className="text-sm text-gray-400">Controle fiscal dos seus eventos</p>
                    </div>
                </div>
                
                <div className="bg-[#2c1e10] p-6 rounded-xl border border-[#463420]">
                    <p className="text-sm text-[#EAE0D5] mb-4">
                        Como Agente Cultural (Produtor), você deve emitir a Nota Fiscal de Serviço (NFS-e) correspondente aos ingressos vendidos. 
                        Este ambiente permite simular a integração com a prefeitura local.
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-lg border border-white/10 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
                            <ExternalLink size={16} />
                            Fazer Upload de NFS-e (PDF)
                        </button>
                        <button className="bg-[#4cd964]/10 hover:bg-[#4cd964]/20 text-[#4cd964] px-4 py-3 rounded-lg border border-[#4cd964]/20 text-sm font-bold uppercase tracking-wider transition-colors">
                            Simular Emissão Automática (API)
                        </button>
                    </div>
                </div>
            </div>`;

if (!content.includes('FileText')) {
    content = content.replace('TrendingUp } from "lucide-react";', 'TrendingUp, FileText } from "lucide-react";');
}

if (!content.includes('Fazer Upload de NFS-e')) {
    content = content.replace('        </div>\n    );\n};', nfseSection + '\n        </div>\n    );\n};');
    fs.writeFileSync(path, content, 'utf8');
    console.log('Added NFS-e section');
}
