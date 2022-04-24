import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSongDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    title: string;

    @IsNotEmpty({ each: true })
    @IsString({ each: true })
    @MaxLength(50, {
        each: true,
    })
    artist: string[];

    @IsString()
    @MaxLength(50)
    album: string;

    @IsNotEmpty()
    @IsString()
    path: string;
}