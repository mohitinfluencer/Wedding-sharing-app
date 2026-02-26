'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Calendar, X, ChevronLeft, ChevronRight, Upload, Maximize2, Users } from 'lucide-react';
import Link from 'next/link';


export default function WeddingPage() {
    const { slug } = useParams<{ slug: string }>();
    const [event, setEvent] = useState<any>(null);
    const [media, setMedia] = useState<any[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<string | 'all'>('all');
    const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
    const [slideshow, setSlideshow] = useState(false);
    const [slideshowIdx, setSlideshowIdx] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [viewerCount] = useState(() => Math.floor(Math.random() * 12) + 3);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    // Slideshow auto-advance
    const photos = media.filter(m => m.type === 'photo');
    useEffect(() => {
        if (!slideshow || photos.length === 0) return;
        const t = setInterval(() => setSlideshowIdx(i => (i + 1) % photos.length), 3500);
        return () => clearInterval(t);
    }, [slideshow, photos.length]);

    useEffect(() => {
        const fn = (e: KeyboardEvent) => {
            if (lightbox.open) {
                if (e.key === 'ArrowRight') nextPhoto();
                if (e.key === 'ArrowLeft') prevPhoto();
                if (e.key === 'Escape') closeLightbox();
            }
            if (slideshow && e.key === 'Escape') setSlideshow(false);
        };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [lightbox, slideshow]);

    const filtered = selectedAlbum === 'all'
        ? media.filter(m => m.type === 'photo')
        : media.filter(m => m.type === 'photo' && m.albumId === selectedAlbum);

    const openLightbox = (i: number) => { setLightbox({ open: true, index: i }); document.body.style.overflow = 'hidden'; };
    const closeLightbox = () => { setLightbox({ open: false, index: 0 }); document.body.style.overflow = ''; };
    const prevPhoto = () => setLightbox(l => ({ ...l, index: (l.index - 1 + filtered.length) % filtered.length }));
    const nextPhoto = () => setLightbox(l => ({ ...l, index: (l.index + 1) % filtered.length }));

    const loadData = useCallback(async () => {
        try {
            const { eventsApi, mediaApi } = await import('@/lib/api');
            const data = await eventsApi.getBySlug(slug as string);
            setEvent(data.event);
            setMedia(data.media || []);
        } catch { /* Handle not found */ }
    }, [slug]);

    useEffect(() => { loadData(); }, [loadData]);

    const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

    if (!event) return (
        <div style={{ minHeight: '100dvh', background: '#0C0A09', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart style={{ color: '#C9974A', animation: 'pulse 1.5s ease-in-out infinite' }} size={32} />
        </div>
    );

    return (
        <div style={{ background: 'var(--obsidian)', minHeight: '100dvh', overflowX: 'hidden' }}>

            {/* ── LIVE NOTIFICATION ── */}
            {event.youtube_live_id && (
                <div style={{
                    position: 'sticky', top: 0, zIndex: 100, background: '#EF4444', color: '#fff',
                    padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    fontSize: 12, fontWeight: 700, letterSpacing: '0.05em'
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                    LIVE NOW: {event.groomName} & {event.brideName} is broadcasting live!
                    <button
                        onClick={() => document.getElementById('live-section')?.scrollIntoView({ behavior: 'smooth' })}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '2px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}
                    >WATCH LIVE</button>
                </div>
            )}

            {/* ── SLIDESHOW MODE ── */}
            <AnimatePresence>
                {slideshow && photos[slideshowIdx] && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.4 } }}
                        style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={slideshowIdx}
                                src={photos[slideshowIdx].url}
                                alt=""
                                initial={{ opacity: 0, scale: 1.04 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                style={{ maxWidth: '100vw', maxHeight: '100vh', objectFit: 'contain' }}
                            />
                        </AnimatePresence>

                        {/* Couple name overlay */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            padding: '60px 40px 40px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                        }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.01em' }}>
                                    {event.groomName} & {event.brideName}
                                </div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                                    {slideshowIdx + 1} / {photos.length}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {photos.map((_, i) => (
                                    <button key={i} onClick={() => setSlideshowIdx(i)}
                                        style={{ width: i === slideshowIdx ? 20 : 6, height: 3, borderRadius: 99, background: i === slideshowIdx ? 'var(--gold)' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
                                ))}
                            </div>
                        </div>

                        <button onClick={() => setSlideshow(false)} style={{
                            position: 'absolute', top: 20, right: 20,
                            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 'var(--radius-sm)', padding: 8, cursor: 'pointer', color: '#fff',
                            display: 'flex', alignItems: 'center',
                        }}>
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── HERO ── */}
            <section style={{
                height: '100dvh',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}>
                {/* Background — blurred mosaic of photos */}
                {photos.length > 0 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, opacity: 0.2 }}>
                        {photos.slice(0, 4).map((p, i) => (
                            <img key={i} src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ))}
                    </div>
                )}

                {/* Gradient overlays */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(12,10,9,0.6) 0%, rgba(12,10,9,0.2) 40%, rgba(12,10,9,0.75) 80%, var(--obsidian) 100%)',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 80% 70% at 50% 30%, rgba(201,151,74,0.05) 0%, transparent 70%)',
                }} />

                {/* Studio badge */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{
                        position: 'relative', zIndex: 1,
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 16px', borderRadius: 'var(--radius-full)',
                        background: 'rgba(20,18,16,0.7)', backdropFilter: 'blur(12px)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: 'var(--text-xs)', letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: 'var(--text-muted)',
                        marginBottom: 32,
                    }}
                >
                    <Heart size={10} style={{ color: 'var(--gold)' }} />
                    {event.studio?.studioName ?? 'Wedding Portal'}
                </motion.div>

                {/* Couple headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'relative', zIndex: 1,
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(60px, 11vw, 140px)',
                        fontWeight: 300,
                        lineHeight: 0.88,
                        letterSpacing: '-0.04em',
                        textAlign: 'center',
                        color: 'var(--ivory)',
                        margin: '0 20px 28px',
                    }}
                >
                    {event.groomName}
                    <span style={{
                        display: 'block', color: 'transparent',
                        WebkitTextStroke: '1px rgba(201,151,74,0.6)',
                        fontStyle: 'italic',
                        fontSize: '0.5em',
                        letterSpacing: '-0.01em',
                        lineHeight: 1.4,
                    }}>
                        &amp;
                    </span>
                    {event.brideName}
                </motion.h1>

                {/* Meta */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    style={{
                        position: 'relative', zIndex: 1,
                        display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center',
                        fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)',
                    }}
                >
                    {event.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={13} style={{ color: 'var(--gold)', opacity: 0.7 }} />
                            {event.location}
                        </span>
                    )}
                    {event.startDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Calendar size={13} style={{ color: 'var(--gold)', opacity: 0.7 }} />
                            {fmt(event.startDate)}
                        </span>
                    )}
                </motion.div>

                {/* Live badge */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                    style={{
                        position: 'relative', zIndex: 1,
                        display: 'flex', alignItems: 'center', gap: 6,
                        marginTop: 20,
                        padding: '5px 14px', borderRadius: 'var(--radius-full)',
                        background: 'rgba(201,151,74,0.08)', border: '1px solid rgba(201,151,74,0.2)',
                        fontSize: 'var(--text-xs)', color: 'var(--gold)',
                    }}
                >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <Users size={11} />
                    {viewerCount} viewing right now
                </motion.div>

                {/* Bottom actions */}
                <div style={{
                    position: 'absolute', bottom: 32, left: 0, right: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    zIndex: 1,
                }}>
                    <button onClick={() => setSlideshow(true)} className="btn btn-ghost" style={{
                        borderRadius: 'var(--radius-full)', padding: '10px 20px',
                        backdropFilter: 'blur(20px)',
                    }} id="slideshow-btn">
                        <Maximize2 size={14} />
                        Slideshow
                    </button>
                    <Link href={`/wedding/${slug}/upload`} className="btn btn-primary" style={{
                        borderRadius: 'var(--radius-full)', padding: '10px 22px',
                    }} id="guest-upload-link">
                        <Upload size={14} />
                        Share a memory
                    </Link>
                </div>

                {/* Scroll line */}
                <div style={{ position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
                    <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, var(--gold))', animation: 'float 2s ease-in-out infinite' }} />
                </div>
            </section>

            {/* ── GALLERY (first per layout spec: images → videos → live) ── */}
            <section style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
                {/* Section header */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Gallery</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--cream)', marginBottom: 8 }}>
                        Captured Moments
                    </div>
                </div>

                {/* Album tabs */}
                {event.albums?.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['all', ...event.albums.map((a: any) => a.id)].map((id) => {
                            const label = id === 'all' ? 'All Moments' : event.albums.find((a: any) => a.id === id)?.title ?? '';
                            const count = id === 'all' ? photos.length : photos.filter((m: any) => m.albumId === id).length;
                            return (
                                <button key={id} onClick={() => setSelectedAlbum(id as any)} style={{
                                    padding: '7px 18px',
                                    borderRadius: 'var(--radius-full)',
                                    border: `1px solid ${selectedAlbum === id ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
                                    background: selectedAlbum === id ? 'var(--surface-frost)' : 'transparent',
                                    color: selectedAlbum === id ? 'var(--gold-light)' : 'var(--text-muted)',
                                    fontSize: 'var(--text-sm)', cursor: 'pointer', fontFamily: 'var(--font-ui)',
                                    transition: 'all 0.2s',
                                }}>
                                    {label} {count > 0 && <span style={{ opacity: 0.5, fontSize: 11, marginLeft: 4 }}>{count}</span>}
                                </button>
                            );
                        })}
                    </div>
                )}

                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, marginBottom: 8 }}>Photos coming soon</div>
                        <div style={{ fontSize: 'var(--text-sm)' }}>The photographer is uploading your memories.</div>
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {filtered.map((photo, i) => (
                            <motion.div
                                key={photo.id}
                                className="gallery-item"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.04, 0.6), ease: [0.16, 1, 0.3, 1] }}
                                onClick={() => openLightbox(i)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img
                                    src={photo.thumbnail_url || photo.thumbnailUrl || photo.url}
                                    alt=""
                                    loading="lazy"
                                    style={{ width: '100%', display: 'block' }}
                                />
                                <div className="gallery-overlay" />
                                {photo.highlight && (
                                    <div style={{
                                        position: 'absolute', top: 10, right: 10,
                                        width: 24, height: 24, borderRadius: '50%',
                                        background: 'rgba(12,10,9,0.6)', backdropFilter: 'blur(8px)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Heart size={11} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── VIDEO + LIVE SECTIONS (below gallery) ── */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
                {/* VIDEO SECTION */}
                {event.youtube_video_id && (
                    <div style={{ marginBottom: 80 }}>
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>The Wedding Film</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--cream)' }}>Our Story Forever</div>
                        </div>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)' }}>
                            <iframe
                                width="100%" height="100%"
                                src={`https://www.youtube.com/embed/${event.youtube_video_id}?autoplay=0&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&controls=1&color=white`}
                                title="Wedding Film" frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                            />
                        </div>
                    </div>
                )}

                {/* LIVE SECTION */}
                {event.youtube_live_id && (
                    <div id="live-section" style={{ marginBottom: 80 }}>
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, fontSize: 10, fontWeight: 800, color: '#EF4444', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1s infinite' }} /> LIVE BROADCAST
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--cream)' }}>Witness the Union</div>
                        </div>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 24, overflow: 'hidden', border: '2px solid rgba(239,68,68,0.2)', boxShadow: '0 30px 60px -12px rgba(239,68,68,0.1)' }}>
                            <iframe
                                width="100%" height="100%"
                                src={`https://www.youtube.com/embed/${event.youtube_live_id}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&showinfo=0&color=white`}
                                title="Live Wedding" frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── MEMORY CTA ── */}
            <section style={{
                padding: '60px 24px 100px',
                maxWidth: 560,
                margin: '0 auto',
                textAlign: 'center',
            }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 300, color: 'var(--cream)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16 }}>
                    Were you there?
                    <br />
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Share your moments.</span>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.7, fontWeight: 300 }}>
                    Your perspective matters. Upload your photos and add to this collection of memories.
                </p>
                <Link href={`/wedding/${slug}/upload`} className="btn btn-cinematic">
                    <Upload size={15} />
                    Upload a memory
                </Link>
            </section>

            {/* ── VIRAL FOOTER ── */}
            <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--charcoal)', padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'var(--cream)', marginBottom: 12 }}>
                        Capturing your own forever?
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7 }}>
                        Create a cinematic digital experience for your guests.
                        WeddingVault helps photographers share emotions, not just files.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/auth/signup" className="btn btn-cinematic" style={{ padding: '12px 32px' }}>
                            Open your studio
                        </Link>
                        <Link href="/" className="btn btn-ghost" style={{ padding: '12px 24px' }}>
                            Learn more
                        </Link>
                    </div>
                    <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Powered by <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', letterSpacing: '0' }}>WeddingVault ✦</span>
                        </span>
                    </div>
                </div>
            </footer>

            {/* ── LIGHTBOX ── */}
            <AnimatePresence>
                {lightbox.open && filtered[lightbox.index] && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.96)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(8px)',
                        }}
                        onClick={closeLightbox}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={lightbox.index}
                                src={filtered[lightbox.index].url}
                                alt=""
                                initial={{ opacity: 0, scale: 0.94 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)' }}
                                onClick={e => e.stopPropagation()}
                            />
                        </AnimatePresence>

                        {/* Counter */}
                        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.4)' }}>
                            {lightbox.index + 1} / {filtered.length}
                        </div>

                        <button onClick={closeLightbox} style={{
                            position: 'absolute', top: 20, right: 20,
                            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff', display: 'flex',
                        }}>
                            <X size={18} />
                        </button>

                        {filtered.length > 1 && <>
                            <button onClick={e => { e.stopPropagation(); prevPhoto(); }} style={{
                                position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, padding: '12px 10px', cursor: 'pointer', color: '#fff', display: 'flex',
                            }}><ChevronLeft size={20} /></button>
                            <button onClick={e => { e.stopPropagation(); nextPhoto(); }} style={{
                                position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 10, padding: '12px 10px', cursor: 'pointer', color: '#fff', display: 'flex',
                            }}><ChevronRight size={20} /></button>
                        </>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
