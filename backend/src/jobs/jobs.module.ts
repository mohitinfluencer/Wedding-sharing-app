import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MediaProcessorConsumer } from './media-processor.consumer';
import { MediaModule } from '../media/media.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'media-processing' }),
        MediaModule,
        RealtimeModule,
    ],
    providers: [MediaProcessorConsumer],
})
export class JobsModule { }
