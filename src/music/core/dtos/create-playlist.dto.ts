import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreatePlaylistDto {

    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    name: string;

    @IsString()
    @MaxLength(70)
    description?: string;
}