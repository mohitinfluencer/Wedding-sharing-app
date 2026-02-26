import axios from 'axios';
import { supabase } from './supabase';

// ─── Helper for calling Supabase Edge Functions ───────────────────
const invokeFunc = async (name: string, body: any) => {
    const { data, error } = await supabase.functions.invoke(name, { body });
    if (error) throw error;
    return data;
};

// ─── Auth ────────────────────────────────────────────────────────
// (Most auth is handle by useAuthStore directly via supabase.auth)
export const authApi = {
    // These are placeholders if we need specific Edge Functions for onboarding
    onboardStudio: (data: { studioName: string }) => invokeFunc('onboard-studio', data),
};

const normalizeEvent = (e: any) => {
    if (!e) return e;
    return {
        ...e,
        brideName: e.bride_name !== undefined ? e.bride_name : e.brideName,
        groomName: e.groom_name !== undefined ? e.groom_name : e.groomName,
        startDate: e.start_date !== undefined ? e.start_date : e.startDate,
        endDate: e.end_date !== undefined ? e.end_date : e.endDate,
        viewCount: e.view_count !== undefined ? e.view_count : e.viewCount,
        coverImage: e.cover_image !== undefined ? e.cover_image : e.coverImage,
        youtubeVideoId: e.youtube_video_id !== undefined ? e.youtube_video_id : e.youtubeVideoId,
        youtubeLiveId: e.youtube_live_id !== undefined ? e.youtube_live_id : e.youtubeLiveId,
        _count: {
            media: (e.media?.[0]?.count !== undefined) ? e.media[0].count : (e._count?.media ?? 0),
            guestUploads: (e.guest_uploads?.[0]?.count !== undefined) ? e.guest_uploads[0].count : (e._count?.guestUploads ?? e._count?.guest_uploads ?? 0),
        }
    };
};

// ─── Studio ──────────────────────────────────────────────────────
export const studioApi = {
    getMyStudio: async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return null;
        const { data } = await supabase.from('studios').select('*, events(*)').eq('owner_user_id', user.user.id).single();
        return data;
    },
    getEvents: async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return [];
        const { data: studio } = await supabase.from('studios').select('id').eq('owner_user_id', user.user.id).single();
        if (!studio) return [];
        const { data, error } = await supabase
            .from('events')
            .select(`
                id, slug, bride_name, groom_name, location, start_date, end_date,
                visibility, view_count, cover_image, theme, created_at,
                youtube_video_id, youtube_live_id,
                media:media(count),
                guest_uploads:guest_uploads(count)
            `)
            .eq('studio_id', studio.id)
            .order('created_at', { ascending: false });
        if (error) { console.error('getEvents error:', error); return []; }
        return (data || []).map(normalizeEvent);
    },
    getStats: async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return { eventCount: 0, mediaCount: 0, guestUploadCount: 0, viewCount: 0 };
        const { data: studio } = await supabase.from('studios').select('id').eq('owner_user_id', user.user.id).single();
        if (!studio) return { eventCount: 0, mediaCount: 0, guestUploadCount: 0, viewCount: 0 };

        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('id, view_count')
            .eq('studio_id', studio.id);

        if (eventsError) throw eventsError;

        const eventIds = events?.map(e => e.id) || [];
        let mediaCount = 0, guestCount = 0;

        if (eventIds.length > 0) {
            const [m, g] = await Promise.all([
                supabase.from('media').select('*', { count: 'exact', head: true }).in('event_id', eventIds),
                supabase.from('guest_uploads').select('*', { count: 'exact', head: true }).in('event_id', eventIds),
            ]);
            mediaCount = m.count ?? 0;
            guestCount = g.count ?? 0;
        }

        const viewCount = events?.reduce((sum, e) => sum + (e.view_count ?? 0), 0) ?? 0;

        return {
            eventCount: events?.length ?? 0,
            mediaCount,
            guestUploadCount: guestCount,
            viewCount,
        };
    },
    update: async (data: any) => {
        const { data: user } = await supabase.auth.getUser();
        const { data: updated } = await supabase.from('studios').update(data).eq('owner_user_id', user.user?.id).select().single();
        return updated;
    },
};

