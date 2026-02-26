import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GuestService } from './guest.service';

@ApiTags('Guest')
@Controller('guest')
export class GuestController {
    constructor(private readonly guestService: GuestService) { }

    @Get('event/:slug/init-upload')
    @ApiOperation({ summary: 'Get signed upload params for guest (no auth)' })
    initGuestUpload(@Param('slug') slug: string) {
        return this.guestService.initGuestUpload(slug);
    }

    @Post('event/:slug/upload')
    @ApiOperation({ summary: 'Complete guest photo upload' })
    completeGuestUpload(
        @Param('slug') slug: string,
        @Body() dto: {
            guestName: string;
            guestNote?: string;
            providerId: string;
            url: string;
            thumbnailUrl?: string;
            width?: number;
            height?: number;
        },
    ) {
        return this.guestService.completeGuestUpload({ eventSlug: slug, ...dto });
    }

    @Get('event/:slug/uploads')
    @ApiOperation({ summary: 'Get approved guest uploads for public page' })
    getApproved(@Param('slug') slug: string) {
        return this.guestService.getApprovedGuestUploads(slug);
    }

    @Get('manage/:eventId/pending')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get pending guest uploads (photographer)' })
    getPending(@Param('eventId') eventId: string, @CurrentUser('id') userId: string) {
        return this.guestService.getPendingUploads(eventId, userId);
    }

    @Patch('uploads/:id/approve')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Approve guest upload' })
    approve(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.guestService.approveUpload(id, userId);
    }

    @Patch('uploads/:id/reject')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Reject guest upload' })
    reject(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.guestService.rejectUpload(id, userId);
    }
}
