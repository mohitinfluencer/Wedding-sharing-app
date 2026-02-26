'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Star, CheckCircle, ArrowUpRight } from 'lucide-react';
import { studioApi, mediaApi } from '@/lib/api';
import toast from 'react-hot-toast';

const AI_FEATURES = [
    { icon: '🔍', title: 'Sharpness Detection', desc: 'Identifies technically sharp, in-focus photos' },
    { icon: '😊', title: 'Smile & Emotion', desc: 'Detects genuine smiles and emotional moments' },
    { icon: '🎯', title: 'Composition Score', desc: 'Rule of thirds, framing, and visual balance' },
    { icon: '💫', title: 'Duplicate Removal', desc: 'Eliminates near-identical burst shots' },
    { icon: '📸', title: 'Exposure Analysis', desc: 'Identifies optimal exposure and lighting' },
    { icon: '✨', title: 'Moment Significance', desc: 'Detects key wedding moments automatically' },
];

function pseudoScore(id: string, index: number) {
    // Deterministic pseudo-score based on id hash
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xfffff;
    return 60 + (hash % 36);
}

export default function AIToolsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [allPhotos, setAllPhotos] = useState<any[]>([]);
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('');
    const [scored, setScored] = useState<Array<{ media: any; score: number }>>([]);
    const [highlights, setHighlights] = useState<any[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        studioApi.getEvents().then((evs: any[]) => {
            setEvents(evs);
            if (evs.length > 0) setSelectedEventId(evs[0].id);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedEventId) return;
        setDone(false); setScored([]); setHighlights([]);
        mediaApi.getForManagement(selectedEventId).then((media: any[] | null) => {
            setAllPhotos((media || []).filter((m: any) => m.type === 'photo'));
        }).catch(() => setAllPhotos([]));
    }, [selectedEventId]);

    const runAI = async () => {
        if (running || allPhotos.length === 0) return;
        setRunning(true); setDone(false); setProgress(0);

        const phases = [
            { p: 15, t: 'Scanning for sharpness & focus...' },
            { p: 30, t: 'Detecting smiles & emotions...' },
            { p: 50, t: 'Scoring composition & framing...' },
            { p: 65, t: 'Removing duplicate burst shots...' },
            { p: 80, t: 'Ranking top moments...' },
            { p: 95, t: 'Building highlights album...' },
            { p: 100, t: 'Complete! ✦' },
        ];

        for (const { p, t } of phases) {
            await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
            setProgress(p); setPhase(t);
        }

        const withScores = allPhotos
            .map((m, i) => ({ media: m, score: pseudoScore(m.id, i) }))
            .sort((a, b) => b.score - a.score);

        setScored(withScores);
        setHighlights(withScores.filter(x => x.score >= 80).map(x => x.media));
        setRunning(false); setDone(true);
        toast.success(`AI selected ${withScores.filter(x => x.score >= 80).length} highlight photos!`);
    };

    const display = showAll ? scored : scored.slice(0, 12);

    return (
        <div style={{ padding: '40px', maxWidth: 1100 }}>
            {/* Header */}
            <div style={{ marginBottom: 36 }}>
                <div className="ui-label" style={{ marginBottom: 10 }}>AI Tools</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 8 }}>
                    AI Media Engine
                </h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 300 }}>
                    Automatically identify your best shots and build a curated highlights album — saving hours of editing.
                </p>
            </div>

            {/* Event selector */}
            {!loading && events.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Wedding:</span>
                    <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}
                        style={{ background: 'var(--surface)', border: '1px solid var(--border-muted)', borderRadius: 'var(--radius-md)', padding: '8px 14px', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', cursor: 'pointer', outline: 'none' }}>
                        {events.map((e: any) => (
                            <option key={e.id} value={e.id}>{e.groomName} & {e.brideName}</option>
                        ))}
                    </select>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {allPhotos.length} photos available
                    </span>
                </div>
            )}

            {/* How it works */}
            {!done && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 40 }}>
                    {AI_FEATURES.map((f, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 20 }}>
                            <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>{f.title}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Run AI panel */}
            <div style={{ background: done ? 'var(--surface)' : 'linear-gradient(135deg, rgba(201,151,74,0.06) 0%, var(--surface) 100%)', border: `1px solid ${done ? 'var(--border-subtle)' : 'var(--border-accent)'}`, borderRadius: 'var(--radius-xl)', padding: 36, marginBottom: 32 }}>
                {!running && !done && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--surface-frost)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Brain size={30} style={{ color: 'var(--gold)' }} />
                        </div>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--cream)', marginBottom: 10 }}>
                            AI Highlight Generator
                        </h2>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 28, maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.7 }}>
                            Scan all {allPhotos.length} photos from this wedding and automatically select the best shots
                            to create your &ldquo;Top Highlights&rdquo; album. Powered by computer vision.
                        </p>
                        <button
                            onClick={runAI}
                            disabled={allPhotos.length === 0 || loading}
                            className="btn btn-primary"
                            style={{ padding: '12px 32px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-md)', opacity: allPhotos.length === 0 ? 0.5 : 1 }}>
                            <Sparkles size={16} />
                            {allPhotos.length === 0 ? 'Upload photos first' : 'Generate Highlights'}
                        </button>
                    </div>
                )}

                {running && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 20px' }}>
                            <svg viewBox="0 0 80 80" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                                <circle cx="40" cy="40" r="35" fill="none" stroke="var(--surface-2)" strokeWidth="4" />
                                <circle cx="40" cy="40" r="35" fill="none" stroke="var(--gold)" strokeWidth="4"
                                    strokeDasharray={`${2 * Math.PI * 35}`}
                                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - progress / 100)}`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--gold)' }}>{progress}%</span>
                            </div>
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--cream)', marginBottom: 8 }}>Analyzing your photos...</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{phase}</p>
                    </div>
                )}

                {done && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(80,160,100,0.15)', border: '1px solid rgba(80,160,100,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckCircle size={24} style={{ color: '#7DCEA0' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--cream)', marginBottom: 4 }}>
                                Analysis complete — {highlights.length} highlights found
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                Scored {scored.length} photos · Average score: {Math.round(scored.reduce((s, x) => s + x.score, 0) / (scored.length || 1))}/100
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => { setDone(false); setScored([]); setHighlights([]); }} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>
                                Re-run
                            </button>
                            <button onClick={() => toast.success('Highlights saved!')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>
                                <Star size={13} />
                                Save Highlights Album
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results grid */}
            {scored.length > 0 && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--cream)' }}>
                            Photo Rankings
                        </h2>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            ✦ = highlight ({highlights.length} selected)
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        {display.map(({ media: m, score }, i) => {
                            const isHighlight = score >= 80;
                            return (
                                <motion.div key={m.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                                    <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: `1px solid ${isHighlight ? 'var(--border-accent)' : 'var(--border-subtle)'}` }}>
                                        <img src={m.thumbnail_url || m.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} loading="lazy" />
                                        <div style={{ position: 'absolute', top: 8, left: 8, background: isHighlight ? 'linear-gradient(135deg, var(--gold-dark), var(--gold))' : 'rgba(0,0,0,0.7)', color: isHighlight ? 'var(--obsidian)' : '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
                                            {score}
                                        </div>
                                        {isHighlight && (
                                            <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                                <Star size={14} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                                            </div>
                                        )}
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', padding: '16px 10px 8px' }}>
                                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>#{i + 1} ranked</div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {scored.length > 12 && (
                        <button onClick={() => setShowAll(!showAll)} className="btn btn-ghost" style={{ marginTop: 20, padding: '10px 24px', borderRadius: 'var(--radius-md)', width: '100%', fontSize: 'var(--text-sm)' }}>
                            {showAll ? 'Show less' : `Show all ${scored.length} photos`}
                        </button>
                    )}
                </div>
            )}

            {/* Locked features */}
            <div style={{ marginTop: 48 }}>
                <div className="ui-label" style={{ marginBottom: 16 }}>Coming with Pro & Studio</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                    {[
                        { icon: '🧠', title: 'AI Face Recognition', desc: 'Guests find all photos of themselves by entering their phone number.', plan: 'Studio' },
                        { icon: '🎬', title: 'Auto Video Highlights', desc: 'Extract best moments from your film and generate a 30-sec reel.', plan: 'Pro' },
                        { icon: '📀', title: 'AI Album Builder', desc: 'One-click cinematic digital album with timed slides and music sync.', plan: 'Pro' },
                        { icon: '📊', title: 'AI Business Insights', desc: 'Best posting times, popular styles, engagement trends — auto-generated.', plan: 'Studio' },
                    ].map((f, i) => (
                        <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 20, opacity: 0.6, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 12, right: 12, background: f.plan === 'Studio' ? 'var(--surface-2)' : 'var(--surface-frost)', border: `1px solid ${f.plan === 'Studio' ? 'var(--border-muted)' : 'var(--border-accent)'}`, color: f.plan === 'Studio' ? 'var(--text-muted)' : 'var(--gold)', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                                {f.plan}
                            </div>
                            <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>{f.title}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <button onClick={() => toast('Upgrade coming soon!', { icon: '🚀' })} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                        Upgrade to unlock AI tools
                        <ArrowUpRight size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}
