import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
    constructor(private config: ConfigService) { }

    async generateQrPng(slug: string): Promise<Buffer> {
        const appUrl = this.config.get('APP_URL', 'http://localhost:3001');
        const url = `${appUrl}/wedding/${slug}`;
        return QRCode.toBuffer(url, {
            type: 'png',
            width: 512,
            margin: 2,
            color: { dark: '#1a1a1a', light: '#ffffff' },
        });
    }

    async generateQrDataUrl(slug: string): Promise<string> {
        const appUrl = this.config.get('APP_URL', 'http://localhost:3001');
        const url = `${appUrl}/wedding/${slug}`;
        return QRCode.toDataURL(url, {
            width: 512,
            margin: 2,
            color: { dark: '#1a1a1a', light: '#ffffff' },
        });
    }

    getWeddingUrl(slug: string): string {
        const appUrl = this.config.get('APP_URL', 'http://localhost:3001');
        return `${appUrl}/wedding/${slug}`;
    }
}
