import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async track(eventId: string, type: string, metadata?: object) {
        return this.prisma.analytics.create({
            data: { eventId, type, metadata },
        });
    }

    async getEventAnalytics(eventId: string, userId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { studio: true },
        });
        if (!event || event.studio.ownerUserId !== userId) return null;

        const [views, uploads, videoPlays, shares, mediaCount, guestCount] = await Promise.all([
            this.prisma.analytics.count({ where: { eventId, type: 'view' } }),
            this.prisma.analytics.count({ where: { eventId, type: 'upload' } }),
            this.prisma.analytics.count({ where: { eventId, type: 'video_play' } }),
            this.prisma.analytics.count({ where: { eventId, type: 'share' } }),
            this.prisma.media.count({ where: { eventId, hidden: false } }),
            this.prisma.guestUpload.count({ where: { eventId, approved: true } }),
        ]);

        return {
            eventId,
            stats: { views, uploads, videoPlays, shares, mediaCount, guestCount },
            viewCount: event.viewCount,
        };
    }

    async getStudioAnalytics(userId: string) {
        const studio = await this.prisma.studio.findFirst({ where: { ownerUserId: userId } });
        if (!studio) return null;

        const events = await this.prisma.event.findMany({
            where: { studioId: studio.id },
            select: { id: true, slug: true, brideName: true, groomName: true, viewCount: true },
        });

        const totalViews = events.reduce((sum, e) => sum + e.viewCount, 0);
        const totalMedia = await this.prisma.media.count({
            where: { event: { studioId: studio.id } },
        });
        const totalGuests = await this.prisma.guestUpload.count({
            where: { event: { studioId: studio.id }, approved: true },
        });

        return {
            studioId: studio.id,
            eventCount: events.length,
            totalViews,
            totalMedia,
            totalGuests,
            topEvents: events.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5),
        };
    }
}
