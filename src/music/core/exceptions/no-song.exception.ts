import {BadRequestException} from "@nestjs/common";


export class NoSongException extends BadRequestException {

    constructor(error?: string) {
        super("Could not retrieve song from MongoDB", error);
    }

}