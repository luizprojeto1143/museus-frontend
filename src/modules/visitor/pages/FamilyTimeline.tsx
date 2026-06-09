import { logger } from "@/utils/logger";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Heart, Calendar, Users, Music, Play, Pause, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";
import { PageLoader, Button, Badge } from "@/components/ui";
import "./FamilyTimeline.css";

interface FamilyEvent {
    id: string;
    year: number;
    title: string;
    description?: string;
    imageUrl?: string;
    type: string;
    people?: string[];
}

interface FamilyProfile {
    id: string;
    familyName: string;
    description?: string;
    coverImageUrl?: string;
    audioUrl?: string;
    events: FamilyEvent[];
}

export const FamilyTimeline: React.FC = () => {
    const { profileId } = useParams<{ profileId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [profile, setProfile] = useState<FamilyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!profileId) return;
        setLoading(true);
        try {
            const res = await api.get(`/roadmap-family/profiles/${profileId}`);
            setProfile(res.data);
        } catch (err) {
            logger.error("Erro ao carregar perfil familiar:", err);
        } finally {
            setLoading(false);
        }
    }, [profileId]);

    useEffect(() => {
        fetchProfile();

        // Cleanup function for audio memory
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
                audioRef.current.load();
            }
        };
    }, [fetchProfile]);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => {
                logger.warn("Erro ao reproduzir áudio:", e);
                setIsPlaying(false);
            });
        }
    };

    if (loading) return <PageLoader label={t("family.loading", "Recuperando memórias...")} />;
    
    if (!profile) return (
        <div className="family-error-container">
            <h2 className="text-2xl font-bold mb-4">{t("family.notFound", "Legado Familiar não encontrado")}</h2>
            <Button onClick={() => navigate(-1)} variant="outline">
                <ChevronLeft className="mr-2" /> {t("common.back", "Voltar")}
            </Button>
        </div>
    );

    return (
        <div className="family-timeline-container">
            <Helmet>
                <title>{t("family.seoTitle", { family: profile.familyName })} | Cultura Viva</title>
                <meta name="description" content={profile.description?.substring(0, 160)} />
            </Helmet>

            <motion.header
                className="family-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), #000), url(${getFullUrl(profile.coverImageUrl)})` }}
            >
                <Button 
                    className="back-btn-floating" 
                    variant="glass" 
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft size={20} />
                </Button>

                <div className="hero-content">
                    <Badge variant="glass" className="mb-4 text-gold">{t("family.heritage", "Memória Familiar")}</Badge>
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {t("family.name", { family: profile.familyName })}
                    </motion.h1>
                    <p className="hero-desc">{profile.description}</p>

                    {profile.audioUrl && (
                        <div className={`audio-player-mini ${isPlaying ? 'active' : ''}`} onClick={toggleAudio}>
                            <audio 
                                ref={audioRef} 
                                src={getFullUrl(profile.audioUrl)} 
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => setIsPlaying(false)} 
                            />
                            <div className="audio-icon-wrapper">
                                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            </div>
                            <div className="audio-labels">
                                <span className="audio-status">{isPlaying ? t("family.audioPlaying", "Ouvindo legado...") : t("family.audioListen", "História Narrada")}</span>
                                <span className="audio-cta">{isPlaying ? t("family.audioPause", "Pausar") : t("family.audioPlay", "Tocar")}</span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.header>

            <div className="timeline-vertical">
                {profile.events.map((event, idx) => (
                    <motion.div
                        key={event.id}
                        className={`timeline-node ${idx % 2 === 0 ? "left" : "right"}`}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="node-connector">
                            <div className="node-dot"><Calendar size={14} /></div>
                        </div>

                        <div className="node-card glass-card">
                            <span className="node-year">{event.year}</span>
                            <h3 className="node-title">{event.title}</h3>
                            {event.imageUrl && (
                                <div className="node-image-wrapper">
                                    <img src={getFullUrl(event.imageUrl)} alt={event.title} className="node-image" loading="lazy" />
                                </div>
                            )}
                            <p className="node-desc">{event.description}</p>

                            {event.people && event.people.length > 0 && (
                                <div className="node-footer">
                                    <Users size={12} className="mr-2 text-gold" />
                                    <span>{event.people.join(", ")}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <footer className="family-footer">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <Heart size={32} className="text-red-500 mb-6" fill="currentColor" />
                    <p className="max-w-xs mx-auto text-sm italic">
                        {t("family.footerMsg", "Preservando a memória daqueles que pavimentaram o caminho para o nosso presente.")}
                    </p>
                </motion.div>
            </footer>
        </div>
    );
};
