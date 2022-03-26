import {
    Body, Controller,
    Delete, Get,
    HttpCode, HttpStatus,
    Param, Patch,
    Post, StreamableFile,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from "@nestjs/platform-express";
import { createReadStream, unlink } from "fs";
import { diskStorage } from "multer";
import mm from "music-metadata";

import { SongService } from "./song.service";
import { Song } from "./core/schema/song.schema";
import { audioFileFilter, editFileName } from "./core/middleware/file-interceptor.middlware";
import { CreateSongDto } from "./core/dto/create-song.dto";
import { EditSongDto } from "./core/dto/edit-song.dto";
import { SearchSongDto } from "./core/dto/search-song.dto";

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
        fileFilter: audioFileFilter,
    }))
    async uploadSongs(@UploadedFiles() files: Array<Express.Multer.File>): Promise<Song[]> {
        const songs = [];
        for(const file of files) {

            //get path of file
            const path = file.destination + "/" + file.filename;

            //get file metadata
            const metadata = await mm.parseStream(createReadStream(path));
            const dto:CreateSongDto = {
                title: metadata.common.title,
                artist: metadata.common.artist,
                album: metadata.common.album,
                path: path,
            }

            //check for double
            const double = await this.songService.findByQuery(dto.title, dto.artist, dto.album);
            if (double.length === 0) {
                //create MongoDB Document
                songs.push(await this.songService.createSong(dto));
            } else {
                unlink(path, (error) => {
                    if(error) {
                        console.log(error);
                    } else {
                        console.log("File removed:", path);
                    }
                })
                console.warn("This song already exists!");
            }

        }
        return songs;
    }

    @Get('download/:id')
    @HttpCode(HttpStatus.OK)
    async download(@Param('id') id: string): Promise<StreamableFile> {
        const song = await this.songService.findById(id);
        const file = createReadStream(song.path);

        return new StreamableFile(file);
    }


    @Get('find/:id')
    @HttpCode(HttpStatus.OK)
    async findById(@Param('id') id: string): Promise<Song> {
        return await this.songService.findById(id);
    }

    @Get('find')
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<Song[]> {
        return await this.songService.findAll();
    }

    @Get('search/any')
    @HttpCode(HttpStatus.OK)
    async searchAnything(@Body() body: { search: string }): Promise<Song[]> {
        return await this.songService.findBySearch(body.search);
    }

    @Get('search/specific?')
    @HttpCode(HttpStatus.OK)
    async searchSpecifically(@Body() dto: SearchSongDto): Promise<Song[]> {
        return await this.songService.findByQuery(dto.title, dto.artist, dto.album);
    }

    @Patch('update/:id')
    @HttpCode(HttpStatus.OK)
    async updateSong(@Param('id') id: string, @Body() editSongDto:EditSongDto): Promise<Song> {
        return await this.songService.updateOne(id, editSongDto)
    }

    @Delete('delete/:id')
    @HttpCode(HttpStatus.OK)
    async deleteSong(@Param('id') id: string ): Promise<Song> {
        return await this.songService.deleteOne(id);
    }
}
