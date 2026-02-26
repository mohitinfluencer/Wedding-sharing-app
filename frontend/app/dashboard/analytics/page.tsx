'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2, Eye, Heart, Download, Users, MapPin, ArrowUpRight,
    TrendingUp, Camera, Clock, Globe, Zap,
} from 'lucide-react';
import { useAuthStore, DEMO_EVENTS } from '@/lib/auth-store';

// Demo analytics data
const DEMO_STATS = {
    totalViews: 4312,
    uniqueVisitors: 2187,
    photoDownloads: 831,
    guestUploads: 42,
    avgViewDuration: '4m 32s',
    topCountries: [
        { name: 'India', pct: 72, flag: '🇮🇳' },
        { name: 'UAE', pct: 11, flag: '🇦🇪' },
        { name: 'UK', pct: 7, flag: '🇬🇧' },
        { name: 'USA', pct: 6, flag: '🇺🇸' },
        { name: 'Canada', pct: 4, flag: '🇨🇦' },
    ],
    viewsByDay: [120, 210, 380, 290, 510, 440, 320, 580, 630, 490, 720, 680, 540, 420],
    topPhotos: [
        { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=200', views: 341, downloads: 87, id: 'p1' },
        { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200', views: 298, downloads: 64, id: 'p2' },
        { url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=200', views: 276, downloads: 59, id: 'p3' },
        { url: 'https://images.unsplash.com/photo-1525772764200-be829a350797?w=200', views: 231, downloads: 41, id: 'p4' },
    ],
    peakHour: '8 PM – 10 PM',
    returningRate: '38%',
    videoWatchTime: '12,400 min',
};

const CHART_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const maxViews = Math.max(...DEMO_STATS.viewsByDay);

export default function AnalyticsPage() {
    const { isDemoMode } = useAuthStore();
    const [selectedEvent, setSelectedEvent] = useState(DEMO_EVENTS[0].id);

    const stats = DEMO_STATS;

    const kpiCards = [
        { icon: Eye, label: 'Total Views', value: stats.totalViews.toLocaleString(), sub: '+24% vs last month', up: true },
        { icon: Users, label: 'Unique Visitors', value: stats.uniqueVisitors.toLocaleString(), sub: '+18% vs last month', up: true },
        { icon: Download, label: 'Photo Downloads', value: stats.photoDownloads.toLocaleString(), sub: '+31% vs last month', up: true },
        { icon: Camera, label: 'Guest Uploads', value: stats.guestUploads.toString(), sub: 'Awaiting review: 3', up: false },
        { icon: Clock, label: 'Avg. Session', value: stats.avgViewDuration, sub: 'Per gallery visit', up: false },
        { icon: Heart, label: 'Video Watch Time', value: stats.videoWatchTime, sub: 'Total this period', up: true },
    ];

    return (
        <div style={{ padding: '40px', maxWidth: 1100 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <div className="ui-label" style={{ marginBottom: 10 }}>Analytics</div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 6 }}>
                        Studio Intelligence
                    </h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 300 }}>
                        Deep insights into how your wedding portals perform.
                    </p>
                </div>

                {/* Event selector */}
                <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}
                    style={{
                        background: 'var(--surface)', border: '1px solid var(--border-muted)',
                        borderRadius: 'var(--radius-md)', padding: '8px 14px',
                        color: 'var(--text-primary)', fontFamily: 'var(--font-ui)',
                        fontSize: 'var(--text-sm)', cursor: 'pointer', outline: 'none',
                    }}>
                    {DEMO_EVENTS.map(e => (
                        <option key={e.id} value={e.id}>{e.groomName} & {e.brideName}</option>
                    ))}
                </select>
            </div>

            {/* Demo banner */}
            {isDemoMode && (
                <div className="glass-gold" style={{ borderRadius: 'var(--radius-md)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: 'var(--text-xs)' }}>
                    <Zap size={12} style={{ color: 'var(--gold)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Demo analytics — showing simulated data for <strong style={{ color: 'var(--gold-light)' }}>Rahul &amp; Priya</strong></span>
                </div>
            )}

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
                        <div style={{ fontSize: 11, color: card.up ? '#7DCEA0' : 'var(--text-muted)' }}>{card.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Views chart + breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Bar chart */}
                <div className="card-flat" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)' }}>Gallery Views (14 days)</h3>
                        <span className="badge badge-green">Live</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                        {DEMO_STATS.viewsByDay.map((v, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{
                                    width: '100%', borderRadius: '3px 3px 0 0',
                                    background: `linear-gradient(to top, var(--gold-dark), var(--gold-light))`,
                                    height: `${(v / maxViews) * 100}%`,
                                    minHeight: 4,
                                    opacity: i === DEMO_STATS.viewsByDay.length - 1 ? 1 : 0.6,
                                    transition: 'opacity 0.2s',
                                }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = i === DEMO_STATS.viewsByDay.length - 1 ? '1' : '0.6')}
                                />
                                {i % 2 === 0 && (
                                    <span style={{ fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{CHART_DAYS[i]}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insights */}
                <div className="card-flat" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 20 }}>
                        AI Insights
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { icon: '🕐', title: 'Peak hour', value: stats.peakHour, tip: 'Post updates at 8PM' },
                            { icon: '🔄', title: 'Return visitors', value: stats.returningRate, tip: 'Strong engagement' },
                            { icon: '🌍', title: 'Top market', value: 'India (72%)', tip: 'Regional dominance' },
                            { icon: '📸', title: 'Most downloaded', value: 'Ritual photos', tip: '2.4× more than portraits' },
                        ].map(item => (
                            <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.title}</span>
                                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--gold)', marginTop: 2 }}>{item.tip}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top photos + Geography */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Top photos */}
                <div className="card-flat" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 20 }}>
                        Most Viewed Photos
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {DEMO_STATS.topPhotos.map((photo, i) => (
                            <div key={photo.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                                    {i + 1}
                                </div>
                                <img src={photo.url} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-subtle)' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Eye size={10} />{photo.views}
                                        </span>
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Download size={10} />{photo.downloads}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: 4, height: 3, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${(photo.views / 341) * 100}%`, background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Geography */}
                <div className="card-flat" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Globe size={16} style={{ color: 'var(--gold)' }} /> Audience Geography
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {DEMO_STATS.topCountries.map(c => (
                            <div key={c.name}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>{c.flag}</span> {c.name}
                                    </span>
                                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>{c.pct}%</span>
                                </div>
                                <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2 }}>
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${c.pct}%` }}
                                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-light))' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="divider" style={{ margin: '20px 0' }} />

                    {/* Guest lead capture teaser */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 8 }}>
                            Guest contact capture (Pro feature)
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>
                            🎯 187 qualified leads captured from this event
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)', marginTop: 4 }}>
                            Upgrade to Pro to access guest contact list →
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
