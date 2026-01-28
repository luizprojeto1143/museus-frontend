import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, MapPin, Ticket, User } from 'lucide-react';
import './TicketCard.css';

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
        <div className="ticket-card-wrapper">
            <div className="ticket-card">
                {/* QR Code Section */}
                <div className="ticket-card-qr-section">
                    <div className="ticket-card-qr-container">
                        <QRCodeSVG
                            value={code}
                            size={180}
                            level="H"
                            bgColor="#ffffff"
                            fgColor="#1a1108"
                        />
                    </div>
                </div>

                {/* Warning Banner */}
                <div className="ticket-card-warning">
                    <p className="ticket-card-warning-title">Atenção:</p>
                    <p className="ticket-card-warning-text">
                        Este é o seu ingresso que dará acesso ao evento.
                    </p>
                </div>

                {/* Event Info */}
                <div className="ticket-card-event-info">
                    <h2 className="ticket-card-event-title">{eventTitle}</h2>
                    {eventSubtitle && (
                        <p className="ticket-card-event-subtitle">{eventSubtitle}</p>
                    )}
                </div>

                {/* Details Grid */}
                <div className="ticket-card-details">
                    <div className="ticket-card-detail">
                        <p className="ticket-card-detail-label">
                            <Calendar /> Data:
                        </p>
                        <p className="ticket-card-detail-value">{date}</p>
                    </div>

                    <div className="ticket-card-detail">
                        <p className="ticket-card-detail-label">
                            <Clock /> Horário:
                        </p>
                        <p className="ticket-card-detail-value">{time}</p>
                    </div>

                    <div className="ticket-card-detail">
                        <p className="ticket-card-detail-label">
                            <Ticket /> Tipo:
                        </p>
                        <p className="ticket-card-detail-value">{ticketType}</p>
                    </div>

                    <div className="ticket-card-detail">
                        <p className="ticket-card-detail-label">
                            <MapPin /> Acesso:
                        </p>
                        <p className="ticket-card-detail-value">{accessGate || "Principal"}</p>
                    </div>

                    {location && (
                        <div className="ticket-card-detail full-width">
                            <p className="ticket-card-detail-label">
                                <MapPin /> Local:
                            </p>
                            <p className="ticket-card-detail-value">{location}</p>
                        </div>
                    )}

                    <div className="ticket-card-detail full-width">
                        <p className="ticket-card-detail-label">
                            <User /> Participante:
                        </p>
                        <p className="ticket-card-detail-value">{guestName}</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="ticket-card-footer">
                    <p className="ticket-card-code-label">Código</p>
                    <p className="ticket-card-code-value">{code}</p>
                </div>
            </div>
        </div>
    );
};
