import {
    Controller,
    Post,
    Body,
    Res,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
    Get,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    @ApiOperation({ summary: 'Photographer signup' })
    @ApiResponse({ status: 201, description: 'Account created' })
    async signup(
        @Body() dto: SignupDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.signup(dto);
        this.setRefreshTokenCookie(res, result.refreshToken);
        return { user: result.user, accessToken: result.accessToken };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login' })
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const result = await this.authService.login(dto);
        this.setRefreshTokenCookie(res, result.refreshToken);
        return { user: result.user, accessToken: result.accessToken };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const token = req.cookies?.['refresh_token'];
        const result = await this.authService.refresh(token);
        this.setRefreshTokenCookie(res, result.refreshToken);
        return { accessToken: result.accessToken };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Logout' })
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @CurrentUser('id') userId: string,
    ) {
        const token = req.cookies?.['refresh_token'];
        await this.authService.logout(userId, token);
        res.clearCookie('refresh_token');
        return { message: 'Logged out successfully' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user' })
    async me(@CurrentUser() user: any) {
        return user;
    }

    private setRefreshTokenCookie(res: Response, token: string) {
        res.cookie('refresh_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api/auth',
        });
    }
}
