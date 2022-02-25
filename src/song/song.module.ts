import { Module } from '@nestjs/common';
import { MulterModule } from "@nestjs/platform-express";
import { MongooseModule } from "@nestjs/mongoose";

import { SongController } from './song.controller';
import { SongService } from './song.service';
import { Song, SongSchema } from "./schema/song.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Song.name, schema: SongSchema}]),
    MulterModule.register({
      dest: './upload',
    }),
  ],
  controllers: [SongController],
  providers: [SongService]
})
export class SongModule {}
