import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { VimeoModule } from '../vimeo/vimeo.module';
import { MediaModule } from '../media/media.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
    imports: [VimeoModule, MediaModule, RealtimeModule],
    controllers: [WebhooksController],
})
export class WebhooksModule { }
