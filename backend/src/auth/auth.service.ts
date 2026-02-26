import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) { }

    async signup(dto: SignupDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) throw new ConflictException('Email already registered');

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                passwordHash,
                role: Role.photographer,
            },
        });

        // Auto-create studio for photographer
        const studio = await this.prisma.studio.create({
            data: {
                studioName: dto.studioName || `${dto.name}'s Studio`,
                ownerUserId: user.id,
            },
        });

        // Link user to studio
        await this.prisma.user.update({
            where: { id: user.id },
            data: { studioId: studio.id },
        });

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        const safeUser = this.sanitizeUser({ ...user, studioId: studio.id });
        return { user: safeUser, ...tokens };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { ownedStudio: true },
        });

        if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        return { user: this.sanitizeUser(user), ...tokens };
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) throw new UnauthorizedException('No refresh token');

        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!stored || stored.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const tokens = await this.generateTokens(
            stored.user.id,
            stored.user.email,
            stored.user.role,
        );

        // Rotate refresh token
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: {
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return tokens;
    }

    async logout(userId: string, refreshToken: string) {
        if (refreshToken) {
            await this.prisma.refreshToken.deleteMany({
                where: { userId, token: refreshToken },
            });
        }
    }

    async validateUser(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                studioId: true,
                avatar: true,
                createdAt: true,
            },
        });
    }

    private async generateTokens(userId: string, email: string, role: Role) {
        const payload = { sub: userId, email, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);

        return { accessToken, refreshToken };
    }

    private async saveRefreshToken(userId: string, token: string) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: { userId, token, expiresAt },
        });

        // Clean expired tokens
        await this.prisma.refreshToken.deleteMany({
            where: { userId, expiresAt: { lt: new Date() } },
        });
    }

    private sanitizeUser(user: any) {
        const { passwordHash, ...safe } = user;
        return safe;
    }
}
