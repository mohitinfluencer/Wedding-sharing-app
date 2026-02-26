'use client';

import { useState } from 'react';
import { Download, CloudDownload, Check, Loader2, FileArchive, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import toast from 'react-hot-toast';

interface Media {
    id: string;
    url: string;
    type: 'photo' | 'video';
}

interface MediaDownloadSystemProps {
    media?: Media; // For single download
    albumMedia?: Media[]; // For album download
    albumName?: string;
    variant?: 'button' | 'icon';
}

export default function MediaDownloadSystem({ media, albumMedia, albumName = 'Wedding', variant = 'button' }: MediaDownloadSystemProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);

    const getAttachmentUrl = (url: string) => {
        if (!url.includes('cloudinary.com')) return url;
        // Insert fl_attachment after /upload/
        return url.replace('/upload/', '/upload/fl_attachment/');
    };

    const handleSingleDownload = async () => {
        if (!media) return;
        setIsDownloading(true);
        try {
            const response = await fetch(media.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `wedding-${media.id}.${media.type === 'video' ? 'mp4' : 'jpg'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Download started');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Download failed. Try opening the image and saving it.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleAlbumDownload = async () => {
        if (!albumMedia || albumMedia.length === 0) return;
        setIsDownloading(true);
        setProgress(0);
        const zip = new JSZip();
        const toastId = toast.loading(`Preparing ${albumMedia.length} files...`);

        try {
            const mediaFolder = zip.folder(albumName);

            for (let i = 0; i < albumMedia.length; i++) {
                const item = albumMedia[i];
                try {
                    const response = await fetch(item.url);
                    const blob = await response.blob();
                    const ext = item.type === 'video' ? 'mp4' : 'jpg';
                    mediaFolder?.file(`${albumName.toLowerCase()}-${i + 1}-${item.id}.${ext}`, blob);
                } catch (e) {
                    console.error(`Failed to download ${item.url}`, e);
                }
                setProgress(Math.round(((i + 1) / albumMedia.length) * 100));
            }

            const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
                // This is for the ZIP generation progress if needed
            });

            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${albumName.replace(/\s+/g, '_')}_Collection.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.dismiss(toastId);
            toast.success('Album ZIP ready!');
        } catch (error) {
            console.error('ZIP creation failed:', error);
            toast.dismiss(toastId);
            toast.error('Failed to create ZIP');
        } finally {
            setIsDownloading(false);
            setProgress(0);
        }
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleSingleDownload();
                }}
                disabled={isDownloading}
                className="p-2 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-110 active:scale-95 group relative"
                title="Download high-res"
            >
                {isDownloading ? (
                    <Loader2 size={16} className="animate-spin text-gold" />
                ) : (
                    <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                )}
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={handleAlbumDownload}
                disabled={isDownloading}
                className="flex items-center gap-3 px-6 py-3 bg-[#C9974A] hover:bg-[#E4B96A] text-[#0a0806] rounded-full font-bold transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {isDownloading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <FileArchive size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                )}
                <span>{isDownloading ? `Preparing... ${progress}%` : 'Download Full Album'}</span>

                {isDownloading && (
                    <div className="absolute bottom-0 left-0 h-1 bg-black/20 rounded-full overflow-hidden w-full m-0 p-0">
                        <motion.div
                            className="h-full bg-white"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </button>
        </div>
    );
}
