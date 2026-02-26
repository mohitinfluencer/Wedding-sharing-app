'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowRight, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', studioName: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { signup, loginAsDemo } = useAuthStore();
    const router = useRouter();

    useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) { toast.error('Please fill all required fields'); return; }
        if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
        setLoading(true);
        try {
            await signup(form);
            toast.success('Studio created! Welcome 🎉');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const handleDemo = () => { loginAsDemo(); router.push('/dashboard'); };

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--obsidian)', display: 'flex' }}>

            {/* Left — Animated visual */}
            <div style={{ display: 'none', width: '46%', background: 'var(--charcoal)', position: 'relative', overflow: 'hidden' }} className="lg-show-su">
                <style>{`@media(min-width:1024px){.lg-show-su{display:block!important}}`}</style>

                {/* Stacked gallery */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
                        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
                        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
                    ].map((src, i) => (
                        <div key={i} style={{ flex: 1, overflow: 'hidden' }}>
                            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                        </div>
                    ))}
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(12,10,9,0.9) 0%, rgba(12,10,9,0.6) 100%)' }} />

                <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 56 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--obsidian)', fontSize: 16 }}>✦</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--cream)' }}>WeddingVault</span>
                    </Link>

                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--ivory)', marginBottom: 20 }}>
                        Open your<br />
                        <span style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>studio.</span>
                    </h2>
                    <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-tertiary)', fontWeight: 300, lineHeight: 1.7, maxWidth: 320 }}>
                        Join hundreds of photographers delivering premium wedding experiences to their clients.
                    </p>

                    <div style={{ marginTop: 64 }}>
                        <div className="ui-label" style={{ marginBottom: 20 }}>What you get</div>
                        {[
                            'Beautiful auto-generated wedding portals',
                            'Direct Cloudinary image uploads',
                            'Vimeo video integration',
                            'Real-time gallery updates',
                            'Guest upload moderation',
                        ].map((item) => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <span style={{ color: 'var(--gold)', fontSize: 14 }}>✦</span>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 300 }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
                <div className={mounted ? 'animate-fade-up' : ''} style={{ width: '100%', maxWidth: 420 }}>

                    {/* Mobile logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--obsidian)', fontSize: 13 }}>✦</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)' }}>WeddingVault</span>
                    </Link>

                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--ivory)', marginBottom: 8 }}>
                        Create your studio
                    </h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 40, fontWeight: 300 }}>
                        Start delivering premium wedding portals today
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Full name *</label>
                                <input className="input" id="signup-name" value={form.name} placeholder="Rahul Sharma" onChange={set('name')} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Email address *</label>
                                <input className="input" id="signup-email" type="email" value={form.email} placeholder="you@studio.com" onChange={set('email')} autoComplete="email" />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Studio name</label>
                                <input className="input" id="signup-studio" value={form.studioName} placeholder="Sharma Wedding Photography" onChange={set('studioName')} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Password *</label>
                                <div style={{ position: 'relative' }}>
                                    <input className="input" id="signup-password" type={showPw ? 'text' : 'password'} value={form.password} placeholder="Min. 8 characters" onChange={set('password')} style={{ paddingRight: 44 }} autoComplete="new-password" />
                                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" id="signup-submit" disabled={loading} className="btn btn-primary" style={{
                            padding: '13px', width: '100%', borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)', marginTop: 4,
                            opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                        }}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'rgba(0,0,0,0.8)', borderRadius: '50%', animation: 'spin-slow 0.6s linear infinite' }} />
                                    Creating studio...
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Create studio <ArrowRight size={14} /></span>
                            )}
                        </button>
                    </form>

                    <div className="divider-text" style={{ margin: '28px 0' }}>or try first</div>

                    <button id="demo-signup-btn" onClick={handleDemo} style={{
                        width: '100%', padding: '12px',
                        background: 'var(--surface-frost)',
                        border: '1px solid var(--border-accent)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--gold-light)',
                        fontFamily: 'var(--font-ui)',
                        fontSize: 'var(--text-sm)', fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'background 0.2s',
                    }}>
                        <Zap size={14} />
                        Continue as Demo — No database needed
                    </button>

                    <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 8 }}>
                        Explore the full platform with sample data instantly
                    </p>

                    <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 32 }}>
                        Already have a studio?{' '}
                        <Link href="/auth/login" style={{ color: 'var(--gold-light)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
