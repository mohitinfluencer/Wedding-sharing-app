import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StudioService } from './studio.service';
import { UpdateStudioDto } from './dto/update-studio.dto';

@ApiTags('Studio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('studio')
export class StudioController {
    constructor(private readonly studioService: StudioService) { }

    @Get()
    @ApiOperation({ summary: 'Get my studio' })
    getMyStudio(@CurrentUser('id') userId: string) {
        return this.studioService.getMyStudio(userId);
    }

    @Get('events')
    @ApiOperation({ summary: 'Get all studio events' })
    getEvents(@CurrentUser('id') userId: string) {
        return this.studioService.getStudioEvents(userId);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get studio statistics' })
    getStats(@CurrentUser('id') userId: string) {
        return this.studioService.getStudioStats(userId);
    }

    @Patch()
    @ApiOperation({ summary: 'Update studio profile' })
    update(@CurrentUser('id') userId: string, @Body() dto: UpdateStudioDto) {
        return this.studioService.updateStudio(userId, dto);
    }
}
