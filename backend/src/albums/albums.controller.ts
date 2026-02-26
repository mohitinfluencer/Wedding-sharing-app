import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AlbumsService } from './albums.service';
import { IsString, IsOptional, IsNumber } from 'class-validator';

class CreateAlbumDto {
    @IsString() title: string;
    @IsNumber() @IsOptional() orderIndex?: number;
}

@ApiTags('Albums')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events/:eventId/albums')
export class AlbumsController {
    constructor(private readonly albumsService: AlbumsService) { }

    @Post()
    @ApiOperation({ summary: 'Create album' })
    create(
        @Param('eventId') eventId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: CreateAlbumDto,
    ) {
        return this.albumsService.create(eventId, userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get albums for event' })
    findAll(@Param('eventId') eventId: string) {
        return this.albumsService.findAll(eventId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update album' })
    update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: Partial<{ title: string; orderIndex: number; coverImage: string }>,
    ) {
        return this.albumsService.update(id, userId, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete album' })
    remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.albumsService.delete(id, userId);
    }
}
