'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Upload, Video, QrCode, Share2, Eye, EyeOff, Star,
    StarOff, Trash2, Plus, ExternalLink, Check, Copy, Play, ImageIcon,
    Users, Zap, Radio, Grid3X3 as Grid, List, ChevronDown, X, Heart,
    LayoutGrid, ChevronLeft, Edit2, Film,
} from 'lucide-react';

import PremiumYouTubePlayer from '@/components/PremiumYouTubePlayer';

import Link from 'next/link';
import { eventsApi, albumsApi, mediaApi, guestApi, qrApi } from '@/lib/api';
import { useAuthStore, DEMO_EVENTS, DEMO_MEDIA } from '@/lib/auth-store';

type TabId = 'media' | 'albums' | 'video' | 'guests' | 'share';

export default function EventManagerPage() {
    const { id } = useParams<{ id: string }>();
    const { isDemoMode } = useAuthStore();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [event, setEvent] = useState<any>(null);
    const [media, setMedia] = useState<any[]>([]);
    const [guestUploads, setGuestUploads] = useState<any[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<string | 'all'>('all');
    const [activeTab, setActiveTab] = useState<TabId>('media');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [vimeoId, setVimeoId] = useState('');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [shareLink, setShareLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [newAlbum, setNewAlbum] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

    const loadData = useCallback(async () => {
        if (isDemoMode) {
            const demoEvent = DEMO_EVENTS.find(e => e.id === id) ?? DEMO_EVENTS[0];
            setEvent(demoEvent);
            setMedia(DEMO_MEDIA as any);
            setGuestUploads([
                { id: 'gu-1', guestName: 'Meera Aunty', guestNote: 'Beautiful ceremony! 💕', media: { url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400', thumbnailUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=200' } },
                { id: 'gu-2', guestName: 'Raj Uncle', guestNote: 'Congratulations dear!', media: { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400', thumbnailUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200' } },
            ]);
            const base = typeof window !== 'undefined' ? window.location.origin : '';
            setShareLink(`${base}/wedding/${demoEvent.slug}`);
            setLoading(false);
            return;
        }
        try {
            const [eventData, mediaData, guestData] = await Promise.all([
                eventsApi.getById(id), mediaApi.getForManagement(id), guestApi.getPending(id),
            ]);
            setEvent(eventData);
            setMedia(mediaData || []);
            setGuestUploads(guestData || []);
            setShareLink(`${window.location.origin}/wedding/${eventData.slug}`);
        } catch { toast.error('Failed to load event'); }
        finally { setLoading(false); }
    }, [id, isDemoMode]);

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => {
        if (event && !isDemoMode) {
            qrApi.getDataUrl(event.slug).then(d => setQrDataUrl(d.dataUrl)).catch(() => { });
        }
    }, [event, isDemoMode]);

    // Keyboard lightbox
    useEffect(() => {
        const fn = (e: KeyboardEvent) => {
            if (lightbox.open) {
                const filtered = getFiltered();
                if (e.key === 'ArrowRight') setLightbox(l => ({ ...l, index: (l.index + 1) % filtered.length }));
                if (e.key === 'ArrowLeft') setLightbox(l => ({ ...l, index: (l.index - 1 + filtered.length) % filtered.length }));
                if (e.key === 'Escape') { setLightbox({ open: false, index: 0 }); document.body.style.overflow = ''; }
            }
        };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [lightbox]);

    const getFiltered = () => selectedAlbum === 'all' ? media : media.filter(m => m.albumId === selectedAlbum);

    const handleFileUpload = async (files: FileList) => {
        if (!event) return;
        const albumId = selectedAlbum !== 'all' ? selectedAlbum : undefined;
        for (const file of Array.from(files)) {
            if (file.size > 50 * 1024 * 1024) { toast.error(`${file.name} is too large (max 50MB)`); continue; }
            setUploading(true); setUploadProgress(0);
            try {
                const params = await mediaApi.initUpload(event.id, albumId);
                if (!params.uploadUrl || !params.uploadPreset) {
                    throw new Error('Cloudinary is not configured. Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in Vercel settings.');
                }
                const result = await mediaApi.uploadToCloudinary(file, params, setUploadProgress);
                if (!result.secure_url) throw new Error('Upload completed but no URL returned from Cloudinary');

                // Generate thumbnail URL from Cloudinary transformations
                const thumbnailUrl = result.secure_url.replace('/upload/', '/upload/c_fill,w_400,h_400,q_80/');

                await mediaApi.completeUpload({
                    eventId: event.id,
                    albumId,
                    providerId: result.public_id,
                    url: result.secure_url,
                    thumbnailUrl,
                    width: result.width,
                    height: result.height,
                    type: file.type.startsWith('video/') ? 'video' : 'photo',
                });
                toast.success(`${file.name} uploaded!`);
                await loadData();
            } catch (err: any) {
                const msg = err?.response?.data?.error?.message || err?.message || 'Upload failed';
                toast.error(msg);
                console.error('Upload error:', err);
            }
            finally { setUploading(false); }
        }
    };


    const toggleHide = async (m: any) => {
        if (isDemoMode) { setMedia(p => p.map(x => x.id === m.id ? { ...x, hidden: !x.hidden } : x)); toast.success(m.hidden ? 'Photo shown' : 'Photo hidden'); return; }
        try { await mediaApi.update(m.id, { hidden: !m.hidden }); setMedia(p => p.map(x => x.id === m.id ? { ...x, hidden: !x.hidden } : x)); } catch { toast.error('Failed'); }
    };
    const toggleHighlight = async (m: any) => {
        if (isDemoMode) { setMedia(p => p.map(x => x.id === m.id ? { ...x, highlight: !x.highlight } : x)); return; }
        try { await mediaApi.update(m.id, { highlight: !m.highlight }); setMedia(p => p.map(x => x.id === m.id ? { ...x, highlight: !x.highlight } : x)); } catch { toast.error('Failed'); }
    };
    const deleteMedia = async (m: any) => {
        if (isDemoMode) { setMedia(p => p.filter(x => x.id !== m.id)); toast.success('Deleted'); return; }
        if (!confirm('Delete this photo?')) return;
        try { await mediaApi.delete(m.id); setMedia(p => p.filter(x => x.id !== m.id)); } catch { toast.error('Failed'); }
    };
    const createAlbum = async () => {
        if (!newAlbum.trim()) return;
        if (isDemoMode) {
            const entry = { id: `da-${Date.now()}`, title: newAlbum, orderIndex: event?.albums.length ?? 0, _count: { media: 0 } };
            setEvent((p: any) => p ? { ...p, albums: [...p.albums, entry] } : p);
            setNewAlbum(''); toast.success('Album created'); return;
        }
        try { await albumsApi.create(event.id, { title: newAlbum }); toast.success('Album created'); setNewAlbum(''); loadData(); } catch { toast.error('Failed'); }
    };
    const copyLink = () => { navigator.clipboard.writeText(shareLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2500); toast.success('Link copied!'); };
    const approveGuest = async (id: string) => {
        if (isDemoMode) { setGuestUploads(p => p.filter(u => u.id !== id)); toast.success('Published!'); return; }
        try { await guestApi.approve(id); setGuestUploads(p => p.filter(u => u.id !== id)); loadData(); } catch { toast.error('Failed'); }
    };
    const rejectGuest = async (id: string) => {
        if (isDemoMode) { setGuestUploads(p => p.filter(u => u.id !== id)); return; }
        try { await guestApi.reject(id); setGuestUploads(p => p.filter(u => u.id !== id)); } catch { toast.error('Failed'); }
    };

    const openLightbox = (i: number) => { setLightbox({ open: true, index: i }); document.body.style.overflow = 'hidden'; };
    const closeLightbox = () => { setLightbox({ open: false, index: 0 }); document.body.style.overflow = ''; };

    if (loading || !event) return (
        <div style={{ padding: '32px 24px' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <div className="skeleton" style={{ height: 36, width: 200, borderRadius: 'var(--radius-md)' }} />
                <div className="skeleton" style={{ height: 36, flex: 1, borderRadius: 'var(--radius-md)' }} />
            </div>
            <div className="skeleton" style={{ height: 48, width: '100%', borderRadius: 'var(--radius-md)', marginBottom: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)' }} />
                ))}
            </div>
        </div>
    );

    const filtered = getFiltered();
    const tabs: { id: TabId; label: string; icon: any; count?: number }[] = [
        { id: 'media', label: 'Photos', icon: ImageIcon, count: media.filter(m => m.type !== 'video').length },
        { id: 'albums', label: 'Albums', icon: Grid, count: event.albums?.length ?? 0 },
        { id: 'video', label: 'Video', icon: Video },
        { id: 'guests', label: 'Guests', icon: Users, count: guestUploads.length },
        { id: 'share', label: 'Share', icon: Share2 },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* ── TOP HEADER BAR ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-raised)',
                flexWrap: 'wrap',
                flexShrink: 0,
            }}>
                {/* Back + title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div style={{ minWidth: 0 }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, letterSpacing: '-0.01em', color: 'var(--cream)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.groomName} &amp; {event.brideName}
                        </h1>
                        {event.location && (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 1 }}>{event.location}</p>
                        )}
                    </div>
                </div>



                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Link href={`/wedding/${event.slug}`} target="_blank" style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 'var(--radius-md)',
                        background: 'var(--surface)', border: '1px solid var(--border-muted)',
                        fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                        textDecoration: 'none', whiteSpace: 'nowrap',
                    }}>
                        <ExternalLink size={13} /> View Live
                    </Link>
                    <Link href={`/dashboard/events/${event.id}/livestream`} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 'var(--radius-md)',
                        background: 'rgba(139,58,58,0.15)', border: '1px solid rgba(209,68,68,0.3)',
                        fontSize: 'var(--text-xs)', color: '#F87171',
                        textDecoration: 'none', whiteSpace: 'nowrap',
                    }}>
                        <Radio size={12} /> Go Live
                    </Link>
                    <button onClick={() => fileInputRef.current?.click()} id="upload-photos-btn" style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                        border: 'none', cursor: 'pointer',
                        fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--obsidian)',
                        whiteSpace: 'nowrap',
                    }}>
                        <Upload size={13} /> Upload
                    </button>
                    <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={e => e.target.files && handleFileUpload(e.target.files)} />
                </div>
            </div>

            {/* ── UPLOAD PROGRESS ── */}
            {uploading && (
                <div style={{ padding: '10px 24px', background: 'var(--surface-frost)', borderBottom: '1px solid var(--border-accent)', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 'var(--text-xs)' }}>
                        <span style={{ color: 'var(--gold)' }}>Uploading...</span>
                        <span style={{ color: 'var(--text-muted)' }}>{uploadProgress}%</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${uploadProgress}%` }} /></div>
                </div>
            )}

            {/* ── TABS ── */}
            <div style={{
                display: 'flex', alignItems: 'center',
                padding: '0 16px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-raised)',
                overflowX: 'auto', flexShrink: 0,
                gap: 0,
            }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '12px 16px',
                        border: 'none', background: 'none', cursor: 'pointer',
                        fontSize: 'var(--text-xs)', fontWeight: 500, fontFamily: 'var(--font-ui)',
                        color: activeTab === tab.id ? 'var(--gold-light)' : 'var(--text-muted)',
                        borderBottom: `2px solid ${activeTab === tab.id ? 'var(--gold)' : 'transparent'}`,
                        whiteSpace: 'nowrap', transition: 'color 0.15s, border-color 0.15s',
                        marginBottom: -1,
                    }}>
                        <tab.icon size={13} />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span style={{
                                background: activeTab === tab.id ? 'var(--surface-frost)' : 'var(--surface)',
                                color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
                                border: `1px solid ${activeTab === tab.id ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                                fontSize: 10, fontWeight: 600, padding: '0px 5px', borderRadius: 4,
                            }}>{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── SCROLLABLE CONTENT ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

                {/* MEDIA TAB */}
                {activeTab === 'media' && (
                    <div>
                        {/* Album filter + view mode */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            {/* Album pills */}
                            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, paddingBottom: 2 }}>
                                {['all', ...(event.albums ?? []).map((a: any) => a.id)].map(albumId => {
                                    const label = albumId === 'all' ? 'All Photos' : event.albums.find((a: any) => a.id === albumId)?.title ?? '';
                                    const count = albumId === 'all' ? media.length : media.filter((m: any) => m.albumId === albumId).length;
                                    return (
                                        <button key={albumId} onClick={() => setSelectedAlbum(albumId as any)} style={{
                                            padding: '5px 12px', borderRadius: 'var(--radius-full)',
                                            border: `1px solid ${selectedAlbum === albumId ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
                                            background: selectedAlbum === albumId ? 'var(--surface-frost)' : 'transparent',
                                            color: selectedAlbum === albumId ? 'var(--gold-light)' : 'var(--text-muted)',
                                            fontSize: 11, fontFamily: 'var(--font-ui)', cursor: 'pointer', whiteSpace: 'nowrap',
                                            fontWeight: selectedAlbum === albumId ? 600 : 400,
                                            transition: 'all 0.15s',
                                        }}>
                                            {label} {count > 0 && <span style={{ opacity: 0.5 }}>{count}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* View mode */}
                            <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
                                {(['grid', 'list'] as const).map(m => (
                                    <button key={m} onClick={() => setViewMode(m)} style={{
                                        padding: '4px 8px', border: 'none', cursor: 'pointer',
                                        borderRadius: 4, background: viewMode === m ? 'var(--surface-frost)' : 'transparent',
                                        color: viewMode === m ? 'var(--gold)' : 'var(--text-muted)',
                                    }}>
                                        {m === 'grid' ? <Grid size={13} /> : <List size={13} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Photo count */}
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                            {filtered.length} photo{filtered.length !== 1 ? 's' : ''}
                            {selectedAlbum !== 'all' && <span style={{ color: 'var(--gold)', marginLeft: 6 }}>· {event.albums.find((a: any) => a.id === selectedAlbum)?.title}</span>}
                        </div>

                        {/* Grid */}
                        {filtered.length === 0 ? (
                            <div onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '1.5px dashed var(--border-muted)', borderRadius: 'var(--radius-lg)',
                                    padding: '60px 24px', textAlign: 'center', cursor: 'pointer',
                                    transition: 'border-color 0.2s, background 0.2s',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--surface-frost)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-muted)'; (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                            >
                                <Upload size={28} style={{ color: 'var(--text-muted)', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 4 }}>Click to upload photos</div>
                                <div style={{ fontSize: 11, color: 'var(--driftwood)' }}>JPEG, PNG, HEIC, MP4 — max 50MB each</div>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: 8,
                            }}>
                                {filtered.map((m, i) => (
                                    <motion.div key={m.id} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}>
                                        <div className="gallery-item" onClick={() => openLightbox(i)} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
                                            <img src={m.thumbnailUrl || m.url} alt="" loading="lazy"
                                                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', opacity: m.hidden ? 0.35 : 1, filter: m.hidden ? 'grayscale(70%)' : 'none', transition: 'transform 0.3s' }}
                                            />
                                            <div className="gallery-overlay" />
                                            {/* Hide / Star buttons on hover — centered */}
                                            <div style={{
                                                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                                opacity: 0, transition: 'opacity 0.2s',
                                            }}
                                                className="photo-actions"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <button onClick={() => toggleHide(m)} style={{ padding: 7, background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff', display: 'flex', backdropFilter: 'blur(4px)' }} title={m.hidden ? 'Show' : 'Hide'}>
                                                    {m.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                                                </button>
                                                <button onClick={() => toggleHighlight(m)} style={{ padding: 7, background: m.highlight ? 'rgba(201,151,74,0.5)' : 'rgba(0,0,0,0.75)', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff', display: 'flex', backdropFilter: 'blur(4px)' }}>
                                                    {m.highlight ? <Star size={13} style={{ fill: 'var(--gold)' }} /> : <StarOff size={13} />}
                                                </button>
                                            </div>
                                            {/* Delete button — bottom right, separate from center actions to avoid accidents */}
                                            <button
                                                className="photo-delete-btn"
                                                onClick={e => { e.stopPropagation(); deleteMedia(m); }}
                                                style={{
                                                    position: 'absolute', bottom: 6, right: 6,
                                                    padding: '5px 7px', background: 'rgba(180,30,30,0.85)',
                                                    border: '1px solid rgba(255,100,100,0.3)',
                                                    borderRadius: 6, cursor: 'pointer', color: '#fff',
                                                    display: 'flex', backdropFilter: 'blur(4px)',
                                                    opacity: 0, transition: 'opacity 0.2s',
                                                }}
                                                title="Delete photo"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            {/* Status badges */}
                                            {m.highlight && <div style={{ position: 'absolute', top: 6, left: 6 }}><Star size={12} style={{ color: 'var(--gold)', fill: 'var(--gold)', filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))' }} /></div>}
                                            {m.hidden && <div style={{ position: 'absolute', top: 6, right: 6 }}><EyeOff size={11} style={{ color: 'rgba(255,255,255,0.7)' }} /></div>}
                                            {m.uploaderType === 'guest' && <div style={{ position: 'absolute', bottom: 5, left: 5, background: 'rgba(59,130,246,0.8)', borderRadius: 3, padding: '1px 5px', fontSize: 9, color: '#fff', backdropFilter: 'blur(4px)' }}>Guest</div>}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            /* List view */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {filtered.map((m, i) => (
                                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                                        <img src={m.thumbnailUrl || m.url} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, opacity: m.hidden ? 0.4 : 1 }} loading="lazy" />
                                        <div style={{ flex: 1, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Photo #{i + 1}</div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => toggleHide(m)} style={{ padding: 6, background: 'var(--surface-2)', border: 'none', borderRadius: 5, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>{m.hidden ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                                            <button onClick={() => toggleHighlight(m)} style={{ padding: 6, background: m.highlight ? 'var(--surface-frost)' : 'var(--surface-2)', border: 'none', borderRadius: 5, cursor: 'pointer', color: m.highlight ? 'var(--gold)' : 'var(--text-muted)', display: 'flex' }}><Star size={13} style={{ fill: m.highlight ? 'var(--gold)' : 'none' }} /></button>
                                            <button onClick={() => deleteMedia(m)} style={{ padding: 6, background: 'var(--surface-2)', border: 'none', borderRadius: 5, cursor: 'pointer', color: '#F87171', display: 'flex' }}><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ALBUMS TAB */}
                {activeTab === 'albums' && (
                    <div>
                        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                            <input value={newAlbum} onChange={e => setNewAlbum(e.target.value)} onKeyDown={e => e.key === 'Enter' && createAlbum()} placeholder="Album name (e.g. Haldi, Sangeet...)" className="input" style={{ flex: 1, maxWidth: 320, padding: '9px 14px', fontSize: 'var(--text-sm)' }} />
                            <button onClick={createAlbum} style={{ padding: '9px 18px', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, color: 'var(--obsidian)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Plus size={14} />Add Album
                            </button>
                        </div>

                        {event.albums?.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                                <Grid size={28} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                                No albums yet. Try: Haldi, Mehendi, Sangeet, Wedding, Reception
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                                {event.albums.map((album: any) => (
                                    <button key={album.id} onClick={() => { setSelectedAlbum(album.id); setActiveTab('media'); }} style={{
                                        padding: '20px', background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                                        borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left',
                                        transition: 'border-color 0.2s', fontFamily: 'var(--font-ui)',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                                    >
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 6 }}>{album.title}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{album._count?.media ?? 0} photos</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* VIDEO & LIVE TAB */}
                {activeTab === 'video' && (
                    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 28 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--cream)', marginBottom: 6 }}>
                                <Video size={16} style={{ color: 'var(--gold)', marginRight: 8, display: 'inline' }} />
                                Wedding Film (YouTube)
                            </h3>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                                Paste your unlisted YouTube link. Guests will view it in a premium cinematic player.
                            </p>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                                <input
                                    value={vimeoId} // Using same state variable for simplicity in refactoring
                                    onChange={e => setVimeoId(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="input"
                                    style={{ flex: 1, padding: '9px 14px', fontSize: 'var(--text-sm)' }}
                                />
                                <button
                                    onClick={async () => {
                                        if (isDemoMode) { toast.success('Video attached (Demo)'); return; }
                                        try {
                                            const { youtubeApi } = await import('@/lib/api');
                                            await youtubeApi.attachVideo(event.id, vimeoId);
                                            toast.success('YouTube Video attached!');
                                            loadData();
                                        } catch (e: any) { toast.error(e.message || 'Invalid URL'); }
                                    }}
                                    style={{ padding: '9px 16px', background: 'var(--gold)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, color: 'var(--obsidian)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}
                                >
                                    Attach
                                </button>
                            </div>
                            {event?.youtube_video_id && (
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 14 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={12} /> Attached: {event.youtube_video_id}</span>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Remove this video?')) return;
                                                try { await eventsApi.update(event.id, { youtube_video_id: null }); toast.success('Video removed'); loadData(); } catch { toast.error('Failed'); }
                                            }}
                                            style={{ padding: '4px 10px', background: 'rgba(180,30,30,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, cursor: 'pointer', color: '#F87171', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                                        >
                                            <Trash2 size={11} /> Remove
                                        </button>
                                    </div>
                                    {/* Premium cinematic preview */}
                                    <PremiumYouTubePlayer
                                        videoId={event.youtube_video_id}
                                        title={`${event.groomName} & ${event.brideName}`}
                                        subtitle="Wedding Film Preview"
                                        badge="Wedding Film"
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ background: 'var(--surface-frost)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Radio size={14} style={{ color: '#F87171' }} />Live Streaming Hook
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.7 }}>
                                Paste your YouTube Live link here. When you start your stream in YouTube Studio, guests will see a "🔴 LIVE NOW" banner.
                            </p>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                                <input
                                    placeholder="https://youtube.com/live/..."
                                    className="input"
                                    style={{ flex: 1, padding: '9px 14px', fontSize: 'var(--text-sm)', background: 'var(--bg-raised)' }}
                                    id="youtube-live-input"
                                />
                                <button
                                    onClick={async () => {
                                        const val = (document.getElementById('youtube-live-input') as HTMLInputElement).value;
                                        if (isDemoMode) { toast.success('Live Stream attached (Demo)'); return; }
                                        try {
                                            const { youtubeApi } = await import('@/lib/api');
                                            await youtubeApi.attachLive(event.id, val);
                                            toast.success('YouTube Live Link saved!');
                                            loadData();
                                        } catch (e: any) { toast.error(e.message || 'Invalid Link'); }
                                    }}
                                    style={{ padding: '9px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, color: '#F87171', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}
                                >
                                    Set Live
                                </button>
                            </div>
                            {event?.youtube_live_id && (
                                <div style={{ fontSize: 11, color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={12} /> Live Active: {event.youtube_live_id}</span>
                                    <button
                                        onClick={async () => {
                                            if (!confirm('Stop live stream and remove it?')) return;
                                            try { await eventsApi.update(event.id, { youtube_live_id: null }); toast.success('Live stream removed'); loadData(); } catch { toast.error('Failed'); }
                                        }}
                                        style={{ padding: '4px 10px', background: 'rgba(180,30,30,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, cursor: 'pointer', color: '#F87171', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                                    >
                                        <Trash2 size={11} /> Stop & Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* GUESTS TAB */}
                {activeTab === 'guests' && (
                    <div>
                        {guestUploads.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                                <Users size={28} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.3 }} />
                                <div style={{ fontSize: 'var(--text-sm)' }}>No pending guest uploads</div>
                                <div style={{ fontSize: 11, marginTop: 6, color: 'var(--driftwood)' }}>
                                    Share the upload link so guests can submit photos
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                                {guestUploads.map(upload => (
                                    <div key={upload.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                                        <img src={upload.media?.thumbnailUrl || upload.media?.url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                                        <div style={{ padding: '12px 14px' }}>
                                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>{upload.guestName}</div>
                                            {upload.guestNote && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>{upload.guestNote}</div>}
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => approveGuest(upload.id)} style={{ flex: 1, padding: '7px 0', background: 'rgba(80,160,100,0.15)', border: '1px solid rgba(80,160,100,0.25)', borderRadius: 6, cursor: 'pointer', color: '#7DCEA0', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                                    <Check size={11} />Approve
                                                </button>
                                                <button onClick={() => rejectGuest(upload.id)} style={{ flex: 1, padding: '7px 0', background: 'rgba(139,58,58,0.12)', border: '1px solid rgba(139,58,58,0.25)', borderRadius: 6, cursor: 'pointer', color: '#F87171', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                                    <X size={11} />Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* SHARE TAB */}
                {activeTab === 'share' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 680 }}>
                        {/* Share link */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Share2 size={14} style={{ color: 'var(--gold)' }} />Share Link
                            </h3>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                <input readOnly value={shareLink} style={{ flex: 1, padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', fontSize: 11, outline: 'none' }} />
                                <button onClick={copyLink} id="copy-link-btn" style={{
                                    padding: '8px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                    background: linkCopied ? 'rgba(80,160,100,0.2)' : 'var(--surface-frost)',
                                    color: linkCopied ? '#7DCEA0' : 'var(--gold)', display: 'flex', alignItems: 'center',
                                    border: `1px solid ${linkCopied ? 'rgba(80,160,100,0.3)' : 'var(--border-accent)'}`,
                                    transition: 'all 0.2s',
                                }}>
                                    {linkCopied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            <Link href={`/wedding/${event.slug}`} target="_blank" style={{ fontSize: 11, color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <ExternalLink size={11} />Open wedding page
                            </Link>
                            <div className="divider" style={{ margin: '16px 0' }} />
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Guest upload link</div>
                            <div style={{ fontSize: 11, color: 'var(--gold)', wordBreak: 'break-all' }}>
                                {shareLink}/upload
                            </div>
                        </div>

                        {/* QR Code */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: 24 }}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, color: 'var(--cream)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <QrCode size={14} style={{ color: 'var(--gold)' }} />QR Code
                            </h3>
                            {isDemoMode ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ background: '#fff', padding: 16, borderRadius: 12, display: 'inline-flex', marginBottom: 14 }} id="qr-code-img">
                                        <div style={{ width: 120, height: 120, background: 'var(--charcoal)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <QrCode size={48} style={{ color: '#fff' }} />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>QR generation requires backend API</div>
                                </div>
                            ) : qrDataUrl ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ background: '#fff', padding: 12, borderRadius: 10, display: 'inline-block', marginBottom: 14 }}>
                                        <img src={qrDataUrl} alt="QR" style={{ width: 120, height: 120 }} id="qr-code-img" />
                                    </div>
                                    <br />
                                    <button onClick={() => { const a = document.createElement('a'); a.href = qrDataUrl; a.download = `qr-${event.slug}.png`; a.click(); }} id="download-qr-btn" style={{ padding: '8px 20px', background: 'var(--gold)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--obsidian)' }}>
                                        Download PNG
                                    </button>
                                </div>
                            ) : <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading...</div>}
                        </div>
                    </div>
                )}
            </div>

            {/* ── LIGHTBOX ── */}
            <AnimatePresence>
                {lightbox.open && filtered[lightbox.index] && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
                    >
                        <motion.img key={lightbox.index} src={filtered[lightbox.index].url} alt="" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                            onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain', borderRadius: 8, boxShadow: 'var(--shadow-xl)' }}
                        />
                        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                            {lightbox.index + 1} / {filtered.length} · Press ← → to navigate · Esc to close
                        </div>
                        <button onClick={closeLightbox} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                            <X size={18} />
                        </button>
                        {filtered.length > 1 && <>
                            <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index - 1 + filtered.length) % filtered.length })); }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                                <ArrowLeft size={20} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); setLightbox(l => ({ ...l, index: (l.index + 1) % filtered.length })); }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                                <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                        </>}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        .gallery-item:hover .photo-actions { opacity: 1 !important; }
        .gallery-item:hover .photo-delete-btn { opacity: 1 !important; }
      `}</style>
        </div>
    );
}