// ─── Events ──────────────────────────────────────────────────────
export const eventsApi = {
    create: async (data: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: studio } = await supabase.from('studios').select('id').eq('owner_user_id', user.id).single();
        if (!studio) throw new Error('Please set up your studio profile first');

        const slug = `${data.groomName}-${data.brideName}-${new Date().getFullYear()}`
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            + `-${Date.now().toString(36)}`; // unique suffix

        const { data: event, error } = await supabase.from('events').insert({
            studio_id: studio.id,
            slug,
            bride_name: data.brideName,
            groom_name: data.groomName,
            location: data.location || null,
            start_date: data.startDate || null,
            end_date: data.endDate || null,
            visibility: data.visibility || 'public',
            password_hash: data.password || null,
            theme: data.theme || 'classic'
        }).select().single();

        if (error) { console.error('Create event error:', error); throw new Error(error.message); }
        return normalizeEvent(event);
    },
    getAll: async () => {
        const { data } = await supabase.from('events').select('*, studio:studios(studio_name, brand_color)').order('created_at', { ascending: false });
        return (data || []).map(normalizeEvent);
    },
    getById: async (id: string) => {
        const { data } = await supabase.from('events').select('*, studio:studios(*), albums(*)').eq('id', id).single();
        return normalizeEvent(data);
    },
    getBySlug: async (slug: string, password?: string) => {
        const data = await invokeFunc('get-event-public', { slug, password });
        return normalizeEvent(data);
    },
    update: async (id: string, data: any) => {
        const { data: event } = await supabase.from('events').update(data).eq('id', id).select().single();
        return normalizeEvent(event);
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },
};

// ─── Albums ──────────────────────────────────────────────────────
export const albumsApi = {
    create: async (eventId: string, data: { title: string; orderIndex?: number }) => {
        const { data: album } = await supabase.from('albums').insert({ ...data, event_id: eventId }).select().single();
        return album;
    },
    getAll: async (eventId: string) => {
        const { data } = await supabase.from('albums').select('*, _count: media(count)').eq('event_id', eventId).order('order_index');
        return data;
    },
    update: async (eventId: string, albumId: string, data: any) => {
        const { data: album } = await supabase.from('albums').update(data).eq('id', albumId).select().single();
        return album;
    },
    delete: async (eventId: string, albumId: string) => {
        await supabase.from('albums').delete().eq('id', albumId);
        return { success: true };
    },
};

// ─── Media ───────────────────────────────────────────────────────
export const mediaApi = {
    initUpload: async (eventId: string, albumId?: string) => {
        // Use direct Cloudinary unsigned upload - bypasses Edge Function auth issues
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'wedding_upload';
        return {
            uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            uploadPreset,
            folder: `weddings/${eventId}${albumId ? `/${albumId}` : ''}`,
            apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
            // No signature needed for unsigned uploads
            signature: null,
            timestamp: null,
        };
    },

    completeUpload: async (data: any) => {
        // Map camelCase to snake_case for the database
        const { data: media, error } = await supabase.from('media').insert({
            event_id: data.eventId,
            album_id: data.albumId || null,
            provider_id: data.providerId,
            provider: 'cloudinary',
            url: data.url,
            thumbnail_url: data.thumbnailUrl || data.url,
            width: data.width,
            height: data.height,
            type: data.type === 'video' ? 'video' : 'photo',
            uploader_type: 'photographer',
        }).select().single();
        if (error) throw error;
        return media;
    },

    getEventMedia: async (eventId: string, albumId?: string, page = 1) => {
        let query = supabase.from('media').select('*').eq('event_id', eventId);
        if (albumId && albumId !== 'all') query = query.eq('album_id', albumId);
        const { data } = await query.order('created_at', { ascending: false });
        return data;
    },

    getForManagement: async (eventId: string) => {
        const { data } = await supabase.from('media').select('*').eq('event_id', eventId).order('created_at', { ascending: false });
        return data;
    },

    getHighlights: async (eventId: string) => {
        const { data } = await supabase.from('media').select('*').eq('event_id', eventId).eq('highlight', true).order('created_at', { ascending: false });
        return data;
    },

    update: async (id: string, data: any) => {
        const { data: media } = await supabase.from('media').update(data).eq('id', id).select().single();
        return media;
    },
    delete: async (id: string) => {
        await supabase.from('media').delete().eq('id', id);
        return { success: true };
    },

    uploadToCloudinary: async (
        file: File,
        uploadParams: {
            uploadUrl: string;
            uploadPreset?: string;
            signature?: string | null;
            timestamp?: number | null;
            apiKey?: string;
            folder: string;
        },
        onProgress?: (percent: number) => void,
    ) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', uploadParams.folder);

        if (uploadParams.uploadPreset) {
            // Unsigned upload (recommended for direct browser uploads)
            formData.append('upload_preset', uploadParams.uploadPreset);
        } else if (uploadParams.signature && uploadParams.timestamp && uploadParams.apiKey) {
            // Signed upload (fallback)
            formData.append('signature', uploadParams.signature);
            formData.append('timestamp', String(uploadParams.timestamp));
            formData.append('api_key', uploadParams.apiKey);
        }

        const response = await axios.post(uploadParams.uploadUrl, formData, {
            onUploadProgress: (e) => {
                if (onProgress && e.total) {
                    onProgress(Math.round((e.loaded * 100) / e.total));
                }
            },
        });
        return response.data;
    },
};

