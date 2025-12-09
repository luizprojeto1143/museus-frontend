import i18n from '../i18n/config';
import { describe, it, expect, beforeAll } from 'vitest';

describe('Translations', () => {
    beforeAll(async () => {
        // Ensure i18n is initialized
        if (!i18n.isInitialized) {
            await i18n.init();
        }
    });

    it('should have correct Portuguese translations', () => {
        i18n.changeLanguage('pt-BR');
        expect(i18n.t('welcome.subtitle')).toBe('Explore a História, Viva a Cultura');
        expect(i18n.t('auth.login.title')).toBe('Acesse sua conta');
        expect(i18n.t('admin.dashboard.title')).toBe('Painel de Controle');
    });

    it('should have correct English translations', () => {
        i18n.changeLanguage('en');
        expect(i18n.t('welcome.subtitle')).toBe('Explore History, Live Culture');
        expect(i18n.t('auth.login.title')).toBe('Access your account');
        expect(i18n.t('admin.dashboard.title')).toBe('Control Panel');
    });

    it('should have correct Spanish translations', () => {
        i18n.changeLanguage('es');
        expect(i18n.t('welcome.subtitle')).toBe('Explora la Historia, Vive la Cultura');
        expect(i18n.t('auth.login.title')).toBe('Accede a tu cuenta');
        expect(i18n.t('admin.dashboard.title')).toBe('Panel de Control');
    });
});
