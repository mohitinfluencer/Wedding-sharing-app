'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Radio, Eye, Send } from 'lucide-react';
import { DEMO_EVENTS } from '@/lib/auth-store';

const EMOJIS = ['❤️', '🎊', '😍', '🎉', '💍', '🌹'];

export default function GuestLiveViewPage() {
    const { slug } = useParams<{ slug: string }>();
    const event = DEMO_EVENTS.find(e => e.slug === slug) ?? DEMO_EVENTS[0];

    const [viewerCount] = useState(() => Math.floor(Math.random() * 60) + 12);
    const [reactions, setReactions] = useState<{ emoji: string; id: number; x: number }[]>([]);
    const [messages, setMessages] = useState([
        { name: 'Meera Aunty', text: 'So beautiful! Joining from Dubai ❤️', time: '9:32' },
        { name: 'Karan Bhai', text: 'Congratulations Rahul! 🎊', time: '9:33' },
    ]);
    const [name, setName] = useState('');
    const [msg, setMsg] = useState('');
    const [nameSet, setNameSet] = useState(false);

    const sendReaction = (emoji: string) => {
        const r = { emoji, id: Date.now(), x: 20 + Math.random() * 60 };
        setReactions(p => [...p, r]);
        setTimeout(() => setReactions(p => p.filter(x => x.id !== r.id)), 3000);
    };

    const sendMsg = () => {
        if (!msg.trim() || !nameSet) return;
        setMessages(p => [...p, { name, text: msg, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
        setMsg('');
    };

    return (
        <div style={{ minHeight: '100dvh', background: '#000', display: 'flex', flexDirection: 'column' }}>

            {/* Live video area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '50vh' }}>
                {/* Simulated live stream background */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(160deg, #0d050a 0%, #0a0d1a 40%, #050d08 100%)',
                }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Radio size={28} style={{ color: '#F87171' }} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 300, color: 'rgba(255,255,255,0.5)' }}>
                        Stream starting soon
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>The photographer will begin shortly</div>
                </div>

                {/* HUD overlays */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
                    <Link href={`/wedding/${slug}`} style={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13 }}>
                        <ArrowLeft size={16} /> Gallery
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                            <Eye size={11} />{viewerCount}
                        </div>
                        <div style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', animation: 'livePulse 1s ease-in-out infinite' }} />
                            LIVE
                        </div>
                    </div>
                </div>

                {/* Event info at bottom */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '40px 16px 16px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
                }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, color: 'rgba(255,255,255,0.85)' }}>
                        {event.groomName} &amp; {event.brideName}
                    </div>
                    {event.location && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>{event.location}</div>}
                </div>

                {/* Floating reactions */}
                {reactions.map(r => (
                    <div key={r.id} style={{ position: 'absolute', bottom: 80, left: `${r.x}%`, fontSize: 28, animation: 'floatUp 3s ease-out forwards', pointerEvents: 'none' }}>
                        {r.emoji}
                    </div>
                ))}
                <style>{`
          @keyframes floatUp{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-150px)}}
          @keyframes livePulse{0%,100%{opacity:1}50%{opacity:0.3}}
        `}</style>
            </div>

            {/* Reactions + chat */}
            <div style={{ background: 'var(--charcoal)', borderTop: '1px solid rgba(255,255,255,0.08)', maxHeight: '40dvh', display: 'flex', flexDirection: 'column' }}>
                {/* Emoji buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {EMOJIS.map(e => (
                        <button key={e} onClick={() => sendReaction(e)} style={{
                            fontSize: 22, background: 'rgba(255,255,255,0.06)', border: 'none',
                            borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s, transform 0.1s',
                        }}
                            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
                            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {e}
                        </button>
                    ))}
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <AnimatePresence initial={false}>
                        {messages.map((m, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-frost)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--gold)', flexShrink: 0, fontWeight: 600 }}>
                                    {m.name[0]}
                                </div>
                                <div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginRight: 6 }}>{m.name}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.text}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Name prompt + input */}
                {!nameSet ? (
                    <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name to join chat..."
                            style={{ flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 13, outline: 'none' }} />
                        <button onClick={() => name.trim() && setNameSet(true)} style={{ padding: '9px 16px', background: 'var(--gold)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--obsidian)', fontWeight: 600, fontSize: 13 }}>
                            Join
                        </button>
                    </div>
                ) : (
                    <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
                        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Write a message..."
                            style={{ flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 13, outline: 'none' }} />
                        <button onClick={sendMsg} style={{ padding: '9px 12px', background: 'var(--gold)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--obsidian)', display: 'flex', alignItems: 'center' }}>
                            <Send size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
