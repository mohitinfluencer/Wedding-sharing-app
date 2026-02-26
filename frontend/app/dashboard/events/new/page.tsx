'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Heart, Calendar, MapPin, Lock, Globe, Camera } from 'lucide-react';
import Link from 'next/link';
import { eventsApi } from '@/lib/api';

// ── Inline style constants for guaranteed rendering ──────────────────
const card: React.CSSProperties = {
    background: '#141210',
    border: '1px solid rgba(200,184,154,0.12)',
    borderRadius: 20,
    padding: 32,
    marginBottom: 0,
};

const inputBase: React.CSSProperties = {
    display: 'block',
    width: '100%',
    background: '#0C0A09',
    border: '1px solid rgba(200,184,154,0.22)',
    borderRadius: 12,
    color: '#F5F0E8',
    fontSize: 14,
    padding: '12px 16px',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.5,
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#6B5E52',
    textTransform: 'uppercase',
    marginBottom: 8,
};

const sectionTitle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#6B5E52',
    marginBottom: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
};

export default function NewEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState('');
    const [form, setForm] = useState({
        brideName: '',
        groomName: '',
        location: '',
        startDate: '',
        endDate: '',
        visibility: 'public',
        password: '',
        theme: 'classic',
    });

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const inputStyle = (id: string): React.CSSProperties => ({
        ...inputBase,
        borderColor: focusedField === id ? '#C9974A' : 'rgba(200,184,154,0.22)',
        boxShadow: focusedField === id ? '0 0 0 3px rgba(201,151,74,0.12)' : 'none',
        background: focusedField === id ? 'rgba(201,151,74,0.04)' : '#0C0A09',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.brideName || !form.groomName) {
            toast.error('Please enter bride and groom names');
            return;
        }
        setLoading(true);
        try {
            const event = await eventsApi.create(form);
            toast.success('Wedding portal created! 🎉');
            router.push(`/dashboard/events/${event.id}`);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    const themes = [
        { id: 'classic', label: 'Classic', desc: 'Timeless elegance', icon: '🕊️' },
        { id: 'modern', label: 'Modern', desc: 'Clean & minimal', icon: '◇' },
        { id: 'romantic', label: 'Romantic', desc: 'Soft and dreamy', icon: '🌸' },
        { id: 'royal', label: 'Royal', desc: 'Grand & opulent', icon: '👑' },
    ];

    const slug = `${form.groomName}-${form.brideName}-${new Date().getFullYear()}`
        .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    return (
        <div style={{ padding: '40px 48px', maxWidth: 760, minHeight: '100vh' }}>
            <Link
                href="/dashboard"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: 13, marginBottom: 40, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
                <ArrowLeft size={16} />
                Back to Dashboard
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontFamily: 'var(--font-display,Georgia,serif)', fontSize: 36, fontWeight: 300, letterSpacing: '-0.02em', color: '#E8D5B4', marginBottom: 10, lineHeight: 1.1 }}>
                        Create Wedding Portal
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
                        A beautiful shareable page will be generated automatically for your clients.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* ── The Couple ── */}
                    <div style={card}>
                        <div style={sectionTitle}>
                            <Heart size={14} style={{ color: '#fb7185' }} />
                            The Couple
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={labelStyle}>Groom's Name *</label>
                                <input
                                    id="groom-name"
                                    value={form.groomName}
                                    onChange={set('groomName')}
                                    placeholder="Rahul"
                                    onFocus={() => setFocusedField('groom')}
                                    onBlur={() => setFocusedField('')}
                                    style={inputStyle('groom')}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Bride's Name *</label>
                                <input
                                    id="bride-name"
                                    value={form.brideName}
                                    onChange={set('brideName')}
                                    placeholder="Priya"
                                    onFocus={() => setFocusedField('bride')}
                                    onBlur={() => setFocusedField('')}
                                    style={inputStyle('bride')}
                                />
                            </div>
                        </div>
                        {(form.groomName || form.brideName) && (
                            <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
                                Portal URL → <span style={{ color: '#E4B96A' }}>/wedding/{slug}</span>
                            </div>
                        )}
                    </div>

                    {/* ── Event Details ── */}
                    <div style={card}>
                        <div style={sectionTitle}>
                            <Calendar size={14} style={{ color: '#60a5fa' }} />
                            Event Details
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}><MapPin size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />Venue / Location</label>
                            <input
                                id="event-location"
                                value={form.location}
                                onChange={set('location')}
                                placeholder="The Leela Palace, Mumbai"
                                onFocus={() => setFocusedField('location')}
                                onBlur={() => setFocusedField('')}
                                style={inputStyle('location')}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={labelStyle}>Start Date</label>
                                <input
                                    id="event-start-date"
                                    type="date"
                                    value={form.startDate}
                                    onChange={set('startDate')}
                                    onFocus={() => setFocusedField('startDate')}
                                    onBlur={() => setFocusedField('')}
                                    style={{ ...inputStyle('startDate'), colorScheme: 'dark' }}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>End Date</label>
                                <input
                                    id="event-end-date"
                                    type="date"
                                    value={form.endDate}
                                    onChange={set('endDate')}
                                    onFocus={() => setFocusedField('endDate')}
                                    onBlur={() => setFocusedField('')}
                                    style={{ ...inputStyle('endDate'), colorScheme: 'dark' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Access Control ── */}
                    <div style={card}>
                        <div style={sectionTitle}>
                            <Globe size={14} style={{ color: '#4ade80' }} />
                            Access Control
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                            {[
                                { id: 'public', label: 'Public', icon: <Globe size={14} /> },
                                { id: 'private', label: 'Private', icon: <Lock size={14} /> },
                                { id: 'password', label: 'Password', icon: <Lock size={14} /> },
                            ].map((v) => {
                                const active = form.visibility === v.id;
                                return (
                                    <button
                                        key={v.id}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, visibility: v.id }))}
                                        style={{
                                            padding: '12px 8px',
                                            borderRadius: 12,
                                            border: active ? '1px solid rgba(201,151,74,0.5)' : '1px solid rgba(255,255,255,0.07)',
                                            background: active ? 'rgba(201,151,74,0.1)' : 'rgba(255,255,255,0.03)',
                                            color: active ? '#E4B96A' : 'rgba(255,255,255,0.35)',
                                            cursor: 'pointer',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            letterSpacing: '0.05em',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 6,
                                            transition: 'all 150ms',
                                        }}
                                    >
                                        {v.icon}
                                        {v.label.toUpperCase()}
                                    </button>
                                );
                            })}
                        </div>
                        {form.visibility === 'password' && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16 }}>
                                <label style={labelStyle}>Event Password</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={set('password')}
                                    placeholder="Set a password for guests"
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField('')}
                                    style={inputStyle('password')}
                                />
                            </motion.div>
                        )}
                    </div>

                    {/* ── Visual Theme ── */}
                    <div style={card}>
                        <div style={sectionTitle}>
                            <Camera size={14} style={{ color: '#c084fc' }} />
                            Visual Theme
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {themes.map((t) => {
                                const active = form.theme === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, theme: t.id }))}
                                        style={{
                                            padding: '16px 18px',
                                            borderRadius: 14,
                                            border: active ? '1px solid rgba(201,151,74,0.5)' : '1px solid rgba(255,255,255,0.07)',
                                            background: active ? 'rgba(201,151,74,0.09)' : 'rgba(255,255,255,0.03)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 150ms',
                                        }}
                                    >
                                        <div style={{ fontSize: 20, marginBottom: 8 }}>{t.icon}</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: active ? '#E4B96A' : 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
                                            {t.label}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{t.desc}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Submit ── */}
                    <button
                        id="create-wedding-submit"
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            borderRadius: 16,
                            border: 'none',
                            background: loading ? 'rgba(201,151,74,0.4)' : 'linear-gradient(135deg, #C9974A 0%, #E4B96A 60%, #C9974A 100%)',
                            color: '#0C0A09',
                            fontSize: 15,
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            boxShadow: loading ? 'none' : '0 8px 40px rgba(201,151,74,0.35)',
                            transition: 'all 200ms',
                        }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 12px 60px rgba(201,151,74,0.5)'; }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 40px rgba(201,151,74,0.35)'; }}
                    >
                        {loading ? (
                            <>
                                <span style={{ width: 18, height: 18, border: '2px solid rgba(12,10,9,0.3)', borderTopColor: '#0C0A09', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                Launching Portal...
                            </>
                        ) : (
                            '✨ Create Wedding Portal'
                        )}
                    </button>
                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                </form>
            </motion.div>
        </div>
    );
}
