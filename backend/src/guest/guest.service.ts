import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../media/cloudinary.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MediaType, MediaProvider, UploaderType, MediaStatus } from '@prisma/client';

@Injectable()
export class GuestService {
    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
        private realtime: RealtimeGateway,
    ) { }

    async initGuestUpload(eventSlug: string) {
        const event = await this.prisma.event.findUnique({ where: { slug: eventSlug } });
        if (!event) throw new NotFoundException('Event not found');
        if (event.visibility === 'private') throw new ForbiddenException('This event is private');

        return this.cloudinary.generateSignedUploadParams(event.id);
    }

    async completeGuestUpload(dto: {
        eventSlug: string;
        guestName: string;
        guestNote?: string;
        providerId: string;
        url: string;
        thumbnailUrl?: string;
        width?: number;
        height?: number;
    }) {
        if (!dto.guestName?.trim()) throw new BadRequestException('Guest name is required');

        const event = await this.prisma.event.findUnique({ where: { slug: dto.eventSlug } });
        if (!event) throw new NotFoundException('Event not found');
        if (event.visibility === 'private') throw new ForbiddenException('This event is private');

        const thumbnailUrl =
            dto.thumbnailUrl || this.cloudinary.generateThumbnailUrl(dto.providerId, 400, 300);

        const media = await this.prisma.media.create({
            data: {
                eventId: event.id,
                type: MediaType.photo,
                provider: MediaProvider.cloudinary,
                providerId: dto.providerId,
                url: dto.url,
                thumbnailUrl,
                width: dto.width,
                height: dto.height,
                uploaderType: UploaderType.guest,
                hidden: true, // hidden until approved
                status: MediaStatus.ready,
            },
        });

        const guestUpload = await this.prisma.guestUpload.create({
            data: {
                eventId: event.id,
                mediaId: media.id,
                guestName: dto.guestName.trim(),
                guestNote: dto.guestNote,
                approved: false,
            },
        });

        // Notify photographer via realtime
        this.realtime.emitToEvent(event.slug, 'guest_upload_pending', {
            guestUpload: { ...guestUpload, media },
        });

        return { message: 'Upload received! The photographer will review your photo.', mediaId: media.id };
    }

    async getPendingUploads(eventId: string, userId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { studio: true },
        });
        if (!event) throw new NotFoundException('Event not found');
        if (event.studio.ownerUserId !== userId) throw new ForbiddenException();

        return this.prisma.guestUpload.findMany({
            where: { eventId, approved: false },
            include: { media: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async approveUpload(uploadId: string, userId: string) {
        const upload = await this.prisma.guestUpload.findUnique({
            where: { id: uploadId },
            include: { event: { include: { studio: true } }, media: true },
        });
        if (!upload) throw new NotFoundException('Upload not found');
        if (upload.event.studio.ownerUserId !== userId) throw new ForbiddenException();

        const [guestUpload] = await Promise.all([
            this.prisma.guestUpload.update({ where: { id: uploadId }, data: { approved: true } }),
            this.prisma.media.update({ where: { id: upload.mediaId }, data: { hidden: false } }),
        ]);

        // Emit new media to all event viewers
        this.realtime.emitToEvent(upload.event.slug, 'media_added', { media: upload.media });

        return guestUpload;
    }

    async rejectUpload(uploadId: string, userId: string) {
        const upload = await this.prisma.guestUpload.findUnique({
            where: { id: uploadId },
            include: { event: { include: { studio: true } } },
        });
        if (!upload) throw new NotFoundException('Upload not found');
        if (upload.event.studio.ownerUserId !== userId) throw new ForbiddenException();

        await this.prisma.media.delete({ where: { id: upload.mediaId } });
        return { message: 'Upload rejected and removed' };
    }

    async getApprovedGuestUploads(eventSlug: string) {
        const event = await this.prisma.event.findUnique({ where: { slug: eventSlug } });
        if (!event) throw new NotFoundException('Event not found');

        return this.prisma.guestUpload.findMany({
            where: { eventId: event.id, approved: true },
            include: { media: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
