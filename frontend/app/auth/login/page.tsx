'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowRight, Eye, EyeOff, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { login, loginAsDemo } = useAuthStore();
    const router = useRouter();

    useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill all fields'); return; }
        setLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Invalid credentials');
        } finally { setLoading(false); }
    };

    const handleDemo = () => { loginAsDemo(); router.push('/dashboard'); };

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--obsidian)', display: 'flex' }}>

            {/* Left — Visual panel */}
            <div style={{
                display: 'none',
                width: '50%',
                position: 'relative',
                overflow: 'hidden',
                background: 'var(--charcoal)',
            }} className="lg-show">
                <style>{`@media(min-width:1024px){.lg-show{display:block!important}}`}</style>

                {/* Background image collage */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 4,
                    opacity: 0.35,
                }}>
                    {[
                        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
                        'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
                        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
                        'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800',
                    ].map((src, i) => (
                        <img key={i} src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ))}
                </div>

                {/* Overlay gradient */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(12,10,9,0.85) 0%, rgba(12,10,9,0.5) 100%)',
                }} />

                {/* Content */}
                <div style={{
                    position: 'relative', zIndex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '60px 56px',
                }}>
                    <div style={{ marginBottom: 48 }}>
                        <Link href="/" style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            textDecoration: 'none',
                        }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: 'var(--obsidian)', fontSize: 16 }}>✦</span>
                            </div>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--cream)' }}>WeddingVault</span>
                        </Link>
                    </div>

                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(40px, 4vw, 60px)',
                        fontWeight: 300,
                        lineHeight: 1.1,
                        letterSpacing: '-0.025em',
                        color: 'var(--ivory)',
                        marginBottom: 20,
                    }}>
                        Your studio.<br />
                        <span style={{
                            fontStyle: 'italic',
                            background: 'linear-gradient(135deg, var(--gold-light), var(--gold-pale))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>Their memories.</span>
                    </h2>

                    <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-tertiary)', fontWeight: 300, lineHeight: 1.7, maxWidth: 340 }}>
                        The premium wedding media platform built for photographers who care about every detail.
                    </p>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 40, marginTop: 56 }}>
                        {[['500+', 'Studios'], ['12k+', 'Weddings'], ['4M+', 'Photos']].map(([num, label]) => (
                            <div key={label}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--cream)' }}>{num}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Form panel */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
            }}>
                <div
                    className={mounted ? 'animate-fade-up' : ''}
                    style={{ width: '100%', maxWidth: 400 }}
                >
                    {/* Mobile logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'var(--obsidian)', fontSize: 13 }}>✦</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)' }}>WeddingVault</span>
                    </Link>

                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 36,
                        fontWeight: 300,
                        letterSpacing: '-0.02em',
                        color: 'var(--ivory)',
                        marginBottom: 8,
                    }}>
                        Welcome back
                    </h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 40, fontWeight: 300 }}>
                        Sign in to your studio dashboard
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label className="input-label">Email</label>
                            <input className="input" type="email" id="login-email" value={email} placeholder="photographer@studio.com"
                                onChange={e => setEmail(e.target.value)} autoComplete="email" />
                        </div>
                        <div>
                            <label className="input-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="input" type={showPw ? 'text' : 'password'} id="login-password" value={password}
                                    placeholder="••••••••" onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password" style={{ paddingRight: 44 }} />
                                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center',
                                }}>
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" id="login-submit" disabled={loading} className="btn btn-primary" style={{
                            padding: '13px', width: '100%', borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)', marginTop: 4,
                            opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                        }}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'rgba(0,0,0,0.8)', borderRadius: '50%', animation: 'spin-slow 0.6s linear infinite' }} />
                                    Signing in...
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Sign in <ArrowRight size={14} /></span>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="divider-text" style={{ margin: '28px 0' }}>or</div>

                    {/* Demo button */}
                    <button
                        id="demo-login-btn" onClick={handleDemo}
                        style={{
                            width: '100%', padding: '12px',
                            background: 'var(--surface-frost)',
                            border: '1px solid var(--border-accent)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--gold-light)',
                            fontFamily: 'var(--font-ui)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'background 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(201,151,74,0.12)'; (e.target as HTMLButtonElement).style.boxShadow = 'var(--shadow-gold)'; }}
                        onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'var(--surface-frost)'; (e.target as HTMLButtonElement).style.boxShadow = 'none'; }}
                    >
                        <Zap size={14} />
                        Continue as Demo — No setup needed
                    </button>
                    <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 8 }}>
                        Explore with pre-loaded sample wedding data
                    </p>

                    <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 32 }}>
                        New photographer?{' '}
                        <Link href="/auth/signup" style={{ color: 'var(--gold-light)', textDecoration: 'none', fontWeight: 500 }}>
                            Create your studio
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
