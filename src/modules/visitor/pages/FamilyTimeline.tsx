import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../api/client";
import { Heart, Calendar, Users, Music, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    const [profile, setProfile] = useState<FamilyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/roadmap-family/profiles/${profileId}`);
                setProfile(res.data);
            } catch (err) {
                console.error("Erro ao carregar perfil familiar:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [profileId]);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    if (loading) return null;
    if (!profile) return <div className="text-center py-20">Perfil não encontrado</div>;

    return (
        <div className="family-timeline-container">
            <motion.header
                className="family-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), #000), url(${profile.coverImageUrl})` }}
            >
                <div className="hero-content">
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Família {profile.familyName}
                    </motion.h1>
                    <p>{profile.description}</p>

                    {profile.audioUrl && (
                        <div className="audio-player-mini" onClick={toggleAudio}>
                            <audio ref={audioRef} src={profile.audioUrl} onEnded={() => setIsPlaying(false)} />
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            <span>{isPlaying ? "Ouvindo narrativa..." : "Ouvir história da família"}</span>
                        </div>
                    )}
                </div>
            </motion.header>

            <div className="timeline-vertical">
                {profile.events.map((event, idx) => (
                    <motion.div
                        key={event.id}
                        className={`timeline-node ${idx % 2 === 0 ? "left" : "right"}`}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="node-connector">
                            <div className="node-dot"><Calendar size={14} /></div>
                        </div>

                        <div className="node-card glass">
                            <span className="node-year">{event.year}</span>
                            <h3>{event.title}</h3>
                            {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="node-image" />}
                            <p>{event.description}</p>

                            {event.people && event.people.length > 0 && (
                                <div className="node-footer">
                                    <Users size={12} className="mr-1" />
                                    {event.people.join(", ")}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <footer className="family-footer">
                <Heart size={24} className="text-red-500 mb-4" />
                <p>Preservando a memória de quem construiu nossa história.</p>
            </footer>
        </div>
    );
};

// Internal ref for audio
import { useRef } from "react";
