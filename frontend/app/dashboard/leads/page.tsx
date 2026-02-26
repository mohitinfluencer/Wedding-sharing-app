'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, Search, Download, Mail, Phone, Calendar,
    Filter, ChevronRight, Star
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { studioApi } from '@/lib/api';

export default function LeadsPage() {
    const [search, setSearch] = useState('');
    const [leads, setLeads] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, events: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                // Get current user's studio events first
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: studios } = await supabase
                    .from('studios')
                    .select('id')
                    .eq('owner_id', user.id)
                    .single();

                if (!studios) return;

                const { data: events } = await supabase
                    .from('events')
                    .select('id, groom_name, bride_name')
                    .eq('studio_id', studios.id);

                const eventIds = (events || []).map((e: any) => e.id);
                const eventMap: Record<string, string> = {};
                (events || []).forEach((e: any) => {
                    eventMap[e.id] = `${e.groom_name} & ${e.bride_name}`;
                });

                if (eventIds.length === 0) {
                    setLeads([]);
                    setStats({ total: 0, events: 0 });
                    return;
                }

                // Fetch guest uploads as leads
                const { data: guestUploads } = await supabase
                    .from('guest_uploads')
                    .select('id, guest_name, guest_email, guest_phone, guest_note, event_id, created_at, status')
                    .in('event_id', eventIds)
                    .order('created_at', { ascending: false });

                const mapped = (guestUploads || []).map((g: any) => ({
                    id: g.id,
                    name: g.guest_name || 'Anonymous Guest',
                    email: g.guest_email || '—',
                    phone: g.guest_phone || '—',
                    event: eventMap[g.event_id] || 'Unknown Event',
                    interaction: g.guest_note ? `Note: ${g.guest_note.substring(0, 30)}...` : 'Submitted a photo',
                    date: new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                    status: g.status,
                }));

                setLeads(mapped);
                setStats({ total: mapped.length, events: eventIds.length });
            } catch (err) {
                console.error('Failed to fetch leads:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.event.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase())
    );

    const statCards = [
        { label: 'Total Guest Contacts', value: stats.total.toString(), icon: Users, color: 'var(--gold)' },
        { label: 'Active Weddings', value: stats.events.toString(), icon: Calendar, color: '#7DCEA0' },
        { label: 'Latest Interaction', value: leads[0]?.date || '—', icon: Star, color: 'var(--gold-light)' },
    ];

    return (
        <div style={{ padding: '40px', maxWidth: 1200 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 20, flexWrap: 'wrap' }}>
                <div>
                    <div className="ui-label" style={{ marginBottom: 10 }}>Guest CRM</div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 6 }}>
                        Guest Contacts
                    </h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 300 }}>
                        Every guest interaction from your wedding portals captured here.
                    </p>
                </div>
                <button
                    onClick={() => {
                        const csv = ['Name,Email,Phone,Event,Interaction,Date', ...filteredLeads.map(l => `"${l.name}","${l.email}","${l.phone}","${l.event}","${l.interaction}","${l.date}"`)].join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'leads.csv'; a.click();
                    }}
                    className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                    <Download size={14} style={{ marginRight: 8 }} />
                    Export CSV
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
                {statCards.map(s => (
                    <div key={s.label} className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <s.icon size={16} style={{ color: s.color }} />
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, color: 'var(--cream)' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card-flat" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, email or wedding..."
                            className="input"
                            style={{ paddingLeft: 40, fontSize: 'var(--text-xs)' }}
                        />
                    </div>
                    <button className="btn-icon" title="Filter"><Filter size={14} /></button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                    ) : filteredLeads.length === 0 ? (
                        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                            <Users size={32} style={{ display: 'block', margin: '0 auto 16px', opacity: 0.2, color: 'var(--text-muted)' }} />
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 8 }}>No guest contacts yet</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--driftwood)' }}>
                                Share your wedding portal links so guests can submit photos and leave notes.
                            </div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-2)' }}>
                                    {['Contact', 'Wedding', 'Interaction', 'Date', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '14px 24px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead, i) => (
                                    <tr key={lead.id} style={{ borderBottom: i < filteredLeads.length - 1 ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: 10, background: 'var(--surface-2)',
                                                    border: '1px solid var(--border-subtle)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontFamily: 'var(--font-display)', color: 'var(--text-secondary)'
                                                }}>
                                                    {lead.name[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{lead.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{lead.event}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span className="badge badge-stone" style={{ fontSize: 10 }}>{lead.interaction}</span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{lead.date}</div>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                {lead.phone !== '—' && <button className="btn-icon" title="Call" onClick={() => window.open(`tel:${lead.phone}`)}><Phone size={13} /></button>}
                                                {lead.email !== '—' && <button className="btn-icon" title="Email" onClick={() => window.open(`mailto:${lead.email}`)}><Mail size={13} /></button>}
                                                <button className="btn-icon" title="View"><ChevronRight size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