// ─── Guest Uploads ────────────────────────────────────────────────
export const guestApi = {
    initUpload: (slug: string) => invokeFunc('guest-init-upload', { slug }),

    completeUpload: async (slug: string, data: any) => invokeFunc('guest-complete-upload', { slug, ...data }),

    getApproved: async (slug: string) => {
        const { data: event } = await supabase.from('events').select('id').eq('slug', slug).single();
        const { data } = await supabase.from('guest_uploads').select('*, media(*)').eq('event_id', event?.id).eq('approved', true);
        return data?.map(gu => gu.media);
    },

    getPending: async (eventId: string) => {
        const { data } = await supabase.from('guest_uploads').select('*, media(*)').eq('event_id', eventId).eq('approved', false);
        return data;
    },

    approve: async (id: string) => {
        const { data } = await supabase.from('guest_uploads').update({ approved: true }).eq('id', id).select().single();
        return data;
    },
    reject: async (id: string) => {
        const { error } = await supabase.from('guest_uploads').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    },
};

// ─── YouTube Video & Live ──────────────────────────────────────────
export const youtubeApi = {
    attachVideo: async (eventId: string, youtubeUrl: string) => {
        const videoId = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/)?.[1];
        if (!videoId) throw new Error('Invalid YouTube URL');
        const { data } = await supabase.from('events').update({ youtube_video_id: videoId }).eq('id', eventId).select().single();
        return data;
    },
    attachLive: async (eventId: string, youtubeUrl: string) => {
        const liveId = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/))([\w-]{11})/)?.[1];
        if (!liveId) throw new Error('Invalid YouTube URL');
        const { data } = await supabase.from('events').update({ youtube_live_id: liveId }).eq('id', eventId).select().single();
        return data;
    }
};

// ─── QR ──────────────────────────────────────────────────────────
export const qrApi = {
    getDataUrl: async (slug: string) => {
        // We can generate QR in frontend using 'qrcode' lib
        const QRCode = await import('qrcode');
        const url = `${window.location.origin}/wedding/${slug}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2 });
        return { dataUrl };
    },
};

// ─── Analytics ───────────────────────────────────────────────────
export const analyticsApi = {
    track: async (eventId: string, type: string, metadata?: object) => {
        await supabase.from('analytics').insert({ event_id: eventId, type, metadata });
    },
    getEvent: async (eventId: string) => {
        const { data } = await supabase.from('analytics').select('*').eq('event_id', eventId);
        return data;
    },
    getStudio: async () => invokeFunc('get-studio-analytics', {}),
};
