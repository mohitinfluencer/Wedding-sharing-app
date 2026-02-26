import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
    @ApiProperty({ example: 'photographer@studio.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Rahul Sharma' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({ example: 'password123', minLength: 8 })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ example: 'Sharma Wedding Photography', required: false })
    @IsString()
    @IsOptional()
    studioName?: string;
}
