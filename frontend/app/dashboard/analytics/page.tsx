'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2, Eye, Heart, Download, Users, ArrowUpRight,
    TrendingUp, Camera, Clock, Globe, Zap, Calendar,
} from 'lucide-react';
import { studioApi, mediaApi } from '@/lib/api';

const CHART_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AnalyticsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [stats, setStats] = useState<any>(null);
    const [topPhotos, setTopPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        studioApi.getEvents().then((evs: any[]) => {
            setEvents(evs);
            if (evs.length > 0) {
                setSelectedEventId(evs[0].id);
            }
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedEventId) return;
        const ev = events.find(e => e.id === selectedEventId);
        if (!ev) return;
        setStats({
            totalViews: ev.viewCount ?? ev.view_count ?? 0,
            mediaCount: ev._count?.media ?? 0,
            guestUploads: ev._count?.guestUploads ?? 0,
        });
        // Fetch top 4 photos for this event
        mediaApi.getForManagement(selectedEventId).then((media: any[] | null) => {
            setTopPhotos((media || []).filter((m: any) => m.type === 'photo').slice(0, 4));
        }).catch(() => setTopPhotos([]));
    }, [selectedEventId, events]);

    const selectedEvent = events.find(e => e.id === selectedEventId);

    const kpiCards = stats ? [
        { icon: Eye, label: 'Total Views', value: stats.totalViews.toLocaleString(), sub: 'All-time page views', up: true },
        { icon: Camera, label: 'Photos', value: stats.mediaCount.toLocaleString(), sub: 'Uploaded to this wedding', up: false },
        { icon: Users, label: 'Guest Uploads', value: stats.guestUploads.toString(), sub: 'Photos submitted by guests', up: false },
    ] : [];

    return (
        <div style={{ padding: '40px', maxWidth: 1100 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <div className="ui-label" style={{ marginBottom: 10 }}>Analytics</div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 6 }}>
                        Studio Intelligence
                    </h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 300 }}>
                        Real insights from your wedding portals.
                    </p>
                </div>

                {/* Event selector */}
                {events.length > 0 && (
                    <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}
                        style={{
                            background: 'var(--surface)', border: '1px solid var(--border-muted)',
                            borderRadius: 'var(--radius-md)', padding: '8px 14px',
                            color: 'var(--text-primary)', fontFamily: 'var(--font-ui)',
                            fontSize: 'var(--text-sm)', cursor: 'pointer', outline: 'none',
                        }}>
                        {events.map((e: any) => (
                            <option key={e.id} value={e.id}>{e.groomName} & {e.brideName}</option>
                        ))}
                    </select>
                )}
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />)}
                </div>
            ) : events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <BarChart2 size={40} style={{ display: 'block', margin: '0 auto 16px', opacity: 0.2 }} />
                    <div style={{ fontSize: 'var(--text-md)', marginBottom: 8 }}>No weddings yet</div>
                    <div style={{ fontSize: 'var(--text-sm)' }}>Create your first wedding to start tracking analytics.</div>
                </div>
            ) : (
                <>
                    {/* KPI grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
                        {kpiCards.map((card, i) => (
                            <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                className="stat-card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <card.icon size={14} style={{ color: 'var(--gold)' }} />
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</span>
                                    </div>
                                    {card.up && <TrendingUp size={12} style={{ color: '#7DCEA0' }} />}
                                </div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--cream)', lineHeight: 1, marginBottom: 4 }}>
                                    {card.value}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{card.sub}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Wedding details + Top photos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Wedding info */}
                        <div className="card-flat" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 20 }}>
                                Wedding Details
                            </h3>
                            {selectedEvent && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {[
                                        { icon: '💑', title: 'Couple', value: `${selectedEvent.groomName} & ${selectedEvent.brideName}` },
                                        { icon: '📍', title: 'Location', value: selectedEvent.location || 'Not set' },
                                        { icon: '📅', title: 'Date', value: selectedEvent.startDate ? new Date(selectedEvent.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set' },
                                        { icon: '🔒', title: 'Visibility', value: selectedEvent.visibility || 'public' },
                                        { icon: '🎨', title: 'Theme', value: selectedEvent.theme || 'classic' },
                                    ].map(item => (
                                        <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.title}</span>
                                                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{item.value}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Top Photos */}
                        <div className="card-flat" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 20 }}>
                                Recent Photos
                            </h3>
                            {topPhotos.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                                    No photos uploaded yet
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {topPhotos.map((photo: any, i: number) => (
                                        <div key={photo.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                                                {i + 1}
                                            </div>
                                            <img src={photo.thumbnail_url || photo.url} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-subtle)' }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
                                                    {photo.uploader_type === 'guest' ? '👤 Guest upload' : '📸 Photographer'}
                                                </div>
                                                <div style={{ height: 3, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${((i + 1) / topPhotos.length) * 100}%`, background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))' }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coming soon - real analytics */}
                    <div style={{ marginTop: 24, padding: 20, background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 6 }}>
                            📊 Advanced analytics (geography, session duration, peak hours) — coming soon
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)' }}>
                            Upgrade to Pro for deeper engagement insights →
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
