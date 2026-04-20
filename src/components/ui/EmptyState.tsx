import React from 'react';
import { motion } from 'framer-motion';
import {
    Package, Image, Calendar, Award,
    MessageSquare, Map, Search, Heart, Star,
    Ticket, Trophy
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { springs, fadeInUp, staggerContainer, staggerItem } from '../../lib/motion';

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
 * Beautiful empty states with floating icon animation,
 * staggered entrance, and accent-color-aware styling.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    type = 'generic',
    title,
    description,
    action
}) => {
    const config = emptyStateConfigs[type];

    return (
        <motion.div
            className={cn(
                "flex flex-col items-center justify-center",
                "py-12 px-6 text-center",
                "bg-[var(--bg-surface)] rounded-[var(--radius-lg)]",
                "border-2 border-dashed border-[var(--border-default)]"
            )}
            variants={staggerContainer(0.12, 0.05)}
            initial="hidden"
            animate="visible"
        >
            {/* Floating animated icon */}
            <motion.div
                className={cn(
                    "w-24 h-24 rounded-full mb-5",
                    "bg-[var(--accent-primary)]/10",
                    "flex items-center justify-center",
                    "text-[var(--accent-primary)]"
                )}
                variants={staggerItem}
                animate={{
                    y: [0, -8, 0],
                }}
                transition={{
                    y: {
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut",
                    },
                }}
            >
                {config.icon}
            </motion.div>

            {/* Title */}
            <motion.h3
                className="text-xl font-bold text-[var(--fg-main)] mb-2"
                variants={staggerItem}
            >
                {title || config.title}
            </motion.h3>

            {/* Description */}
            <motion.p
                className="text-sm text-[var(--fg-secondary)] max-w-[300px] leading-relaxed"
                variants={staggerItem}
            >
                {description || config.description}
            </motion.p>

            {/* Optional action */}
            {action && (
                <motion.button
                    className={cn(
                        "mt-6 px-6 py-3 rounded-[var(--radius-md)]",
                        "bg-[var(--accent-primary)] text-[var(--fg-inverse)]",
                        "font-semibold text-sm",
                        "shadow-[var(--shadow-glow)]",
                        "transition-transform"
                    )}
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={springs.stiff}
                    onClick={action.onClick}
                >
                    {action.label}
                </motion.button>
            )}
        </motion.div>
    );
};
