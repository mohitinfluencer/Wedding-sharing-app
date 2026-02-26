import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private config: ConfigService) {
        cloudinary.config({
            cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.config.get('CLOUDINARY_API_KEY'),
            api_secret: this.config.get('CLOUDINARY_API_SECRET'),
        });
    }

    generateSignedUploadParams(eventId: string, albumId?: string) {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = `wedding-platform/${eventId}${albumId ? `/${albumId}` : ''}`;
        const tags = `event_${eventId}${albumId ? `,album_${albumId}` : ''}`;

        const paramsToSign: Record<string, any> = {
            timestamp,
            folder,
            tags,
            context: `event_id=${eventId}${albumId ? `|album_id=${albumId}` : ''}`,
            transformation: 'q_auto,f_auto',
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            this.config.get('CLOUDINARY_API_SECRET') || '',
        );

        return {
            signature,
            timestamp,
            folder,
            tags,
            apiKey: this.config.get('CLOUDINARY_API_KEY'),
            cloudName: this.config.get('CLOUDINARY_CLOUD_NAME'),
            uploadUrl: `https://api.cloudinary.com/v1_1/${this.config.get('CLOUDINARY_CLOUD_NAME')}/image/upload`,
        };
    }

    generateSignedVideoUploadParams(eventId: string) {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = `wedding-platform/${eventId}/videos`;

        const paramsToSign: Record<string, any> = {
            timestamp,
            folder,
            tags: `event_${eventId},video`,
            resource_type: 'video',
        };

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            this.config.get('CLOUDINARY_API_SECRET') || '',
        );

        return {
            signature,
            timestamp,
            folder,
            apiKey: this.config.get('CLOUDINARY_API_KEY'),
            cloudName: this.config.get('CLOUDINARY_CLOUD_NAME'),
            uploadUrl: `https://api.cloudinary.com/v1_1/${this.config.get('CLOUDINARY_CLOUD_NAME')}/video/upload`,
        };
    }

    generateThumbnailUrl(publicId: string, width = 400, height = 300): string {
        return cloudinary.url(publicId, {
            transformation: [
                { width, height, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
            ],
        });
    }

    async deleteMedia(publicId: string, resourceType: 'image' | 'video' = 'image') {
        try {
            return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        } catch (error) {
            this.logger.error(`Failed to delete ${publicId}`, error);
        }
    }

    verifyWebhookSignature(payload: string, signature: string, timestamp: string): boolean {
        const secret = this.config.get('CLOUDINARY_WEBHOOK_SECRET');
        if (!secret) return true; // In dev mode, skip verification

        const { createHmac } = require('crypto');
        const expectedSignature = createHmac('sha1', secret)
            .update(payload + timestamp)
            .digest('hex');
        return expectedSignature === signature;
    }
}
