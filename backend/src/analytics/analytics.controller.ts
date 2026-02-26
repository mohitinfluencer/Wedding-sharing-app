import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Post('track')
    @ApiOperation({ summary: 'Track an analytics event (public)' })
    track(@Body() dto: { eventId: string; type: string; metadata?: object }) {
        return this.analyticsService.track(dto.eventId, dto.type, dto.metadata);
    }

    @Get('event/:eventId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get event analytics' })
    getEventStats(@Param('eventId') eventId: string, @CurrentUser('id') userId: string) {
        return this.analyticsService.getEventAnalytics(eventId, userId);
    }

    @Get('studio')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get studio-level analytics' })
    getStudioStats(@CurrentUser('id') userId: string) {
        return this.analyticsService.getStudioAnalytics(userId);
    }
}
