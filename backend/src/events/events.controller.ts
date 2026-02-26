import {
    Controller, Get, Post, Patch, Delete, Body, Param, Query,
    UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('Events')
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new wedding event' })
    create(@CurrentUser('id') userId: string, @Body() dto: CreateEventDto) {
        return this.eventsService.create(userId, dto);
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get all events for my studio' })
    findAll(@CurrentUser('id') userId: string) {
        return this.eventsService.findAll(userId);
    }

    @Get(':slug/public')
    @ApiOperation({ summary: 'Get public event by slug (guest access)' })
    @ApiQuery({ name: 'password', required: false })
    findBySlug(@Param('slug') slug: string, @Query('password') password?: string) {
        return this.eventsService.findBySlug(slug, password);
    }

    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get event by ID (photographer)' })
    findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.eventsService.findById(id, userId);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update event' })
    update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateEventDto,
    ) {
        return this.eventsService.update(id, userId, dto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete event' })
    remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.eventsService.delete(id, userId);
    }
}
