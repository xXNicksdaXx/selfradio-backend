import {
    Body,
    Controller, Delete,
    Get,
    HttpCode,
    HttpStatus,
    Patch, Post, StreamableFile,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "fs";
import { diskStorage } from "multer";
import mm from "music-metadata";

import { SongService } from "./song.service";
import { Song } from "./core/schema/song.schema";
import { SearchSongDto } from "./core/dto/search-song.dto";
import { EditSongDto } from "./core/dto/edit-song.dto";
import { audioFileFilter, editFileName } from "./core/middleware/file-interceptor.middlware";


@Controller('song')
export class SongController {

    private readonly songService: SongService;

    constructor(songService: SongService) {
        this.songService = songService;
    }

    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FilesInterceptor('files', 311, {
        storage: diskStorage({
            destination: './upload',
            filename: editFileName
        }),
        fileFilter: audioFileFilter
    }))
    async uploadSongs(@UploadedFiles() files: Array<Express.Multer.File>): Promise<Song[]> {

        const response = [];

        for(const file of files) {

            const path = file.destination + "/" + file.filename;

            //get file metadata
            const metadata = await mm.parseStream(createReadStream(path));
            console.log(metadata);

            //create MongoDB Document
            response.push(await this.songService.createSong( {
                title: metadata.common.title,
                artist: metadata.common.artist,
                album: metadata.common.album,
                path: path,
            }));
        }

        return response;
    }

    @Get('download/single')
    @HttpCode(HttpStatus.OK)
    async downloadSong(@Body() song: Song): Promise<StreamableFile> {

        const file = createReadStream(song.path);
        return new StreamableFile(file);
    }


    @Get('find/any')
    @HttpCode(HttpStatus.OK)
    async findBySearch(@Body() body: { search: string }): Promise<Song[]> {
        return await this.songService.findByAnything(body.search);
    }

    @Get('find/form')
    @HttpCode(HttpStatus.OK)
    async findByForm(@Body() searchSongDto: SearchSongDto): Promise<Song[]> {
        return await this.songService.findByForm(searchSongDto.artist, searchSongDto.title);
    }

    @Get('find/artist')
    @HttpCode(HttpStatus.OK)
    async findByArtist(@Body() body: { artist: string }): Promise<Song[]> {
        return await this.songService.findByArtist(body.artist);
    }

    @Get('find/title')
    @HttpCode(HttpStatus.OK)
    async findByTitle(@Body() body: { title: string }): Promise<Song[]> {
        return await this.songService.findByTitle(body.title);
    }

    @Get('find/all')
    @HttpCode(HttpStatus.OK)
    async findAllSongs(): Promise<Song[]> {
        return await this.songService.findAll();
    }

    @Patch('update')
    @HttpCode(HttpStatus.OK)
    async updateSong(@Body() editSongDto:EditSongDto): Promise<Song> {
        let update;
        if(editSongDto.artist !== 'undefined') {
            if(editSongDto.title !== 'undefined') update = { artist: editSongDto.artist, title: editSongDto.title};
            else update = { artist: editSongDto.artist };
        }
        else {
            if (editSongDto.title !== 'undefined') update = { title: editSongDto.title };
            else return;
        }

        return await this.songService.updateOne(editSongDto.id, update)
    }

    @Delete('delete')
    @HttpCode(HttpStatus.OK)
    async deleteSong(@Body() body: { id: string }): Promise<Song> {
        return await this.songService.deleteOne(body.id);
    }
}
