import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
    constructor(private prisma: PrismaService) { }

    async create(eventId: string, userId: string, data: { title: string; orderIndex?: number }) {
        await this.assertEventOwner(eventId, userId);
        const count = await this.prisma.album.count({ where: { eventId } });
        return this.prisma.album.create({
            data: { eventId, title: data.title, orderIndex: data.orderIndex ?? count },
        });
    }

    async findAll(eventId: string) {
        return this.prisma.album.findMany({
            where: { eventId },
            include: { _count: { select: { media: true } } },
            orderBy: { orderIndex: 'asc' },
        });
    }

    async update(id: string, userId: string, data: Partial<{ title: string; orderIndex: number; coverImage: string }>) {
        const album = await this.prisma.album.findUnique({ where: { id }, include: { event: { include: { studio: true } } } });
        if (!album) throw new NotFoundException('Album not found');
        if (album.event.studio.ownerUserId !== userId) throw new ForbiddenException();
        return this.prisma.album.update({ where: { id }, data });
    }

    async delete(id: string, userId: string) {
        const album = await this.prisma.album.findUnique({ where: { id }, include: { event: { include: { studio: true } } } });
        if (!album) throw new NotFoundException('Album not found');
        if (album.event.studio.ownerUserId !== userId) throw new ForbiddenException();
        await this.prisma.album.delete({ where: { id } });
        return { message: 'Album deleted' };
    }

    private async assertEventOwner(eventId: string, userId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { studio: true },
        });
        if (!event) throw new NotFoundException('Event not found');
        if (event.studio.ownerUserId !== userId) throw new ForbiddenException();
    }
}
