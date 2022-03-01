import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema()
export class Song {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    artist: string;

    @Prop({ required: true })
    directory: string;
}

export type SongDocument = Song & Document;

export const SongSchema = SchemaFactory.createForClass(Song);
