import { Module } from '@nestjs/common';
import { VimeoController } from './vimeo.controller';
import { VimeoService } from './vimeo.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
    imports: [RealtimeModule],
    controllers: [VimeoController],
    providers: [VimeoService],
    exports: [VimeoService],
})
export class VimeoModule { }
