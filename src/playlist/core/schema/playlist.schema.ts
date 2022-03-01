import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

import { Song, SongSchema } from "../../../song/core/schema/song.schema";

@Schema()
export class Playlist {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop([{ type: SongSchema }] )
    songs: Song[];

    @Prop()
    cover: string;
}

export type PlaylistDocument = Playlist & Document;

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);