'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowRight, Building2, Star, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        tagline: 'Perfect for beginning photographers',
        monthly: 0,
        yearly: 0,
        color: 'var(--text-muted)',
        accentBg: 'var(--surface)',
        features: [
            '2 active wedding portals',
            '5 GB cloud storage',
            '200 photos per event',
            'Basic gallery themes',
            'Guest upload moderation',
            'QR code generation',
            'WeddingVault branding',
        ],
        cta: 'Start free',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        tagline: 'For professional photographers',
        monthly: 2499,
        yearly: 1999,
        color: 'var(--gold)',
        accentBg: 'var(--surface-frost)',
        features: [
            'Unlimited wedding portals',
            '100 GB cloud storage',
            'Unlimited photos per event',
            'All premium themes',
            'Remove platform branding',
            'Custom studio branding',
            'AI highlight generator',
            'Advanced analytics',
            'Automated client emails',
            'Priority support',
        ],
        cta: 'Get Pro',
        popular: true,
    },
    {
        id: 'studio',
        name: 'Studio',
        tagline: 'For established studios & teams',
        monthly: 6999,
        yearly: 5499,
        color: 'var(--cream)',
        accentBg: 'var(--surface)',
        features: [
            'Everything in Pro',
            '500 GB cloud storage',
            'Team members (up to 10)',
            'White-label custom domain',
            'AI face recognition',
            'Print store integration',
            'Client lead dashboard',
            'Wedding marketplace listing',
            'Dedicated account manager',
            'SLA uptime guarantee',
        ],
        cta: 'Contact sales',
        popular: false,
    },
];

