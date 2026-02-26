'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, Zap, ArrowUpRight, Download, History, Shield, Star } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth-store';

const PLAN_DETAILS = {
    starter: { name: 'Starter', color: 'var(--text-muted)', price: 0 },
    pro: { name: 'Pro', color: 'var(--gold)', price: 2499 * 12 },
    studio: { name: 'Studio', color: 'var(--cream)', price: 5499 * 12 },
};

const INVOICES = [
    { id: 'INV-2026-03', date: 'Mar 1, 2026', amount: '₹23,988', status: 'Paid', plan: 'Pro (Annual)' },
    { id: 'INV-2025-03', date: 'Mar 1, 2025', amount: '₹23,988', status: 'Paid', plan: 'Pro (Annual)' },
];

export default function BillingPage() {
    const { user, isDemoMode } = useAuthStore();
    const [currentPlan] = useState<'starter' | 'pro' | 'studio'>('pro');
    const [cancelModal, setCancelModal] = useState(false);

    const plan = PLAN_DETAILS[currentPlan];

    // Usage meters
    const usage = {
        events: { used: 7, limit: isDemoMode ? '∞' : 'Unlimited', pct: 0 },
        storage: { used: '23.4 GB', limit: '100 GB', pct: 23 },
        photos: { used: 1842, limit: 'Unlimited', pct: 0 },
    };

    const handleRazorpay = () => {
        toast('Razorpay integration requires backend API keys configured in .env', { icon: '💳', duration: 5000 });
    };

    const handleStripe = () => {
        toast('Stripe integration requires STRIPE_SECRET_KEY in backend/.env', { icon: '💳', duration: 5000 });
    };

    return (
        <div style={{ padding: '40px', maxWidth: 900 }}>
            <div style={{ marginBottom: 36 }}>
                <div className="ui-label" style={{ marginBottom: 10 }}>Billing & Plan</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--cream)' }}>
                    Studio Subscription
                </h1>
            </div>

            {/* Current plan card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(201,151,74,0.06) 0%, var(--surface) 60%)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-xl)',
                padding: 32, marginBottom: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                    <div>
                        <div className="ui-label" style={{ marginBottom: 10 }}>Current plan</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, color: plan.color }}>{plan.name}</span>
                            <span className="badge badge-gold">Active</span>
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                            {isDemoMode ? 'Demo — upgrade to go live' : `Renews March 1, 2027 · ₹${(plan.price ?? 0).toLocaleString('en-IN')}/year`}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link href="/pricing" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                            Upgrade to Studio
                            <ArrowUpRight size={13} />
                        </Link>
                        {!isDemoMode && (
                            <button onClick={() => setCancelModal(true)} className="btn btn-ghost" style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                {/* Usage meters */}
                <div className="divider" style={{ margin: '24px 0' }} />
                <div className="ui-label" style={{ marginBottom: 14 }}>Usage this period</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {[
                        { label: 'Active Weddings', used: usage.events.used, limit: usage.events.limit, pct: usage.events.pct },
                        { label: 'Cloud Storage', used: usage.storage.used, limit: usage.storage.limit, pct: usage.storage.pct },
                        { label: 'Total Photos', used: usage.photos.used.toLocaleString(), limit: usage.photos.limit, pct: usage.photos.pct },
                    ].map(m => (
                        <div key={m.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</span>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                    {m.used} / {m.limit}
                                </span>
                            </div>
                            {m.pct > 0 ? (
                                <div className="progress-track">
                                    <motion.div
                                        className="progress-fill"
                                        initial={{ width: 0 }} animate={{ width: `${m.pct}%` }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        style={{ background: m.pct > 80 ? 'linear-gradient(90deg, #8B3A3A, #E07070)' : undefined }}
                                    />
                                </div>
                            ) : (
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: '100%', opacity: 0.2 }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment methods */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div className="card-flat" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CreditCard size={16} style={{ color: 'var(--gold)' }} /> Payment Method
                    </h3>
                    {isDemoMode ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.7 }}>
                                Connect your payment provider to accept subscriptions.
                            </p>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                <button onClick={handleRazorpay} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>
                                    🇮🇳 Razorpay
                                </button>
                                <button onClick={handleStripe} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 'var(--text-sm)' }}>
                                    💳 Stripe
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 44, height: 28, background: 'linear-gradient(135deg, #1A1A2E, #16213E)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#aaa' }}>VISA</div>
                            <div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>•••• •••• •••• 4242</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Expires 12/27</div>
                            </div>
                            <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Default</span>
                        </div>
                    )}
                </div>

                <div className="card-flat" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Shield size={16} style={{ color: 'var(--gold)' }} /> Plan Benefits
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {['Remove platform branding', 'AI highlight generator', 'Priority support', 'Custom domain (Studio)'].map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {currentPlan === 'starter' && f === 'Remove platform branding' ? (
                                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--surface-2)', flexShrink: 0 }} />
                                ) : (
                                    <Check size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                                )}
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoices */}
            <div className="card-flat" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <History size={16} style={{ color: 'var(--gold)' }} /> Invoice History
                </h3>
                {isDemoMode ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                        <Zap size={20} style={{ color: 'var(--gold)', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                        No invoices yet — connect payment to go live
                    </div>
                ) : (
                    <div>
                        {INVOICES.map((inv, i) => (
                            <div key={inv.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 0',
                                borderBottom: i < INVOICES.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                            }}>
                                <div>
                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{inv.plan}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{inv.id} · {inv.date}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{inv.amount}</span>
                                    <span className="badge badge-green">{inv.status}</span>
                                    <button className="btn btn-icon" style={{ width: 30, height: 30 }}>
                                        <Download size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
