import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";

import { Song, SongSchema } from "./core/schemas/song.schema";
import { Playlist, PlaylistSchema } from "./core/schemas/playlist.schema";
import { SongController } from "./song/song.controller";
import { PlaylistController } from "./playlist/playlist.controller";
import { SongService } from "./song/song.service";
import { PlaylistService } from "./playlist/playlist.service";
import { FirebaseService } from "../firebase-storage/firebase.service";
import { ManagementService } from './management/management.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Song.name, schema: SongSchema}]),
        MongooseModule.forFeature([{ name: Playlist.name, schema: PlaylistSchema}]),
    ],
    controllers: [
        SongController,
        PlaylistController
    ],
    providers: [
        SongService,
        PlaylistService,
        FirebaseService,
        ManagementService
    ]
})
export class MusicModule {}
