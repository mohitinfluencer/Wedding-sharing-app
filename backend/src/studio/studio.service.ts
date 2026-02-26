import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudioDto } from './dto/update-studio.dto';

@Injectable()
export class StudioService {
    constructor(private prisma: PrismaService) { }

    async getMyStudio(userId: string) {
        const studio = await this.prisma.studio.findFirst({
            where: { ownerUserId: userId },
            include: {
                owner: { select: { id: true, name: true, email: true, avatar: true } },
                _count: { select: { events: true } },
            },
        });
        if (!studio) throw new NotFoundException('Studio not found');
        return studio;
    }

    async getStudioEvents(userId: string) {
        const studio = await this.prisma.studio.findFirst({
            where: { ownerUserId: userId },
        });
        if (!studio) throw new NotFoundException('Studio not found');

        return this.prisma.event.findMany({
            where: { studioId: studio.id },
            include: {
                albums: { select: { id: true, title: true } },
                _count: { select: { media: true, guestUploads: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateStudio(userId: string, dto: UpdateStudioDto) {
        const studio = await this.prisma.studio.findFirst({
            where: { ownerUserId: userId },
        });
        if (!studio) throw new NotFoundException('Studio not found');

        return this.prisma.studio.update({
            where: { id: studio.id },
            data: dto,
        });
    }

    async getStudioStats(userId: string) {
        const studio = await this.prisma.studio.findFirst({
            where: { ownerUserId: userId },
        });
        if (!studio) throw new NotFoundException('Studio not found');

        const [eventCount, mediaCount, guestUploadCount] = await Promise.all([
            this.prisma.event.count({ where: { studioId: studio.id } }),
            this.prisma.media.count({ where: { event: { studioId: studio.id } } }),
            this.prisma.guestUpload.count({ where: { event: { studioId: studio.id } } }),
        ]);

        return { eventCount, mediaCount, guestUploadCount };
    }
}
