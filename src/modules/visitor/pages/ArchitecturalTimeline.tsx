import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../../api/client";
import { Clock, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import "./ArchitecturalTimeline.css";

interface TimelineEvent {
    id: string;
    year: number;
    title: string;
    description?: string;
    imageUrl?: string;
    people?: { name: string; role: string }[];
}

export const ArchitecturalTimeline: React.FC = () => {
    const { spaceId } = useParams<{ spaceId: string }>();
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get(`/roadmap-extra/events?spaceId=${spaceId}`);
                setEvents(res.data);
            } catch (err) {
                console.error("Erro ao buscar linha do tempo:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [spaceId]);

    if (loading) return (
        <div className="timeline-loading">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
                <Clock size={40} className="text-[var(--accent-primary)]" />
            </motion.div>
            <p>Resgatando memórias...</p>
        </div>
    );

    return (
        <div className="timeline-wrapper">
            <header className="timeline-page-header">
                <h1>Linha do Tempo Arquitetônica</h1>
                <p>A evolução histórica deste patrimônio</p>
            </header>

            <div className="timeline-scroll-container" ref={scrollRef}>
                <div className="timeline-line"></div>

                <div className="timeline-items">
                    {events.map((event, idx) => (
                        <motion.div
                            key={event.id}
                            className="timeline-item"
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                        >
                            <div className="year-bubble">
                                {event.year}
                            </div>

                            <div className="event-content glass">
                                {event.imageUrl && (
                                    <div className="event-image">
                                        <img src={event.imageUrl} alt={event.title} />
                                    </div>
                                )}
                                <div className="event-info">
                                    <h3>{event.title}</h3>
                                    <p>{event.description}</p>

                                    {event.people && event.people.length > 0 && (
                                        <div className="event-people">
                                            <Users size={14} className="mr-2" />
                                            {event.people.map(p => p.name).join(", ")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="timeline-controls">
                <p className="opacity-40 text-xs uppercase tracking-widest">Role para explorar</p>
            </div>
        </div>
    );
};
