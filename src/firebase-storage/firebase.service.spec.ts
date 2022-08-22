import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import {AppModule} from "../app.module";

describe('FirebaseService', () => {
  let service: FirebaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseService],
      imports: [AppModule],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
