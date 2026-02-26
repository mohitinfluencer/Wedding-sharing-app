'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Globe, Palette, Shield, Save, Camera, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

type Section = 'profile' | 'security' | 'notifications' | 'studio';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [section, setSection] = useState<Section>('profile');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Profile
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');

    // Security
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    // Studio
    const [studioName, setStudioName] = useState('');
    const [studioWebsite, setStudioWebsite] = useState('');
    const [studioCity, setStudioCity] = useState('');

    useEffect(() => {
        if (!user) return;
        setName(user.name || '');
        // Load studio info
        supabase.from('studios').select('*').eq('owner_user_id', user.id).single().then(({ data }) => {
            if (data) {
                setStudioName(data.name || '');
                setStudioWebsite(data.website || '');
                setStudioCity(data.city || '');
                setBio(data.bio || '');
                setPhone(data.phone || '');
            }
        });
    }, [user]);

    const saveProfile = async () => {
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ data: { name } });
            if (error) throw error;
            // Also update studios table
            if (user) {
                await supabase.from('studios').update({ name: studioName, website: studioWebsite, city: studioCity, bio, phone }).eq('owner_user_id', user.id);
            }
            setSaved(true);
            toast.success('Profile saved!');
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            toast.error(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        if (!newPw || newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
        if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPw });
            if (error) throw error;
            toast.success('Password changed!');
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (err: any) {
            toast.error(err.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        { id: 'profile' as Section, label: 'Profile', icon: User },
        { id: 'studio' as Section, label: 'Studio', icon: Camera },
        { id: 'security' as Section, label: 'Security', icon: Lock },
        { id: 'notifications' as Section, label: 'Notifications', icon: Bell },
    ];

    return (
        <div style={{ padding: '40px', maxWidth: 900 }}>
            {/* Header */}
            <div style={{ marginBottom: 36 }}>
                <div className="ui-label" style={{ marginBottom: 10 }}>Account</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 6 }}>
                    Settings
                </h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 300 }}>
                    Manage your account, studio, and preferences.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
                {/* Sidebar nav */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 8 }}>
                    {sections.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setSection(id)} style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', border: 'none', cursor: 'pointer',
                            borderRadius: 'var(--radius-sm)',
                            background: section === id ? 'var(--surface-frost)' : 'none',
                            color: section === id ? 'var(--gold-light)' : 'var(--text-muted)',
                            fontSize: 'var(--text-sm)', fontFamily: 'var(--font-ui)',
                            fontWeight: section === id ? 600 : 400,
                            textAlign: 'left',
                            borderLeft: `2px solid ${section === id ? 'var(--gold)' : 'transparent'}`,
                            transition: 'all 0.15s',
                        }}>
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 32 }}>

                    {/* Profile Section */}
                    {section === 'profile' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--cream)', marginBottom: 24 }}>
                                Personal Information
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label className="input-label">Full Name</label>
                                    <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                                </div>
                                <div>
                                    <label className="input-label">Email Address</label>
                                    <input className="input" value={user?.email || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed here. Contact support.</div>
                                </div>
                                <div>
                                    <label className="input-label">Phone Number</label>
                                    <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" autoComplete="tel" />
                                </div>
                                <div>
                                    <label className="input-label">Bio / About You</label>
                                    <textarea className="input" value={bio} onChange={e => setBio(e.target.value)} placeholder="A short bio about your photography style..." rows={3} style={{ resize: 'vertical', minHeight: 80 }} />
                                </div>
                                <button onClick={saveProfile} disabled={saving} className="btn btn-primary" style={{ padding: '11px 24px', width: 'fit-content', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {saved ? <CheckCircle size={15} /> : <Save size={15} />}
                                    {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Studio Section */}
                    {section === 'studio' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--cream)', marginBottom: 24 }}>
                                Studio Details
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label className="input-label">Studio Name</label>
                                    <input className="input" value={studioName} onChange={e => setStudioName(e.target.value)} placeholder="e.g. Sharma Wedding Photography" autoComplete="organization" />
                                </div>
                                <div>
                                    <label className="input-label">Website</label>
                                    <input className="input" value={studioWebsite} onChange={e => setStudioWebsite(e.target.value)} placeholder="https://yourwebsite.com" type="url" autoComplete="url" />
                                </div>
                                <div>
                                    <label className="input-label">City</label>
                                    <input className="input" value={studioCity} onChange={e => setStudioCity(e.target.value)} placeholder="Mumbai, Delhi, Bangalore..." autoComplete="address-level2" />
                                </div>
                                <button onClick={saveProfile} disabled={saving} className="btn btn-primary" style={{ padding: '11px 24px', width: 'fit-content', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {saved ? <CheckCircle size={15} /> : <Save size={15} />}
                                    {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Studio Info'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Security Section */}
                    {section === 'security' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--cream)', marginBottom: 24 }}>
                                Change Password
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div>
                                    <label className="input-label">New Password</label>
                                    <input className="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
                                </div>
                                <div>
                                    <label className="input-label">Confirm New Password</label>
                                    <input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
                                </div>
                                <button onClick={changePassword} disabled={saving} className="btn btn-primary" style={{ padding: '11px 24px', width: 'fit-content', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Shield size={15} />
                                    {saving ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>

                            <div className="divider" style={{ margin: '32px 0' }} />

                            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>Account Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ padding: 16, background: 'rgba(180,30,30,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>Delete Account</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 12 }}>Permanently delete your account and all data. This cannot be undone.</div>
                                    <button onClick={() => toast.error('Contact support to delete your account')} style={{ padding: '7px 16px', background: 'rgba(180,30,30,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: '#F87171', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Notifications Section */}
                    {section === 'notifications' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'var(--cream)', marginBottom: 24 }}>
                                Notification Preferences
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { label: 'Guest uploads a photo', desc: 'Get notified when a guest submits a photo for approval', default: true },
                                    { label: 'Wedding portal viewed', desc: 'Daily digest of page views for your events', default: true },
                                    { label: 'New wedding created', desc: 'Confirmation when a new event is set up', default: false },
                                    { label: 'Marketing updates', desc: 'Product news and feature announcements', default: false },
                                ].map(item => (
                                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{item.label}</div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{item.desc}</div>
                                        </div>
                                        <button
                                            onClick={e => {
                                                const btn = e.currentTarget;
                                                const isOn = btn.dataset.on === 'true';
                                                btn.dataset.on = String(!isOn);
                                                btn.style.background = !isOn ? 'var(--gold)' : 'var(--surface-2)';
                                                btn.querySelector('span')!.style.transform = !isOn ? 'translateX(20px)' : 'translateX(2px)';
                                            }}
                                            data-on={String(item.default)}
                                            style={{ width: 44, height: 24, borderRadius: 12, background: item.default ? 'var(--gold)' : 'var(--surface-2)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                                            <span style={{ display: 'block', width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: 0, transition: 'transform 0.2s', transform: item.default ? 'translateX(20px)' : 'translateX(2px)' }} />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => toast.success('Notification preferences saved!')} className="btn btn-primary" style={{ padding: '11px 24px', width: 'fit-content', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Save size={15} /> Save Preferences
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
