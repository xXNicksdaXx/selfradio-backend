import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from "@nestjs/platform-express";

import { SongService } from "./song.service";
import { Song } from "./schema/song.schema";

@Controller('song')
export class SongController {

    private readonly songService: SongService;

    constructor(songService: SongService) {
        this.songService = songService;
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadSong(@UploadedFile() file: Express.Multer.File): Promise<Song> {
        const metadata = file.originalname.split(" - ", 2);
        return await this.songService.createSong( {
            title: metadata[1].slice(0,-4),
            artist: metadata[0],
            directory: file.destination + "/" + file.filename,
        });
    }
}
