import { Test, TestingModule } from '@nestjs/testing';
import { ManagementService } from './management.service';
import { MongooseModule } from "@nestjs/mongoose";
import { Song, SongSchema } from "../core/schemas/song.schema";
import { Playlist, PlaylistSchema } from "../core/schemas/playlist.schema";
import { ConfigModule, ConfigService } from "@nestjs/config";

describe('ManagementService', () => {
  let service: ManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManagementService],
      imports: [
        MongooseModule.forFeature([{ name: Song.name, schema: SongSchema}]),
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
        }),
      ],
    }).compile();

    service = module.get<ManagementService>(ManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
