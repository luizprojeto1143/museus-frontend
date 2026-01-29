import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, X, Navigation, Clock } from 'lucide-react';
import './ProximityAlert.css';

export interface ProximityAlertData {
    id: string;
    type: 'work' | 'museum' | 'point';
    title: string;
    subtitle?: string;
    imageUrl?: string;
    distance: number; // metros
    url: string;
}

interface ProximityAlertProps {
    alerts: ProximityAlertData[];
    onDismiss: (id: string) => void;
    onDismissAll: () => void;
}

export const ProximityAlert: React.FC<ProximityAlertProps> = ({
    alerts,
    onDismiss,
    onDismissAll
}) => {
    const navigate = useNavigate();

    if (alerts.length === 0) return null;

    const currentAlert = alerts[0]; // Show one at a time

    const getIcon = (type: string) => {
        switch (type) {
            case 'museum': return '🏛️';
            case 'point': return '📍';
            default: return '🎨';
        }
    };

    const formatDistance = (meters: number) => {
        if (meters < 1000) {
            return `${Math.round(meters)}m`;
        }
        return `${(meters / 1000).toFixed(1)}km`;
    };

    const handleNavigate = () => {
        navigate(currentAlert.url);
        onDismiss(currentAlert.id);
    };

    return (
        <div className="proximity-alert-container">
            <div className="proximity-alert">
                {/* Close button */}
                <button
                    className="proximity-alert-close"
                    onClick={() => onDismiss(currentAlert.id)}
                    aria-label="Fechar"
                >
                    <X size={16} />
                </button>

                {/* Image or Icon */}
                <div className="proximity-alert-media">
                    {currentAlert.imageUrl ? (
                        <img
                            src={currentAlert.imageUrl}
                            alt={currentAlert.title}
                            className="proximity-alert-image"
                        />
                    ) : (
                        <div className="proximity-alert-icon">
                            {getIcon(currentAlert.type)}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="proximity-alert-content">
                    <div className="proximity-alert-badge">
                        <MapPin size={12} />
                        <span>Você está próximo!</span>
                    </div>

                    <h4 className="proximity-alert-title">{currentAlert.title}</h4>

                    {currentAlert.subtitle && (
                        <p className="proximity-alert-subtitle">{currentAlert.subtitle}</p>
                    )}

                    <div className="proximity-alert-distance">
                        <Navigation size={12} />
                        <span>{formatDistance(currentAlert.distance)} de distância</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="proximity-alert-actions">
                    <button
                        className="proximity-alert-btn primary"
                        onClick={handleNavigate}
                    >
                        Ver Detalhes
                    </button>

                    {alerts.length > 1 && (
                        <button
                            className="proximity-alert-btn secondary"
                            onClick={onDismissAll}
                        >
                            Ignorar ({alerts.length})
                        </button>
                    )}
                </div>

                {/* Auto-dismiss indicator */}
                <div className="proximity-alert-timer">
                    <Clock size={10} />
                    <span>Fechando em 15s</span>
                </div>
            </div>
        </div>
    );
};
