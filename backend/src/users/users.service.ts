import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                studioId: true,
                avatar: true,
                createdAt: true,
                studio: { select: { id: true, studioName: true, logo: true, brandColor: true } },
            },
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateProfile(id: string, data: Partial<{ name: string; avatar: string }>) {
        return this.prisma.user.update({
            where: { id },
            data,
            select: { id: true, email: true, name: true, role: true, avatar: true, studioId: true },
        });
    }
}
