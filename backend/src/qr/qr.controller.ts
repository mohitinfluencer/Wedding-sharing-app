import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QrService } from './qr.service';

@ApiTags('QR')
@Controller('qr')
export class QrController {
    constructor(private readonly qrService: QrService) { }

    @Get('event/:slug/png')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Download QR code PNG for event' })
    async downloadQr(@Param('slug') slug: string, @Res() res: Response) {
        const buffer = await this.qrService.generateQrPng(slug);
        res.set({
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename="qr-${slug}.png"`,
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }

    @Get('event/:slug/data-url')
    @ApiOperation({ summary: 'Get QR code as data URL (inline)' })
    getQrDataUrl(@Param('slug') slug: string) {
        return this.qrService.generateQrDataUrl(slug).then((dataUrl) => ({
            dataUrl,
            url: this.qrService.getWeddingUrl(slug),
        }));
    }
}
