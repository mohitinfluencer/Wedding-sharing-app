'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, QrCode, Heart, Sparkles, MapPin, Calendar, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface WeddingQRCodeCardProps {
    event: {
        id: string;
        slug: string;
        groomName: string;
        brideName: string;
        startDate?: string;
        location?: string;
    };
    qrDataUrl?: string; // If already generated, pass it here
    isDigitalDisplay?: boolean; // If true, adds more ambient animations
    theme?: 'light' | 'dark';
}

export default function WeddingQRCodeCard({ event, qrDataUrl: existingQr, isDigitalDisplay = false, theme = 'dark' }: WeddingQRCodeCardProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(existingQr || null);
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const isDark = theme === 'dark';
    const accentColor = '#C9974A'; // Gold
    const bgColor = isDark ? '#0C0A09' : '#F5F0E8';
    const textColor = isDark ? '#F5F0E8' : '#0C0A09';
    const mutedColor = isDark ? 'rgba(245,240,232,0.6)' : 'rgba(12,10,9,0.6)';

    useEffect(() => {
        if (!qrDataUrl && typeof window !== 'undefined') {
            import('qrcode').then(QRCode => {
                const url = `${window.location.origin}/wedding/${event.slug}`;
                QRCode.toDataURL(url, {
                    width: 1000,
                    margin: 2,
                    color: {
                        dark: '#0C0A09',
                        light: '#FFFFFF'
                    }
                }).then(setQrDataUrl);
            });
        }
    }, [event.slug, qrDataUrl]);

    const handleDownloadPNG = () => {
        if (!qrDataUrl) return;
        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = `wedding-qr-${event.slug}.png`;
        a.click();
        toast.success('QR Code downloaded');
    };

    const handleDownloadPoster = async () => {
        if (!qrDataUrl) return;
        const tid = toast.loading('Generating premium poster...');

        try {
            // Create a high-res canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported');

            // Set poster dimensions (2:3 or 3:4.5 ratio, high res)
            const width = 1200;
            const height = 1800;
            canvas.width = width;
            canvas.height = height;

            // 1. Background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            // 2. Texture (Grain)
            ctx.globalAlpha = 0.05;
            for (let i = 0; i < 100000; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
                ctx.fillRect(x, y, 1, 1);
            }
            ctx.globalAlpha = 1.0;

            // 3. Gold Borders (Inner)
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 4;
            ctx.strokeRect(60, 60, width - 120, height - 120);

            ctx.lineWidth = 1;
            ctx.strokeRect(80, 80, width - 160, height - 160);

            // 4. Content Typography
            const center = width / 2;

            // Groom Name
            ctx.font = '300 80px "Fraunces", serif';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.fillText(event.groomName, center, 320);

            // & symbol
            ctx.font = 'italic 50px "Fraunces", serif';
            ctx.fillStyle = accentColor;
            ctx.fillText('&', center, 400);

            // Bride Name
            ctx.font = '300 80px "Fraunces", serif';
            ctx.fillStyle = textColor;
            ctx.fillText(event.brideName, center, 480);

            // Wedding Title
            ctx.font = '600 24px "Outfit", sans-serif';
            ctx.fillStyle = accentColor;
            ctx.letterSpacing = '10px';
            ctx.fillText('WEDDING CELEBRATION', center, 560);

            // 5. QR Code
            const qrSize = 500;
            const qrX = center - qrSize / 2;
            const qrY = 750;

            // QR Frame
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
            ctx.shadowBlur = 40;
            ctx.fillRect(qrX - 30, qrY - 30, qrSize + 60, qrSize + 60);
            ctx.shadowBlur = 0;

            // Corner Accents on QR
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 8;
            const cs = 40; // Corner size
            const pad = 30;
            // TL
            ctx.beginPath(); ctx.moveTo(qrX - pad, qrY - pad + cs); ctx.lineTo(qrX - pad, qrY - pad); ctx.lineTo(qrX - pad + cs, qrY - pad); ctx.stroke();
            // TR
            ctx.beginPath(); ctx.moveTo(qrX + qrSize + pad - cs, qrY - pad); ctx.lineTo(qrX + qrSize + pad, qrY - pad); ctx.lineTo(qrX + qrSize + pad, qrY - pad + cs); ctx.stroke();
            // BL
            ctx.beginPath(); ctx.moveTo(qrX - pad, qrY + qrSize + pad - cs); ctx.lineTo(qrX - pad, qrY + qrSize + pad); ctx.lineTo(qrX - pad + cs, qrY + qrSize + pad); ctx.stroke();
            // BR
            ctx.beginPath(); ctx.moveTo(qrX + qrSize + pad - cs, qrY + qrSize + pad); ctx.lineTo(qrX + qrSize + pad, qrY + qrSize + pad); ctx.lineTo(qrX + qrSize + pad, qrY + qrSize + pad - cs); ctx.stroke();

            // The QR Image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = qrDataUrl;
            await new Promise((resolve) => { img.onload = resolve; });
            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

            // 6. Footer Information
            ctx.font = '400 32px "Outfit", sans-serif';
            ctx.fillStyle = mutedColor;
            ctx.fillText(formattedDate, center, 1450);

            if (event.location) {
                ctx.fillText(event.location, center, 1510);
            }

            ctx.font = 'italic 28px "Fraunces", serif';
            ctx.fillStyle = accentColor;
            ctx.fillText('Scan to join the celebration', center, 1620);

            // 7. Branding
            ctx.font = '300 24px "Fraunces", serif';
            ctx.globalAlpha = 0.5;
            ctx.fillText('✦ WeddingVault', center, 1720);

            // Trigger Download
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `wedding-poster-${event.slug}.png`;
            a.click();

            toast.dismiss(tid);
            toast.success('Premium Wedding Poster ready!');
        } catch (err) {
            console.error(err);
            toast.dismiss(tid);
            toast.error('Failed to generate poster');
        }
    };

    const formattedDate = event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }) : '';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%', maxWidth: 400 }}>
            {/* ── THE CARD ── */}
            <motion.div
                ref={cardRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3 / 4.2',
                    background: bgColor,
                    borderRadius: 24,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 40,
                    boxShadow: isHovered
                        ? `0 30px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}40`
                        : `0 20px 40px -12px rgba(0,0,0,0.3)`,
                    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: `1px solid ${isDark ? 'rgba(201,151,74,0.15)' : 'rgba(12,10,9,0.05)'}`,
                }}
            >
                {/* Background Texture Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    backgroundSize: '180px',
                    opacity: isDark ? 0.04 : 0.02,
                    pointerEvents: 'none',
                }} />

                {/* Border Accent */}
                <div style={{
                    position: 'absolute',
                    inset: 12,
                    border: `1px solid ${accentColor}40`,
                    borderRadius: 18,
                    pointerEvents: 'none',
                    opacity: 0.6,
                }} />

                {/* Header: Bride & Groom */}
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, marginBottom: 30 }}>
                    <motion.div
                        animate={isDigitalDisplay ? { rotate: [0, 5, -5, 0] } : {}}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ color: accentColor, marginBottom: 12 }}
                    >
                        <Sparkles size={20} style={{ margin: '0 auto' }} />
                    </motion.div>

                    <h2 style={{
                        fontFamily: 'var(--font-display, "Fraunces", serif)',
                        fontSize: 32,
                        fontWeight: 300,
                        color: textColor,
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                        marginBottom: 4
                    }}>
                        {event.groomName}
                    </h2>
                    <div style={{
                        fontFamily: 'var(--font-display, "Fraunces", serif)',
                        fontSize: 20,
                        fontStyle: 'italic',
                        color: accentColor,
                        opacity: 0.8,
                        margin: '4px 0'
                    }}>
                        &
                    </div>
                    <h2 style={{
                        fontFamily: 'var(--font-display, "Fraunces", serif)',
                        fontSize: 32,
                        fontWeight: 300,
                        color: textColor,
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em'
                    }}>
                        {event.brideName}
                    </h2>

                    <div style={{
                        marginTop: 14,
                        fontSize: 10,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: accentColor,
                        fontWeight: 600,
                        opacity: 0.8
                    }}>
                        Wedding Celebration
                    </div>
                </div>

                {/* Divider */}
                <div style={{
                    width: 60,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 30,
                    opacity: 0.4
                }}>
                    <div style={{ flex: 1, height: 1, background: accentColor }} />
                    <Heart size={10} style={{ color: accentColor, fill: accentColor }} />
                    <div style={{ flex: 1, height: 1, background: accentColor }} />
                </div>

                {/* QR Section */}
                <div style={{ position: 'relative', zIndex: 1, marginBottom: 30 }}>
                    <motion.div
                        animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                        style={{
                            padding: 16,
                            background: '#FFFFFF',
                            borderRadius: 16,
                            boxShadow: `0 10px 30px rgba(0,0,0,0.1), 0 0 0 1px rgba(201,151,74,0.1)`,
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            width: 140,
                            height: 140,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {qrDataUrl ? (
                                <img src={qrDataUrl} alt="QR Code" style={{ width: '100%', height: '100%', display: 'block' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#F9F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <QrCode size={32} style={{ color: '#DDD', animation: 'pulse 1.5s infinite' }} />
                                </div>
                            )}
                        </div>

                        {/* Corner Accents */}
                        {[0, 90, 180, 270].map(deg => (
                            <div key={deg} style={{
                                position: 'absolute',
                                width: 12, height: 12,
                                borderTop: `2px solid ${accentColor}`,
                                borderLeft: `2px solid ${accentColor}`,
                                top: deg === 0 || deg === 270 ? -2 : 'auto',
                                bottom: deg === 90 || deg === 180 ? -2 : 'auto',
                                left: deg === 0 || deg === 90 ? -2 : 'auto',
                                right: deg === 180 || deg === 270 ? -2 : 'auto',
                                transform: `rotate(${deg}deg)`,
                                borderTopLeftRadius: 4,
                            }} />
                        ))}
                    </motion.div>
                </div>

                {/* Footer: Date & Location */}
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        fontSize: 12,
                        color: mutedColor,
                        fontFamily: 'var(--font-ui, "Outfit", sans-serif)',
                    }}>
                        {formattedDate && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Calendar size={12} style={{ color: accentColor }} />
                                {formattedDate}
                            </div>
                        )}
                        {event.location && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <MapPin size={12} style={{ color: accentColor }} />
                                {event.location}
                            </div>
                        )}
                    </div>

                    <div style={{
                        marginTop: 20,
                        fontSize: 11,
                        color: accentColor,
                        fontStyle: 'italic',
                        opacity: 0.7
                    }}>
                        Scan to join the celebration
                    </div>
                </div>

                {/* Animated Glow Overlay */}
                <AnimatePresence>
                    {(isHovered || isDigitalDisplay) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: `radial-gradient(circle at center, ${accentColor}10 0%, transparent 70%)`,
                                pointerEvents: 'none',
                                zIndex: 0
                            }}
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── BUTTONS ── */}
            <div style={{ display: 'flex', gap: 12, width: '100%', flexWrap: 'wrap' }}>
                <button
                    onClick={handleDownloadPNG}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '12px 16px',
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: 12,
                        color: textColor,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; }}
                >
                    <Download size={16} />
                    Download QR
                </button>
                <button
                    onClick={handleDownloadPoster}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '12px 16px',
                        background: accentColor,
                        border: 'none',
                        borderRadius: 12,
                        color: isDark ? '#0C0A09' : '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: `0 8px 16px ${accentColor}30`,
                        whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 20px ${accentColor}40`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 16px ${accentColor}30`; }}
                >
                    <ImageIcon size={16} />
                    Wedding Poster
                </button>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
