'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Camera, X, Heart, CheckCircle } from 'lucide-react';

export default function GuestUploadPage() {
    const { slug } = useParams<{ slug: string }>();
    const fileRef = useRef<HTMLInputElement>(null);
    const [guestName, setGuestName] = useState('');
    const [note, setNote] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [success, setSuccess] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const addFiles = (selected: FileList | null) => {
        if (!selected) return;
        const valid = Array.from(selected).filter(f => {
            if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) { toast.error(`${f.name} isn't a photo or video`); return false; }
            if (f.size > 50 * 1024 * 1024) { toast.error(`${f.name} is too large (50MB max)`); return false; }
            return true;
        });
        setFiles(p => [...p, ...valid]);
        valid.forEach(f => {
            if (f.type.startsWith('image/')) {
                const r = new FileReader();
                r.onload = e => setPreviews(p => [...p, e.target?.result as string]);
                r.readAsDataURL(f);
            } else { setPreviews(p => [...p, '']); }
        });
    };

    const removeFile = (i: number) => {
        setFiles(p => p.filter((_, idx) => idx !== i));
        setPreviews(p => p.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim()) { toast.error('Please enter your name'); return; }
        if (files.length === 0) { toast.error('Please add at least one photo'); return; }

        setUploading(true);
        setProgress(0);

        try {
            const { guestApi, mediaApi } = await import('@/lib/api');
            let completed = 0;

            for (const file of files) {
                // 1. Get signed upload params
                const params = await guestApi.initUpload(slug as string);

                // 2. Upload to Cloudinary
                const result = await mediaApi.uploadToCloudinary(file, params, (p) => {
                    const currentProgress = Math.round(((completed * 100) + p) / files.length);
                    setProgress(currentProgress);
                });

                // 3. Register with backend
                await guestApi.completeUpload(slug as string, {
                    guestName,
                    guestNote: note,
                    mediaData: {
                        providerId: result.public_id,
                        url: result.secure_url,
                        width: result.width,
                        height: result.height,
                        type: file.type.startsWith('video/') ? 'video' : 'photo'
                    }
                });

                completed++;
                setProgress(Math.round((completed * 100) / files.length));
            }

            setSuccess(true);
            toast.success('Memories shared successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to upload some memories. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // Success state
    if (success) return (
        <div style={{ minHeight: '100dvh', background: 'var(--obsidian)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ease: [0.16, 1, 0.3, 1] }}
                style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}
            >
                {/* Animated check */}
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(80,160,100,0.2), rgba(80,160,100,0.05))',
                        border: '1px solid rgba(80,160,100,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 32px',
                    }}
                >
                    <CheckCircle size={36} style={{ color: '#7DCEA0' }} />
                </motion.div>

                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 12 }}>
                    Thank you,<br />
                    <span style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>{guestName}</span>
                </h1>
                <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.7, marginBottom: 40 }}>
                    Your {files.length} {files.length === 1 ? 'photo has' : 'photos have'} been submitted.
                    The photographer will review and publish them to the wedding gallery.
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <Link href={`/wedding/${slug}`} className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)' }}>
                        View gallery
                    </Link>
                    <button onClick={() => { setSuccess(false); setFiles([]); setPreviews([]); setNote(''); setGuestName(''); }}
                        className="btn btn-ghost" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)' }}>
                        Upload more
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return (
        <div style={{ minHeight: '100dvh', background: 'var(--obsidian)', padding: '0 0 80px' }}>

            {/* Top bar */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: 'rgba(12,10,9,0.8)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '0 24px', height: 56,
                display: 'flex', alignItems: 'center', gap: 16,
            }}>
                <Link href={`/wedding/${slug}`} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <ArrowLeft size={18} />
                </Link>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 300, color: 'var(--cream)' }}>
                    Share a memory
                </span>
            </div>

            <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 24px 0' }}>

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'var(--surface-frost)',
                        border: '1px solid var(--border-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <Heart size={22} style={{ color: 'var(--gold)' }} />
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 300, letterSpacing: '-0.025em', color: 'var(--cream)', marginBottom: 12, lineHeight: 1.1 }}>
                        Your moment matters
                    </h1>
                    <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', fontWeight: 300, lineHeight: 1.7 }}>
                        Every photo adds to the story. The photographer will review and add the best ones to the gallery.
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit}>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                        {/* Guest info */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="input-label">Your name *</label>
                                <input className="input" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="e.g. Aunt Priya" id="guest-name" />
                            </div>
                            <div>
                                <label className="input-label">Leave a note <span style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                                <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="A heartfelt message to the couple..." id="guest-note" />
                            </div>
                        </div>

                        {/* Drop zone */}
                        <div
                            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                            style={{ padding: '40px 24px', textAlign: 'center' }}
                            onClick={() => fileRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                            id="guest-dropzone"
                        >
                            <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: dragOver ? 'var(--surface-frost)' : 'var(--surface)',
                                border: '1px solid var(--border-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                                transition: 'all 0.2s',
                            }}>
                                <Camera size={20} style={{ color: dragOver ? 'var(--gold)' : 'var(--text-muted)' }} />
                            </div>
                            <div style={{ fontSize: 'var(--text-sm)', color: dragOver ? 'var(--gold-light)' : 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>
                                {dragOver ? 'Release to add photos' : 'Tap to select photos'}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>or drag & drop · JPEG, PNG, HEIC, MP4 · up to 50MB each</div>
                            <input ref={fileRef} type="file" multiple accept="image/*,video/*" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
                        </div>

                        {/* Previews */}
                        <AnimatePresence>
                            {previews.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}
                                >
                                    {previews.map((src, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                            style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface)' }}
                                        >
                                            {src ? (
                                                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Camera size={20} style={{ color: 'var(--text-muted)' }} />
                                                </div>
                                            )}
                                            <button type="button" onClick={() => removeFile(i)} style={{
                                                position: 'absolute', top: 6, right: 6,
                                                width: 22, height: 22, borderRadius: '50%',
                                                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                                                border: 'none', cursor: 'pointer', color: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 10,
                                            }}>
                                                <X size={11} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Progress */}
                        <AnimatePresence>
                            {uploading && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{
                                        background: 'var(--surface-frost)', border: '1px solid var(--border-accent)',
                                        borderRadius: 'var(--radius-md)', padding: 16,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 'var(--text-xs)' }}>
                                        <span style={{ color: 'var(--gold)' }}>Uploading your memories...</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{progress}%</span>
                                    </div>
                                    <div className="progress-track">
                                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <button type="submit" id="guest-submit" disabled={uploading || files.length === 0} className="btn btn-primary" style={{
                            width: '100%', padding: '14px',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: 'var(--text-md)',
                            opacity: (uploading || files.length === 0) ? 0.5 : 1,
                            cursor: (uploading || files.length === 0) ? 'not-allowed' : 'pointer',
                        }}>
                            {uploading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'rgba(0,0,0,0.8)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                    Uploading {files.length} {files.length === 1 ? 'photo' : 'photos'}...
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Heart size={15} />
                                    Submit {files.length > 0 ? `${files.length} ${files.length === 1 ? 'photo' : 'photos'}` : 'photos'}
                                </span>
                            )}
                        </button>

                        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                    </motion.div>
                </form>
            </div>
        </div>
    );
}
