import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
    namespace: '/',
    transports: ['websocket', 'polling'],
})
export class RealtimeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(RealtimeGateway.name);
    private viewerCounts = new Map<string, number>();

    constructor(private config: ConfigService) { }

    afterInit(server: Server) {
        this.logger.log('🔌 WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.debug(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.debug(`Client disconnected: ${client.id}`);
        // Clean up room memberships and viewer counts
        client.rooms.forEach((room) => {
            if (room.startsWith('event:')) {
                const slug = room.replace('event:', '');
                this.decrementViewers(slug);
            }
        });
    }

    @SubscribeMessage('join_event')
    handleJoinEvent(
        @MessageBody() data: { eventSlug: string },
        @ConnectedSocket() client: Socket,
    ) {
        const room = `event:${data.eventSlug}`;
        client.join(room);
        this.incrementViewers(data.eventSlug);

        const viewerCount = this.viewerCounts.get(data.eventSlug) || 0;
        this.server.to(room).emit('viewer_count', { count: viewerCount });

        this.logger.debug(`Client ${client.id} joined event: ${data.eventSlug}`);
        return { success: true, room };
    }

    @SubscribeMessage('leave_event')
    handleLeaveEvent(
        @MessageBody() data: { eventSlug: string },
        @ConnectedSocket() client: Socket,
    ) {
        const room = `event:${data.eventSlug}`;
        client.leave(room);
        this.decrementViewers(data.eventSlug);
        return { success: true };
    }

    @SubscribeMessage('slideshow_control')
    handleSlideshowControl(
        @MessageBody() data: { eventSlug: string; action: 'start' | 'pause' | 'next' | 'prev' },
        @ConnectedSocket() client: Socket,
    ) {
        const room = `event:${data.eventSlug}`;
        const event = data.action === 'start' ? 'slideshow_start' :
            data.action === 'pause' ? 'slideshow_pause' : `slideshow_${data.action}`;
        this.server.to(room).emit(event, { eventSlug: data.eventSlug });
        return { success: true };
    }

    // Called by services to push updates
    emitToEvent(eventSlug: string, event: string, data: any) {
        this.server.to(`event:${eventSlug}`).emit(event, data);
    }

    getViewerCount(eventSlug: string): number {
        return this.viewerCounts.get(eventSlug) || 0;
    }

    private incrementViewers(slug: string) {
        this.viewerCounts.set(slug, (this.viewerCounts.get(slug) || 0) + 1);
    }

    private decrementViewers(slug: string) {
        const current = this.viewerCounts.get(slug) || 0;
        if (current <= 1) {
            this.viewerCounts.delete(slug);
        } else {
            this.viewerCounts.set(slug, current - 1);
        }
    }
}
