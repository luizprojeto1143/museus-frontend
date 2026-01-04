import React, { useState, useEffect, createContext, useContext } from 'react';

interface AccessibilitySettings {
    fontSize: 'small' | 'normal' | 'large' | 'xlarge';
    highContrast: boolean;
    reducedMotion: boolean;
    dyslexicFont: boolean;
}

interface AccessibilityContextValue {
    settings: AccessibilitySettings;
    setFontSize: (size: AccessibilitySettings['fontSize']) => void;
    toggleHighContrast: () => void;
    toggleReducedMotion: () => void;
    toggleDyslexicFont: () => void;
    resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
    fontSize: 'normal',
    highContrast: false,
    reducedMotion: false,
    dyslexicFont: false
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        const saved = localStorage.getItem('accessibility-settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));

        // Apply to document
        const root = document.documentElement;

        // Font size
        const fontSizes = { small: '14px', normal: '16px', large: '18px', xlarge: '20px' };
        root.style.setProperty('--base-font-size', fontSizes[settings.fontSize]);

        // High contrast
        if (settings.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Reduced motion
        if (settings.reducedMotion) {
            root.classList.add('reduced-motion');
        } else {
            root.classList.remove('reduced-motion');
        }

        // Dyslexic font
        if (settings.dyslexicFont) {
            root.classList.add('dyslexic-font');
        } else {
            root.classList.remove('dyslexic-font');
        }
    }, [settings]);

    const setFontSize = (size: AccessibilitySettings['fontSize']) => {
        setSettings(prev => ({ ...prev, fontSize: size }));
    };

    const toggleHighContrast = () => {
        setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
    };

    const toggleReducedMotion = () => {
        setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
    };

    const toggleDyslexicFont = () => {
        setSettings(prev => ({ ...prev, dyslexicFont: !prev.dyslexicFont }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
    };

    return (
        <AccessibilityContext.Provider value={{
            settings,
            setFontSize,
            toggleHighContrast,
            toggleReducedMotion,
            toggleDyslexicFont,
            resetSettings
        }}>
            {children}
            <style>{`
                :root {
                    --base-font-size: 16px;
                }
                
                html {
                    font-size: var(--base-font-size);
                }
                
                /* High Contrast Mode */
                .high-contrast {
                    --bg-page: #000000 !important;
                    --bg-card: #1a1a1a !important;
                    --fg-main: #ffffff !important;
                    --fg-muted: #e0e0e0 !important;
                    --primary-color: #00ff00 !important;
                    --accent-color: #ffff00 !important;
                }
                
                .high-contrast * {
                    border-color: #ffffff !important;
                }
                
                .high-contrast a,
                .high-contrast button {
                    text-decoration: underline !important;
                }
                
                /* Reduced Motion */
                .reduced-motion *,
                .reduced-motion *::before,
                .reduced-motion *::after {
                    animation-duration: 0.001ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.001ms !important;
                }
                
                /* Dyslexic-Friendly Font */
                .dyslexic-font {
                    font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
                    letter-spacing: 0.05em;
                    word-spacing: 0.1em;
                    line-height: 1.8;
                }
                
                /* Focus Styles - Always Visible */
                *:focus {
                    outline: 3px solid var(--primary-color, #3b82f6) !important;
                    outline-offset: 2px !important;
                }
                
                *:focus:not(:focus-visible) {
                    outline: none !important;
                }
                
                *:focus-visible {
                    outline: 3px solid var(--primary-color, #3b82f6) !important;
                    outline-offset: 2px !important;
                }
            `}</style>
        </AccessibilityContext.Provider>
    );
};
