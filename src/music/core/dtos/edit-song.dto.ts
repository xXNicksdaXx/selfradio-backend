import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EditSongDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    artist: string;

    @IsString()
    @MaxLength(50)
    album?: string;
}