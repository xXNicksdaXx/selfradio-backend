import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';
const ID3Writer = require('browser-id3-writer');

import { Song, SongDocument } from "../core/schemas/song.schema";
import { CreateSongDto } from "../core/dtos/create-song.dto";
import {EditSongDto} from "../core/dtos/edit-song.dto";
import {NoSongException} from "../core/exceptions/no-song.exception";

@Injectable()
export class SongService {

    private readonly songModel: Model<SongDocument>;

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

    async findByQuery(title: string, artist: string, album?: string): Promise<Song[]> {
        if(!album) {
            return this.songModel.find({
                title: new RegExp(title, 'i'),
                artist: new RegExp(artist, 'i'),
                feat: new RegExp(artist, 'i'),
            }).exec();
        }
        return this.songModel.find({
            title: new RegExp(title, 'i'),
            artist: new RegExp(artist, 'i'),
            feat: new RegExp(artist, 'i'),
            album: new RegExp(album, 'i'),
        }).exec();
    }

    async findByArtist(artist: string): Promise<Song[]> {
        const byArtist = await this.songModel.find({ artist: new RegExp(artist, 'i') }).exec();
        const byFeat = await this.songModel.find({ feat: new RegExp(artist, 'i') }).exec();
        return byArtist.concat(byFeat);
    }

    async findByTitle(title: string): Promise<Song[]> {
        return this.songModel.find({ title: new RegExp(title, 'i') }).exec();
    }

    async findAll(): Promise<Song[]> {
        return this.songModel.find().exec();
    }

    async updateSong(id: string, editSongDto: EditSongDto): Promise<Song> {

        const song: Song =  await this.songModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            editSongDto,
            { new: true }
        ).exec();

        if(!song) throw new NoSongException();

        return song;
    }

    async deleteSong(id: string): Promise<Song> {

        const song: Song = await this.songModel.findByIdAndRemove(new Types.ObjectId(id));

        if(!song) throw new NoSongException();

        return song;
    }

    generateFileName(ext: string): string {
        const random = Array(8)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
        return random + "." + ext;
    }

    changeMetadataInFile(buffer: Buffer, song:Song): Buffer {
        const writer = new ID3Writer(buffer);
        writer.setFrame('TIT2', song.title)
            .setFrame('TPE1', song.artist.concat(song.feat))
            .setFrame('TPE2', song.artist.join(', '))
            .setFrame('TPE4', song.feat.join(', '))
            .setFrame('TALB', song.album);
        writer.addTag();
        return Buffer.from(writer.arrayBuffer);
    }
}
