import { IsNotEmpty, IsString, MaxLength, NotEquals } from 'class-validator';

export class EditPlaylistDto {

    @IsNotEmpty()
    @IsString()
    @NotEquals("Favorites")
    @MaxLength(20)
    name: string;

    @IsString()
    @MaxLength(70)
    description?: string;
}