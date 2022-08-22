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

    async findManyById(ids: Playlist[]): Promise<Playlist[]> {
        const playlists: Playlist[] = [];
        for(const id of ids) {
            playlists.push(
                await this.playlistModel.findById(id).exec()
            );
        }
        return playlists;
    }

    async findByName(name: string): Promise<Playlist[]> {
        return this.playlistModel.find({ name: new RegExp(name, 'i')}).exec();
    }

    async findAll(): Promise<Playlist[]> {
        return this.playlistModel.find().exec();
    }

    async updatePlaylist(id: string, editPlaylistDto: EditPlaylistDto): Promise<Playlist> {
        return this.playlistModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            editPlaylistDto,
            { new: true }
        ).exec();
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
