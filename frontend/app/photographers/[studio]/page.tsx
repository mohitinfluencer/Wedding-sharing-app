'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Camera, Eye, Star, Heart, ArrowRight, Calendar } from 'lucide-react';

// Demo portfolio data for any studio slug
const DEMO_PORTFOLIO = {
    studioName: 'Aryan Frames Photography',
    photographerName: 'Aryan Kapoor',
    location: 'Mumbai, Maharashtra',
    bio: 'Capturing timeless stories since 2018. Specialising in cinematic wedding films and luxury destination wedding photography across India and internationally.',
    coverImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    stats: { weddings: 214, photos: 48200, reviews: 4.9, cities: 18 },
    tags: ['Destination Wedding', 'Luxury', 'Candid', 'Cinematic', 'South Indian Weddings', 'Pre-Wedding'],
    weddings: [
        { id: '1', groomName: 'Rahul', brideName: 'Priya', location: 'Udaipur', year: 2026, cover: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600', slug: 'rahul-priya-2026' },
        { id: '2', groomName: 'Arjun', brideName: 'Sneha', location: 'Goa', year: 2026, cover: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600', slug: 'arjun-sneha-2026' },
        { id: '3', groomName: 'Vikram', brideName: 'Isha', location: 'Jaipur', year: 2025, cover: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600', slug: 'vikram-isha-2026' },
        { id: '4', groomName: 'Dev', brideName: 'Meera', location: 'Chennai', year: 2025, cover: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600', slug: 'rahul-priya-2026' },
        { id: '5', groomName: 'Karan', brideName: 'Ananya', location: 'Kolkata', year: 2025, cover: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600', slug: 'rahul-priya-2026' },
        { id: '6', groomName: 'Raj', brideName: 'Nisha', location: 'Delhi', year: 2024, cover: 'https://images.unsplash.com/photo-1525772764200-be829a350797?w=600', slug: 'rahul-priya-2026' },
    ],
    reviews: [
        { name: 'Rahul Mehta', text: 'Aryan captured our wedding beautifully. Every look, every laugh — preserved forever.', rating: 5, wedding: 'Udaipur, 2026' },
        { name: 'Sneha Rao', text: 'The cinematic film he created made our parents cry. Pure artistry.', rating: 5, wedding: 'Goa, 2026' },
        { name: 'Priya Sharma', text: 'Professional, creative, and incredibly fast delivery. Highly recommended!', rating: 5, wedding: 'Mumbai, 2025' },
    ],
};

export default function PhotographerPortfolioPage() {
    const { studio } = useParams<{ studio: string }>();
    const [portfolio] = useState(DEMO_PORTFOLIO);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    return (
        <div style={{ background: 'var(--obsidian)', minHeight: '100dvh' }}>

            {/* Navbar */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                height: 56, display: 'flex', alignItems: 'center',
                padding: '0 32px', justifyContent: 'space-between',
                background: 'rgba(12,10,9,0.8)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-subtle)',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 300, color: 'var(--text-muted)' }}>
                        ✦ WeddingVault
                    </span>
                </Link>
                <Link href="/auth/signup" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: 'var(--text-sm)' }}>
                    Get started free
                </Link>
            </nav>

            {/* Hero — full studio cover */}
            <div style={{ height: '60vh', position: 'relative', overflow: 'hidden', marginTop: 0 }}>
                <img src={portfolio.coverImage} alt={portfolio.studioName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(12,10,9,0.3) 0%, rgba(12,10,9,0.85) 100%)',
                }} />
                {/* Studio badge */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 40px 40px' }}>
                    <div className={mounted ? 'animate-fade-up' : ''} style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: 16,
                            border: '3px solid rgba(201,151,74,0.4)',
                            overflow: 'hidden', flexShrink: 0,
                        }}>
                            <img src={portfolio.avatar} alt={portfolio.photographerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300, letterSpacing: '-0.025em', color: 'var(--ivory)', marginBottom: 6 }}>
                                {portfolio.studioName}
                            </h1>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <MapPin size={12} style={{ color: 'var(--gold)' }} />{portfolio.location}
                                </span>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Star size={12} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />{portfolio.stats.reviews} rating
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div style={{
                background: 'var(--charcoal)', borderBottom: '1px solid var(--border-subtle)',
                padding: '0 40px',
            }}>
                <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', borderBottom: '1px solid transparent' }}>
                    {[
                        { label: 'Weddings', value: portfolio.stats.weddings },
                        { label: 'Photos taken', value: `${(portfolio.stats.photos / 1000).toFixed(0)}k+` },
                        { label: 'Cities', value: portfolio.stats.cities },
                        { label: 'Rating', value: `${portfolio.stats.reviews}/5 ★` },
                    ].map((s, i) => (
                        <div key={i} style={{
                            padding: '20px 32px 20px 0', marginRight: 32,
                            borderRight: i < 3 ? '1px solid var(--border-subtle)' : 'none',
                        }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: 'var(--cream)' }}>{s.value}</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                        </div>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                        <a href="mailto:hello@studio.com" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                            Enquire now
                        </a>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px' }}>

                {/* About + Tags */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, marginBottom: 60 }}>
                    <div>
                        <div className="ui-label" style={{ marginBottom: 12 }}>About the studio</div>
                        <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)', lineHeight: 1.8, fontWeight: 300 }}>
                            {portfolio.bio}
                        </p>
                    </div>
                    <div>
                        <div className="ui-label" style={{ marginBottom: 12 }}>Specialities</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {portfolio.tags.map(tag => (
                                <span key={tag} className="badge badge-stone">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wedding portfolio grid */}
                <div style={{ marginBottom: 60 }}>
                    <div className="ui-label" style={{ marginBottom: 24 }}>Recent Weddings</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {portfolio.weddings.map((w, i) => (
                            <motion.div key={w.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                <Link href={`/wedding/${w.slug}`} style={{ textDecoration: 'none' }}>
                                    <div className="event-card">
                                        <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', background: 'var(--surface)' }}>
                                            <img src={w.cover} alt={`${w.groomName} & ${w.brideName}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} loading="lazy"
                                                onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.05)'; }}
                                                onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                                            />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,10,9,0.7) 0%, transparent 50%)' }} />
                                            <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                                                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--ivory)' }}>
                                                    {w.groomName} & {w.brideName}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <MapPin size={10} />{w.location}
                                            </span>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Calendar size={10} />{w.year}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Reviews */}
                <div style={{ marginBottom: 60 }}>
                    <div className="ui-label" style={{ marginBottom: 24 }}>Client Reviews</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {portfolio.reviews.map((r, i) => (
                            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                                <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                                    {Array.from({ length: r.rating }).map((_, j) => (
                                        <Star key={j} size={13} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                                    ))}
                                </div>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 16, fontWeight: 300 }}>
                                    &ldquo;{r.text}&rdquo;
                                </p>
                                <div>
                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{r.name}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{r.wedding}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Viral CTA — viral growth engine for WeddingVault */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(201,151,74,0.06) 0%, var(--surface) 100%)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '40px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 300, color: 'var(--cream)', marginBottom: 12 }}>
                        Create your own wedding portal
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.7 }}>
                        A photographer? Give your clients the same cinematic experience.
                        Set up your studio in 5 minutes — free forever.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <Link href="/auth/signup" className="btn btn-cinematic">
                            <Camera size={15} />
                            Open your studio
                        </Link>
                        <Link href="/pricing" className="btn btn-ghost" style={{ padding: '14px 24px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-md)' }}>
                            View pricing
                        </Link>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Heart size={10} style={{ color: 'var(--gold)' }} />
                        <span>Powered by</span>
                        <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>WeddingVault</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
