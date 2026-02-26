import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private prisma: PrismaService) { }

    @Get()
    @ApiOperation({ summary: 'Health check endpoint' })
    async check() {
        const dbHealthy = await this.prisma.healthCheck();
        return {
            status: dbHealthy ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: dbHealthy ? 'connected' : 'disconnected',
                api: 'running',
            },
        };
    }
}
