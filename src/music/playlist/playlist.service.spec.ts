import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistService } from "./playlist.service";
import {MongooseModule} from "@nestjs/mongoose";
import { Playlist, PlaylistSchema } from "../core/schemas/playlist.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { FirebaseService } from "../../firebase-storage/firebase.service";

describe('PlaylistService', () => {
  let service: PlaylistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistService, FirebaseService],
      imports: [
        MongooseModule.forFeature([{ name: Playlist.name, schema: PlaylistSchema}]),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGO_URI')
          }),
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env'],
        })
      ],
    }).compile();

    service = module.get<PlaylistService>(PlaylistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
