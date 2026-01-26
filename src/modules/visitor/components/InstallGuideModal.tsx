import React from 'react';
import { useTranslation } from 'react-i18next';

interface InstallGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div
                style={{
                    backgroundColor: '#2c1e10',
                    border: '1px solid #d4af37',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    maxWidth: '24rem',
                    width: '100%',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        padding: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#d4af37',
                        fontSize: '1.2rem',
                        cursor: 'pointer'
                    }}
                >
                    ✕
                </button>

                <h3 style={{
                    textAlign: 'center',
                    color: '#d4af37',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    fontFamily: "'Georgia', serif"
                }}>
                    {t('pwa.install.title', 'Instalar Aplicativo')}
                </h3>

                <div style={{ color: '#EAE0D5', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.9 }}>
                        {t('pwa.install.desc', 'Para uma melhor experiência, adicione este app à sua tela inicial.')}
                    </p>

                    {isIOS ? (
                        <div style={{ backgroundColor: '#1a1108', padding: '1rem', borderRadius: '8px', border: '1px solid #463420' }}>
                            <ol style={{ listStyleType: 'decimal', paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                                <li style={{ marginBottom: '0.5rem' }}>{t('pwa.install.ios.step1', 'Toque no botão Compartilhar')} <span style={{ display: 'inline-block', color: '#60a5fa' }}>⎋</span></li>
                                <li style={{ marginBottom: '0.5rem' }}>{t('pwa.install.ios.step2', 'Role para baixo e selecione')} <strong>"Adicionar à Tela de Início"</strong> <span>➕</span></li>
                                <li>{t('pwa.install.ios.step3', 'Toque em "Adicionar" no canto superior')}</li>
                            </ol>
                        </div>
                    ) : (
                        <div style={{ backgroundColor: '#1a1108', padding: '1rem', borderRadius: '8px', border: '1px solid #463420' }}>
                            <ol style={{ listStyleType: 'decimal', paddingLeft: '1.2rem', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                                <li style={{ marginBottom: '0.5rem' }}>{t('pwa.install.android.step1', 'Toque no ícone de menu do navegador (3 pontos)')} <span>⋮</span></li>
                                <li>{t('pwa.install.android.step2', 'Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"')}</li>
                            </ol>
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%',
                        marginTop: '1.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#d4af37',
                        color: '#1a1108',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b8941f')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d4af37')}
                >
                    {t('common.close', 'Entendi')}
                </button>
            </div>
        </div>
    );
};
