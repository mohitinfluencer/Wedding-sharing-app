'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Music, VolumeX, Heart, MapPin, Calendar, Play } from 'lucide-react';

interface WeddingWelcomeScreenProps {
    event: {
        groomName: string;
        brideName: string;
        startDate?: string;
        location?: string;
        youtube_live_id?: string;
    };
    heroImage?: string;
    onEnter: () => void;
}

export default function WeddingWelcomeScreen({ event, heroImage, onEnter }: WeddingWelcomeScreenProps) {
    const [isMuted, setIsMuted] = useState(true);
    const [statusText, setStatusText] = useState('Welcome to');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Determine status based on date
        if (event.youtube_live_id) {
            setStatusText('Live Now');
        } else if (event.startDate) {
            const start = new Date(event.startDate).getTime();
            const now = Date.now();
            const diff = start - now;

            if (diff > 0) setStatusText('The Wedding of');
            else setStatusText('Reliving the Magic of');
        }
    }, [event]);

    const handleEnter = () => {
        setIsVisible(false);
        setTimeout(onEnter, 800); // Allow animation to finish
    };

    const formattedDate = event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: '#0a0806',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        fontFamily: 'var(--font-ui, "Outfit", sans-serif)'
                    }}
                >
                    {/* ── Cinematic Background ── */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        {heroImage && (
                            <motion.div
                                initial={{ scale: 1 }}
                                animate={{ scale: 1.15 }}
                                transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                                style={{
                                    position: 'absolute',
                                    inset: -50,
                                    backgroundImage: `url(${heroImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: 'blur(10px) brightness(0.4)',
                                }}
                            />
                        )}

                        {/* Overlay Gradients */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(circle at 50% 50%, transparent 20%, #0a0806 100%)',
                        }} />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, #0a0806 0%, transparent 50%, #0a0806 100%)',
                            opacity: 0.8
                        }} />

                        {/* Film Grain */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                            backgroundSize: '180px',
                            opacity: 0.05,
                            pointerEvents: 'none',
                        }} />
                    </div>

                    {/* ── Content ── */}
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 24, paddingBottom: 60 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            style={{ marginBottom: 40 }}
                        >
                            <div style={{
                                color: '#C9974A',
                                fontSize: 13,
                                letterSpacing: '0.4em',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                marginBottom: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10
                            }}>
                                <span style={{ width: 30, height: 1, background: 'rgba(201,151,74,0.3)' }} />
                                {statusText}
                                <span style={{ width: 30, height: 1, background: 'rgba(201,151,74,0.3)' }} />
                            </div>

                            <h1 style={{
                                fontFamily: 'var(--font-display, "Fraunces", serif)',
                                fontSize: 'clamp(40px, 12vw, 84px)',
                                color: '#F5F0E8',
                                fontWeight: 300,
                                lineHeight: 1,
                                letterSpacing: '-0.02em',
                                margin: 0,
                                textShadow: '0 10px 40px rgba(0,0,0,0.5)'
                            }}>
                                {event.groomName} <br />
                                <span style={{
                                    fontSize: '0.6em',
                                    fontStyle: 'italic',
                                    color: '#C9974A',
                                    fontFamily: 'var(--font-display)',
                                    display: 'block',
                                    margin: '10px 0'
                                }}>&</span>
                                {event.brideName}
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, delay: 0.6 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}
                        >
                            {/* Main CTA */}
                            <button
                                onClick={handleEnter}
                                style={{
                                    background: 'linear-gradient(135deg, #C9974A 0%, #E4B96A 100%)',
                                    color: '#0a0806',
                                    border: 'none',
                                    padding: '18px 48px',
                                    borderRadius: 999,
                                    fontSize: 14,
                                    fontWeight: 800,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    boxShadow: '0 20px 40px rgba(201,151,74,0.25)',
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(201,151,74,0.35)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(201,151,74,0.25)';
                                }}
                            >
                                <Play size={16} fill="currentColor" />
                                Enter Celebration
                            </button>

                            <div style={{
                                display: 'flex',
                                gap: 24,
                                color: 'rgba(245,240,232,0.6)',
                                fontSize: 13,
                                letterSpacing: '0.04em'
                            }}>
                                {formattedDate && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Calendar size={14} style={{ color: '#C9974A' }} />
                                        {formattedDate}
                                    </div>
                                )}
                                {event.location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <MapPin size={14} style={{ color: '#C9974A' }} />
                                        {event.location}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Footer Branding ── */}
                    <div style={{
                        position: 'absolute',
                        bottom: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 24,
                        zIndex: 1
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: 'rgba(201,151,74,0.5)',
                            fontSize: 12,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontWeight: 300,
                            fontFamily: 'var(--font-display)'
                        }}>
                            ✦ WeddingVault Studio
                        </div>

                        {/* Music UI */}
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(201,151,74,0.2)',
                                color: '#C9974A',
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isMuted ? <VolumeX size={16} /> : <Music size={16} />}
                        </button>
                    </div>

                    {/* Decorative Elements */}
                    <div style={{
                        position: 'absolute',
                        top: 40,
                        left: 40,
                        zIndex: 1,
                        opacity: 0.3
                    }}>
                        <Heart size={20} style={{ color: '#C9974A' }} />
                    </div>
                    <div style={{
                        position: 'absolute',
                        top: 40,
                        right: 40,
                        zIndex: 1,
                        opacity: 0.3
                    }}>
                        <Sparkles size={20} style={{ color: '#C9974A' }} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
