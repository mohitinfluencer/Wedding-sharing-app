import {
    Injectable,
    Logger,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MediaType, MediaProvider, UploaderType, MediaStatus } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class VimeoService {
    private readonly logger = new Logger(VimeoService.name);

    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
        private realtime: RealtimeGateway,
    ) { }

    async attachVideo(
        eventId: string,
        userId: string,
        dto: {
            vimeoId: string;
            isHighlight?: boolean;
            albumId?: string;
            title?: string;
            description?: string;
        },
    ) {
        await this.assertEventOwner(eventId, userId);

        const vimeoData = await this.fetchVimeoMetadata(dto.vimeoId);

        const media = await this.prisma.media.create({
            data: {
                eventId,
                albumId: dto.albumId,
                type: MediaType.video,
                provider: MediaProvider.vimeo,
                providerId: dto.vimeoId,
                url: `https://vimeo.com/${dto.vimeoId}`,
                thumbnailUrl: vimeoData.thumbnail,
                title: dto.title || vimeoData.name,
                description: dto.description || vimeoData.description,
                duration: vimeoData.duration,
                uploaderType: UploaderType.photographer,
                highlight: dto.isHighlight || false,
                status: MediaStatus.ready,
            },
        });

        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (event) {
            this.realtime.emitToEvent(event.slug, 'media_added', { media });
        }

        return media;
    }

    async getEmbedConfig(vimeoId: string, eventId: string) {
        const appUrl = this.config.get('APP_URL', 'http://localhost:3001');
        return {
            embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
            params: {
                dnt: 1,
                badge: 0,
                autopause: 0,
                player_id: `vimeo-${vimeoId}`,
                app_id: this.config.get('VIMEO_CLIENT_ID'),
            },
        };
    }

    async handleWebhook(event: string, data: any) {
        this.logger.log(`Vimeo webhook: ${event}`);

        switch (event) {
            case 'video.ready': {
                const vimeoId = data.video?.uri?.replace('/videos/', '');
                if (!vimeoId) break;
                await this.prisma.media.updateMany({
                    where: { providerId: vimeoId, provider: MediaProvider.vimeo },
                    data: { status: MediaStatus.ready },
                });
                break;
            }

            case 'live.started': {
                const vimeoId = data.video?.uri?.replace('/videos/', '');
                if (!vimeoId) break;
                const media = await this.prisma.media.findFirst({
                    where: { providerId: vimeoId },
                    include: { event: true },
                });
                if (media?.event) {
                    this.realtime.emitToEvent(media.event.slug, 'live_started', {
                        vimeoId,
                        mediaId: media.id,
                    });
                }
                break;
            }

            case 'live.ended': {
                const vimeoId = data.video?.uri?.replace('/videos/', '');
                if (!vimeoId) break;
                const media = await this.prisma.media.findFirst({
                    where: { providerId: vimeoId },
                    include: { event: true },
                });
                if (media?.event) {
                    this.realtime.emitToEvent(media.event.slug, 'live_ended', {
                        vimeoId,
                        mediaId: media.id,
                    });
                }
                break;
            }
        }
    }

    private async fetchVimeoMetadata(vimeoId: string) {
        try {
            const accessToken = this.config.get('VIMEO_ACCESS_TOKEN');
            if (!accessToken || accessToken === 'demo') {
                // Return mock data in dev mode
                return {
                    name: 'Wedding Film',
                    description: '',
                    duration: 0,
                    thumbnail: null,
                };
            }

            const response = await axios.get(`https://api.vimeo.com/videos/${vimeoId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const data = response.data;
            const thumbnail = data.pictures?.sizes?.[3]?.link || null;

            return {
                name: data.name,
                description: data.description,
                duration: data.duration,
                thumbnail,
            };
        } catch (error) {
            this.logger.warn(`Could not fetch Vimeo metadata for ${vimeoId}: ${error.message}`);
            return { name: 'Wedding Video', description: '', duration: 0, thumbnail: null };
        }
    }

    private async assertEventOwner(eventId: string, userId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { studio: true },
        });
        if (!event) throw new NotFoundException('Event not found');
        if (event.studio.ownerUserId !== userId) throw new ForbiddenException('Not your event');
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        const secret = this.config.get('VIMEO_WEBHOOK_SECRET');
        if (!secret || secret === 'demo') return true;
        const { createHmac } = require('crypto');
        const expected = createHmac('sha256', secret).update(payload).digest('hex');
        return expected === signature;
    }
}
