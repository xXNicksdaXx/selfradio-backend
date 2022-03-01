import {Body, Controller, HttpCode, HttpStatus, Post, Put} from '@nestjs/common';

import { CreatePlaylistDto } from "./core/dto/create-playlist.dto";
import { Playlist } from "./core/schema/playlist.schema";
import { PlaylistService } from "./playlist.service";
import { AddSongDto } from "./core/dto/add-song.dto";

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
    async addSong(@Body() addSongDto: AddSongDto): Promise<Playlist> {
        return this.playlistService.addSongToPlaylist(addSongDto.playlistId, addSongDto.songs.pop());
    }

    @Put('add/many')
    @HttpCode(HttpStatus.OK)
    async addSongs(@Body() addSongDto: AddSongDto): Promise<Playlist> {
        return this.playlistService.addSongsToPlaylist(addSongDto.playlistId, addSongDto.songs);
    }



}
