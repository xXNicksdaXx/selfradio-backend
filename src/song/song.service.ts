import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';

import { Song, SongDocument } from "./schema/song.schema";
import { CreateSongDto } from "./dto/create-song.dto";

@Injectable()
export class SongService {

    constructor(@InjectModel(Song.name) private songModel: Model<SongDocument>) {
    }

    async createSong(createSongDto: CreateSongDto): Promise<Song> {
        const createdSong = new this.songModel(createSongDto);
        return createdSong.save();
    }
}
