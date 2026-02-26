'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Calendar, Image, Eye, Users, Search } from 'lucide-react';
import { studioApi } from '@/lib/api';
import { useAuthStore, DEMO_EVENTS } from '@/lib/auth-store';
import toast from 'react-hot-toast';

interface Event {
    id: string; slug: string; brideName: string; groomName: string;
    coverImage?: string; startDate?: string; location?: string;
    visibility: string; viewCount: number; createdAt: string;
    _count: { media: number; guestUploads: number };
}

export default function EventsListPage() {
    const { isDemoMode } = useAuthStore();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isDemoMode) {
            setEvents(DEMO_EVENTS as any);
            setLoading(false);
            return;
        }
        studioApi.getEvents()
            .then(setEvents)
            .catch(() => toast.error('Failed to load events'))
            .finally(() => setLoading(false));
    }, [isDemoMode]);

    const filtered = events.filter((e) => {
        const q = search.toLowerCase();
        return (
            e.brideName.toLowerCase().includes(q) ||
            e.groomName.toLowerCase().includes(q) ||
            e.location?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-1">All Weddings</h1>
                    <p className="text-white/40 text-sm">{events.length} wedding{events.length !== 1 ? 's' : ''} total</p>
                </div>
                <Link href="/dashboard/events/new" className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Wedding
                </Link>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or location..."
                    className="input-dark pl-10 pr-4 py-2.5 text-sm"
                    id="events-search"
                />
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40">
                        {search ? 'No weddings match your search' : 'No weddings yet'}
                    </p>
                    {!search && (
                        <Link href="/dashboard/events/new" className="btn-gold px-6 py-2.5 rounded-xl text-sm mt-6 inline-block">
                            Create First Wedding
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((event, i) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                        >
                            <Link href={`/dashboard/events/${event.id}`}>
                                <div className="card-dark p-4 flex items-center gap-4 hover:border-gold-400/20 transition-all">
                                    <div
                                        className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden"
                                        style={{
                                            background: event.coverImage
                                                ? `url(${event.coverImage}) center/cover`
                                                : `linear-gradient(135deg, hsl(${30 + i * 40}, 40%, 12%), hsl(${50 + i * 30}, 30%, 18%))`,
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm mb-1">
                                            {event.groomName} & {event.brideName}
                                        </h3>
                                        <p className="text-xs text-white/40 truncate">{event.location || 'No location set'}</p>
                                    </div>
                                    <div className="hidden md:flex items-center gap-6 text-xs text-white/40">
                                        <span className="flex items-center gap-1">
                                            <Image className="w-3.5 h-3.5" />{event._count.media}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />{event._count.guestUploads}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3.5 h-3.5" />{event.viewCount}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${event.visibility === 'public' ? 'bg-green-500/20 text-green-400' :
                                                event.visibility === 'private' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-gold-500/20 text-gold-400'
                                            }`}>
                                            {event.visibility}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
