import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get full user profile with studio' })
    getProfile(@CurrentUser('id') userId: string) {
        return this.usersService.findById(userId);
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Update user profile' })
    updateProfile(
        @CurrentUser('id') userId: string,
        @Body() dto: Partial<{ name: string; avatar: string }>,
    ) {
        return this.usersService.updateProfile(userId, dto);
    }
}
