import React from 'react';
import {
    Package, Image, Calendar, Users, Award,
    MessageSquare, Map, Search, Heart, Star,
    Ticket, BookOpen, Trophy
} from 'lucide-react';

type EmptyStateType =
    | 'works' | 'events' | 'tickets' | 'favorites'
    | 'reviews' | 'achievements' | 'certificates'
    | 'guestbook' | 'search' | 'trails' | 'generic';

interface EmptyStateProps {
    type?: EmptyStateType;
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const emptyStateConfigs: Record<EmptyStateType, { icon: React.ReactNode; title: string; description: string }> = {
    works: {
        icon: <Image size={48} />,
        title: 'Nenhuma obra encontrada',
        description: 'O acervo deste museu ainda não foi cadastrado ou não há obras públicas.'
    },
    events: {
        icon: <Calendar size={48} />,
        title: 'Nenhum evento programado',
        description: 'Não há eventos próximos no momento. Volte em breve!'
    },
    tickets: {
        icon: <Ticket size={48} />,
        title: 'Nenhum ingresso',
        description: 'Você ainda não se inscreveu em nenhum evento. Explore nossa agenda!'
    },
    favorites: {
        icon: <Heart size={48} />,
        title: 'Sem favoritos',
        description: 'Você ainda não salvou nenhuma obra. Toque no ❤️ para favoritar!'
    },
    reviews: {
        icon: <Star size={48} />,
        title: 'Sem avaliações',
        description: 'Esta obra ainda não foi avaliada. Seja o primeiro a avaliar!'
    },
    achievements: {
        icon: <Trophy size={48} />,
        title: 'Nenhuma conquista',
        description: 'Continue explorando para desbloquear conquistas e ganhar XP!'
    },
    certificates: {
        icon: <Award size={48} />,
        title: 'Nenhum certificado',
        description: 'Complete trilhas ou participe de eventos para receber certificados.'
    },
    guestbook: {
        icon: <MessageSquare size={48} />,
        title: 'Livro vazio',
        description: 'Seja o primeiro a deixar uma mensagem no livro de visitas!'
    },
    search: {
        icon: <Search size={48} />,
        title: 'Nenhum resultado',
        description: 'Não encontramos nada com esses termos. Tente palavras diferentes.'
    },
    trails: {
        icon: <Map size={48} />,
        title: 'Sem trilhas',
        description: 'Nenhuma trilha disponível no momento. Explore as obras livremente!'
    },
    generic: {
        icon: <Package size={48} />,
        title: 'Nada por aqui',
        description: 'Não há itens para exibir no momento.'
    }
};

/**
 * Empty State Component
 * Beautiful empty states for lists and pages
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    type = 'generic',
    title,
    description,
    action
}) => {
    const config = emptyStateConfigs[type];

    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                {config.icon}
            </div>
            <h3 className="empty-state-title">
                {title || config.title}
            </h3>
            <p className="empty-state-description">
                {description || config.description}
            </p>
            {action && (
                <button
                    className="empty-state-action"
                    onClick={action.onClick}
                >
                    {action.label}
                </button>
            )}

            <style>{`
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 24px;
                    text-align: center;
                    background: var(--bg-card, #1f2937);
                    border-radius: 20px;
                    border: 2px dashed var(--border-color, #374151);
                }
                
                .empty-state-icon {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary-color, #3b82f6);
                    margin-bottom: 20px;
                }
                
                .empty-state-title {
                    margin: 0 0 8px;
                    font-size: 1.25rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .empty-state-description {
                    margin: 0;
                    color: var(--fg-muted, #9ca3af);
                    max-width: 300px;
                    line-height: 1.6;
                }
                
                .empty-state-action {
                    margin-top: 20px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .empty-state-action:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
                }
            `}</style>
        </div>
    );
};
