import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Put, StreamableFile } from '@nestjs/common';
import { createReadStream, ReadStream } from "fs";
const JSZip = require('jszip');

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

    @Get('find/all')
    @HttpCode(HttpStatus.OK)
    async findAllPlaylists(): Promise<Playlist[]> {
        return await this.playlistService.findAll();
    }

    @Get('download')
    @HttpCode(HttpStatus.OK)
    async downloadPlaylist(@Body() body: { id: string }) {

        const playlist = await this.playlistService.findOneById(body.id);

        const zip = new JSZip();
        const plZip = zip.folder(playlist.name);

        for(const song of playlist.songs) {
            const songData = createReadStream(song.directory);
            plZip.file(song._id.toString() + ".mp3", songData, {binary : true, compression : "DEFLATE"});
        }

        const readStream: ReadStream = zip.generateNodeStream({ type: "nodebuffer", streamFiles: true })

        return new StreamableFile(readStream);
    }

}
