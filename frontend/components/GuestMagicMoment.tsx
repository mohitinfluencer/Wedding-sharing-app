'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Camera, Phone, Mail, ChevronRight,
    Download, Heart, Star, ImageIcon, Zap, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GuestMagicMomentProps {
    event: {
        id: string;
        groomName: string;
        brideName: string;
    };
}

export default function GuestMagicMoment({ event }: GuestMagicMomentProps) {
    const [step, setStep] = useState<'invite' | 'find' | 'lead' | 'success'>('invite');
    const [lead, setLead] = useState({ contact: '' });

    const accentColor = '#C9974A'; // Gold

    const handleFindPhotos = () => setStep('find');
    const handleLeadStep = () => setStep('lead');

    const handleSubmitLead = (e: React.FormEvent) => {
        e.preventDefault();
        if (!lead.contact) return toast.error('Please enter your details');
        setStep('success');
        toast.success('Your collection is being prepared!', { icon: '✨' });
    };

    return (
        <section style={{
            marginTop: 80,
            padding: '60px 24px',
            background: 'rgba(201,151,74,0.03)',
            borderRadius: 32,
            border: '1px solid rgba(201,151,74,0.08)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background sparkle effect */}
            <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, pointerEvents: 'none' }}>
                <Sparkles size={200} style={{ color: accentColor }} />
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>

                <AnimatePresence mode="wait">
                    {/* STEP 1: THE INVITE */}
                    {step === 'invite' && (
                        <motion.div
                            key="invite"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                                <div style={{
                                    width: 50, height: 50, borderRadius: '50%',
                                    background: 'rgba(201,151,74,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: accentColor
                                }}>
                                    <Camera size={24} />
                                </div>
                            </div>

                            <h2 style={{
                                fontFamily: 'var(--font-display, "Fraunces", serif)',
                                fontSize: 32, fontWeight: 300, color: '#F5F0E8',
                                marginBottom: 12
                            }}>
                                Capturing Your Moments
                            </h2>
                            <p style={{
                                fontSize: 14, color: 'rgba(245,240,232,0.6)',
                                lineHeight: 1.6, marginBottom: 32, maxWidth: 440, margin: '0 auto 32px'
                            }}>
                                Were you spotted in the celebration? Our AI can find all your photos and create a personal memory collection just for you.
                            </p>

                            <button
                                onClick={handleFindPhotos}
                                style={{
                                    padding: '16px 32px',
                                    background: 'linear-gradient(135deg, #C9974A 0%, #E4B96A 100%)',
                                    color: '#0a0806',
                                    border: 'none',
                                    borderRadius: 12,
                                    fontSize: 14,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    margin: '0 auto',
                                    boxShadow: '0 12px 24px rgba(201,151,74,0.2)'
                                }}
                            >
                                Find My Photos <ChevronRight size={16} />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: SIMULATED FINDING */}
                    {step === 'find' && (
                        <motion.div
                            key="find"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ padding: '20px 0' }}
                        >
                            <div style={{ marginBottom: 24 }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                    style={{ color: accentColor, display: 'inline-block' }}
                                >
                                    <Zap size={40} />
                                </motion.div>
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: '#F5F0E8', marginBottom: 20 }}>
                                Creating Your Collection...
                            </h3>

                            {/* Simulated personal album grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 32 }}>
                                {[1, 2, 3].map(i => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 0.5, 0.2] }}
                                        transition={{ delay: i * 0.2, duration: 1, repeat: Infinity }}
                                        style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleLeadStep}
                                style={{
                                    padding: '12px 24px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 999,
                                    color: '#F5F0E8',
                                    fontSize: 13,
                                    cursor: 'pointer'
                                }}
                            >
                                Almost there, continue
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 3: LEAD CAPTURE */}
                    {step === 'lead' && (
                        <motion.div
                            key="lead"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: '#F5F0E8', marginBottom: 12 }}>
                                Personal Collection Ready
                            </h3>
                            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', marginBottom: 24 }}>
                                Leave your contact to receive your full 4K collection and personalized wedding book when it's finalized.
                            </p>

                            <form onSubmit={handleSubmitLead} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Phone or WhatsApp number"
                                        value={lead.contact}
                                        onChange={e => setLead({ ...lead, contact: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(201,151,74,0.2)',
                                            borderRadius: 12,
                                            color: '#fff',
                                            fontSize: 14,
                                            outline: 'none',
                                            textAlign: 'center'
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '14px',
                                        background: accentColor,
                                        color: '#0a0806',
                                        border: 'none',
                                        borderRadius: 12,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        boxShadow: '0 8px 20px rgba(201,151,74,0.3)'
                                    }}
                                >
                                    Get My Collection
                                </button>
                            </form>

                            <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                                Sent with ❤️ from WeddingVault Studio
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: SUCCESS & UPSELL */}
                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div style={{ color: '#50A064', marginBottom: 16 }}>
                                <Check size={48} style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300, color: '#F5F0E8', marginBottom: 16 }}>
                                Magic Sent!
                            </h3>
                            <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.6)', marginBottom: 32 }}>
                                We've queued your personal highlights. In the meantime, discover how we make weddings unforgettable.
                            </p>

                            {/* INSPIRATION SECTION */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'left' }}>
                                <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Star size={18} style={{ color: accentColor, marginBottom: 8 }} />
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#F5F0E8', marginBottom: 4 }}>Cinematic Film</div>
                                    <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)' }}>See our 2026 highlights</div>
                                </div>
                                <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Heart size={18} style={{ color: accentColor, marginBottom: 8 }} />
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#F5F0E8', marginBottom: 4 }}>Host Your Day</div>
                                    <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)' }}>Join 500+ happy couples</div>
                                </div>
                            </div>

                            <a
                                href="https://weddingvault.com"
                                target="_blank"
                                style={{
                                    display: 'inline-block',
                                    marginTop: 24,
                                    fontSize: 12,
                                    color: accentColor,
                                    textDecoration: 'none',
                                    borderBottom: '1px solid rgba(201,151,74,0.3)',
                                    paddingBottom: 2
                                }}
                            >
                                Visit the WeddingVault Studio ✦
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Subtle Platform Branding */}
            <div style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                textAlign: 'center',
                opacity: 0.2,
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                pointerEvents: 'none'
            }}>
                Powered by WeddingVault Premium Sharing
            </div>
        </section>
    );
}
