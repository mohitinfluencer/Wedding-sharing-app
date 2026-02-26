'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Calendar, ImageIcon, Users, Eye, ArrowUpRight, Zap, TrendingUp } from 'lucide-react';
import { studioApi } from '@/lib/api';
import { useAuthStore, DEMO_EVENTS } from '@/lib/auth-store';
import toast from 'react-hot-toast';

const GRADIENT_PALETTES = [
    'linear-gradient(135deg, #1a1208 0%, #2d1f0a 100%)',
    'linear-gradient(135deg, #0d1220 0%, #1a2338 100%)',
    'linear-gradient(135deg, #1a0d14 0%, #2d1520 100%)',
    'linear-gradient(135deg, #0d1a10 0%, #152a18 100%)',
];

export default function DashboardPage() {
    const { user, isDemoMode } = useAuthStore();
    const [events, setEvents] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const h = new Date().getHours();
        if (h < 12) setGreeting('Good morning');
        else if (h < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        if (isDemoMode) {
            setEvents(DEMO_EVENTS);
            setStats({ eventCount: 3, mediaCount: 188, guestUploadCount: 24, viewCount: 431 });
            setLoading(false);
            return;
        }
        Promise.all([studioApi.getEvents(), studioApi.getStats()])
            .then(([e, s]) => { setEvents(e || []); setStats(s); })
            .catch(() => toast.error('Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, [isDemoMode]);


    if (loading) return (
        <div style={{ padding: 40 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)' }} />)}
            </div>
        </div>
    );

    const statCards = [
        { label: 'Weddings', value: stats?.eventCount ?? 0, icon: Calendar, sub: 'All time' },
        { label: 'Photos', value: stats?.mediaCount ?? 0, icon: ImageIcon, sub: 'Published' },
        { label: 'Guest Uploads', value: stats?.guestUploadCount ?? 0, icon: Users, sub: 'Submitted' },
        { label: 'Page Views', value: stats?.viewCount ?? 0, icon: Eye, sub: 'Total views' },
    ];

    return (
        <div style={{ padding: 40, maxWidth: 1200 }}>

            {/* Demo banner */}
            {isDemoMode && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: 'var(--surface-frost)', border: '1px solid var(--border-accent)',
                        borderRadius: 'var(--radius-md)', padding: '10px 16px', marginBottom: 28,
                    }}
                >
                    <Zap size={14} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', flex: 1 }}>
                        <strong style={{ color: 'var(--gold-light)', fontWeight: 500 }}>Demo mode</strong>
                        {' '}— You&apos;re exploring with sample data. All UI interactions are fully live.
                    </span>
                    <Link href="/auth/signup" style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--gold)', color: 'var(--obsidian)',
                        fontSize: 'var(--text-xs)', fontWeight: 600, textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}>
                        Get started
                    </Link>
                </motion.div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36 }}>
                <div>
                    <div className="ui-label" style={{ marginBottom: 8 }}>Studio Overview</div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 36, fontWeight: 300,
                        letterSpacing: '-0.02em',
                        color: 'var(--cream)',
                        lineHeight: 1.1,
                    }}>
                        {greeting || 'Welcome'},{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontStyle: 'italic',
                        }}>
                            {user?.name?.split(' ')[0]}
                        </span>
                    </h1>
                </div>
                <Link href="/dashboard/events/new" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', gap: 8 }}>
                    <Plus size={15} />
                    New wedding
                </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 40 }}>
                {statCards.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                        className="stat-card"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: 'var(--surface-frost)',
                                border: '1px solid var(--border-accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <s.icon size={15} style={{ color: 'var(--gold)' }} />
                            </div>
                            <TrendingUp size={12} style={{ color: 'var(--border-muted)' }} />
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--cream)', lineHeight: 1 }}>
                            {s.value.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Weddings */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--cream)', letterSpacing: '-0.01em' }}>
                    Your Weddings
                </h2>
                <Link href="/dashboard/events" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--gold)', textDecoration: 'none' }}>
                    View all <ArrowUpRight size={13} />
                </Link>
            </div>

            {events.length === 0 ? (
                <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
                    padding: '60px 40px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 32, marginBottom: 16 }}>✦</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'var(--cream)', marginBottom: 10 }}>
                        Your first portal awaits
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
                        Create a wedding portal and give your clients something extraordinary.
                    </p>
                    <Link href="/dashboard/events/new" className="btn btn-primary" style={{ padding: '12px 28px', borderRadius: 'var(--radius-md)' }}>
                        Create first wedding
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                    {events.slice(0, 6).map((event, i) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Link href={`/dashboard/events/${event.id}`} style={{ textDecoration: 'none' }}>
                                <div className="event-card">
                                    {/* Cover */}
                                    <div className="event-cover" style={{
                                        background: event.coverImage
                                            ? `url(${event.coverImage}) center/cover`
                                            : GRADIENT_PALETTES[i % GRADIENT_PALETTES.length],
                                    }}>
                                        <div className="event-cover-overlay" />
                                        {/* Visibility badge */}
                                        <div style={{ position: 'absolute', top: 12, right: 12 }}>
                                            <span className={`badge ${event.visibility === 'public' ? 'badge-green' : event.visibility === 'private' ? 'badge-red' : 'badge-gold'}`}>
                                                {event.visibility}
                                            </span>
                                        </div>
                                        {/* Couple names */}
                                        <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
                                            <h3 style={{
                                                fontFamily: 'var(--font-display)',
                                                fontSize: 20, fontWeight: 300,
                                                color: 'var(--ivory)',
                                                letterSpacing: '-0.01em',
                                                lineHeight: 1.2,
                                            }}>
                                                {event.groomName} &amp; {event.brideName}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Meta row */}
                                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                                        {event.location && (
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {event.location}
                                            </span>
                                        )}
                                        <div style={{ display: 'flex', gap: 14, marginLeft: 'auto', flexShrink: 0 }}>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <ImageIcon size={11} />{event._count?.media ?? 0}
                                            </span>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Eye size={11} />{event.viewCount ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}

                    {/* Add new */}
                    <Link href="/dashboard/events/new" style={{ textDecoration: 'none' }}>
                        <div className="event-card" style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            minHeight: 180, border: '1px dashed var(--border-muted)',
                            background: 'transparent', opacity: 0.6,
                            transition: 'opacity 0.2s, border-color 0.2s',
                            cursor: 'pointer',
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-accent)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.6'; (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-muted)'; }}
                        >
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: 'var(--surface-frost)', border: '1px solid var(--border-accent)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 12,
                            }}>
                                <Plus size={18} style={{ color: 'var(--gold)' }} />
                            </div>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>New wedding</span>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}
