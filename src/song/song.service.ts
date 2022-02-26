import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';

import { Song, SongDocument } from "./schema/song.schema";
import { CreateSongDto } from "./dto/create-song.dto";

@Injectable()
export class SongService {

    constructor(@InjectModel(Song.name) private songModel: Model<SongDocument>) {}

    async createSong(createSongDto: CreateSongDto): Promise<Song> {
        const createdSong = new this.songModel(createSongDto);
        return createdSong.save();
    }

    async findOneById(id: string): Promise<Song> {
        return this.songModel.findById(id).exec();
    }

    async findByAnything(text: string): Promise<Song[]> {
        const byArtist = await this.findByArtist(text);
        const byTitle = await this.findByTitle(text);
        return byArtist.concat(byTitle);
    }

    async findByForm(artist: string, title: string): Promise<Song[]> {
        return this.songModel.find({
            artist: new RegExp(artist, 'i'),
            title: new RegExp(title, 'i'),
        }).exec();
    }

    async findByArtist(artist: string): Promise<Song[]> {
        return this.songModel.find({ artist: new RegExp(artist, 'i') }).exec();
    }

    async findByTitle(title: string): Promise<Song[]> {
        return this.songModel.find({ artist: new RegExp(title, 'i') }).exec();
    }

    async findAll(): Promise<Song[]> {
        return this.songModel.find().exec();
    }
}
