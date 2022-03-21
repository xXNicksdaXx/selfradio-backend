import {
    Body, Controller,
    Get, HttpCode,
    HttpStatus, Param,
    Patch, Post,
    Put, StreamableFile
} from '@nestjs/common';

import { CreatePlaylistDto } from "./core/dto/create-playlist.dto";
import { Playlist } from "./core/schema/playlist.schema";
import { PlaylistService } from "./playlist.service";
import { Song } from "../song/core/schema/song.schema";


@Controller('playlist')
export class PlaylistController {

    private readonly playlistService: PlaylistService;

    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
    }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    async createPlaylist(@Body() createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
        return this.playlistService.createPlaylist(createPlaylistDto);
    }

    @Put('add/:id')
    @HttpCode(HttpStatus.OK)
    async addSongs(@Param('id') id: string, @Body() songs: Song[]): Promise<Playlist> {
        return this.playlistService.addSongsToPlaylist(id, songs);
    }

    @Patch('remove/:id')
    @HttpCode(HttpStatus.OK)
    async removeSongs(@Param('id') id: string, @Body() songs: Song[]): Promise<Playlist> {
        return this.playlistService.removeSongsFromPlaylist(id, songs);
    }

    @Get('find/all')
    @HttpCode(HttpStatus.OK)
    async findAllPlaylists(): Promise<Playlist[]> {
        return await this.playlistService.findAll();
    }

    @Get('download/:id')
    @HttpCode(HttpStatus.OK)
    async downloadPlaylist(@Param('id') id: string) {

        const playlist = await this.playlistService.findOneById(id);

        if(!playlist) {
            throw Error("No playlist with id "+ id);
        }

        const readStream = this.playlistService.zipPlaylist(playlist.name, playlist.songs);

        return new StreamableFile(readStream);
    }

}
