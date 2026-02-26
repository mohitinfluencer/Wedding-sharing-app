import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStudioDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    studioName?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    brandColor?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    customDomain?: string;
}
