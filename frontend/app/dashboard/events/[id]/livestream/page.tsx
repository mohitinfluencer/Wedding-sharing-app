'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft, Radio, ExternalLink, Copy, Check, Youtube,
    MonitorPlay, Settings, ArrowRight, Zap, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsApi } from '@/lib/api';
import { useAuthStore, DEMO_EVENTS } from '@/lib/auth-store';

export default function GoLivePage() {
    const { id } = useParams<{ id: string }>();
    const { isDemoMode } = useAuthStore();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [liveLink, setLiveLink] = useState('');
    const [copiedStep, setCopiedStep] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isDemoMode) {
            setEvent(DEMO_EVENTS.find(e => e.id === id) ?? DEMO_EVENTS[0]);
            return;
        }
        eventsApi.getById(id as string).then(setEvent).catch(() => toast.error('Failed to load event'));
    }, [id, isDemoMode]);

    const copy = (text: string, step: number) => {
        navigator.clipboard.writeText(text);
        setCopiedStep(step);
        setTimeout(() => setCopiedStep(null), 2000);
    };

    const saveLiveLink = async () => {
        if (!liveLink.trim()) { toast.error('Please paste a YouTube Live link first'); return; }
        setSaving(true);
        try {
            const { youtubeApi } = await import('@/lib/api');
            await youtubeApi.attachLive(id as string, liveLink);
            toast.success('🔴 Live link saved! Guests will now see the live badge.');
            router.push(`/dashboard/events/${id}?tab=video`);
        } catch (e: any) {
            toast.error(e.message || 'Invalid YouTube Live link');
        } finally {
            setSaving(false);
        }
    };

    const card: React.CSSProperties = {
        background: '#141210',
        border: '1px solid rgba(200,184,154,0.12)',
        borderRadius: 20,
        padding: 28,
    };

    const steps = [
        {
            num: 1,
            title: 'Open YouTube Studio',
            desc: 'Go to studio.youtube.com and click "Go Live" in the top bar.',
            action: { label: 'Open YouTube Studio', url: 'https://studio.youtube.com', icon: <Youtube size={14} /> },
        },
        {
            num: 2,
            title: 'Create a Live Stream',
            desc: 'Click "Schedule a stream" → Set title to "Wedding Film" → Set to Unlisted → Click "Create stream".',
            action: null,
        },
        {
            num: 3,
            title: 'Choose your streaming tool',
            desc: 'Use your phone camera with YouTube Live app, or professional software like OBS Studio for a more cinematic look.',
            action: { label: 'Download OBS Studio (free)', url: 'https://obsproject.com/', icon: <MonitorPlay size={14} /> },
        },
        {
            num: 4,
            title: 'Copy your Stream link',
            desc: 'Once your stream is live, copy the youtube.com/live/... URL from the browser address bar.',
            action: null,
        },
        {
            num: 5,
            title: 'Paste it below',
            desc: 'Paste the link here and click "Go Live" — your guests will immediately see a 🔴 LIVE NOW banner on the wedding page.',
            action: null,
        },
    ];

    return (
        <div style={{ padding: '40px 48px', maxWidth: 720 }}>
            <Link
                href={`/dashboard/events/${id}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: 13, marginBottom: 40 }}
            >
                <ArrowLeft size={16} /> Back to Event Manager
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Radio size={20} style={{ color: '#F87171' }} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display,Georgia,serif)', fontSize: 28, fontWeight: 300, color: '#E8D5B4', letterSpacing: '-0.02em', marginBottom: 2 }}>
                            Go Live
                        </h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                            {event?.groomName} &amp; {event?.brideName} — {event?.location}
                        </p>
                    </div>
                </div>

                {/* How it works banner */}
                <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: 'rgba(201,151,74,0.07)', border: '1px solid rgba(201,151,74,0.2)', borderRadius: 12, marginBottom: 32, marginTop: 24 }}>
                    <Info size={16} style={{ color: '#C9974A', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                        WeddingVault uses <strong style={{ color: '#E4B96A' }}>YouTube Live</strong> to broadcast your ceremony. Your guests don't need a YouTube account — they watch directly on the wedding portal with no YouTube branding.
                    </p>
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.num}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            style={card}
                        >
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                    background: 'rgba(201,151,74,0.12)', border: '1px solid rgba(201,151,74,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 700, color: '#C9974A',
                                }}>
                                    {step.num}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>{step.title}</div>
                                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{step.desc}</div>
                                    {step.action && (
                                        <a
                                            href={step.action.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                                                padding: '7px 14px', borderRadius: 10,
                                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                                fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                                                transition: 'all 150ms',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                                        >
                                            {step.action.icon}
                                            {step.action.label}
                                            <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Live link input */}
                <div style={{ ...card, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F87171', animation: 'pulse 1s ease-in-out infinite' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#F87171', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Activate Live Stream</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input
                            value={liveLink}
                            onChange={e => setLiveLink(e.target.value)}
                            placeholder="https://youtube.com/live/xxxx..."
                            style={{
                                flex: 1, background: '#0C0A09', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 12, color: '#F5F0E8', fontSize: 14, padding: '11px 16px',
                                outline: 'none', fontFamily: 'inherit',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#F87171'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                            id="live-link-input"
                        />
                        <button
                            onClick={saveLiveLink}
                            disabled={saving}
                            style={{
                                padding: '11px 22px', borderRadius: 12, border: 'none',
                                background: saving ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.8)',
                                color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                                transition: 'all 150ms',
                            }}
                        >
                            {saving ? <>Saving...</> : <><Radio size={15} /> Go Live</>}
                        </button>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 10 }}>
                        Guests will instantly see a 🔴 LIVE NOW banner. To stop the stream, end it in YouTube Studio.
                    </p>
                </div>

                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
            </motion.div>
        </div>
    );
}
