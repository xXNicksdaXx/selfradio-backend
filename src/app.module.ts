import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SongModule } from './song/song.module';
import { PlaylistModule } from './playlist/playlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: ['.env'],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    PlaylistModule,
    SongModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
