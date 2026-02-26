import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { CloudinaryService } from './cloudinary.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'media-processing' }),
        RealtimeModule,
    ],
    controllers: [MediaController],
    providers: [MediaService, CloudinaryService],
    exports: [MediaService, CloudinaryService],
})
export class MediaModule { }
