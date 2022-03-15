import { Song } from "../../../song/core/schema/song.schema";

export class PlaylistSongsDto {

    playlistId: string;

    songs: Song[];
}