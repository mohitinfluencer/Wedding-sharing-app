'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Search, Download, Mail, Phone, Calendar,
    MapPin, ArrowUpRight, Filter, ChevronRight, Zap, Star
} from 'lucide-react';
import { useAuthStore, DEMO_EVENTS } from '@/lib/auth-store';

const DEMO_LEADS = [
    { id: 'l1', name: 'Meera Kapoor', email: 'meera.k@gmail.com', phone: '+91 98765 43210', event: 'Rahul & Priya', role: 'Guest', interaction: 'Downloaded 12 photos', date: '2 hours ago' },
    { id: 'l2', name: 'Arjun Mehta', email: 'arjun.mehta@outlook.com', phone: '+91 99887 76655', event: 'Rahul & Priya', role: 'Event Manager', interaction: 'Requested access', date: '5 hours ago' },
    { id: 'l3', name: 'Sanjana Rao', email: 'sanjana@luxuryweddings.in', phone: '+91 91234 56789', event: 'Vikram & Isha', role: 'Planner', interaction: 'Shared gallery', date: '1 day ago', hot: true },
    { id: 'l4', name: 'Rahul Sharma', email: 'rahul.sha@yahoo.com', phone: '+91 95555 44444', event: 'Rahul & Priya', role: 'Guest', interaction: 'Uploaded 4 photos', date: '1 day ago' },
    { id: 'l5', name: 'Neha Gupta', email: 'neha.gupta@corp.com', phone: '+91 98888 77777', event: 'Arjun & Sneha', role: 'Guest', interaction: 'Viewed video', date: '2 days ago' },
];

export default function LeadsPage() {
    const { isDemoMode } = useAuthStore();
    const [search, setSearch] = useState('');

    const filteredLeads = DEMO_LEADS.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.event.toLowerCase().includes(search.toLowerCase())
    );

    const stats = [
        { label: 'Total Contacts', value: '482', icon: Users, color: 'var(--gold)' },
        { label: 'Qualified Leads', value: '18', icon: Star, color: '#7DCEA0' },
        { label: 'Avg Contacts/Event', value: '24', icon: Calendar, color: 'var(--gold-light)' },
    ];

    return (
        <div style={{ padding: '40px', maxWidth: 1200 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 20, flexWrap: 'wrap' }}>
                <div>
                    <div className="ui-label" style={{ marginBottom: 10 }}>Viral Growth</div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 6 }}>
                        Lead Intelligence
                    </h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 300 }}>
                        Every interaction from your wedding portals, captured into a high-intent CRM.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    {isDemoMode && (
                        <button className="btn btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
                            <Zap size={14} style={{ color: 'var(--gold)', marginRight: 6 }} />
                            Upgrade for CSV Export
                        </button>
                    )}
                    <button className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                        <Download size={14} style={{ marginRight: 8 }} />
                        Export Leads
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
                {stats.map(s => (
                    <div key={s.label} className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <s.icon size={16} style={{ color: s.color }} />
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--cream)' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Main Table Area */}
            <div className="card-flat" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {/* Table Filters */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by lead name or wedding..."
                            className="input"
                            style={{ paddingLeft: 40, fontSize: 'var(--text-xs)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-icon" title="Filter"><Filter size={14} /></button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-2)' }}>
                                <th style={{ padding: '14px 24px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact</th>
                                <th style={{ padding: '14px 24px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Origin Event</th>
                                <th style={{ padding: '14px 24px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Activity</th>
                                <th style={{ padding: '14px 24px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</th>
                                <th style={{ padding: '14px 24px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead, i) => (
                                <tr key={lead.id} style={{
                                    borderBottom: i < filteredLeads.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                    transition: 'background 0.2s'
                                }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 10, background: lead.hot ? 'rgba(201,151,74,0.15)' : 'var(--surface-2)',
                                                border: lead.hot ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontFamily: 'var(--font-display)', color: lead.hot ? 'var(--gold)' : 'var(--text-secondary)'
                                            }}>
                                                {lead.name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {lead.name}
                                                    {lead.hot && <span className="badge badge-gold" style={{ fontSize: 9, padding: '1px 6px' }}>Hot</span>}
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{lead.event}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className="badge badge-stone" style={{ fontSize: 10 }}>{lead.interaction}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{lead.date}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                            <button className="btn-icon" title="Call"><Phone size={13} /></button>
                                            <button className="btn-icon" title="Email"><Mail size={13} /></button>
                                            <button className="btn-icon" title="View Details"><ChevronRight size={13} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lead Capture Teaser */}
            <div style={{
                marginTop: 24, padding: 24,
                background: 'linear-gradient(135deg, rgba(201,151,74,0.06) 0%, var(--surface) 100%)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 16
            }}>
                <div style={{ display: 'flex', gap: 14 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: '50%', background: 'var(--gold)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--obsidian)'
                    }}>
                        <Zap size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--cream)' }}>Enable Auto-Messenger</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                            Automatically send your portfolio and pricing to guests who download photos.
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary" style={{ padding: '9px 18px', fontSize: 'var(--text-xs)' }}>
                    Setup Automation
                </button>
            </div>
        </div>
    );
}
