import {IsNotEmpty, IsString, MaxLength, MinLength} from 'class-validator';

export class EditSongDto {

    @IsString()
    @MinLength(24)
    @MaxLength(24)
    id: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    title?: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    artist?: string;
}