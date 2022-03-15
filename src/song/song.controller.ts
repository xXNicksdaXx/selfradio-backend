import {
    Body,
    Controller, Delete,
    Get,
    HttpCode,
    HttpStatus,
    Patch, Post,
    UploadedFile,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";

import { SongService } from "./song.service";
import { Song } from "./core/schema/song.schema";
import { SearchSongDto } from "./core/dto/search-song.dto";
import {EditSongDto} from "./core/dto/edit-song.dto";

@Controller('song')
export class SongController {

    private readonly songService: SongService;

    constructor(songService: SongService) {
        this.songService = songService;
    }

    @Post('upload/single')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('file'))
    async uploadSong(@UploadedFile() file: Express.Multer.File): Promise<Song> {
        const metadata = file.originalname.split(" - ", 2);
        return await this.songService.createSong( {
            title: metadata[1].slice(0,-4),
            artist: metadata[0],
            directory: file.destination + "/" + file.filename,
        });
    }

    @Post('upload/many')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FilesInterceptor('files'))
    async uploadSongs(@UploadedFiles() files: Array<Express.Multer.File>): Promise<Song[]> {
        let songs = [];
        for(const file of files) {
            const metadata = file.originalname.split(" - ", 2);
            songs.push(await this.songService.createSong( {
                title: metadata[1].slice(0,-4),
                artist: metadata[0],
                directory: file.destination + "/" + file.filename,
            }));
        }
        return songs;
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
