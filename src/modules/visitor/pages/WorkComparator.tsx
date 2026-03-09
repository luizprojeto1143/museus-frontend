import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, ArrowLeftRight, ChevronDown } from "lucide-react";

export const WorkComparator: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [leftId, setLeftId] = useState<string>("");
    const [rightId, setRightId] = useState<string>("");

    const fetchWorks = useCallback(async () => {
        try {
            const res = await api.get(`/works?tenantId=${tenantId}`);
            const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setWorks(list);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) fetchWorks();
    }, [tenantId, fetchWorks]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <Loader2 className="animate-spin" style={{ color: '#d4af37' }} />
        </div>
    );

    const leftWork = works.find(w => w.id === leftId);
    const rightWork = works.find(w => w.id === rightId);

    const selectStyle: React.CSSProperties = {
        width: '100%',
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        color: 'white',
        fontSize: '0.85rem',
        outline: 'none',
        appearance: 'none' as const,
        cursor: 'pointer'
    };

    const CompareRow = ({ label, left, right }: { label: string; left?: string | null; right?: string | null }) => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '0.75rem',
            padding: '0.75rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            alignItems: 'center'
        }}>
            <span style={{ color: '#ddd', fontSize: '0.85rem', textAlign: 'right' }}>{left || "—"}</span>
            <span style={{
                color: '#d4af37',
                fontSize: '0.6rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                minWidth: '70px',
                textAlign: 'center'
            }}>{label}</span>
            <span style={{ color: '#ddd', fontSize: '0.85rem' }}>{right || "—"}</span>
        </div>
    );

    const WorkCard = ({ work }: { work: any }) => (
        <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: '1px solid rgba(212,175,55,0.15)'
        }}>
            <div style={{ aspectRatio: '1', overflow: 'hidden', position: 'relative' }}>
                {work.imageUrl ? (
                    <img src={work.imageUrl} alt={work.title} style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transition: 'transform 0.3s'
                    }} />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(0,0,0,0.3))',
                        color: '#666', fontSize: '0.8rem'
                    }}>Sem imagem</div>
                )}
                {/* Gold gradient overlay at bottom */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))'
                }} />
            </div>
            <div style={{ padding: '0.75rem 1rem' }}>
                <h3 style={{
                    color: 'white', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem',
                    fontFamily: 'Georgia, serif'
                }}>{work.title}</h3>
                <p style={{ color: '#d4af37', fontSize: '0.75rem', fontWeight: 600 }}>{work.artist}</p>
                {work.year && <p style={{ color: '#888', fontSize: '0.7rem', marginTop: '0.15rem' }}>{work.year}</p>}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto', paddingBottom: '6rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
                    border: '1px solid rgba(212,175,55,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.75rem'
                }}>
                    <ArrowLeftRight size={24} style={{ color: '#d4af37' }} />
                </div>
                <h1 style={{
                    fontSize: '1.8rem', fontWeight: 900, color: 'white',
                    fontFamily: 'Georgia, serif'
                }}>Comparar Obras</h1>
                <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Analise duas obras lado a lado
                </p>
                {/* Gold divider */}
                <div style={{
                    width: '60px', height: '2px', margin: '1rem auto 0',
                    background: 'linear-gradient(90deg, transparent, #d4af37, transparent)'
                }} />
            </div>

            {/* Selectors */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div>
                    <label style={{
                        display: 'block', color: '#d4af37', fontSize: '0.7rem',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                        marginBottom: '0.5rem'
                    }}>Obra 1</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={leftId}
                            onChange={e => setLeftId(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">Selecione...</option>
                            {works.filter(w => w.id !== rightId).map(w => (
                                <option key={w.id} value={w.id}>{w.title}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} style={{
                            position: 'absolute', right: '0.75rem', top: '50%',
                            transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none'
                        }} />
                    </div>
                </div>
                <div>
                    <label style={{
                        display: 'block', color: '#d4af37', fontSize: '0.7rem',
                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                        marginBottom: '0.5rem'
                    }}>Obra 2</label>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={rightId}
                            onChange={e => setRightId(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">Selecione...</option>
                            {works.filter(w => w.id !== leftId).map(w => (
                                <option key={w.id} value={w.id}>{w.title}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} style={{
                            position: 'absolute', right: '0.75rem', top: '50%',
                            transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none'
                        }} />
                    </div>
                </div>
            </div>

            {/* Comparison */}
            {leftWork && rightWork ? (
                <div style={{
                    background: 'rgba(30,32,38,0.9)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '1.25rem',
                    overflow: 'hidden'
                }}>
                    {/* Images side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: 'rgba(0,0,0,0.3)' }}>
                        <WorkCard work={leftWork} />
                        <WorkCard work={rightWork} />
                    </div>

                    {/* VS divider */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.75rem', padding: '0.75rem 0',
                        background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.08), transparent)'
                    }}>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3))' }} />
                        <span style={{
                            color: '#d4af37', fontWeight: 900, fontSize: '0.75rem',
                            letterSpacing: '0.2em', textTransform: 'uppercase'
                        }}>VS</span>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(270deg, transparent, rgba(212,175,55,0.3))' }} />
                    </div>

                    {/* Comparison Fields */}
                    <div style={{ padding: '0 1.25rem 1rem' }}>
                        <CompareRow label="Artista" left={leftWork.artist} right={rightWork.artist} />
                        <CompareRow label="Ano" left={leftWork.year} right={rightWork.year} />
                        <CompareRow label={t("visitor.workcomparator.perodo", `Período`)} left={leftWork.period} right={rightWork.period} />
                        <CompareRow label={t("visitor.workcomparator.tcnica", `Técnica`)} left={leftWork.technique} right={rightWork.technique} />
                        <CompareRow label="Suporte" left={leftWork.medium} right={rightWork.medium} />
                        <CompareRow label={t("visitor.workcomparator.dimenses", `Dimensões`)} left={leftWork.dimensions} right={rightWork.dimensions} />
                        <CompareRow label="Sala" left={leftWork.room} right={rightWork.room} />
                        <CompareRow label="Andar" left={leftWork.floor} right={rightWork.floor} />
                    </div>

                    {/* Descriptions */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ background: 'rgba(30,32,38,0.95)', padding: '1rem 1.25rem' }}>
                            <p style={{
                                color: '#d4af37', fontSize: '0.6rem', fontWeight: 800,
                                textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem'
                            }}>{t("visitor.workcomparator.descrio", `Descrição`)}</p>
                            <p style={{
                                color: '#aaa', fontSize: '0.8rem', lineHeight: '1.6',
                                display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                            }}>{leftWork.description || "Sem descrição."}</p>
                        </div>
                        <div style={{ background: 'rgba(30,32,38,0.95)', padding: '1rem 1.25rem' }}>
                            <p style={{
                                color: '#d4af37', fontSize: '0.6rem', fontWeight: 800,
                                textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem'
                            }}>{t("visitor.workcomparator.descrio", `Descrição`)}</p>
                            <p style={{
                                color: '#aaa', fontSize: '0.8rem', lineHeight: '1.6',
                                display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                            }}>{rightWork.description || "Sem descrição."}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    background: 'rgba(30,32,38,0.9)',
                    border: '2px dashed rgba(212,175,55,0.15)',
                    borderRadius: '1.5rem',
                    textAlign: 'center',
                    padding: '4rem 2rem'
                }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'rgba(212,175,55,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <ArrowLeftRight size={28} style={{ color: '#555' }} />
                    </div>
                    <h3 style={{
                        color: 'white', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.4rem',
                        fontFamily: 'Georgia, serif'
                    }}>Selecione duas obras</h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.5' }}>
                        Escolha as obras acima para comparar<br />estilo, período e técnica.
                    </p>
                </div>
            )}
        </div>
    );
};
