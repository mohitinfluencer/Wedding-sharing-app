import {
    Controller, Post, Body, Headers, HttpCode, HttpStatus, Logger, RawBodyRequest, Req
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VimeoService } from '../vimeo/vimeo.service';
import { CloudinaryService } from '../media/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MediaStatus, MediaProvider } from '@prisma/client';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(
        private vimeoService: VimeoService,
        private cloudinaryService: CloudinaryService,
        private prisma: PrismaService,
        private realtime: RealtimeGateway,
    ) { }

    @Post('vimeo')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Vimeo webhook receiver' })
    async vimeoWebhook(
        @Body() body: any,
        @Headers('x-vimeo-webhook-signature') signature: string,
    ) {
        const rawBody = JSON.stringify(body);
        const isValid = this.vimeoService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
            this.logger.warn('Invalid Vimeo webhook signature');
            return { ok: false };
        }

        await this.vimeoService.handleWebhook(body.type, body);
        return { ok: true };
    }

    @Post('cloudinary')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cloudinary webhook receiver' })
    async cloudinaryWebhook(
        @Body() body: any,
        @Headers('x-cld-signature') signature: string,
        @Headers('x-cld-timestamp') timestamp: string,
    ) {
        // In production: verify signature
        this.logger.log(`Cloudinary event: ${body.notification_type}`);

        if (body.notification_type === 'upload' && body.public_id) {
            // Update media status if needed
            const media = await this.prisma.media.findFirst({
                where: { providerId: body.public_id, provider: MediaProvider.cloudinary },
                include: { event: true },
            });

            if (media) {
                await this.prisma.media.update({
                    where: { id: media.id },
                    data: { status: MediaStatus.ready },
                });
                this.realtime.emitToEvent(media.event.slug, 'media_updated', {
                    mediaId: media.id,
                    changes: { status: 'ready' },
                });
            }
        }

        return { ok: true };
    }
}