const FAQS = [
    { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime with no questions asked. Your portals remain accessible until the end of your billing period.' },
    { q: 'Do you support Razorpay / Indian payments?', a: 'Yes. We support Razorpay for Indian photographers and Stripe for international payments. UPI, credit cards, and net banking accepted.' },
    { q: 'What happens when I exceed storage?', a: 'We notify you at 80% and 100%. You can upgrade or purchase additional storage add-ons without losing any data.' },
    { q: 'Is there a free trial for Pro?', a: 'Yes — 14 days free on all paid plans. No credit card required to start.' },
    { q: 'Can I migrate my existing wedding galleries?', a: 'Yes. Our team provides free migration support for Studio plan customers.' },
];

export default function PricingPage() {
    const [yearly, setYearly] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const { loginAsDemo } = useAuthStore();
    const router = useRouter();

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    const fmt = (n: number) => n === 0 ? 'Free' : `₹${n.toLocaleString('en-IN')}`;

    return (
        <div style={{ background: 'var(--obsidian)', minHeight: '100dvh' }}>

            {/* Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                height: 60, display: 'flex', alignItems: 'center',
                padding: '0 40px', justifyContent: 'space-between',
                background: 'rgba(12,10,9,0.8)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-subtle)',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'var(--obsidian)', fontSize: 12 }}>✦</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 300, color: 'var(--cream)' }}>WeddingVault</span>
                </Link>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link href="/auth/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>Sign in</Link>
                    <Link href="/auth/signup" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>Get started free</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ paddingTop: 120, paddingBottom: 80, textAlign: 'center', padding: '120px 24px 80px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="ui-label" style={{ marginBottom: 20 }}>Pricing</div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(40px, 6vw, 72px)',
                        fontWeight: 300, letterSpacing: '-0.03em',
                        color: 'var(--cream)', lineHeight: 1.0, marginBottom: 20,
                    }}>
                        Grow your studio.<br />
                        <span style={{
                            fontStyle: 'italic',
                            background: 'linear-gradient(135deg, var(--gold-light), var(--gold-pale))',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>Pay as you scale.</span>
                    </h1>
                    <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-muted)', fontWeight: 300, maxWidth: 480, margin: '0 auto 40px' }}>
                        Start free. Upgrade when your studio grows.
                    </p>

                    {/* Toggle */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', padding: '6px 16px' }}>
                        <button onClick={() => setYearly(false)} style={{
                            background: !yearly ? 'var(--surface-frost)' : 'none',
                            color: !yearly ? 'var(--gold-light)' : 'var(--text-muted)',
                            borderRadius: 'var(--radius-full)', padding: '5px 14px',
                            fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer',
                            border: !yearly ? '1px solid var(--border-accent)' : '1px solid transparent',
                        }}>Monthly</button>
                        <button onClick={() => setYearly(true)} style={{
                            background: yearly ? 'var(--surface-frost)' : 'none',
                            color: yearly ? 'var(--gold-light)' : 'var(--text-muted)',
                            borderRadius: 'var(--radius-full)', padding: '5px 14px',
                            fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer',
                            border: yearly ? '1px solid var(--border-accent)' : '1px solid transparent',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            Yearly
                            <span style={{ background: 'var(--gold)', color: 'var(--obsidian)', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>-20%</span>
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Plans */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                background: plan.popular ? 'linear-gradient(180deg, rgba(201,151,74,0.08) 0%, var(--surface) 100%)' : 'var(--surface)',
                                border: `1px solid ${plan.popular ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                                borderRadius: 'var(--radius-xl)',
                                padding: 32, position: 'relative',
                                transform: plan.popular ? 'scale(1.02)' : 'none',
                                boxShadow: plan.popular ? 'var(--shadow-gold)' : 'none',
                            }}
                        >
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                                    background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))',
                                    color: 'var(--obsidian)',
                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                                    padding: '4px 14px', borderRadius: 'var(--radius-full)',
                                }}>Most Popular</div>
                            )}

                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300, color: plan.color, marginBottom: 6 }}>
                                    {plan.name}
                                </div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{plan.tagline}</div>
                            </div>

                            <div style={{ marginBottom: 28 }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 300, color: 'var(--cream)', lineHeight: 1 }}>
                                    {fmt(yearly ? plan.yearly : plan.monthly)}
                                </span>
                                {plan.monthly > 0 && (
                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginLeft: 6 }}>/month</span>
                                )}
                                {plan.monthly > 0 && yearly && (
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)', marginTop: 4 }}>
                                        Billed ₹{(plan.yearly * 12).toLocaleString('en-IN')}/year
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => { loginAsDemo(); router.push('/dashboard/billing'); }}
                                className="btn"
                                style={{
                                    width: '100%', padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    background: plan.popular ? 'linear-gradient(135deg, var(--gold), var(--gold-light))' : 'var(--surface-2)',
                                    color: plan.popular ? 'var(--obsidian)' : 'var(--text-secondary)',
                                    border: plan.popular ? 'none' : '1px solid var(--border-muted)',
                                    fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 28,
                                    cursor: 'pointer',
                                }}
                            >
                                {plan.cta}
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {plan.features.map(f => (
                                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <Check size={13} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 300 }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Enterprise bar */}
                <div style={{
                    marginTop: 24, padding: '20px 32px',
                    background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 16,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <Building2 size={20} style={{ color: 'var(--gold)' }} />
                        <div>
                            <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>Enterprise — For large studios & agencies</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Custom pricing · Unlimited teams · SLA · Dedicated infrastructure</div>
                        </div>
                    </div>
                    <Link href="mailto:enterprise@weddingvault.app" className="btn btn-ghost" style={{ padding: '8px 20px', fontSize: 'var(--text-sm)' }}>
                        Contact us <ArrowRight size={13} />
                    </Link>
                </div>
            </section>

            {/* FAQ */}
            <section style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 120px' }}>
                <div className="ui-label" style={{ textAlign: 'center', marginBottom: 16 }}>FAQ</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--cream)', textAlign: 'center', marginBottom: 48 }}>
                    Common questions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {FAQS.map((faq, i) => (
                        <div key={i} style={{
                            background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)', overflow: 'hidden',
                            borderColor: openFaq === i ? 'var(--border-accent)' : 'var(--border-subtle)',
                        }}>
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                                width: '100%', padding: '16px 20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)',
                                fontWeight: 500, color: 'var(--text-primary)', textAlign: 'left', gap: 16,
                            }}>
                                {faq.q}
                                <ChevronDown size={15} style={{ color: 'var(--text-muted)', flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                            {openFaq === i && (
                                <div style={{ padding: '0 20px 16px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: 300 }}>
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
