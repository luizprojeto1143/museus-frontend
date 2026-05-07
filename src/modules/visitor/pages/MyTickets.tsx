import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { QRCodeSVG } from "qrcode.react";
import { Ticket, Calendar, MapPin, QrCode, Clock, Info, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Card, PageLoader } from "@/components/ui";
import "./CulturalAgenda.css"; // Reuse some styles

interface Registration {
  id: string;
  code: string;
  status: string;
  guestName: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    location?: string;
    tenant: { name: string };
  };
  ticket: {
    name: string;
    type: string;
  };
}

export const MyTickets: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);

  useEffect(() => {
    api.get("/registrations/my-registrations")
      .then(res => setRegistrations(res.data))
      .catch(err => console.error("Error fetching tickets", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const upcoming = registrations.filter(r => {
    const end = r.event.endDate ? new Date(r.event.endDate) : new Date(r.event.startDate);
    // Add 4 hours buffer or just compare with now
    return end >= new Date();
  });
  const past = registrations.filter(r => {
    const end = r.event.endDate ? new Date(r.event.endDate) : new Date(r.event.startDate);
    return end < new Date();
  });

  return (
    <div className="tickets-container">
      <header className="mb-10 text-center">
        <h1 className="section-title">Meus Ingressos</h1>
        <p className="text-muted text-sm">Seus acessos e reservas para experiências culturais.</p>
      </header>

      {registrations.length === 0 ? (
        <div className="ticket-empty">
          <Ticket size={64} className="mx-auto mb-4 opacity-20" />
          <p>Você ainda não possui nenhum ingresso.</p>
          <Button variant="outline" className="mt-6" onClick={() => window.location.href='/agenda'}>
            Explorar Agenda Cultural
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar size={18} className="text-gold" /> Próximos Eventos
              </h2>
              {upcoming.map(reg => (
                <TicketCard key={reg.id} registration={reg} onShowQR={() => setSelectedTicket(reg)} />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="opacity-60">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Clock size={18} /> Histórico
              </h2>
              {past.map(reg => (
                <TicketCard key={reg.id} registration={reg} onShowQR={() => setSelectedTicket(reg)} />
              ))}
            </section>
          )}
        </div>
      )}

      {/* QR Code Modal Overlay */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div 
              className="bg-[#1a1a1a] border border-white/10 rounded-[40px] p-8 max-w-sm w-full text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <Badge variant="gold" className="mb-6">Ingresso Digital</Badge>
              <h3 className="text-2xl font-bold mb-2">{selectedTicket.event.title}</h3>
              <p className="text-muted text-sm mb-8">{selectedTicket.ticket.name}</p>
              
              <div className="bg-white p-6 rounded-3xl inline-block mb-8 shadow-2xl shadow-gold/20">
                <QRCodeSVG value={selectedTicket.code} size={200} level="H" />
              </div>

              <div className="text-gold font-mono text-lg mb-8 tracking-widest">
                {selectedTicket.code}
              </div>

              <div className="bg-white/5 p-4 rounded-2xl text-xs text-left flex gap-3 items-start">
                <Info size={16} className="text-gold shrink-0" />
                <p className="text-white/60">Apresente este QR Code na portaria do evento para realizar o seu check-in e validar sua entrada.</p>
              </div>

              <Button 
                variant="glass" 
                className="w-full mt-8"
                onClick={() => setSelectedTicket(null)}
              >
                Fechar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TicketCard: React.FC<{ registration: Registration, onShowQR: () => void }> = ({ registration, onShowQR }) => {
  const date = new Date(registration.event.startDate);
  
  const getStatusLabel = (status: string) => {
    if (status === 'CONFIRMED') return 'Confirmado';
    if (status === 'CHECKED_IN') return 'Utilizado';
    if (status === 'PENDING') return 'Pagamento Pendente';
    return status;
  };

  const getStatusClass = (status: string) => {
    if (status === 'CONFIRMED') return 'status-confirmed';
    if (status === 'CHECKED_IN') return 'status-checked';
    if (status === 'PENDING') return 'status-pending';
    return '';
  };

  return (
    <div className="ticket-card">
      <div className="ticket-main">
        <div className="ticket-header">
          <span className="ticket-id">#{registration.code}</span>
          <span className={`ticket-status ${getStatusClass(registration.status)}`}>
            {getStatusLabel(registration.status)}
          </span>
        </div>
        
        <div className="ticket-body">
          <p className="text-gold text-[10px] font-bold uppercase tracking-wider mb-1">
            {registration.event.tenant.name}
          </p>
          <h2>{registration.event.title}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <div className="flex items-center gap-1">
              <Calendar size={14} /> 
              {date.toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {registration.event.location || "Sede"}
            </div>
          </div>
        </div>
      </div>

      <div className="ticket-footer">
        <div className="text-xs">
          <p className="text-muted">Titular</p>
          <p className="font-bold">{registration.guestName}</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="btn-qr !bg-transparent border border-white/20 hover:bg-white/5" 
            onClick={(e) => {
               e.stopPropagation();
               const startDate = new Date(registration.event.startDate);
               const start = startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
               
               let end = start;
               if (registration.event.endDate) {
                   end = new Date(registration.event.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
               } else {
                   const fallbackEnd = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
                   end = fallbackEnd.toISOString().replace(/-|:|\.\d\d\d/g, "");
               }

               const title = encodeURIComponent(registration.event.title);
               const loc = encodeURIComponent(registration.event.location || registration.event.tenant.name || "");
               const details = encodeURIComponent(`Seu ingresso: ${registration.code}`);
               window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${loc}`, '_blank');
            }}
            title="Salvar no Google Agenda"
          >
            <Calendar size={16} /> Agenda
          </button>
          
          <button 
            className="btn-qr !bg-black border border-white/10 hover:bg-gray-900" 
            onClick={(e) => {
               e.stopPropagation();
               // Call the backend endpoint to download the .pkpass file
               const baseURL = import.meta.env.VITE_API_URL || "https://museus-backend-1.onrender.com";
               window.open(`${baseURL.replace(/\/$/, "")}/registrations/${registration.code}/wallet/apple`, '_blank');
            }}
            title="Adicionar à Carteira da Apple"
          >
            🍎 Wallet
          </button>

          <button className="btn-qr" onClick={onShowQR}>
            <QrCode size={16} /> QR Code
          </button>
        </div>
      </div>

      {registration.status === 'CHECKED_IN' && (
        <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 p-2 rounded-full backdrop-blur-sm">
          <CheckCircle2 size={24} />
        </div>
      )}
    </div>
  );
};
