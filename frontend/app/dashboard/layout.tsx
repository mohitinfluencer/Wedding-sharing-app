'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Calendar, Settings, LogOut, ChevronRight,
    Zap, Menu, X, Sun, Moon, Heart, Brain, BarChart2, CreditCard, Users
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';

const navLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Studio', group: 'main' },
    { href: '/dashboard/events', icon: Calendar, label: 'Weddings', group: 'main' },
    { href: '/dashboard/ai', icon: Brain, label: 'AI Tools', group: 'tools' },
    { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics', group: 'tools' },
    { href: '/dashboard/leads', icon: Users, label: 'Leads', group: 'tools' },
    { href: '/dashboard/billing', icon: CreditCard, label: 'Billing', group: 'tools' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings', group: 'settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isDemoMode, hydrate, logout } = useAuthStore();
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (isDemoMode) return;
        hydrate().then(() => {
            const { user } = useAuthStore.getState();
            if (!user) router.push('/auth/login');
        });
    }, [isDemoMode]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
    };

    const handleLogout = async () => {
        await logout();
        toast.success(isDemoMode ? 'Demo exited' : 'Signed out');
        router.push('/');
    };

    if (!user) return (
        <div style={{
            minHeight: '100dvh', background: 'var(--obsidian)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                width: 32, height: 32, border: '2px solid var(--border-accent)',
                borderTopColor: 'var(--gold)', borderRadius: '50%',
                animation: 'spin-slow 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--bg-base)', display: 'flex' }}>

            {/* ── Sidebar ── */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 24,
                paddingBottom: 20,
            }}>
                {/* Brand */}
                <div style={{ padding: '0 20px 24px' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{
                            width: 30, height: 30, borderRadius: 7,
                            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold-light))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            <span style={{ color: 'var(--obsidian)', fontSize: 13 }}>✦</span>
                        </div>
                        <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 17, fontWeight: 300,
                            color: 'var(--cream)',
                            letterSpacing: '-0.01em',
                        }}>WeddingVault</span>
                    </Link>
                </div>

                {/* User chip */}
                <div style={{ padding: '0 12px 24px' }}>
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 12px',
                        display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--obsidian)', fontWeight: 400,
                        }}>
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: isDemoMode ? 'var(--gold)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {isDemoMode ? <><Zap size={10} />Demo Mode</> : user.email?.substring(0, 20)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grouped Nav */}
                <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
                    <div className="ui-label" style={{ padding: '2px 14px 8px', marginTop: 4 }}>Studio</div>
                    {navLinks.filter(n => n.group === 'main').map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                        return (
                            <Link key={href} href={href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                                <Icon size={15} className="nav-icon" />
                                {label}
                                {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />}
                            </Link>
                        );
                    })}

                    <div className="ui-label" style={{ padding: '16px 14px 8px' }}>Power Tools</div>
                    {navLinks.filter(n => n.group === 'tools').map(({ href, icon: Icon, label }) => {
                        const isActive = pathname.startsWith(href);
                        return (
                            <Link key={href} href={href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                                <Icon size={15} className="nav-icon" />
                                {label}
                                {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />}
                            </Link>
                        );
                    })}

                    <div className="ui-label" style={{ padding: '16px 14px 8px' }}>Account</div>
                    {navLinks.filter(n => n.group === 'settings').map(({ href, icon: Icon, label }) => {
                        const isActive = pathname.startsWith(href);
                        return (
                            <Link key={href} href={href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                                <Icon size={15} className="nav-icon" />
                                {label}
                                {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Demo CTA */}
                {isDemoMode && (
                    <div style={{ padding: '16px 12px' }}>
                        <Link href="/auth/signup" style={{
                            display: 'block', textAlign: 'center', padding: '9px',
                            background: 'var(--surface-frost)',
                            border: '1px solid var(--border-accent)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-xs)', fontWeight: 600,
                            color: 'var(--gold-light)', textDecoration: 'none',
                            letterSpacing: '0.04em',
                        }}>
                            🚀 Connect Database
                        </Link>
                    </div>
                )}

                {/* Bottom actions */}
                <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Theme toggle */}
                    <button onClick={toggleTheme} className="sidebar-nav-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
                        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    </button>

                    <button onClick={handleLogout} className="sidebar-nav-item" style={{
                        width: '100%', border: 'none', background: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)',
                    }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#E07070')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                        <LogOut size={15} />
                        {isDemoMode ? 'Exit demo' : 'Sign out'}
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 39, backdropFilter: 'blur(4px)' }}
                />
            )}

            {/* ── Main ── */}
            <main style={{ marginLeft: 240, flex: 1, minHeight: '100dvh', position: 'relative' }}>
                {/* Mobile topbar */}
                <div style={{
                    display: 'none', position: 'sticky', top: 0, zIndex: 30,
                    background: 'rgba(12,10,9,0.85)', backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid var(--border-subtle)',
                    padding: '0 16px', height: 52, alignItems: 'center', justifyContent: 'space-between',
                }} className="mobile-topbar">
                    <style>{`@media(max-width:768px){.mobile-topbar{display:flex!important}main{margin-left:0!important}}`}</style>
                    <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <Menu size={20} />
                    </button>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 300, color: 'var(--cream)' }}>WeddingVault</span>
                    <div style={{ width: 20 }} />
                </div>

                {children}
            </main>
        </div>
    );
}
