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
import { Bucket } from "@google-cloud/storage"
import { createReadStream } from "fs";
import { memoryStorage } from "multer";
import mm from "music-metadata";

import { SongService } from "./song.service";
import { Song } from "./core/schema/song.schema";
import { audioFileFilter } from "./core/middleware/file-interceptor.middlware";
import { CreateSongDto } from "./core/dto/create-song.dto";
import { EditSongDto } from "./core/dto/edit-song.dto";
import { SearchSongDto } from "./core/dto/search-song.dto";
import { FirebaseService } from "./firebase-storage/firebase.service";

@Controller('song')
export class SongController {

    private readonly songService: SongService;
    private readonly firebaseService: FirebaseService

    constructor(songService: SongService, firebaseService: FirebaseService) {
        this.songService = songService;
        this.firebaseService = firebaseService;
    }

    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FilesInterceptor('files', 17, {
        storage: memoryStorage(),
        fileFilter: audioFileFilter,
    }))
    async uploadSongs(@UploadedFiles() files: Array<Express.Multer.File>): Promise<Song[]> {

        const songs: Song[] = [];
        const bucket: Bucket = this.firebaseService.getFirebaseBucket();

        for(const file of files) {

            //get file metadata
            const contents = file.buffer;
            const metadata = await mm.parseBuffer(contents);

            //check for double
            const double = await this.songService.findByQuery(
                metadata.common.title,
                metadata.common.artist,
                metadata.common.album
            );
            if (double.length === 0) {

                //generate path
                const path = this.songService.generateFileName(
                    file.originalname.split('.').pop()
                );

                //upload to firebase
                const firebaseFile = bucket.file(path);
                firebaseFile.save(contents, (error) => {
                    if(!error) console.log("File written successfully to Firebase Storage.");
                    else console.log(error);
                })

                const dto: CreateSongDto = {
                    title: metadata.common.title,
                    artist: metadata.common.artist,
                    album: metadata.common.album,
                    path: path
                }

                //create MongoDB Document
                songs.push(await this.songService.createSong(dto));

            } else {
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
