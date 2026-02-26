import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudioModule } from './studio/studio.module';
import { EventsModule } from './events/events.module';
import { AlbumsModule } from './albums/albums.module';
import { MediaModule } from './media/media.module';
import { GuestModule } from './guest/guest.module';
import { VimeoModule } from './vimeo/vimeo.module';
import { QrModule } from './qr/qr.module';
import { RealtimeModule } from './realtime/realtime.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthModule } from './health/health.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 20,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 100,
      },
    ]),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
      inject: [ConfigService],
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    StudioModule,
    EventsModule,
    AlbumsModule,
    MediaModule,
    GuestModule,
    VimeoModule,
    QrModule,
    RealtimeModule,
    WebhooksModule,
    AnalyticsModule,
    HealthModule,
    JobsModule,
  ],
})
export class AppModule { }
