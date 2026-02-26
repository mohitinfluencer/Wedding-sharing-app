import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../media/cloudinary.service';

type JobWithData<T> = { data: T };

@Processor('media-processing')
export class MediaProcessorConsumer {
    private readonly logger = new Logger(MediaProcessorConsumer.name);

    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService,
    ) { }

    @Process('process-image')
    async processImage(job: JobWithData<{ mediaId: string; providerId: string }>) {
        const { mediaId, providerId } = job.data;
        this.logger.log(`Processing image: ${providerId}`);

        try {
            const thumbnailUrl = this.cloudinary.generateThumbnailUrl(providerId, 800, 600);

            await (this.prisma as any).media.update({
                where: { id: mediaId },
                data: { thumbnailUrl },
            });

            this.logger.log(`✅ Processed image: ${mediaId}`);
        } catch (error) {
            this.logger.error(`Failed to process image ${mediaId}:`, error);
            throw error;
        }
    }

    @Process('cache-refresh')
    async refreshCache(job: JobWithData<{ eventId: string }>) {
        this.logger.log(`Cache refresh for event: ${job.data.eventId}`);
        // In production: invalidate CDN cache via Cloudflare/CloudFront API
    }

    @Process('send-notification')
    async sendNotification(job: JobWithData<{ type: string; payload: unknown }>) {
        this.logger.log(`Notification: ${job.data.type}`);
        // In production: send email/SMS notification
    }
}
