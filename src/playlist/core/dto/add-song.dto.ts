import { Song } from "../../../song/core/schema/song.schema";

export class AddSongDto {

    playlistId: string;

    songs: Song[];
}