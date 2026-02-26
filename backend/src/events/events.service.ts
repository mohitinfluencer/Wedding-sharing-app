import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Visibility } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateEventDto) {
        const studio = await this.prisma.studio.findFirst({
            where: { ownerUserId: userId },
        });
        if (!studio) throw new NotFoundException('Studio not found');

        const slug = dto.slug || this.generateSlug(dto.brideName, dto.groomName);
        const existing = await this.prisma.event.findUnique({ where: { slug } });
        if (existing) throw new ConflictException(`Slug "${slug}" already taken`);

        let passwordHash: string | undefined;
        if (dto.visibility === 'password' && dto.password) {
            passwordHash = await bcrypt.hash(dto.password, 12);
        }

        return this.prisma.event.create({
            data: {
                studioId: studio.id,
                slug,
                brideName: dto.brideName,
                groomName: dto.groomName,
                location: dto.location,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                coverImage: dto.coverImage,
                visibility: (dto.visibility as Visibility) || Visibility.public,
                passwordHash,
                theme: dto.theme || 'classic',
            },
            include: { albums: true, _count: { select: { media: true } } },
        });
    }

    async findAll(userId: string) {
        const studio = await this.prisma.studio.findFirst({
            where: { ownerUserId: userId },
        });
        if (!studio) throw new NotFoundException('Studio not found');

        return this.prisma.event.findMany({
            where: { studioId: studio.id },
            include: {
                albums: { orderBy: { orderIndex: 'asc' } },
                _count: { select: { media: true, guestUploads: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findBySlug(slug: string, password?: string) {
        const event = await this.prisma.event.findUnique({
            where: { slug },
            include: {
                albums: { orderBy: { orderIndex: 'asc' } },
                studio: {
                    select: { studioName: true, logo: true, brandColor: true },
                },
                _count: { select: { media: true, guestUploads: true } },
            },
        });

        if (!event) throw new NotFoundException('Event not found');

        if (event.visibility === Visibility.password) {
            if (!password) throw new UnauthorizedException('Password required');
            const valid = await bcrypt.compare(password, event.passwordHash!);
            if (!valid) throw new UnauthorizedException('Invalid password');
        }

        if (event.visibility === Visibility.private) {
            throw new ForbiddenException('This event is private');
        }

        // Increment view count
        await this.prisma.event.update({
            where: { id: event.id },
            data: { viewCount: { increment: 1 } },
        });

        const { passwordHash, ...safeEvent } = event as any;
        return safeEvent;
    }

    async findById(id: string, userId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                studio: true,
                albums: { orderBy: { orderIndex: 'asc' } },
                _count: { select: { media: true, guestUploads: true } },
            },
        });
        if (!event) throw new NotFoundException('Event not found');

        await this.assertOwner(event.studio.ownerUserId, userId);
        return event;
    }

    async update(id: string, userId: string, dto: UpdateEventDto) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: { studio: true },
        });
        if (!event) throw new NotFoundException('Event not found');
        await this.assertOwner(event.studio.ownerUserId, userId);

        let passwordHash = event.passwordHash;
        if (dto.visibility === 'password' && dto.password) {
            passwordHash = await bcrypt.hash(dto.password, 12);
        }

        const { password, ...rest } = dto;

        return this.prisma.event.update({
            where: { id },
            data: {
                ...rest,
                visibility: rest.visibility as Visibility | undefined,
                passwordHash,
                startDate: rest.startDate ? new Date(rest.startDate) : undefined,
                endDate: rest.endDate ? new Date(rest.endDate) : undefined,
            },
        });
    }

    async delete(id: string, userId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: { studio: true },
        });
        if (!event) throw new NotFoundException('Event not found');
        await this.assertOwner(event.studio.ownerUserId, userId);

        await this.prisma.event.delete({ where: { id } });
        return { message: 'Event deleted' };
    }

    async verifyOwnership(eventId: string, userId: string): Promise<boolean> {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { studio: true },
        });
        return event?.studio.ownerUserId === userId;
    }

    private async assertOwner(ownerId: string, userId: string) {
        if (ownerId !== userId) {
            throw new ForbiddenException('You do not own this event');
        }
    }

    private generateSlug(brideName: string, groomName: string): string {
        const year = new Date().getFullYear();
        const base = `${groomName}-${brideName}-${year}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return base;
    }
}
