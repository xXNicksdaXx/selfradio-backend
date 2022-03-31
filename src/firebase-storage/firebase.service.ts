import { Injectable } from '@nestjs/common';
import { Bucket } from "@google-cloud/storage"
import { getStorage } from "firebase-admin/storage";


@Injectable()
export class FirebaseService {

    private bucket: Bucket;

    getFirebaseBucket(): Bucket {
        if(!this.bucket) {
            return this.bucket = getStorage().bucket();
        } else {
            return this.bucket;
        }
    }

}
