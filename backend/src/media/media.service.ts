import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MediaType, MediaProvider, UploaderType } from '@prisma/client';

@Injectable()
export class MediaService {
    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
        private realtime: RealtimeGateway,
        @InjectQueue('media-processing') private mediaQueue: Queue,
    ) { }

    async initUpload(userId: string, eventId: string, albumId?: string) {
        await this.assertEventOwner(eventId, userId);
        return this.cloudinary.generateSignedUploadParams(eventId, albumId);
    }

    async completeUpload(
        userId: string,
        dto: {
            eventId: string;
            albumId?: string;
            providerId: string;
            url: string;
            thumbnailUrl?: string;
            width?: number;
            height?: number;
            size?: number;
            type?: 'photo' | 'video';
        },
    ) {
        await this.assertEventOwner(dto.eventId, userId);

        const thumbnailUrl =
            dto.thumbnailUrl ||
            (dto.type !== 'video'
                ? this.cloudinary.generateThumbnailUrl(dto.providerId)
                : undefined);

        const media = await this.prisma.media.create({
            data: {
                eventId: dto.eventId,
                albumId: dto.albumId,
                type: (dto.type === 'video' ? MediaType.video : MediaType.photo),
                provider: MediaProvider.cloudinary,
                providerId: dto.providerId,
                url: dto.url,
                thumbnailUrl,
                width: dto.width,
                height: dto.height,
                size: dto.size,
                uploaderType: UploaderType.photographer,
                status: 'ready',
            },
        });

        // Emit realtime event
        const event = await this.prisma.event.findUnique({ where: { id: dto.eventId } });
        if (event) {
            this.realtime.emitToEvent(event.slug, 'media_added', { media });
        }

        // Queue thumbnail regeneration
        await this.mediaQueue.add('process-image', { mediaId: media.id, providerId: dto.providerId });

        return media;
    }

    async getMediaForEvent(eventId: string, albumId?: string, page = 1, limit = 50) {
        const where: any = { eventId, hidden: false, status: 'ready' };
        if (albumId) where.albumId = albumId;

        const [total, media] = await Promise.all([
            this.prisma.media.count({ where }),
            this.prisma.media.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        return { media, total, page, limit, pages: Math.ceil(total / limit) };
    }

    async getMediaForPhotographer(eventId: string, userId: string) {
        await this.assertEventOwner(eventId, userId);
        return this.prisma.media.findMany({
            where: { eventId },
            include: { album: true, guestUpload: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateMedia(
        id: string,
        userId: string,
        data: Partial<{ hidden: boolean; highlight: boolean; albumId: string; title: string }>,
    ) {
        const media = await this.prisma.media.findUnique({
            where: { id },
            include: { event: { include: { studio: true } } },
        });
        if (!media) throw new NotFoundException('Media not found');
        if (media.event.studio.ownerUserId !== userId) throw new ForbiddenException();

        const updated = await this.prisma.media.update({ where: { id }, data });

        // Emit update
        this.realtime.emitToEvent(media.event.slug, 'media_updated', {
            mediaId: id,
            changes: data,
        });

        return updated;
    }

    async deleteMedia(id: string, userId: string) {
        const media = await this.prisma.media.findUnique({
            where: { id },
            include: { event: { include: { studio: true } } },
        });
        if (!media) throw new NotFoundException('Media not found');
        if (media.event.studio.ownerUserId !== userId) throw new ForbiddenException();

        await this.cloudinary.deleteMedia(media.providerId);
        await this.prisma.media.delete({ where: { id } });
        return { message: 'Media deleted' };
    }

    async getHighlights(eventId: string) {
        return this.prisma.media.findMany({
            where: { eventId, highlight: true, hidden: false, status: 'ready' },
            orderBy: { createdAt: 'desc' },
        });
    }

    private async assertEventOwner(eventId: string, userId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { studio: true },
        });
        if (!event) throw new NotFoundException('Event not found');
        if (event.studio.ownerUserId !== userId) throw new ForbiddenException('Not your event');
    }
}
