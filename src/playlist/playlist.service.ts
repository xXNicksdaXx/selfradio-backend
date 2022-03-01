import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Playlist, PlaylistDocument } from "./core/schema/playlist.schema";
import { CreatePlaylistDto } from "./core/dto/create-playlist.dto";
import {Song} from "../song/core/schema/song.schema";

@Injectable()
export class PlaylistService {

    private readonly playlistModel: Model<PlaylistDocument>;

    constructor(@InjectModel(Playlist.name) playlistModel: Model<PlaylistDocument>) {
        this.playlistModel = playlistModel;
    }

    async createPlaylist(createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
        const createdPlaylist = new this.playlistModel(createPlaylistDto);
        return createdPlaylist.save();
    }

    async addSongToPlaylist(playlistId: string, song: Song) {
        const playlist = await this.playlistModel.findById(playlistId).exec();
        playlist.songs.push(song);
        return playlist.save();
    }

    async addSongsToPlaylist(playlistId: string, songs: Song[]) {
        const playlist = await this.playlistModel.findById(playlistId).exec();
        for(const song of songs) {
            playlist.songs.push(song);
        }
        return playlist.save();
    }

}
