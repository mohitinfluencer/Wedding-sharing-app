import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
    @ApiProperty({ example: 'Priya' })
    @IsString()
    brideName: string;

    @ApiProperty({ example: 'Rahul' })
    @IsString()
    groomName: string;

    @ApiProperty({ required: false, example: 'rahul-priya-2026' })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiProperty({ required: false, example: '2026-03-15' })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    endDate?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    coverImage?: string;

    @ApiProperty({ enum: ['public', 'private', 'password'], default: 'public' })
    @IsEnum(['public', 'private', 'password'])
    @IsOptional()
    visibility?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    password?: string;

    @ApiProperty({ required: false, default: 'classic' })
    @IsString()
    @IsOptional()
    theme?: string;
}
