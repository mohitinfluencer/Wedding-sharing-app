import { Module } from '@nestjs/common';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { MediaModule } from '../media/media.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
    imports: [MediaModule, RealtimeModule],
    controllers: [GuestController],
    providers: [GuestService],
})
export class GuestModule { }
