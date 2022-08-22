import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Song, SongDocument } from "../core/schemas/song.schema";
import { Playlist, PlaylistDocument } from "../core/schemas/playlist.schema";
import { NoSongException } from "../core/exceptions/no-song.exception";

@Injectable()
export class ManagementService {

    private readonly songModel: Model<SongDocument>;
    private readonly playlistModel: Model<PlaylistDocument>;

    constructor(
        @InjectModel(Song.name) songModel: Model<SongDocument>,
        @InjectModel(Playlist.name) playlistModel: Model<PlaylistDocument>
    ) {
        this.songModel = songModel;
        this.playlistModel= playlistModel;
    }

    async favourSong(id: string, favorite: boolean): Promise<Song> {

        const song: Song = await this.songModel.findByIdAndUpdate(
            new Types.ObjectId(id),
            { favorite: favorite },
            { new: true }
        ).exec();

        if(!song) {
            throw new NoSongException();
        }

        //add or remove song from 'Favorites' playlist
        const favorites = await this.playlistModel.findOne({ name: new RegExp('Favorites') }).exec();
        if (favorite) {
            await this.addSongsToPlaylist(favorites._id.toString(), [song]);
        } else {
            await this.removeSongsFromPlaylist(favorites._id.toString(), [song]);
        }

        return song;
    }

    async addSongsToPlaylist(playlistId: string, songs: Song[]): Promise<Playlist> {

        const playlist = await this.playlistModel.findById(new Types.ObjectId(playlistId)).exec();

        for(const song of songs) {

            //check for duplicate
            const index = playlist.songs.findIndex(value => (value._id.toString() === song._id.toString()))
            if(index > -1) {
                //duplicate, change song to new version of this song
                playlist.songs[index] = song;
            } else {
                //no duplicate, just push into array
                song.playlists.push(playlist._id);
                playlist.songs.push(song);
            }

            //update in songs-db
            const id = song._id;
            delete song._id;
            await this.songModel.findByIdAndUpdate(new Types.ObjectId(id), song);
        }

        return playlist.save();
    }

    async removeSongsFromPlaylist(playlistId: string, songs: Song[]): Promise<Playlist> {

        const playlist = await this.playlistModel.findById(new Types.ObjectId(playlistId)).exec();

        for(const song of songs) {

            // remove ObjectID reference from song
            const index = playlist.songs.findIndex(
                value => (value._id.toString() === song._id.toString())
            )
            if(index > -1) song.playlists.splice(index, 1);

            playlist.songs = playlist.songs.filter((element: Song) => {
                return element._id !== song._id;
            });

            const id = song._id;
            delete song._id;
            await this.songModel.findByIdAndUpdate(new Types.ObjectId(id), song);
        }

        return playlist.save();
    }

    async updateSongInAffectedPlaylists(song: Song) {
        const populatedSong = await this.songModel.findById(song._id)
            .populate('playlists')
            .exec();

        for(const playlist of populatedSong.playlists) {
            //check for song

            const index = playlist.songs.findIndex(value => (value._id.toString() === song._id.toString()))
            if(index > -1) {
                //song in playlist -> update
                playlist.songs[index] = song;

                this.playlistModel.findByIdAndUpdate(playlist._id, playlist);
            }
        }
    }

    async removeSongFromAffectedPlaylists(song: Song) {
        const populatedSong = await this.songModel.findById(song._id)
            .populate('playlists')
            .exec();

        for(const playlist of populatedSong.playlists) {
            //check for song
            const index = playlist.songs.findIndex(value => (value._id.toString() === song._id.toString()))
            if(index > -1) {
                //song in playlist -> update
                playlist.songs.splice(index, 1);

                this.playlistModel.findByIdAndUpdate(playlist._id, playlist);
            }
        }
    }

}
