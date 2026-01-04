import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, MapPin, Ticket, User } from 'lucide-react';

interface TicketCardProps {
    eventTitle: string;
    eventSubtitle?: string;
    code: string;
    guestName: string;
    date: string;
    time: string;
    location?: string;
    ticketType?: string;
    accessGate?: string;
}

export const TicketCard: React.FC<TicketCardProps> = ({
    eventTitle,
    eventSubtitle,
    code,
    guestName,
    date,
    time,
    location,
    ticketType = "Inteira",
    accessGate
}) => {
    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Main Ticket Container */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">

                {/* QR Code Section */}
                <div className="p-6 flex flex-col items-center">
                    {/* QR Code with white border */}
                    <div className="bg-white p-4 rounded-2xl shadow-lg">
                        <QRCodeSVG
                            value={code}
                            size={180}
                            level="H"
                            bgColor="#ffffff"
                            fgColor="#0f172a"
                        />
                    </div>
                </div>

                {/* Warning Banner */}
                <div className="bg-amber-500/20 border-y border-amber-500/30 py-4 px-6">
                    <p className="text-amber-400 font-bold text-center text-sm tracking-wider uppercase">
                        Atenção:
                    </p>
                    <p className="text-amber-300/80 text-center text-xs mt-1">
                        Este é o seu ingresso que dará acesso ao evento.
                    </p>
                </div>

                {/* Event Info */}
                <div className="p-6 text-center border-b border-slate-700">
                    <h2 className="text-white text-2xl font-bold tracking-wide uppercase">
                        {eventTitle}
                    </h2>
                    {eventSubtitle && (
                        <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest">
                            {eventSubtitle}
                        </p>
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-px bg-slate-700">
                    {/* Date */}
                    <div className="bg-slate-800 p-4">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Data:
                        </p>
                        <p className="text-white font-bold">{date}</p>
                    </div>

                    {/* Time */}
                    <div className="bg-slate-800 p-4">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Horário:
                        </p>
                        <p className="text-white font-bold">{time}</p>
                    </div>

                    {/* Ticket Type */}
                    <div className="bg-slate-800 p-4">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Ticket className="w-3 h-3" /> Tipo:
                        </p>
                        <p className="text-white font-bold">{ticketType}</p>
                    </div>

                    {/* Access Gate */}
                    <div className="bg-slate-800 p-4">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Acesso:
                        </p>
                        <p className="text-white font-bold">{accessGate || "Principal"}</p>
                    </div>

                    {/* Location - Full width */}
                    {location && (
                        <div className="bg-slate-800 p-4 col-span-2">
                            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Local:
                            </p>
                            <p className="text-white font-bold">{location}</p>
                        </div>
                    )}

                    {/* Guest Name - Full width */}
                    <div className="bg-slate-800 p-4 col-span-2">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> Participante:
                        </p>
                        <p className="text-white font-bold">{guestName}</p>
                    </div>
                </div>

                {/* Ticket Code Footer */}
                <div className="bg-slate-900 p-4 text-center">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Código</p>
                    <p className="text-amber-400 font-mono font-bold text-lg tracking-widest">{code}</p>
                </div>
            </div>
        </div>
    );
};
