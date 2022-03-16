import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSongDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    artist: string;

    @IsNotEmpty()
    @IsString()
    path: string;
}