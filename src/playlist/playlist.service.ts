import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ReadStream } from "fs";
const JSZip = require('jszip');

import { Playlist, PlaylistDocument } from "./core/schema/playlist.schema";
import { CreatePlaylistDto } from "./core/dto/create-playlist.dto";
import { Song } from "../song/core/schema/song.schema";
import { FirebaseService } from "../firebase-storage/firebase.service";
import {DownloadResponse} from "@google-cloud/storage";


@Injectable()
export class PlaylistService {

    private readonly playlistModel: Model<PlaylistDocument>;
    private readonly firebaseService: FirebaseService;

    constructor(
        @InjectModel(Playlist.name) playlistModel: Model<PlaylistDocument>,
        firebaseService: FirebaseService
    ) {
        this.playlistModel = playlistModel;
        this.firebaseService = firebaseService;

        //initialize favorites playlist
        this.findAll()
            .then(playlists => {
                if(playlists.length === 0) {
                    const favorite = new this.playlistModel({
                        name: "Favorites",
                        description: "Playlist with all your favorite songs."
                    });
                    favorite.save()
                        .finally(() => console.log("Favorites playlist created"));
                }
            })
    }

    async createPlaylist(createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
        const createdPlaylist = new this.playlistModel(createPlaylistDto);
        return createdPlaylist.save();
    }

    async findOneById(id: string): Promise<Playlist> {
        return this.playlistModel.findById(new Types.ObjectId(id)).exec();
    }

    async addSongsToPlaylist(playlistId: string, songs: Song[]): Promise<Playlist> {
        const playlist = await this.playlistModel.findById(new Types.ObjectId(playlistId)).exec();
        for(const song of songs) {
            playlist.songs.push(song);
        }
        return playlist.save();
    }

    async removeSongsFromPlaylist(playlistId: string, songs: Song[]): Promise<Playlist> {
        const playlist = await this.playlistModel.findById(new Types.ObjectId(playlistId)).exec();
        for(const song of songs) {
            playlist.songs = playlist.songs.filter((element: Song) => {
                return element._id !== song._id;
            });
        }
        return playlist.save();
    }

    async findAll(): Promise<Playlist[]> {
        return this.playlistModel.find().exec();
    }

    async downloadPlaylist(name: string, songs: Song[]): Promise<ReadStream> {

        const bucket = this.firebaseService.getFirebaseBucket();

        //prepare zip file
        const zip = new JSZip();
        const plZip = zip.folder(name);

        for(const song of songs) {
            //download file from firebase and add it to zip
            const contents:Uint8Array = await bucket.file(song.path).download()
                .then(
                    (value: DownloadResponse) => value.pop()
                );
            plZip.file(song.path, contents, {
                binary : true,
            });
        }

        return zip.generateNodeStream({
            type: "nodebuffer",
            compression: 'DEFLATE'
        });
    }
}
