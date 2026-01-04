import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/usePWA';

/**
 * Offline Banner Component
 * Shows when user loses internet connection
 */
export const OfflineBanner: React.FC = () => {
    const { isOnline } = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div className="offline-banner">
            <WifiOff size={18} />
            <span>Você está offline. Alguns recursos podem não estar disponíveis.</span>

            <style>{`
                .offline-banner {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 12px 20px;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    z-index: 9999;
                    animation: slideDown 0.3s ease;
                }
                
                @keyframes slideDown {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

/**
 * Offline Page Component
 * Full page for when user navigates offline
 */
export const OfflinePage: React.FC = () => {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="offline-page">
            <div className="offline-content">
                <div className="offline-icon">
                    <WifiOff size={64} />
                </div>
                <h1>Você está offline</h1>
                <p>
                    Parece que você perdeu a conexão com a internet.
                    Verifique sua conexão e tente novamente.
                </p>
                <div className="offline-features">
                    <h3>Enquanto isso, você pode:</h3>
                    <ul>
                        <li>✅ Ver obras visitadas anteriormente</li>
                        <li>✅ Ouvir audiodescrições já baixadas</li>
                        <li>✅ Ver seus ingressos e certificados</li>
                        <li>❌ Fazer novas interações</li>
                    </ul>
                </div>
                <button className="retry-btn" onClick={handleRetry}>
                    <RefreshCw size={18} />
                    Tentar Novamente
                </button>
            </div>

            <style>{`
                .offline-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-page, #111827);
                    padding: 20px;
                }
                
                .offline-content {
                    text-align: center;
                    max-width: 400px;
                }
                
                .offline-icon {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                    color: #f59e0b;
                }
                
                .offline-page h1 {
                    margin: 0 0 12px;
                    font-size: 1.75rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .offline-page p {
                    margin: 0 0 24px;
                    color: var(--fg-muted, #9ca3af);
                    line-height: 1.6;
                }
                
                .offline-features {
                    text-align: left;
                    background: var(--bg-card, #1f2937);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                }
                
                .offline-features h3 {
                    margin: 0 0 12px;
                    font-size: 0.9rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .offline-features ul {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }
                
                .offline-features li {
                    padding: 8px 0;
                    color: var(--fg-muted, #9ca3af);
                    font-size: 0.9rem;
                }
                
                .retry-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 28px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .retry-btn:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

/**
 * Install PWA Prompt Component
 */
export const InstallPrompt: React.FC<{
    onInstall: () => void;
    onDismiss: () => void;
}> = ({ onInstall, onDismiss }) => {
    return (
        <div className="install-prompt">
            <div className="install-content">
                <div className="install-icon">📱</div>
                <div className="install-text">
                    <h4>Instalar App</h4>
                    <p>Acesse offline e tenha uma experiência mais rápida</p>
                </div>
                <div className="install-actions">
                    <button className="install-btn" onClick={onInstall}>
                        Instalar
                    </button>
                    <button className="dismiss-btn" onClick={onDismiss}>
                        Agora não
                    </button>
                </div>
            </div>

            <style>{`
                .install-prompt {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    max-width: 400px;
                    margin: 0 auto;
                    z-index: 1000;
                    animation: slideUp 0.3s ease;
                }
                
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .install-content {
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                
                .install-icon {
                    font-size: 2rem;
                }
                
                .install-text {
                    flex: 1;
                    min-width: 150px;
                }
                
                .install-text h4 {
                    margin: 0;
                    font-size: 1rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .install-text p {
                    margin: 4px 0 0;
                    font-size: 0.8rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .install-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .install-btn {
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .dismiss-btn {
                    padding: 10px 16px;
                    background: transparent;
                    color: var(--fg-muted, #9ca3af);
                    border: none;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};
