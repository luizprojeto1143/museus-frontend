import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';
import './InstallGuideModal.css';

interface InstallGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    return (
        <div className="install-guide-backdrop" onClick={onClose}>
            <div className="install-guide-modal" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="install-guide-close-btn">
                    <X size={20} />
                </button>

                <h3 className="install-guide-title">
                    <Download size={24} />
                    {t('pwa.install.title', 'Instalar Aplicativo')}
                </h3>

                <p className="install-guide-desc">
                    {t('pwa.install.desc', 'Para uma melhor experiência, adicione este app à sua tela inicial.')}
                </p>

                <div className="install-guide-steps">
                    {isIOS ? (
                        <ol>
                            <li>
                                {t('pwa.install.ios.step1', 'Toque no botão Compartilhar')}
                                <span className="install-guide-icon">⎋</span>
                            </li>
                            <li>
                                {t('pwa.install.ios.step2', 'Role para baixo e selecione')}
                                <span className="install-guide-strong"> "Adicionar à Tela de Início"</span>
                                <span> ➕</span>
                            </li>
                            <li>{t('pwa.install.ios.step3', 'Toque em "Adicionar" no canto superior')}</li>
                        </ol>
                    ) : (
                        <ol>
                            <li>
                                {t('pwa.install.android.step1', 'Toque no ícone de menu do navegador (3 pontos)')}
                                <span> ⋮</span>
                            </li>
                            <li>
                                {t('pwa.install.android.step2', 'Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"')}
                            </li>
                        </ol>
                    )}
                </div>

                <button onClick={onClose} className="install-guide-confirm-btn">
                    {t('common.close', 'Entendi')}
                </button>
            </div>
        </div>
    );
};
