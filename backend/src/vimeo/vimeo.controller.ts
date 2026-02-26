import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VimeoService } from './vimeo.service';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

class AttachVimeoDto {
    @IsString() vimeoId: string;
    @IsBoolean() @IsOptional() isHighlight?: boolean;
    @IsString() @IsOptional() albumId?: string;
    @IsString() @IsOptional() title?: string;
    @IsString() @IsOptional() description?: string;
}

@ApiTags('Vimeo')
@Controller('events/:eventId/vimeo')
export class VimeoController {
    constructor(private readonly vimeoService: VimeoService) { }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Attach a Vimeo video to event' })
    attachVideo(
        @Param('eventId') eventId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: AttachVimeoDto,
    ) {
        return this.vimeoService.attachVideo(eventId, userId, dto);
    }

    @Get(':vimeoId/embed')
    @ApiOperation({ summary: 'Get Vimeo embed configuration' })
    getEmbedConfig(
        @Param('eventId') eventId: string,
        @Param('vimeoId') vimeoId: string,
    ) {
        return this.vimeoService.getEmbedConfig(vimeoId, eventId);
    }
}
