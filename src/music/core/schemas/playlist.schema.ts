import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectID } from 'bson';
import { Document, Types } from 'mongoose';

import { Song, SongSchema } from "./song.schema";

@Schema({ _id: true, timestamps: { createdAt: false, updatedAt: true } })
export class Playlist {

    @Prop({ type: Types.ObjectId, required: true, default: () => new ObjectID() })
    _id: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop([{ type: SongSchema }] )
    songs: Song[];

}

export type PlaylistDocument = Playlist & Document;

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);