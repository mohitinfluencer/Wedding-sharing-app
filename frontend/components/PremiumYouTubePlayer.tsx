'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumYouTubePlayerProps {
    /** YouTube video ID (e.g. "dQw4w9WgXcQ") */
    videoId: string;
    /** Optional title shown on the thumbnail card */
    title?: string;
    /** Optional subtitle / branding line */
    subtitle?: string;
    /** Optional wedding date for 'Intro Mode' */
    date?: string;
    /** Custom thumbnail URL — defaults to YouTube maxres thumbnail */
    thumbnailUrl?: string;
    /** Optional badge label, e.g. "Wedding Film" or "LIVE" */
    badge?: string;
    /** If true, shows a pulsing LIVE indicator instead of play button */
    isLive?: boolean;
    /** Extra class on the outer wrapper */
    className?: string;
}

/**
 * PremiumYouTubePlayer
 *
 * Shows a cinematic thumbnail card first.
 * Only injects the real YouTube iframe when the user clicks Play.
 */
export default function PremiumYouTubePlayer({
    videoId,
    title,
    subtitle,
    date,
    thumbnailUrl,
    badge,
    isLive = false,
    className = '',
}: PremiumYouTubePlayerProps) {
    const [playing, setPlaying] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [hovered, setHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // YouTube thumbnail ladder: maxresdefault → hqdefault
    const thumbnailSrc = thumbnailUrl
        ? thumbnailUrl
        : imgError
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const embedSrc = isLive
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`
        : `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&color=white`;

    // If live, auto-play immediately (so the badge makes sense)
    const handlePlay = () => setPlaying(true);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: 20,
                overflow: 'hidden',
                background: '#0a0806',
                boxShadow: isLive
                    ? '0 0 0 2px rgba(239,68,68,0.4), 0 30px 80px -12px rgba(239,68,68,0.15), 0 20px 60px rgba(0,0,0,0.6)'
                    : '0 30px 80px -12px rgba(0,0,0,0.7)',
                cursor: playing ? 'default' : 'pointer',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* ─── THUMBNAIL STATE ─── */}
            <AnimatePresence>
                {!playing && (
                    <motion.div
                        key="thumbnail"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        onClick={handlePlay}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {/* Background thumbnail image */}
                        <img
                            src={thumbnailSrc}
                            alt={title || 'Video thumbnail'}
                            onError={() => setImgError(true)}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                                transform: hovered ? 'scale(1.04)' : 'scale(1)',
                            }}
                        />

                        {/* Gradient layers — cinematic look */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.2) 40%, rgba(10,8,6,0.5) 100%)',
                            transition: 'background 0.3s',
                        }} />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(201,151,74,0.04) 0%, transparent 70%)',
                        }} />

                        {/* ── Top badge ── */}
                        {badge && (
                            <div style={{
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: isLive ? '5px 12px' : '4px 12px',
                                borderRadius: 999,
                                background: isLive ? 'rgba(239,68,68,0.85)' : 'rgba(201,151,74,0.15)',
                                border: isLive ? 'none' : '1px solid rgba(201,151,74,0.3)',
                                backdropFilter: 'blur(8px)',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#fff',
                                fontFamily: 'var(--font-ui, "Outfit", sans-serif)',
                            }}>
                                {isLive && (
                                    <span style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: '#fff',
                                        animation: 'pulse 1.2s ease-in-out infinite',
                                        flexShrink: 0,
                                    }} />
                                )}
                                {badge}
                            </div>
                        )}

                        {/* ── Centered play button ── */}
                        <motion.div
                            animate={{ scale: hovered ? 1.1 : 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            style={{
                                position: 'relative',
                                zIndex: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 14,
                            }}
                        >
                            {/* Glow ring */}
                            <div style={{
                                position: 'absolute',
                                width: 100,
                                height: 100,
                                borderRadius: '50%',
                                background: 'rgba(201,151,74,0.15)',
                                filter: 'blur(24px)',
                                transform: 'translate(-50%, -50%) scale(1.4)',
                                top: '50%',
                                left: '50%',
                                opacity: hovered ? 1 : 0.6,
                                transition: 'opacity 0.3s',
                            }} />

                            {/* Play disk */}
                            <div style={{
                                width: 68,
                                height: 68,
                                borderRadius: '50%',
                                background: hovered
                                    ? 'linear-gradient(135deg, #C9974A 0%, #E4B96A 100%)'
                                    : 'rgba(255,255,255,0.95)',
                                boxShadow: hovered
                                    ? '0 0 0 8px rgba(201,151,74,0.18), 0 12px 40px rgba(201,151,74,0.4)'
                                    : '0 0 0 8px rgba(255,255,255,0.12), 0 12px 40px rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                backdropFilter: 'blur(4px)',
                            }}>
                                {/* Triangle */}
                                <svg
                                    width="24" height="24"
                                    viewBox="0 0 24 24"
                                    style={{
                                        marginLeft: 4,
                                        fill: hovered ? '#0a0806' : '#0a0806',
                                        transition: 'fill 0.2s',
                                    }}
                                >
                                    <polygon points="5,3 19,12 5,21" />
                                </svg>
                            </div>

                            {/* Labels below play button — Movie Poster Style */}
                            {(title || subtitle || date) && (
                                <div style={{
                                    textAlign: 'center',
                                    position: 'relative',
                                    marginTop: 8,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    {subtitle && (
                                        <div style={{
                                            fontFamily: 'var(--font-ui, "Outfit", sans-serif)',
                                            fontSize: 'clamp(9px, 1.2vw, 11px)',
                                            color: '#C9974A',
                                            letterSpacing: '0.25em',
                                            textTransform: 'uppercase',
                                            fontWeight: 700,
                                            marginBottom: 4,
                                            opacity: 0.8
                                        }}>
                                            {subtitle}
                                        </div>
                                    )}
                                    {title && (
                                        <div style={{
                                            fontFamily: 'var(--font-display, "Fraunces", serif)',
                                            fontSize: 'clamp(20px, 4vw, 36px)',
                                            fontWeight: 300,
                                            color: '#F5F0E8',
                                            letterSpacing: '-0.02em',
                                            lineHeight: 1.1,
                                            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                                        }}>
                                            {title}
                                        </div>
                                    )}
                                    {date && (
                                        <div style={{
                                            fontFamily: 'var(--font-ui, "Outfit", sans-serif)',
                                            fontSize: 'clamp(10px, 1.4vw, 13px)',
                                            color: 'rgba(245,240,232,0.6)',
                                            letterSpacing: '0.04em',
                                            marginTop: 6,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}>
                                            <span style={{ width: 12, height: 1, background: 'rgba(201,151,74,0.3)' }} />
                                            {date}
                                            <span style={{ width: 12, height: 1, background: 'rgba(201,151,74,0.3)' }} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* ── Bottom branding strip ── */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '20px 20px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            {/* WeddingVault watermark */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontFamily: 'var(--font-display, "Fraunces", serif)',
                                fontSize: 13,
                                fontWeight: 300,
                                color: 'rgba(201,151,74,0.7)',
                                letterSpacing: '0.04em',
                            }}>
                                ✦ WeddingVault
                            </div>

                            {/* Click-to-play hint */}
                            <div style={{
                                fontSize: 11,
                                color: 'rgba(255,255,255,0.35)',
                                fontFamily: 'var(--font-ui, "Outfit", sans-serif)',
                                letterSpacing: '0.04em',
                            }}>
                                Click to play
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── PLAYER STATE ─── */}
            {playing && (
                <motion.div
                    key="player"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: iframeLoaded ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ position: 'absolute', inset: 0 }}
                >
                    {/* Shimmer while iframe loads */}
                    {!iframeLoaded && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(110deg, #0a0806 25%, #141210 48%, #0a0806 75%)',
                            backgroundSize: '300% 100%',
                            animation: 'skeleton-sweep 1.8s ease-in-out infinite',
                        }} />
                    )}

                    <iframe
                        src={embedSrc}
                        title={title || 'Wedding Film'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        onLoad={() => setIframeLoaded(true)}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: 'block',
                        }}
                    />
                </motion.div>
            )}

            {/* ─── LIVE PULSE ring (decorative border) ─── */}
            {isLive && !playing && (
                <div style={{
                    position: 'absolute',
                    inset: -2,
                    borderRadius: 22,
                    border: '2px solid rgba(239,68,68,0.5)',
                    animation: 'live-ring 2s ease-in-out infinite',
                    pointerEvents: 'none',
                }} />
            )}

            {/* ─── Inline keyframes for pulse + live-ring ─── */}
            <style>{`
                @keyframes live-ring {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
                @keyframes skeleton-sweep {
                    0% { background-position: 100% 0; }
                    100% { background-position: -100% 0; }
                }
            `}</style>
        </div>
    );
}
