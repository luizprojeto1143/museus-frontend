import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { UserCheck, AlertTriangle, QrCode, Calendar, Users, Search } from 'lucide-react';
import { api } from '../../../api/client';
import { AxiosError } from 'axios';
import './AdminTicketVerifier.css';

type ScanResult = {
    guestName?: string;
    code: string;
    eventTitle?: string;
    ticketType?: string;
    checkedInAt?: string;
};

type EventSummary = {
    id: string;
    title: string;
    date: string;
    registrationsCount: number;
    checkedInCount: number;
};

export const AdminTicketVerifier: React.FC = () => {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');
    const [recentEvents, setRecentEvents] = useState<EventSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, checkedIn: 0 });

    // Carregar eventos com inscrições
    const { tenantId } = useAuth();

    // Carregar eventos com inscrições
    useEffect(() => {
        const loadEvents = async () => {
            if (!tenantId) return;
            try {
                const res = await api.get(`/events?hasRegistrations=true&limit=5&tenantId=${tenantId}`);
                setRecentEvents(res.data.events || res.data.data || res.data || []);
            } catch {
                // Silently fail
            }
        };
        loadEvents();
    }, [tenantId]);

    // Atualizar estatísticas
    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await api.get('/registrations/stats/today');
                setStats(res.data);
            } catch {
                // Use defaults
            }
        };
        loadStats();
    }, [scanResult]);

    const handleCheckIn = useCallback(async (code: string) => {
        if (!code.trim()) return;

        setError(null);
        setScanResult(null);
        setLoading(true);

        try {
            const res = await api.post('/registrations/checkin', { code: code.trim() });
            setScanResult({
                ...res.data.registration,
                eventTitle: res.data.event?.title
            });
            setManualCode('');
        } catch (err) {
            const axiosErr = err as AxiosError<{ error?: string }>;
            setError(axiosErr.response?.data?.error || "Ingresso não encontrado ou já utilizado");
        } finally {
            setLoading(false);
        }
    }, []);

    // Inicializar scanner QR
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "ticket-reader",
            {
                fps: 10,
                qrbox: { width: 280, height: 280 },
                aspectRatio: 1
            },
            false
        );

        scanner.render(
            (decodedText) => {
                handleCheckIn(decodedText);
            },
            () => {
                // Scan error - ignore
            }
        );

        return () => {
            scanner.clear().catch(() => { });
        };
    }, [handleCheckIn]);

    const resetScanner = () => {
        setScanResult(null);
        setError(null);
    };

    return (
        <div className="ticket-verifier-container">
            <div className="ticket-verifier-header">
                <div className="header-title">
                    <QrCode className="header-icon" />
                    <div>
                        <h1>Verificador de Ingressos</h1>
                        <p>Escaneie o QR Code do ingresso para fazer check-in</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <Users size={20} />
                        <div>
                            <span className="stat-value">{stats.checkedIn}</span>
                            <span className="stat-label">Check-ins Hoje</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ticket-verifier-content">
                {/* Scanner Section */}
                <div className="scanner-section">
                    <div className="scanner-card">
                        <div id="ticket-reader" className="qr-scanner"></div>

                        {/* Result Display */}
                        {scanResult && (
                            <div className="result-card success">
                                <div className="result-icon">
                                    <UserCheck size={32} />
                                </div>
                                <div className="result-content">
                                    <h3>✓ Check-in Confirmado!</h3>
                                    <div className="result-details">
                                        <p><strong>Participante:</strong> {scanResult.guestName || "Visitante"}</p>
                                        <p><strong>Código:</strong> {scanResult.code}</p>
                                        {scanResult.eventTitle && (
                                            <p><strong>Evento:</strong> {scanResult.eventTitle}</p>
                                        )}
                                        {scanResult.ticketType && (
                                            <p><strong>Tipo:</strong> {scanResult.ticketType}</p>
                                        )}
                                        <p><strong>Horário:</strong> {new Date().toLocaleTimeString('pt-BR')}</p>
                                    </div>
                                </div>
                                <button onClick={resetScanner} className="btn-next">
                                    Próximo Ingresso
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="result-card error">
                                <div className="result-icon error">
                                    <AlertTriangle size={32} />
                                </div>
                                <div className="result-content">
                                    <h3>✗ Erro na Verificação</h3>
                                    <p className="error-message">{error}</p>
                                </div>
                                <button onClick={resetScanner} className="btn-retry">
                                    Tentar Novamente
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Manual Entry */}
                    <div className="manual-entry">
                        <h3><Search size={18} /> Entrada Manual</h3>
                        <div className="manual-form">
                            <input
                                type="text"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="Digite o código do ingresso"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCheckIn(manualCode);
                                }}
                            />
                            <button
                                onClick={() => handleCheckIn(manualCode)}
                                disabled={loading || !manualCode.trim()}
                            >
                                {loading ? 'Verificando...' : 'Verificar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Events Sidebar */}
                <div className="events-sidebar">
                    <h3><Calendar size={18} /> Eventos com Inscrições</h3>
                    {recentEvents.length === 0 ? (
                        <p className="no-events">Nenhum evento com inscrições</p>
                    ) : (
                        <div className="events-list">
                            {recentEvents.map((event) => (
                                <div key={event.id} className="event-item">
                                    <div className="event-info">
                                        <h4>{event.title}</h4>
                                        <span className="event-date">
                                            {new Date(event.date).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    <div className="event-stats">
                                        <span className="checked-count">
                                            {event.checkedInCount || 0}/{event.registrationsCount || 0}
                                        </span>
                                        <span className="checked-label">check-ins</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
