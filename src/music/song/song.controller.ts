import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param,
    Patch,
    Post,
    StreamableFile,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from "@nestjs/platform-express";
import { Bucket, DownloadResponse } from "@google-cloud/storage"
import { memoryStorage } from "multer";
import mm from "music-metadata";

import { SongService } from "./song.service";
import { FirebaseService } from "../../firebase-storage/firebase.service";
import { audioFileFilter } from "../core/filter/file-interceptor.filter";
import { Song } from "../core/schemas/song.schema";
import { CreateSongDto } from "../core/dtos/create-song.dto";
import { SearchSongDto } from "../core/dtos/search-song.dto";
import { EditSongDto } from "../core/dtos/edit-song.dto";

@Controller('song')
export class SongController {

    private readonly songService: SongService;
    private readonly firebaseService: FirebaseService;
    private readonly logger: Logger;

    constructor(songService: SongService, firebaseService: FirebaseService) {
        this.songService = songService;
        this.firebaseService = firebaseService;
        this.logger = new Logger(SongController.name);
    }

    @Post('upload')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FilesInterceptor('files', 17, {
        storage: memoryStorage(),
        fileFilter: audioFileFilter,
    }))
    async uploadSongs(@UploadedFiles() files: Array<Express.Multer.File>): Promise<Song[]> {

        const bucket: Bucket = this.firebaseService.getFirebaseBucket();
        const songs: Song[] = [];

        for(const file of files) {

            //get file metadata
            const contents = file.buffer;
            const metadata = await mm.parseBuffer(contents, 'audio/mpeg');

            //check for duplicate
            const duplicate = await this.songService.findByQuery(
                metadata.common.title,
                metadata.common.artist,
                metadata.common.album
            );
            if (duplicate.length === 0) {

                //generate path
                const path = this.songService.generateFileName(
                    file.originalname.split('.').pop()
                );

                //upload to firebase
                const firebaseFile = bucket.file(path);
                firebaseFile.save(contents, (error) => {
                    if(!error) this.logger.log("File written successfully to Firebase Storage.");
                    else console.log(error);
                })

                //create MongoDB Document
                const dto: CreateSongDto = {
                    title: metadata.common.title,
                    artist: metadata.common.artist,
                    album: metadata.common.album,
                    path: path
                }
                songs.push(await this.songService.createSong(dto));

            } else {
                this.logger.warn("This Song already exists in the database, no upload necessary!")
            }
        }

        return songs;
    }

    @Get('download/:id')
    @HttpCode(HttpStatus.OK)
    async download(@Param('id') id: string): Promise<StreamableFile> {

        const song = await this.songService.findById(id);

        if(song) {
            //retrieve song from firebase
            const bucket = this.firebaseService.getFirebaseBucket();
            const contents: DownloadResponse = await bucket.file(song.path).download();
            this.logger.log(id + " retrieved from Firebase Cloud Storage")
            return new StreamableFile(contents.pop());
        } else {
            this.logger.warn("Song with id "+id+" not found")
            return ;
        }
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

    @Get('search/specific')
    @HttpCode(HttpStatus.OK)
    async searchSpecifically(@Body() dto: SearchSongDto): Promise<Song[]> {
        return await this.songService.findByQuery(dto.title, dto.artist, dto.album);
    }

    @Patch('update/:id')
    @HttpCode(HttpStatus.OK)
    async updateSong(@Param('id') id: string, @Body() editSongDto:EditSongDto): Promise<Song> {
        return await this.songService.updateOne(id, editSongDto)
    }

    @Patch('favour/:id')
    @HttpCode(HttpStatus.OK)
    async favourSong(@Param('id') id: string, @Body() body: { favorite: boolean }): Promise<Song> {
        return await this.songService.favourSong(id, body.favorite);
    }

    @Delete('delete/:id')
    @HttpCode(HttpStatus.OK)
    async deleteSong(@Param('id') id: string ): Promise<Song> {
        return await this.songService.deleteOne(id);
    }
}
