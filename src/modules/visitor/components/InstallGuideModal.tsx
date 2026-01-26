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
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-[#2c1e10] border border-[#d4af37] rounded-xl p-6 max-w-sm w-full shadow-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-[#d4af37] hover:text-white p-2"
                >
                    ✕
                </button>

                <h3 className="text-xl font-bold text-[#d4af37] mb-4 text-center font-serif">
                    {t('pwa.install.title', 'Instalar Aplicativo')}
                </h3>

                <div className="text-[#EAE0D5] space-y-4">
                    <p className="text-center text-sm opacity-90">
                        {t('pwa.install.desc', 'Para uma melhor experiência, adicione este app à sua tela inicial.')}
                    </p>

                    {isIOS ? (
                        <div className="bg-[#1a1108] p-4 rounded-lg border border-[#463420]">
                            <ol className="list-decimal list-inside space-y-3 text-sm">
                                <li>{t('pwa.install.ios.step1', 'Toque no botão Compartilhar')} <span className="inline-block text-blue-400">⎋</span></li>
                                <li>{t('pwa.install.ios.step2', 'Role para baixo e selecione')} <strong>"Adicionar à Tela de Início"</strong> <span>➕</span></li>
                                <li>{t('pwa.install.ios.step3', 'Toque em "Adicionar" no canto superior')}</li>
                            </ol>
                        </div>
                    ) : (
                        <div className="bg-[#1a1108] p-4 rounded-lg border border-[#463420]">
                            <ol className="list-decimal list-inside space-y-3 text-sm">
                                <li>{t('pwa.install.android.step1', 'Toque no ícone de menu do navegador (3 pontos)')} <span>⋮</span></li>
                                <li>{t('pwa.install.android.step2', 'Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"')}</li>
                            </ol>
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 bg-[#d4af37] text-[#1a1108] font-bold rounded-lg hover:bg-[#b8941f] transition-colors"
                >
                    {t('common.close', 'Entendi')}
                </button>
            </div>
        </div>
    );
};
