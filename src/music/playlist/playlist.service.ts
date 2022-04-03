import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ReadStream } from "fs";
import { DownloadResponse } from "@google-cloud/storage";
const JSZip = require('jszip');

import { Playlist, PlaylistDocument } from "../core/schemas/playlist.schema";
import { CreatePlaylistDto } from "../core/dtos/create-playlist.dto";
import { EditPlaylistDto } from "../core/dtos/edit-playlist.dto";
import { FirebaseService } from "../../firebase-storage/firebase.service";
import { Song } from "../core/schemas/song.schema";


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

    async findByName(name: string): Promise<Playlist[]> {
        return this.playlistModel.find({ name: new RegExp(name, 'i')}).exec();
    }

    async findFavoritePlaylist(): Promise<Playlist> {
        return this.playlistModel.findOne({ name: new RegExp('Favorites') }).exec();
    }

    async updatePlaylist(id: string, editPlaylistDto: EditPlaylistDto): Promise<Playlist> {
        return this.playlistModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            editPlaylistDto,
            { new: true }
        ).exec();
    }

    async addSongsToPlaylist(playlistId: string, songs: Song[]): Promise<Playlist> {
        const playlist = await this.playlistModel.findById(new Types.ObjectId(playlistId)).exec();

        for(const song of songs) {

            //check for duplicate
            const index = playlist.songs.findIndex(value => (value._id.toString() === song._id.toString()))

            if(index === -1) {
                //no duplicate, just push into array
                playlist.songs.push(song);
            } else {
                //duplicate, change song to new version of this song
                playlist.songs[index] = song;
            }
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

    async updateSongInEveryPlaylist(song: Song) {
        const playlists = await this.playlistModel.find().exec();

        for(const playlist of playlists) {
            //check for song
            const index = playlist.songs.findIndex(value => (value._id.toString() === song._id.toString()))
            if(index !== -1) {
                //song in playlist -> update
                playlist.songs[index] = song;
                await playlist.save();
            }
        }

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
