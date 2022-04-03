import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';

import { PlaylistService } from "../playlist/playlist.service";
import { Song, SongDocument } from "../core/schemas/song.schema";
import { CreateSongDto } from "../core/dtos/create-song.dto";
import { EditSongDto } from "../core/dtos/edit-song.dto";
import {NoSongException} from "../core/exceptions/no-song.exception";

@Injectable()
export class SongService {

    private readonly songModel: Model<SongDocument>
    private readonly playlistService: PlaylistService

    constructor(
        @InjectModel(Song.name) songModel: Model<SongDocument>,
        playlistService: PlaylistService
    ) {
        this.songModel = songModel;
        this.playlistService = playlistService;
    }

    async createSong(createSongDto: CreateSongDto): Promise<Song> {
        const createdSong = new this.songModel(createSongDto);
        return createdSong.save();
    }

    async findById(id: string): Promise<Song> {
        return this.songModel.findById(new Types.ObjectId(id)).exec();
    }

    async findBySearch(text: string): Promise<Song[]> {
        const byArtist = await this.findByArtist(text);
        const byTitle = await this.findByTitle(text);
        return byArtist.concat(byTitle);
    }

    async findByQuery(title: string, artist: string, album?: string): Promise<Song[]> {
        if(!album) {
            return this.songModel.find({
                title: new RegExp(title, 'i'),
                artist: new RegExp(artist, 'i'),
            }).exec();
        }
        return this.songModel.find({
            title: new RegExp(title, 'i'),
            artist: new RegExp(artist, 'i'),
            album: new RegExp(album, 'i'),
        }).exec();
    }

    async findByArtist(artist: string): Promise<Song[]> {
        return this.songModel.find({ artist: new RegExp(artist, 'i') }).exec();
    }

    async findByTitle(title: string): Promise<Song[]> {
        return this.songModel.find({ title: new RegExp(title, 'i') }).exec();
    }

    async findAll(): Promise<Song[]> {
        return this.songModel.find().exec();
    }

    async updateOne(id: string, editSongDto: EditSongDto): Promise<Song> {

        const song: Song =  await this.songModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            editSongDto,
            { new: true }
        ).exec();

        if(!song) {
            throw new NoSongException();
        }

        //update in every playlist
        await this.playlistService.updateSongInEveryPlaylist(song);

        return song;
    }

    async favourSong(id: string, favorite: boolean): Promise<Song> {

        const song: Song = await this.songModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            { favorite: favorite },
            { new: true }
        ).exec();

        if(!song) {
            throw new NoSongException();
        }

        //update in every playlist
        await this.playlistService.updateSongInEveryPlaylist(song);

        //add or remove song from 'Favorites' playlist
        const favorites = await this.playlistService.findFavoritePlaylist();
        if (favorite) {
            await this.playlistService.addSongsToPlaylist(favorites._id.toString(), [song]);
        } else {
            await this.playlistService.removeSongsFromPlaylist(favorites._id.toString(), [song]);
        }

        return song;
    }

    async deleteOne(id: string): Promise<Song> {

        const song: Song = await this.songModel.findByIdAndRemove(new Types.ObjectId(id));

        if(!song) {
            throw new NoSongException();
        }

        //remove from every playlist
        await this.playlistService.removeSongFromEveryPlaylist(song);

        return song;

    }

    generateFileName(ext: string): string {
        const random = Array(8)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
        return random + "." + ext;
    }
}
