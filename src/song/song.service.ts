import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';

import { Song, SongDocument } from "./core/schema/song.schema";
import { CreateSongDto } from "./core/dto/create-song.dto";

@Injectable()
export class SongService {

    private readonly songModel: Model<SongDocument>

    constructor(@InjectModel(Song.name) songModel: Model<SongDocument>) {
        this.songModel = songModel;
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

    async findByQuery(title?: string, artist?: string, album?: string): Promise<Song[]> {
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

    async updateOne(id: string, update: { title?: string, artist?: string}): Promise<Song> {
        return this.songModel.findByIdAndUpdate(new Types.ObjectId(id), update);
    }

    async deleteOne(id: string): Promise<Song> {
        return this.songModel.findByIdAndRemove(id);
    }
}
