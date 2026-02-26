import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query,
    UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('init-upload')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get signed Cloudinary upload params' })
    initUpload(
        @CurrentUser('id') userId: string,
        @Body() dto: { eventId: string; albumId?: string },
    ) {
        return this.mediaService.initUpload(userId, dto.eventId, dto.albumId);
    }

    @Post('complete')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Complete upload — register media record' })
    complete(
        @CurrentUser('id') userId: string,
        @Body() dto: {
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
        return this.mediaService.completeUpload(userId, dto);
    }

    @Get('event/:eventId')
    @ApiOperation({ summary: 'Get media for event (public)' })
    @ApiQuery({ name: 'albumId', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getEventMedia(
        @Param('eventId') eventId: string,
        @Query('albumId') albumId?: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    ) {
        return this.mediaService.getMediaForEvent(eventId, albumId, page, limit);
    }

    @Get('event/:eventId/manage')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all media for photographer management' })
    getForPhotographer(
        @Param('eventId') eventId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.mediaService.getMediaForPhotographer(eventId, userId);
    }

    @Get('event/:eventId/highlights')
    @ApiOperation({ summary: 'Get highlight media' })
    getHighlights(@Param('eventId') eventId: string) {
        return this.mediaService.getHighlights(eventId);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update media (hide/highlight/album)' })
    update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: Partial<{ hidden: boolean; highlight: boolean; albumId: string; title: string }>,
    ) {
        return this.mediaService.updateMedia(id, userId, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete media' })
    remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.mediaService.deleteMedia(id, userId);
    }
}
