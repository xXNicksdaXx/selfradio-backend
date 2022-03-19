import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectID } from 'bson';
import { Document, Types } from 'mongoose';

@Schema({ _id: true, timestamps: { createdAt: false, updatedAt: true } })
export class Song {

    @Prop({ type: Types.ObjectId, required: true, default: () => new ObjectID() })
    _id: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    artist: string;

    @Prop({ required: false })
    album: string;

    @Prop({ required: true })
    path: string;

    @Prop({ required: true, default: false })
    favorite: boolean;
}

export type SongDocument = Song & Document;

export const SongSchema = SchemaFactory.createForClass(Song);
