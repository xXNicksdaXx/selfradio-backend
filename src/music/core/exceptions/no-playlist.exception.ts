import {BadRequestException} from "@nestjs/common";


export class NoPlaylistException extends BadRequestException {

    constructor(error?: string) {
        super("Could not retrieve playlist from MongoDB", error);
    }

}