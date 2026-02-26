'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, MapPin, Calendar, X, ChevronLeft, ChevronRight,
    Upload, Users, Play, Pause, ChevronRight as Arrow,
} from 'lucide-react';
import Link from 'next/link';
import PremiumYouTubePlayer from '@/components/PremiumYouTubePlayer';
import WeddingWelcomeScreen from '@/components/WeddingWelcomeScreen';
import GuestMagicMoment from '@/components/GuestMagicMoment';
import MediaDownloadSystem from '@/components/MediaDownloadSystem';

/* ─── tiny hooks ──────────────────────────────────────────────── */
function useKeyPress(key: string, fn: () => void, active: boolean) {
    useEffect(() => {
        if (!active) return;
        const h = (e: KeyboardEvent) => { if (e.key === key) fn(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [key, fn, active]);
}

/* ─── helpers ─────────────────────────────────────────────────── */
const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════ */
export default function WeddingPage() {
    const { slug } = useParams<{ slug: string }>();

    const [event, setEvent] = useState<any>(null);
    const [media, setMedia] = useState<any[]>([]);
    const [notFound, setNotFound] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [showWelcome, setShowWelcome] = useState(true);

    // Lightbox
    const [lb, setLb] = useState<{ open: boolean; photos: any[]; idx: number }>({
        open: false, photos: [], idx: 0,
    });
    const openLb = (photos: any[], idx: number) => {
        setLb({ open: true, photos, idx });
        document.body.style.overflow = 'hidden';
    };
    const closeLb = useCallback(() => {
        setLb(s => ({ ...s, open: false }));
        document.body.style.overflow = '';
    }, []);
    const lbPrev = useCallback(() => setLb(s => ({ ...s, idx: (s.idx - 1 + s.photos.length) % s.photos.length })), []);
    const lbNext = useCallback(() => setLb(s => ({ ...s, idx: (s.idx + 1) % s.photos.length })), []);

    useKeyPress('Escape', closeLb, lb.open);
    useKeyPress('ArrowLeft', lbPrev, lb.open);
    useKeyPress('ArrowRight', lbNext, lb.open);

    // Slideshow
    const [ss, setSs] = useState(false);
    const [ssIdx, setSsIdx] = useState(0);
    const photos = media.filter(m => m.type === 'photo');
    const ssClose = useCallback(() => { setSs(false); document.body.style.overflow = ''; }, []);
    useKeyPress('Escape', ssClose, ss);

    useEffect(() => {
        if (!ss || photos.length === 0) return;
        const t = setInterval(() => setSsIdx(i => (i + 1) % photos.length), 4000);
        return () => clearInterval(t);
    }, [ss, photos.length]);

    // Scroll parallax
    useEffect(() => {
        const fn = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    // Data load
    const loadData = useCallback(async () => {
        try {
            const { eventsApi } = await import('@/lib/api');
            const data = await eventsApi.getBySlug(slug as string);
            setEvent(data?.event ?? null);
            setMedia(data?.media || []);
        } catch { setNotFound(true); }
    }, [slug]);
    useEffect(() => { loadData(); }, [loadData]);

    // Continue Watching Persistence
    useEffect(() => {
        if (!event?.id) return;
        const saved = localStorage.getItem(`wedding_resume_${event.id}`);
        if (saved) {
            const { idx, time } = JSON.parse(saved);
            // We could show a "Resume" toast here, but for now we'll just set the index
            setSsIdx(idx || 0);
        }
    }, [event?.id]);

    useEffect(() => {
        if (event?.id && ss) {
            localStorage.setItem(`wedding_resume_${event.id}`, JSON.stringify({ idx: ssIdx, time: Date.now() }));
        }
    }, [ssIdx, ss, event?.id]);

    // Grouped by albums
    const albums: any[] = event?.albums || [];
    const photosByAlbum = (albumId: string) => photos.filter(m => m.albumId === albumId);
    const uncategorized = photos.filter(m => !m.albumId);

    // Hero BG — first photo or YouTube thumbnail
    const heroBg = photos[0]?.url
        || (event?.youtube_video_id
            ? `https://img.youtube.com/vi/${event.youtube_video_id}/maxresdefault.jpg`
            : null);

    /* ── loading ── */
    if (!event && !notFound) return (
        <div style={{
            minHeight: '100dvh',
            background: '#0C0A09',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 20,
        }}>
            <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: 36, color: '#C9974A' }}
            >♥</motion.div>
            <div style={{ fontSize: 12, color: 'rgba(201,151,74,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Loading your story
            </div>
        </div>
    );

    if (notFound) return (
        <div style={{ minHeight: '100dvh', background: '#0C0A09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: '#C8B89A', textAlign: 'center' }}>
                This wedding portal could not be found.
            </div>
            <div style={{ fontSize: 13, color: '#6B5E52' }}>The link may have expired or changed.</div>
            <Link href="/" style={{ marginTop: 12, color: '#C9974A', fontSize: 13, textDecoration: 'none', borderBottom: '1px solid rgba(201,151,74,0.3)', paddingBottom: 2 }}>
                ← Back to WeddingVault
            </Link>
        </div>
    );

    return (
        <div style={{ background: '#0C0A09', minHeight: '100dvh', overflowX: 'hidden', fontFamily: 'var(--font-ui, "Outfit", sans-serif)', position: 'relative' }}>

            {/* ════════════════════════════════════════════════════
                GLOBAL CINEMATIC BACKGROUND
                Behind everything: blurred, dark gradient, subtle grain
            ════════════════════════════════════════════════════ */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {heroBg && (
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', inset: -50,
                            backgroundImage: `url(${heroBg})`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            filter: 'blur(80px)',
                        }}
                    />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, transparent 0%, #0C0A09 80%)' }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    backgroundSize: '180px', opacity: 0.03,
                }} />
            </div>

            {/* ── Welcome Screen Overlay ── */}
            <AnimatePresence>
                {showWelcome && (
                    <WeddingWelcomeScreen
                        event={event}
                        heroImage={heroBg}
                        onEnter={() => setShowWelcome(false)}
                    />
                )}
            </AnimatePresence>

            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* ════════════════════════════════════════════════════
                LIVE URGENCY BANNER
            ════════════════════════════════════════════════════ */}
                {event.youtube_live_id && (
                    <motion.div
                        initial={{ y: -48 }} animate={{ y: 0 }}
                        style={{
                            position: 'sticky', top: 0, zIndex: 200,
                            background: 'linear-gradient(90deg, #B91C1C 0%, #DC2626 50%, #B91C1C 100%)',
                            padding: '10px 20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                            fontSize: 12, fontWeight: 700, color: '#fff',
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(185,28,28,0.6)',
                        }}
                        onClick={() => document.getElementById('live-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#fff' }}
                        />
                        LIVE NOW — {event.groomName} & {event.brideName} is Broadcasting
                        <span style={{ marginLeft: 8, background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 4, fontSize: 10 }}>
                            WATCH →
                        </span>
                    </motion.div>
                )}

                {/* ════════════════════════════════════════════════════
                ① CINEMATIC HERO BANNER
                Full-height, blurred wedding frame, couple names center stage
            ════════════════════════════════════════════════════ */}
                <section style={{ position: 'relative', height: '100dvh', minHeight: 600, overflow: 'hidden' }}>

                    {/* Cinematic BG — blurred photo with slow Ken Burns zoom */}
                    {heroBg && (
                        <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: 1.08 }}
                            transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
                            style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: `url(${heroBg})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                willChange: 'transform',
                            }}
                        />
                    )}
                    {/* Gradient layers — cinema grade */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to bottom, rgba(12,10,9,0.55) 0%, rgba(12,10,9,0.1) 30%, rgba(12,10,9,0.3) 55%, rgba(12,10,9,0.95) 90%, #0C0A09 100%)',
                    }} />
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,151,74,0.06) 0%, transparent 70%)',
                    }} />
                    {/* Grain texture */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                        backgroundSize: '180px',
                        opacity: 0.04,
                        pointerEvents: 'none',
                    }} />

                    {/* Parallax scroll fade */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: `rgba(12,10,9,${Math.min(scrollY / 400, 0.5)})`,
                        pointerEvents: 'none',
                    }} />

                    {/* HERO CONTENT */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        textAlign: 'center', padding: '0 24px',
                    }}>
                        {/* Studio pill */}
                        <motion.div
                            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '5px 16px', borderRadius: 999,
                                background: 'rgba(12,10,9,0.6)', backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(201,151,74,0.25)',
                                fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
                                color: 'rgba(201,151,74,0.8)', marginBottom: 32,
                            }}
                        >
                            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>✦</motion.span>
                            {event.studio?.studio_name || event.studio?.studioName || 'A Wedding Story'}
                        </motion.div>

                        {/* COUPLE NAMES — The Hero Typography */}
                        <motion.div
                            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <h1 style={{
                                fontFamily: 'var(--font-display, "Fraunces", serif)',
                                fontSize: 'clamp(52px, 12vw, 140px)',
                                fontWeight: 300,
                                lineHeight: 0.88,
                                letterSpacing: '-0.04em',
                                color: '#F5F0E8',
                                marginBottom: 0,
                            }}>
                                {event.groomName}
                            </h1>
                            {/* Ampersand — italic stroke only */}
                            <div style={{
                                fontFamily: 'var(--font-display, "Fraunces", serif)',
                                fontSize: 'clamp(28px, 5vw, 56px)',
                                fontStyle: 'italic',
                                fontWeight: 300,
                                color: 'transparent',
                                WebkitTextStroke: '1px rgba(201,151,74,0.7)',
                                letterSpacing: '-0.01em',
                                margin: '8px 0 4px',
                            }}>
                                & the love of his life
                            </div>
                            <h1 style={{
                                fontFamily: 'var(--font-display, "Fraunces", serif)',
                                fontSize: 'clamp(52px, 12vw, 140px)',
                                fontWeight: 300,
                                lineHeight: 0.88,
                                letterSpacing: '-0.04em',
                                color: '#F5F0E8',
                                marginBottom: 0,
                            }}>
                                {event.brideName}
                            </h1>
                        </motion.div>

                        {/* Date + Location */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: 0.9, duration: 1 }}
                            style={{
                                display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center',
                                marginTop: 28, fontSize: 13, color: 'rgba(200,184,154,0.7)',
                            }}
                        >
                            {event.startDate && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Calendar size={13} style={{ color: 'rgba(201,151,74,0.6)' }} />
                                    {fmt(event.startDate)}
                                </span>
                            )}
                            {event.location && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <MapPin size={13} style={{ color: 'rgba(201,151,74,0.6)' }} />
                                    {event.location}
                                </span>
                            )}
                        </motion.div>

                        {/* Hero CTA buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1, duration: 0.8 }}
                            style={{ display: 'flex', gap: 14, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center' }}
                        >
                            {/* Play film */}
                            {event.youtube_video_id && (
                                <button
                                    onClick={() => document.getElementById('film-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '14px 32px',
                                        background: '#F5F0E8',
                                        border: 'none', borderRadius: 999,
                                        fontFamily: 'var(--font-ui, "Outfit", sans-serif)',
                                        fontSize: 14, fontWeight: 600, color: '#0C0A09',
                                        cursor: 'pointer', letterSpacing: '0.01em',
                                        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                                >
                                    <Play size={16} style={{ fill: '#0C0A09' }} />
                                    Watch the Film
                                </button>
                            )}
                            {/* Slideshow */}
                            {photos.length > 0 && (
                                <button
                                    onClick={() => { setSs(true); setSsIdx(0); document.body.style.overflow = 'hidden'; }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '14px 28px',
                                        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)',
                                        border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999,
                                        fontFamily: 'var(--font-ui, "Outfit", sans-serif)',
                                        fontSize: 14, fontWeight: 500, color: '#F5F0E8',
                                        cursor: 'pointer', letterSpacing: '0.01em',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
                                >
                                    ✨ Slideshow Experience
                                </button>
                            )}
                        </motion.div>

                        {/* Viewer count */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ delay: 1.4 }}
                            style={{
                                marginTop: 28,
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '5px 14px', borderRadius: 999,
                                background: 'rgba(201,151,74,0.08)',
                                border: '1px solid rgba(201,151,74,0.15)',
                                fontSize: 12, color: 'rgba(201,151,74,0.7)',
                            }}
                        >
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ width: 5, height: 5, borderRadius: '50%', background: '#C9974A', display: 'inline-block' }}
                            />
                            <Users size={11} />
                            <span>{Math.floor(Math.random() * 18) + 4} people watching right now</span>
                        </motion.div>
                    </div>

                    {/* Scroll cue */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            position: 'absolute', bottom: 36, left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        }}
                    >
                        <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, rgba(201,151,74,0.5))' }} />
                        <div style={{ fontSize: 9, color: 'rgba(201,151,74,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>scroll</div>
                    </motion.div>
                </section>

                {/* ════════════════════════════════════════════════════
                ② PREMIUM FILM SECTION
            ════════════════════════════════════════════════════ */}
                {event.youtube_video_id && (
                    <section id="film-section" style={{ padding: '100px 24px', maxWidth: 1000, margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Section label */}
                            <div style={{ textAlign: 'center', marginBottom: 48 }}>
                                <div style={{ fontSize: 11, color: 'rgba(201,151,74,0.7)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                                    ✦ The Wedding Film
                                </div>
                                <h2 style={{
                                    fontFamily: 'var(--font-display, "Fraunces", serif)',
                                    fontSize: 'clamp(28px, 5vw, 52px)',
                                    fontWeight: 300, letterSpacing: '-0.02em',
                                    color: '#E8D5B4', lineHeight: 1.1, marginBottom: 12,
                                }}>
                                    Our Story, Forever Captured
                                </h2>
                                <div style={{ width: 40, height: 1, background: 'rgba(201,151,74,0.4)', margin: '0 auto' }} />
                            </div>

                            <PremiumYouTubePlayer
                                videoId={event.youtube_video_id}
                                title={`${event.groomName} & ${event.brideName}`}
                                subtitle="Wedding Film"
                                date={fmt(event.startDate)}
                                badge="Wedding Film"
                            />

                            <p style={{
                                textAlign: 'center', marginTop: 20,
                                fontSize: 13, color: 'rgba(200,184,154,0.4)',
                                fontStyle: 'italic',
                            }}>
                                Filmed & directed by {event.studio?.studio_name || event.studio?.studioName || 'the photography studio'}
                            </p>
                        </motion.div>
                    </section>
                )}

                {/* ════════════════════════════════════════════════════
                ③ LIVE BROADCAST SECTION
            ════════════════════════════════════════════════════ */}
                {event.youtube_live_id && (
                    <section id="live-section" style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.9 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: 40 }}>
                                <motion.div
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        padding: '6px 16px', borderRadius: 999,
                                        background: 'rgba(239,68,68,0.12)',
                                        border: '1px solid rgba(239,68,68,0.35)',
                                        fontSize: 11, fontWeight: 800, color: '#F87171',
                                        letterSpacing: '0.1em', textTransform: 'uppercase',
                                        marginBottom: 16,
                                    }}
                                >
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                                    Live Now
                                </motion.div>
                                <h2 style={{
                                    fontFamily: 'var(--font-display, "Fraunces", serif)',
                                    fontSize: 'clamp(24px, 4vw, 44px)',
                                    fontWeight: 300, color: '#E8D5B4',
                                    letterSpacing: '-0.02em',
                                }}>
                                    Witness the Union
                                </h2>
                            </div>
                            <PremiumYouTubePlayer
                                videoId={event.youtube_live_id}
                                title={`${event.groomName} & ${event.brideName}`}
                                subtitle="Live Ceremony"
                                date={fmt(event.startDate)}
                                badge="● LIVE"
                                isLive
                            />
                        </motion.div>
                    </section>
                )}

                {/* ════════════════════════════════════════════════════
                ④ STORY CHAPTERS (Album-based)
                Each album = a movie chapter
            ════════════════════════════════════════════════════ */}
                {albums.length > 0 && albums.map((album, ai) => {
                    const albumPhotos = photosByAlbum(album.id);
                    if (albumPhotos.length === 0) return null;
                    return (
                        <ChapterRow
                            key={album.id}
                            title={album.title}
                            chapterNum={ai + 1}
                            photos={albumPhotos}
                            onPhotoClick={(idx) => openLb(albumPhotos, idx)}
                            animDelay={ai * 0.1}
                        />
                    );
                })}

                {/* Uncategorized photos — "All Moments" chapter */}
                {uncategorized.length > 0 && (
                    <ChapterRow
                        title={albums.length === 0 ? 'Gallery' : 'More Moments'}
                        chapterNum={albums.length + 1}
                        photos={uncategorized}
                        onPhotoClick={(idx) => openLb(uncategorized, idx)}
                        animDelay={0}
                    />
                )}

                {/* Empty state */}
                {photos.length === 0 && !event.youtube_video_id && (
                    <div style={{ textAlign: 'center', padding: '100px 24px' }}>
                        <div style={{
                            fontFamily: 'var(--font-display, "Fraunces", serif)',
                            fontSize: 32, fontWeight: 300, color: 'rgba(200,184,154,0.4)',
                            marginBottom: 12,
                        }}>
                            Memories are being prepared
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(107,94,82,0.6)' }}>
                            The photographer is uploading your moments. Check back soon.
                        </div>
                    </div>
                )}

                {/* ── GLOBAL DOWNLOAD SECTION ── */}
                {photos.length > 0 && (
                    <section style={{ padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
                        <MediaDownloadSystem
                            albumMedia={photos}
                            albumName={`${event.groomName}_and_${event.brideName}_Wedding`}
                            variant="button"
                        />
                    </section>
                )}

                {/* ════════════════════════════════════════════════════
                ⑤ GUEST MEMORY SECTION — Emotional Upload Hook
            ════════════════════════════════════════════════════ */}
                <section style={{
                    padding: '100px 24px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.9 }}
                        style={{ textAlign: 'center', maxWidth: 520 }}
                    >
                        {/* Heart pulsing */}
                        <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ fontSize: 36, marginBottom: 20, display: 'block' }}
                        >
                            ♥
                        </motion.div>
                        <h2 style={{
                            fontFamily: 'var(--font-display, "Fraunces", serif)',
                            fontSize: 'clamp(30px, 5vw, 52px)',
                            fontWeight: 300, color: '#E8D5B4',
                            letterSpacing: '-0.02em', lineHeight: 1.1,
                            marginBottom: 16,
                        }}>
                            Were you part of<br />
                            <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(201,151,74,0.7)', fontStyle: 'italic' }}>
                                this story?
                            </span>
                        </h2>
                        <p style={{
                            fontSize: 15, color: 'rgba(200,184,154,0.5)',
                            lineHeight: 1.8, marginBottom: 32, fontWeight: 300,
                        }}>
                            Your perspective added to this memory makes it complete.
                            Share the moment you captured — it becomes part of their forever.
                        </p>
                        <Link
                            href={`/wedding/${slug}/upload`}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 10,
                                padding: '16px 40px', borderRadius: 999,
                                background: 'linear-gradient(135deg, #C9974A 0%, #E4B96A 100%)',
                                color: '#0C0A09', fontSize: 15, fontWeight: 700,
                                textDecoration: 'none', letterSpacing: '0.01em',
                                boxShadow: '0 8px 40px rgba(201,151,74,0.3), 0 0 0 1px rgba(201,151,74,0.2)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.04)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)'; }}
                        >
                            <Upload size={16} />
                            Share Your Memory
                        </Link>
                        <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(107,94,82,0.7)', letterSpacing: '0.04em' }}>
                            Free · No account needed · Instant sharing
                        </div>
                    </motion.div>
                </section>

                {/* ════════════════════════════════════════════════════
                ⑥ GUEST ENGAGEMENT — Find Your Photos & Lead Capture
                Embedded directly into the story flow
            ════════════════════════════════════════════════════ */}
                <div style={{ padding: '0 24px 100px' }}>
                    <GuestMagicMoment event={event} />
                </div>
                <motion.footer
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 1.2 }}
                    style={{
                        background: 'linear-gradient(to bottom, #0C0A09 0%, #080605 100%)',
                        borderTop: '1px solid rgba(200,184,154,0.05)',
                        padding: '80px 24px 60px',
                        textAlign: 'center',
                        position: 'relative', overflow: 'hidden',
                    }}
                >
                    {/* Subtle radial glow */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,151,74,0.04) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    {/* Closing message */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 1 }}
                        style={{ position: 'relative' }}
                    >
                        <div style={{
                            fontFamily: 'var(--font-display, "Fraunces", serif)',
                            fontSize: 'clamp(22px, 4vw, 40px)',
                            fontWeight: 300, color: 'rgba(200,184,154,0.6)',
                            letterSpacing: '-0.01em', lineHeight: 1.4,
                            marginBottom: 8,
                        }}>
                            Thank you for celebrating with us
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-display, "Fraunces", serif)',
                            fontSize: 'clamp(24px, 5vw, 48px)',
                            fontWeight: 300, color: '#E8D5B4',
                            letterSpacing: '-0.02em',
                        }}>
                            — {event.groomName} & {event.brideName}
                        </div>
                        {event.startDate && (
                            <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(107,94,82,0.6)', letterSpacing: '0.08em' }}>
                                {fmt(event.startDate)}
                            </div>
                        )}
                    </motion.div>

                    {/* Divider */}
                    <div style={{ width: 48, height: 1, background: 'rgba(201,151,74,0.2)', margin: '48px auto' }} />

                    {/* WeddingVault CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                    >
                        <div style={{ fontSize: 13, color: 'rgba(107,94,82,0.6)', marginBottom: 20, lineHeight: 1.7 }}>
                            Capturing your own forever?
                            <br />
                            WeddingVault turns wedding memories into a cinematic streaming experience for your guests.
                        </div>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/auth/signup" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                padding: '10px 24px', borderRadius: 999,
                                background: 'rgba(201,151,74,0.1)',
                                border: '1px solid rgba(201,151,74,0.25)',
                                color: 'rgba(201,151,74,0.8)', fontSize: 12, fontWeight: 500,
                                textDecoration: 'none', letterSpacing: '0.04em',
                            }}>
                                Open Your Studio →
                            </Link>
                        </div>
                        <div style={{ marginTop: 40, fontSize: 10, color: 'rgba(107,94,82,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                            Powered by ✦ WeddingVault
                        </div>
                    </motion.div>
                </motion.footer>

                {/* ════════════════════════════════════════════════════
                LIGHTBOX
            ════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {lb.open && lb.photos[lb.idx] && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={closeLb}
                            style={{
                                position: 'fixed', inset: 0, zIndex: 300,
                                background: 'rgba(8,6,5,0.97)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={lb.idx}
                                    src={lb.photos[lb.idx].url}
                                    alt=""
                                    initial={{ opacity: 0, scale: 0.93 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.04 }}
                                    transition={{ duration: 0.28 }}
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        maxWidth: '90vw', maxHeight: '88vh',
                                        objectFit: 'contain', borderRadius: 12,
                                        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                                    }}
                                />
                            </AnimatePresence>
                            <button onClick={closeLb} style={btnStyle({ top: 20, right: 20 })}><X size={18} /></button>

                            {/* Lightbox Download Button */}
                            <div style={{ position: 'absolute', top: 20, right: 68 }} onClick={e => e.stopPropagation()}>
                                <MediaDownloadSystem media={lb.photos[lb.idx]} variant="icon" />
                            </div>

                            {lb.photos.length > 1 && <>
                                <button onClick={e => { e.stopPropagation(); lbPrev(); }} style={btnStyle({ left: 16, top: '50%', transform: 'translateY(-50%)' })}><ChevronLeft size={22} /></button>
                                <button onClick={e => { e.stopPropagation(); lbNext(); }} style={btnStyle({ right: 16, top: '50%', transform: 'translateY(-50%)' })}><ChevronRight size={22} /></button>
                            </>}
                            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'rgba(200,184,154,0.4)' }}>
                                {lb.idx + 1} / {lb.photos.length}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ════════════════════════════════════════════════════
                FULLSCREEN SLIDESHOW EXPERIENCE
            ════════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {ss && photos[ssIdx] && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed', inset: 0, zIndex: 400,
                                background: '#080605',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={ssIdx}
                                    src={photos[ssIdx].url}
                                    alt=""
                                    initial={{ opacity: 0, scale: 1.06 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                    style={{
                                        width: '100vw', height: '100vh',
                                        objectFit: 'contain',
                                    }}
                                />
                            </AnimatePresence>

                            {/* Gradient overlay bottom */}
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                height: 180,
                                background: 'linear-gradient(to top, rgba(8,6,5,0.9), transparent)',
                            }} />

                            {/* Couple name + counter */}
                            <div style={{
                                position: 'absolute', bottom: 32, left: 0, right: 0,
                                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                                padding: '0 32px',
                            }}>
                                <div>
                                    <div style={{
                                        fontFamily: 'var(--font-display, "Fraunces", serif)',
                                        fontSize: 22, fontWeight: 300, color: 'rgba(245,240,232,0.8)',
                                        letterSpacing: '-0.01em',
                                    }}>
                                        {event.groomName} & {event.brideName}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'rgba(200,184,154,0.4)', marginTop: 4 }}>
                                        {ssIdx + 1} of {photos.length}
                                    </div>
                                </div>
                                {/* Dot progress */}
                                <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap', maxWidth: '50%', justifyContent: 'flex-end' }}>
                                    {photos.slice(0, 20).map((_, i) => (
                                        <button key={i}
                                            onClick={() => setSsIdx(i)}
                                            style={{
                                                width: i === ssIdx ? 20 : 5, height: 3,
                                                borderRadius: 99,
                                                background: i === ssIdx ? '#C9974A' : 'rgba(255,255,255,0.2)',
                                                border: 'none', cursor: 'pointer', padding: 0,
                                                transition: 'all 0.3s',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button onClick={ssClose} style={btnStyle({ top: 20, right: 20 })}><X size={20} /></button>
                            <button
                                onClick={() => setSsIdx(i => (i - 1 + photos.length) % photos.length)}
                                style={btnStyle({ left: 16, top: '50%', transform: 'translateY(-50%)' })}
                            ><ChevronLeft size={24} /></button>
                            <button
                                onClick={() => setSsIdx(i => (i + 1) % photos.length)}
                                style={btnStyle({ right: 16, top: '50%', transform: 'translateY(-50%)' })}
                            ><ChevronRight size={24} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   CHAPTER ROW COMPONENT — Netflix horizontal scroll row
══════════════════════════════════════════════════════════════════ */
interface ChapterRowProps {
    title: string;
    chapterNum: number;
    photos: any[];
    onPhotoClick: (idx: number) => void;
    animDelay: number;
}

function ChapterRow({ title, chapterNum, photos, onPhotoClick, animDelay }: ChapterRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const scrollLeft = () => rowRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
    const scrollRight = () => rowRef.current?.scrollBy({ left: 320, behavior: 'smooth' });

    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: animDelay, ease: [0.16, 1, 0.3, 1] }}
            style={{ padding: '60px 0', position: 'relative' }}
        >
            {/* Chapter header */}
            <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                padding: '0 24px', marginBottom: 20,
            }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                    {/* Chapter number */}
                    <span style={{
                        fontFamily: 'var(--font-display, "Fraunces", serif)',
                        fontSize: 48, fontWeight: 300,
                        color: 'rgba(201,151,74,0.15)',
                        lineHeight: 1, userSelect: 'none',
                    }}>
                        {String(chapterNum).padStart(2, '0')}
                    </span>
                    <div>
                        <div style={{ fontSize: 10, color: 'rgba(201,151,74,0.5)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 2 }}>
                            Chapter
                        </div>
                        <h2 style={{
                            fontFamily: 'var(--font-display, "Fraunces", serif)',
                            fontSize: 'clamp(20px, 3vw, 32px)',
                            fontWeight: 300, color: '#E8D5B4',
                            letterSpacing: '-0.01em', margin: 0,
                        }}>
                            {title}
                        </h2>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={scrollLeft} style={arrowBtn()}><ChevronLeft size={16} /></button>
                    <button onClick={scrollRight} style={arrowBtn()}><Arrow size={16} /></button>
                </div>
            </div>

            {/* Left + Right fade edges */}
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to right, #0C0A09, transparent)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to left, #0C0A09, transparent)', zIndex: 2, pointerEvents: 'none' }} />

                {/* Horizontal scroll row */}
                <div
                    ref={rowRef}
                    style={{
                        display: 'flex', gap: 10,
                        overflowX: 'auto',
                        padding: '4px 24px 16px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {photos.map((photo, idx) => (
                        <motion.div
                            key={photo.id}
                            whileHover={{ scale: 1.03, y: -4 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            onClick={() => onPhotoClick(idx)}
                            style={{
                                flexShrink: 0,
                                width: photo.width && photo.height
                                    ? `${Math.round(280 * (photo.width / photo.height))}px`
                                    : '280px',
                                maxWidth: 420,
                                minWidth: 180,
                                height: 200,
                                borderRadius: 12,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                position: 'relative',
                                border: '1px solid rgba(200,184,154,0.06)',
                            }}
                        >
                            <img
                                src={photo.thumbnail_url || photo.thumbnailUrl || photo.url}
                                alt=""
                                loading="lazy"
                                style={{
                                    width: '100%', height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                                }}
                            />
                            {/* Hover gradient */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(to top, rgba(8,6,5,0.6) 0%, transparent 50%)',
                                opacity: 0,
                                transition: 'opacity 0.25s',
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0'; }}
                            />
                            {/* Highlight star */}
                            {photo.highlight && (
                                <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
                                    <Heart size={14} style={{ color: '#C9974A', fill: '#C9974A', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.7))' }} />
                                </div>
                            )}

                            {/* Download Icon */}
                            <div
                                style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 10 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <MediaDownloadSystem media={photo} variant="icon" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}

/* ─── style helpers ───────────────────────────────────────────── */
function btnStyle(extra: React.CSSProperties = {}): React.CSSProperties {
    return {
        position: 'absolute',
        background: 'rgba(20,18,16,0.8)',
        border: '1px solid rgba(200,184,154,0.12)',
        borderRadius: 10, padding: '10px 12px',
        cursor: 'pointer', color: 'rgba(200,184,154,0.7)',
        display: 'flex', alignItems: 'center',
        backdropFilter: 'blur(8px)',
        zIndex: 10,
        transition: 'background 0.2s',
        ...extra,
    };
}

function arrowBtn(): React.CSSProperties {
    return {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32,
        background: 'rgba(200,184,154,0.06)',
        border: '1px solid rgba(200,184,154,0.1)',
        borderRadius: 8, cursor: 'pointer',
        color: 'rgba(200,184,154,0.5)',
        transition: 'background 0.2s, color 0.2s',
    };
}
