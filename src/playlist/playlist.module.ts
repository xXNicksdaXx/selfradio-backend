import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";

import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
import { Playlist, PlaylistSchema } from "./core/schema/playlist.schema";
import {FirebaseService} from "../firebase-storage/firebase.service";

@Module({
  imports: [
      MongooseModule.forFeature([{ name: Playlist.name, schema: PlaylistSchema}]),
  ],
  controllers: [PlaylistController],
  providers: [PlaylistService, FirebaseService]
})
export class PlaylistModule {}
