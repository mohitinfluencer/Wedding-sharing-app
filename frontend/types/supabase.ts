export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            albums: {
                Row: {
                    cover_image: string | null
                    created_at: string
                    event_id: string
                    id: string
                    order_index: number
                    title: string
                    updated_at: string
                }
                Insert: {
                    cover_image?: string | null
                    created_at?: string
                    event_id: string
                    id?: string
                    order_index?: number
                    title: string
                    updated_at?: string
                }
                Update: {
                    cover_image?: string | null
                    created_at?: string
                    event_id?: string
                    id?: string
                    order_index?: number
                    title?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "albums_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                ]
            }
            analytics: {
                Row: {
                    created_at: string
                    event_id: string
                    id: string
                    metadata: Json | null
                    type: string
                }
                Insert: {
                    created_at?: string
                    event_id: string
                    id?: string
                    metadata?: Json | null
                    type: string
                }
                Update: {
                    created_at?: string
                    event_id?: string
                    id?: string
                    metadata?: Json | null
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "analytics_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                ]
            }
            events: {
                Row: {
                    bride_name: string
                    cover_image: string | null
                    created_at: string
                    end_date: string | null
                    groom_name: string
                    id: string
                    location: string | null
                    password_hash: string | null
                    slug: string
                    start_date: string | null
                    studio_id: string
                    theme: string | null
                    updated_at: string
                    view_count: number
                    visibility: Database["public"]["Enums"]["Visibility"]
                    youtube_live_id: string | null
                    youtube_video_id: string | null
                }
                Insert: {
                    bride_name: string
                    cover_image?: string | null
                    created_at?: string
                    end_date?: string | null
                    groom_name: string
                    id?: string
                    location?: string | null
                    password_hash?: string | null
                    slug: string
                    start_date?: string | null
                    studio_id: string
                    theme?: string | null
                    updated_at?: string
                    view_count?: number
                    visibility?: Database["public"]["Enums"]["Visibility"]
                    youtube_live_id?: string | null
                    youtube_video_id?: string | null
                }
                Update: {
                    bride_name?: string
                    cover_image?: string | null
                    created_at?: string
                    end_date?: string | null
                    groom_name?: string
                    id?: string
                    location?: string | null
                    password_hash?: string | null
                    slug?: string
                    start_date?: string | null
                    studio_id?: string
                    theme?: string | null
                    updated_at?: string
                    view_count?: number
                    visibility?: Database["public"]["Enums"]["Visibility"]
                    youtube_live_id?: string | null
                    youtube_video_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "events_studio_id_fkey"
                        columns: ["studio_id"]
                        isOneToOne: false
                        referencedRelation: "studios"
                        referencedColumns: ["id"]
                    },
                ]
            }
            guest_uploads: {
                Row: {
                    approved: boolean
                    created_at: string
                    event_id: string
                    guest_name: string
                    guest_note: string | null
                    id: string
                    media_id: string
                }
                Insert: {
                    approved?: boolean
                    created_at?: string
                    event_id: string
                    guest_name: string
                    guest_note?: string | null
                    id?: string
                    media_id: string
                }
                Update: {
                    approved?: boolean
                    created_at?: string
                    event_id?: string
                    guest_name?: string
                    guest_note?: string | null
                    id?: string
                    media_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "guest_uploads_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "guest_uploads_media_id_fkey"
                        columns: ["media_id"]
                        isOneToOne: true
                        referencedRelation: "media"
                        referencedColumns: ["id"]
                    },
                ]
            }
            media: {
                Row: {
                    album_id: string | null
                    created_at: string
                    description: string | null
                    duration: number | null
                    event_id: string
                    height: number | null
                    hidden: boolean
                    highlight: boolean
                    id: string
                    provider: Database["public"]["Enums"]["MediaProvider"]
                    provider_id: string
                    size: number | null
                    status: Database["public"]["Enums"]["MediaStatus"]
                    thumbnail_url: string | null
                    title: string | null
                    type: Database["public"]["Enums"]["MediaType"]
                    updated_at: string
                    uploader_type: Database["public"]["Enums"]["UploaderType"]
                    url: string
                    width: number | null
                }
                Insert: {
                    album_id?: string | null
                    created_at?: string
                    description?: string | null
                    duration?: number | null
                    event_id: string
                    height?: number | null
                    hidden?: boolean
                    highlight?: boolean
                    id?: string
                    provider: Database["public"]["Enums"]["MediaProvider"]
                    provider_id: string
                    size?: number | null
                    status?: Database["public"]["Enums"]["MediaStatus"]
                    thumbnail_url?: string | null
                    title?: string | null
                    type: Database["public"]["Enums"]["MediaType"]
                    updated_at?: string
                    uploader_type?: Database["public"]["Enums"]["UploaderType"]
                    url: string
                    width?: number | null
                }
                Update: {
                    album_id?: string | null
                    created_at?: string
                    description?: string | null
                    duration?: number | null
                    event_id?: string
                    height?: number | null
                    hidden?: boolean
                    highlight?: boolean
                    id?: string
                    provider?: Database["public"]["Enums"]["MediaProvider"]
                    provider_id?: string
                    size?: number | null
                    status?: Database["public"]["Enums"]["MediaStatus"]
                    thumbnail_url?: string | null
                    title?: string | null
                    type?: Database["public"]["Enums"]["MediaType"]
                    updated_at?: string
                    uploader_type?: Database["public"]["Enums"]["UploaderType"]
                    url?: string
                    width?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "media_album_id_fkey"
                        columns: ["album_id"]
                        isOneToOne: false
                        referencedRelation: "albums"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "media_event_id_fkey"
                        columns: ["event_id"]
                        isOneToOne: false
                        referencedRelation: "events"
                        referencedColumns: ["id"]
                    },
                ]
            }
            studios: {
                Row: {
                    brand_color: string | null
                    created_at: string
                    custom_domain: string | null
                    id: string
                    logo: string | null
                    owner_user_id: string
                    studio_name: string
                    updated_at: string
                }
                Insert: {
                    brand_color?: string | null
                    created_at?: string
                    custom_domain?: string | null
                    id?: string
                    logo?: string | null
                    owner_user_id: string
                    studio_name: string
                    updated_at?: string
                }
                Update: {
                    brand_color?: string | null
                    created_at?: string
                    custom_domain?: string | null
                    id?: string
                    logo?: string | null
                    owner_user_id?: string
                    studio_name?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "studios_owner_user_id_fkey"
                        columns: ["owner_user_id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            users: {
                Row: {
                    avatar: string | null
                    created_at: string
                    email: string
                    id: string
                    name: string
                    password_hash: string | null
                    role: Database["public"]["Enums"]["Role"]
                    studio_id: string | null
                    updated_at: string
                }
                Insert: {
                    avatar?: string | null
                    created_at?: string
                    email: string
                    id: string
                    name: string
                    password_hash?: string | null
                    role?: Database["public"]["Enums"]["Role"]
                    studio_id?: string | null
                    updated_at?: string
                }
                Update: {
                    avatar?: string | null
                    created_at?: string
                    email?: string
                    id?: string
                    name?: string
                    password_hash?: string | null
                    role?: Database["public"]["Enums"]["Role"]
                    studio_id?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "users_studio_id_fkey"
                        columns: ["studio_id"]
                        isOneToOne: false
                        referencedRelation: "studios"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            increment_event_view: { Args: { event_id: string }; Returns: undefined }
        }
        Enums: {
            MediaProvider: "cloudinary" | "vimeo" | "youtube"
            MediaStatus: "processing" | "ready" | "failed"
            MediaType: "photo" | "video"
            Role:
            | "platform_admin"
            | "photographer"
            | "studio_staff"
            | "couple"
            | "guest"
            UploaderType: "photographer" | "guest"
            Visibility: "public" | "private" | "password"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
