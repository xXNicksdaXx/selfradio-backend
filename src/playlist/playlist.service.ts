import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { createReadStream, ReadStream } from "fs";
const JSZip = require('jszip');

import { Playlist, PlaylistDocument } from "./core/schema/playlist.schema";
import { CreatePlaylistDto } from "./core/dto/create-playlist.dto";
import { Song } from "../song/core/schema/song.schema";

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

    async findOneById(id: string): Promise<Playlist> {
        return this.playlistModel.findById(new Types.ObjectId(id)).exec();
    }

    async addSongToPlaylist(playlistId: string, song: Song) {
        const playlist = await this.playlistModel.findById(new Types.ObjectId(playlistId)).exec();
        playlist.songs.push(song);
        return playlist.save();
    }

    async addSongsToPlaylist(playlistId: string, songs: Song[]) {
        const playlist = await this.playlistModel.findById(new Types.ObjectId(playlistId)).exec();
        for(const song of songs) {
            playlist.songs.push(song);
        }
        return playlist.save();
    }

    async removeFromPlaylist(playlistId: string, song: Song) {
        const playlist = await this.playlistModel.findById(new Types.ObjectId(playlistId)).exec();
        playlist.songs = playlist.songs.filter((element: Song) => {
            return element._id !== song._id;
        });
        return playlist.save();
    }

    async findAll() {
        return this.playlistModel.find().exec();
    }

    zipPlaylist(name: string, songs: Song[]): ReadStream {
        const zip = new JSZip();
        const plZip = zip.folder(name);

        for(const song of songs) {
            const songData = createReadStream(song.path);
            plZip.file(song._id.toString() + ".mp3", songData, {binary : true, compression : "DEFLATE"});
        }

        return zip.generateNodeStream({ type: "nodebuffer", streamFiles: true })
    }
}
