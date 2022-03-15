import {Body, Controller, HttpCode, HttpStatus, Patch, Post, Put} from '@nestjs/common';

import { CreatePlaylistDto } from "./core/dto/create-playlist.dto";
import { Playlist } from "./core/schema/playlist.schema";
import { PlaylistService } from "./playlist.service";
import { PlaylistSongsDto } from "./core/dto/playlist-songs.dto";

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

    @Put('add/single')
    @HttpCode(HttpStatus.OK)
    async addSong(@Body() playlistSongsDto: PlaylistSongsDto): Promise<Playlist> {
        return this.playlistService.addSongToPlaylist(playlistSongsDto.playlistId, playlistSongsDto.songs.pop());
    }

    @Put('add/many')
    @HttpCode(HttpStatus.OK)
    async addSongs(@Body() playlistSongsDto: PlaylistSongsDto): Promise<Playlist> {
        return this.playlistService.addSongsToPlaylist(playlistSongsDto.playlistId, playlistSongsDto.songs);
    }

    @Patch('remove/single')
    @HttpCode(HttpStatus.OK)
    async removeSong(@Body() playlistSongsDto: PlaylistSongsDto): Promise<Playlist> {
        return this.playlistService.removeFromPlaylist(playlistSongsDto.playlistId, playlistSongsDto.songs.pop());
    }



}
