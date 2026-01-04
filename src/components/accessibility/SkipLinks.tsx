import React from 'react';

interface SkipLinksProps {
    mainContentId?: string;
    navigationId?: string;
}

/**
 * Skip Links Component - WCAG 2.1 AA Compliance
 * Allows keyboard users to skip repetitive navigation
 */
export const SkipLinks: React.FC<SkipLinksProps> = ({
    mainContentId = 'main-content',
    navigationId = 'main-nav'
}) => {
    return (
        <div className="skip-links">
            <a href={`#${mainContentId}`} className="skip-link">
                Pular para o conteúdo principal
            </a>
            <a href={`#${navigationId}`} className="skip-link">
                Ir para navegação
            </a>

            <style>{`
                .skip-links {
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 9999;
                }
                
                .skip-link {
                    position: absolute;
                    top: -100px;
                    left: 0;
                    padding: 12px 24px;
                    background: var(--primary-color, #3b82f6);
                    color: white;
                    font-weight: bold;
                    text-decoration: none;
                    border-radius: 0 0 8px 0;
                    transition: top 0.2s ease;
                }
                
                .skip-link:focus {
                    top: 0;
                    outline: 3px solid var(--accent-color, #f59e0b);
                    outline-offset: 2px;
                }
                
                .skip-link:nth-child(2):focus {
                    left: 250px;
                }
            `}</style>
        </div>
    );
};
