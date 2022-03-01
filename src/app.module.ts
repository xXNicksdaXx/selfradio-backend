import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongModule } from './song/song.module';
import { PlaylistModule } from './playlist/playlist.module';

@Module({
  imports: [
      MongooseModule.forRoot('mongodb://localhost/selfradio'),
      PlaylistModule,
      SongModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
