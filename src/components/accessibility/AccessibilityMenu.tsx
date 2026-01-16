import React, { useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import {
    Accessibility, Type, Eye, Zap, BookOpen,
    RotateCcw, X
} from 'lucide-react';

/**
 * Floating Accessibility Menu
 * Provides quick access to accessibility settings
 */
export const AccessibilityMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        settings,
        setFontSize,
        toggleHighContrast,
        toggleReducedMotion,
        toggleDyslexicFont,
        resetSettings
    } = useAccessibility();

    const fontSizes: Array<{ key: 'small' | 'normal' | 'large' | 'xlarge'; label: string }> = [
        { key: 'small', label: 'A-' },
        { key: 'normal', label: 'A' },
        { key: 'large', label: 'A+' },
        { key: 'xlarge', label: 'A++' }
    ];

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="accessibility-fab"
                aria-label="Opções de Acessibilidade"
                aria-expanded={isOpen}
            >
                <Accessibility size={24} />
            </button>

            {/* Menu Panel */}
            {isOpen && (
                <div
                    className="accessibility-menu"
                    role="dialog"
                    aria-label="Menu de Acessibilidade"
                >
                    <div className="accessibility-menu-header">
                        <h3>Acessibilidade</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Fechar menu"
                            className="close-btn"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="accessibility-menu-content">
                        {/* Font Size */}
                        <div className="accessibility-option">
                            <label>
                                <Type size={18} />
                                Tamanho da Fonte
                            </label>
                            <div className="font-size-buttons">
                                {fontSizes.map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setFontSize(key)}
                                        className={settings.fontSize === key ? 'active' : ''}
                                        aria-pressed={settings.fontSize === key}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* High Contrast */}
                        <div className="accessibility-option">
                            <label htmlFor="high-contrast">
                                <Eye size={18} />
                                Alto Contraste
                            </label>
                            <button
                                id="high-contrast"
                                onClick={toggleHighContrast}
                                className={`toggle-btn ${settings.highContrast ? 'active' : ''}`}
                                aria-pressed={settings.highContrast}
                            >
                                {settings.highContrast ? 'LIGADO' : 'DESLIGADO'}
                            </button>
                        </div>

                        {/* Reduced Motion */}
                        <div className="accessibility-option">
                            <label htmlFor="reduced-motion">
                                <Zap size={18} />
                                Reduzir Animações
                            </label>
                            <button
                                id="reduced-motion"
                                onClick={toggleReducedMotion}
                                className={`toggle-btn ${settings.reducedMotion ? 'active' : ''}`}
                                aria-pressed={settings.reducedMotion}
                            >
                                {settings.reducedMotion ? 'LIGADO' : 'DESLIGADO'}
                            </button>
                        </div>

                        {/* Dyslexic Font */}
                        <div className="accessibility-option">
                            <label htmlFor="dyslexic-font">
                                <BookOpen size={18} />
                                Fonte para Dislexia
                            </label>
                            <button
                                id="dyslexic-font"
                                onClick={toggleDyslexicFont}
                                className={`toggle-btn ${settings.dyslexicFont ? 'active' : ''}`}
                                aria-pressed={settings.dyslexicFont}
                            >
                                {settings.dyslexicFont ? 'LIGADO' : 'DESLIGADO'}
                            </button>
                        </div>

                        {/* Reset */}
                        <button
                            onClick={resetSettings}
                            className="reset-btn"
                        >
                            <RotateCcw size={16} />
                            Restaurar Padrões
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .accessibility-fab {
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
                    z-index: 1000;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .accessibility-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 30px rgba(59, 130, 246, 0.5);
                }
                
                .accessibility-menu {
                    position: fixed;
                    bottom: 170px;
                    right: 20px;
                    width: 320px;
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                    z-index: 1001;
                    overflow: hidden;
                    animation: slideUp 0.2s ease;
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .accessibility-menu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                }
                
                .accessibility-menu-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                }
                
                .close-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: white;
                }
                
                .accessibility-menu-content {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .accessibility-option {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .accessibility-option label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--fg-main, #e5e7eb);
                    font-size: 0.9rem;
                }
                
                .font-size-buttons {
                    display: flex;
                    gap: 4px;
                }
                
                .font-size-buttons button {
                    padding: 6px 12px;
                    border: 1px solid var(--border-color, #374151);
                    background: var(--bg-elevated, #374151);
                    color: var(--fg-main, #e5e7eb);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                }
                
                .font-size-buttons button.active {
                    background: var(--primary-color, #3b82f6);
                    border-color: var(--primary-color, #3b82f6);
                    color: white;
                }
                
                .toggle-btn {
                    padding: 6px 12px;
                    border: 1px solid var(--border-color, #374151);
                    background: var(--bg-elevated, #374151);
                    color: var(--fg-muted, #9ca3af);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.75rem;
                    font-weight: bold;
                    min-width: 90px;
                }
                
                .toggle-btn.active {
                    background: #22c55e;
                    border-color: #22c55e;
                    color: white;
                }
                
                .reset-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px;
                    border: 1px dashed var(--border-color, #374151);
                    background: transparent;
                    color: var(--fg-muted, #9ca3af);
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    margin-top: 8px;
                }
                
                .reset-btn:hover {
                    background: var(--bg-elevated, #374151);
                    color: var(--fg-main, #e5e7eb);
                }
            `}</style>
        </>
    );
};
