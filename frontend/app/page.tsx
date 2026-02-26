'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { ArrowRight, Play, Sparkles, Menu, X } from 'lucide-react';

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80',
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=600&q=80',
  'https://images.unsplash.com/photo-1525772764200-be829a350797?w=600&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80',
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { loginAsDemo } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleDemo = () => {
    loginAsDemo();
    router.push('/dashboard');
  };

  return (
    <div style={{ background: 'var(--obsidian)', minHeight: '100dvh', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav className="navbar" style={{ justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 14, color: 'var(--obsidian)' }}>✦</span>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 300,
            color: 'var(--cream)',
            letterSpacing: '-0.01em',
          }}>
            WeddingVault
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/pricing" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'none', padding: '8px 14px' }}
            onMouseEnter={e => { (e.target as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { (e.target as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}>
            Pricing
          </Link>
          <Link href="/auth/login" className="btn btn-ghost" style={{ padding: '8px 16px' }}>
            Sign in
          </Link>
          <Link href="/auth/signup" className="btn btn-primary" style={{ padding: '8px 18px' }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '120px 24px 80px',
        position: 'relative',
        textAlign: 'center',
      }}>
        {/* Ambient glows */}
        <div className="ambient-glow ambient-gold" style={{ width: 800, height: 600, top: -100, left: '50%', transform: 'translateX(-50%)' }} />
        <div className="ambient-glow ambient-blush" style={{ width: 400, height: 400, top: '30%', left: '20%' }} />

        {/* Eyebrow */}
        <div className={`animate-fade-up ${mounted ? '' : 'opacity-0'}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 'var(--radius-full)',
          background: 'var(--surface-frost)',
          border: '1px solid var(--border-accent)',
          marginBottom: 40,
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
        }}>
          <Sparkles size={11} />
          Cinematic Wedding Media Portals
        </div>

        {/* Headline */}
        <h1 className={`animate-fade-up delay-100 ${mounted ? '' : 'opacity-0'}`} style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(52px, 9vw, 112px)',
          fontWeight: 300,
          lineHeight: 0.9,
          letterSpacing: '-0.04em',
          maxWidth: 900,
          marginBottom: 32,
        }}>
          <span style={{ color: 'var(--cream)' }}>Where</span>{' '}
          <span style={{
            fontStyle: 'italic',
            background: 'linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-pale))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Love</span>
          <br />
          <span style={{ color: 'var(--ivory)' }}>Becomes</span>{' '}
          <span style={{
            color: 'var(--parchment)',
            fontStyle: 'italic',
            opacity: 0.7,
          }}>Art</span>
        </h1>

        {/* Sub */}
        <p className={`animate-fade-up delay-200 ${mounted ? '' : 'opacity-0'}`} style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-lg)',
          color: 'var(--text-tertiary)',
          maxWidth: 520,
          lineHeight: 1.7,
          fontWeight: 300,
          marginBottom: 48,
        }}>
          Create stunning wedding media portals that feel like{' '}
          <em style={{ color: 'var(--parchment)', fontStyle: 'italic' }}>entering a film</em>,
          not opening software.
        </p>

        {/* CTAs */}
        <div className={`animate-fade-up delay-300 ${mounted ? '' : 'opacity-0'}`} style={{
          display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <button onClick={handleDemo} className="btn btn-cinematic">
            Experience Demo
            <ArrowRight size={16} />
          </button>
          <Link href="/auth/signup" className="btn btn-ghost" style={{ padding: '14px 28px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-md)' }}>
            Start your studio
          </Link>
        </div>

        {/* Scroll hint */}
        <div className={`animate-fade-in delay-700 ${mounted ? '' : 'opacity-0'}`} style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            width: 1,
            height: 48,
            background: 'linear-gradient(to bottom, transparent, var(--gold))',
            animation: 'float 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>scroll</span>
        </div>
      </section>

      {/* ── Floating gallery strip ── */}
      <section style={{ padding: '0 0 120px', overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          gap: 8,
          animation: 'marquee 30s linear infinite',
          width: 'max-content',
        }}>
          {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((src, i) => (
            <div key={i} style={{
              width: 280,
              height: 380,
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid var(--border-subtle)',
            }}>
              <img
                src={src}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ── Feature bento ── */}
      <section style={{ padding: '80px 40px 120px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p className="ui-label" style={{ marginBottom: 16 }}>The Platform</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 56px)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--cream)',
            lineHeight: 1.1,
          }}>
            Everything crafted.<br />
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nothing generic.</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto', gap: 12 }}>
          {/* Large feature card */}
          <div className="card" style={{
            gridColumn: 'span 2',
            padding: 40,
            background: 'var(--carbon)',
            position: 'relative',
            overflow: 'hidden',
            minHeight: 280,
          }}>
            <div className="ambient-glow ambient-gold" style={{ width: 400, height: 400, top: -100, right: -100, opacity: 0.6 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 20 }}>✦</span>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 32,
                fontWeight: 300,
                color: 'var(--cream)',
                lineHeight: 1.2,
                marginBottom: 12,
              }}>
                Public portals that feel like<br />
                <em style={{ color: 'var(--gold-light)' }}>a private cinema</em>
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', maxWidth: 400, lineHeight: 1.7 }}>
                Cinematic hero, Vimeo player, masonry gallery, live updates, slideshow mode — all in one auto-generated URL.
              </p>
            </div>
          </div>

          {/* QR card */}
          <div className="card" style={{ padding: 32, background: 'var(--carbon)', minHeight: 280 }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>⬛</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'var(--cream)', marginBottom: 10 }}>
              QR to instant access
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
              Guests scan one code. No app. No login. Instant beauty.
            </p>
          </div>

          {/* Realtime */}
          <div className="card" style={{ padding: 32, background: 'var(--carbon)' }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>⚡</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'var(--cream)', marginBottom: 10 }}>
              Live gallery updates
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
              Photos appear instantly as you upload. No refresh. Pure realtime.
            </p>
          </div>

          {/* Albums */}
          <div className="card" style={{ padding: 32, background: 'var(--carbon)' }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>🪄</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'var(--cream)', marginBottom: 10 }}>
              Multi-day albums
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
              Haldi → Mehendi → Sangeet → Wedding. Every function, perfectly organised.
            </p>
          </div>

          {/* Guest upload */}
          <div className="card" style={{ padding: 32, background: 'var(--carbon)' }}>
            <div style={{ fontSize: 28, marginBottom: 16 }}>📸</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'var(--cream)', marginBottom: 10 }}>
              Guest memories
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
              Guests contribute photos. You curate. Only the best gets published.
            </p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '80px 40px 120px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="divider" style={{ marginBottom: 64 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { body: '"My clients describe the portal as a private Netflix for their wedding. Nothing else comes close."', name: 'Priya Mehta', role: 'Mumbai' },
            { body: '"The QR code at the reception was a game changer. 300 guests viewing live — no friction whatsoever."', name: 'Arjun Studios', role: 'Delhi' },
            { body: '"Finally a platform that matches the quality of my photography. Premium from every angle."', name: 'Sneha Krishnan', role: 'Destination Photographer' },
          ].map((t, i) => (
            <div key={i} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: 28,
            }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>
                {t.body}
              </p>
              <div>
                <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{t.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '80px 40px 120px',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, transparent, var(--charcoal))',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 5vw, 72px)',
          fontWeight: 300,
          letterSpacing: '-0.03em',
          color: 'var(--cream)',
          lineHeight: 1.0,
          marginBottom: 24,
        }}>
          Your clients deserve<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--gold-light), var(--gold-pale))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontStyle: 'italic',
          }}>something extraordinary.</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-md)', marginBottom: 40, fontWeight: 300 }}>
          Set up your first portal in 5 minutes.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" className="btn btn-cinematic">
            Create your studio
          </Link>
          <button onClick={handleDemo} className="btn btn-ghost" style={{ padding: '14px 28px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-md)' }}>
            Try demo first
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '32px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)' }}>
          WeddingVault ✦ 2026
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--driftwood)' }}>
          Built for photographers who care about their craft
        </span>
      </footer>
    </div>
  );
}
