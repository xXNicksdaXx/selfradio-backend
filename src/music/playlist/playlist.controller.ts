import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    Param,
    Patch,
    Post,
    Put,
    StreamableFile
} from '@nestjs/common';

import { CreatePlaylistDto } from "../core/dtos/create-playlist.dto";
import { Playlist } from "../core/schemas/playlist.schema";
import { PlaylistService } from "./playlist.service";
import { EditPlaylistDto } from "../core/dtos/edit-playlist.dto";
import { Song } from "../core/schemas/song.schema";


@Controller('playlist')
export class PlaylistController {

    private readonly playlistService: PlaylistService;
    private readonly logger: Logger

    constructor(playlistService: PlaylistService) {
        this.playlistService = playlistService;
        this.logger = new Logger(PlaylistController.name);
    }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    async createPlaylist(@Body() createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
        if(createPlaylistDto.name === "Favorites") {
            this.logger.warn("This name is reserved for the Favorites playlist.")
            return ;
        } else {
            return this.playlistService.createPlaylist(createPlaylistDto);
        }
    }

    @Patch('update/:id')
    @HttpCode(HttpStatus.OK)
    async updatePlaylist(@Param('id') id: string, @Body() editPlaylistDto:EditPlaylistDto): Promise<Playlist> {
        return await this.playlistService.updatePlaylist(id, editPlaylistDto);
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

    @Get('find/:id')
    @HttpCode(HttpStatus.OK)
    async findPlaylistById(@Param('id') id: string): Promise<Playlist> {
        return await this.playlistService.findOneById(id);
    }

    @Get('find')
    @HttpCode(HttpStatus.OK)
    async findAllPlaylists(): Promise<Playlist[]> {
        return await this.playlistService.findAll();
    }

    @Get('search')
    @HttpCode(HttpStatus.OK)
    async searchSpecifically(@Body() dto: { name: string }): Promise<Playlist[]> {
        return await this.playlistService.findByName(dto.name);
    }

    @Get('download/:id')
    @HttpCode(HttpStatus.OK)
    async downloadPlaylist(@Param('id') id: string): Promise<StreamableFile> {

        const playlist = await this.playlistService.findOneById(id);

        if(playlist) {
            const zip = await this.playlistService.downloadPlaylist(playlist.name, playlist.songs);
            return new StreamableFile(zip);
        } else {
            this.logger.warn("Playlist with id "+id+" not found")
            return ;
        }
    }

}
