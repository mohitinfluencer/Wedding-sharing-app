import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    studioId?: string;
    avatar?: string;
    createdAt: string;
    isDemo?: boolean;
}

// ─── Demo mock data (kept for demo mode) ───────────────────────────────────
export const DEMO_USER: User = {
    id: 'demo-user-001',
    email: 'demo@studio.com',
    name: 'Rahul Sharma',
    role: 'photographer',
    studioId: 'demo-studio-001',
    createdAt: new Date().toISOString(),
    isDemo: true,
};

// ... (DEMO_EVENTS and DEMO_MEDIA constants remain same as before)
export const DEMO_EVENTS = [
    {
        id: 'demo-event-001',
        slug: 'rahul-priya-2026',
        brideName: 'Priya',
        groomName: 'Rahul',
        location: 'The Leela Palace, Mumbai',
        startDate: '2026-03-15T10:00:00Z',
        endDate: '2026-03-17T23:00:00Z',
        visibility: 'public',
        viewCount: 342,
        theme: 'classic',
        coverImage: '',
        studio: { studioName: 'Sharma Wedding Photography', brandColor: '#D4AF9A' },
        albums: [
            { id: 'alb-1', title: 'Haldi', orderIndex: 0, _count: { media: 12 } },
            { id: 'alb-2', title: 'Mehendi', orderIndex: 1, _count: { media: 8 } },
            { id: 'alb-3', title: 'Sangeet', orderIndex: 2, _count: { media: 24 } },
            { id: 'alb-4', title: 'Wedding', orderIndex: 3, _count: { media: 56 } },
            { id: 'alb-5', title: 'Reception', orderIndex: 4, _count: { media: 31 } },
        ],
        _count: { media: 131, guestUploads: 18 },
        createdAt: new Date().toISOString(),
    },
    {
        id: 'demo-event-002',
        slug: 'arjun-sneha-2026',
        brideName: 'Sneha',
        groomName: 'Arjun',
        location: 'Taj Hotel, Delhi',
        startDate: '2026-04-20T10:00:00Z',
        endDate: '2026-04-21T23:00:00Z',
        visibility: 'password',
        viewCount: 89,
        theme: 'modern',
        coverImage: '',
        studio: { studioName: 'Sharma Wedding Photography', brandColor: '#D4AF9A' },
        albums: [
            { id: 'alb-6', title: 'Pre-Wedding', orderIndex: 0, _count: { media: 15 } },
            { id: 'alb-7', title: 'Wedding', orderIndex: 1, _count: { media: 42 } },
        ],
        _count: { media: 57, guestUploads: 6 },
        createdAt: new Date().toISOString(),
    },
];

export const DEMO_MEDIA = [
    { id: 'm1', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', thumbnailUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400', type: 'photo', highlight: true, albumId: 'alb-4', hidden: false, uploaderType: 'photographer', status: 'ready' },
    { id: 'm2', url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800', thumbnailUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400', type: 'photo', highlight: false, albumId: 'alb-4', hidden: false, uploaderType: 'photographer', status: 'ready' },
];

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isDemoMode: boolean;

    login: (email: string, password: string) => Promise<void>;
    signup: (data: { email: string; name: string; password: string; studioName?: string }) => Promise<void>;
    loginAsDemo: () => void;
    logout: () => Promise<void>;
    hydrate: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            isDemoMode: false,

            login: async (email, password) => {
                set({ isLoading: true });
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) { set({ isLoading: false }); throw error; }

                if (data.user) {
                    // Fetch profile from public.users
                    const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).single();
                    set({
                        user: {
                            ...profile,
                            email: data.user.email!,
                            id: data.user.id
                        },
                        isLoading: false,
                        isDemoMode: false
                    });
                }
            },

            signup: async (dto) => {
                set({ isLoading: true });
                const { data, error } = await supabase.auth.signUp({
                    email: dto.email,
                    password: dto.password,
                    options: {
                        data: {
                            name: dto.name,
                            studio_name: dto.studioName
                        }
                    }
                });
                if (error) { set({ isLoading: false }); throw error; }

                // Note: The public.users and public.studios records should be created 
                // via a Supabase Database Trigger on auth.users insert 
                // or via a call to a Supabase Edge Function here.

                if (data.user) {
                    set({
                        user: {
                            id: data.user.id,
                            email: dto.email,
                            name: dto.name,
                            role: 'photographer',
                            createdAt: new Date().toISOString()
                        },
                        isLoading: false,
                        isDemoMode: false
                    });
                }
            },

            loginAsDemo: () => {
                set({
                    user: DEMO_USER,
                    isDemoMode: true,
                    isLoading: false,
                });
            },

            logout: async () => {
                const { isDemoMode } = get();
                if (!isDemoMode) {
                    await supabase.auth.signOut();
                }
                set({ user: null, isDemoMode: false });
            },

            hydrate: async () => {
                const { isDemoMode } = get();
                if (isDemoMode) return;

                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
                    set({
                        user: {
                            ...profile,
                            email: session.user.email!,
                            id: session.user.id
                        }
                    });
                } else {
                    set({ user: null });
                }
            },

            setUser: (user) => set({ user }),
        }),
        {
            name: 'wedding-auth-v2',
            partialize: (state) => ({
                isDemoMode: state.isDemoMode,
                user: state.isDemoMode ? state.user : null,
            }),
        },
    ),
);
