import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectID } from 'bson';
import mongoose, { Document, Types } from 'mongoose';

import { Playlist } from "./playlist.schema";

@Schema({ _id: true, timestamps: { createdAt: false, updatedAt: true } })
export class Song {

    @Prop({ type: Types.ObjectId, required: true, default: () => new ObjectID() })
    _id: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    artist: string[];

    @Prop({ required: true , default: [] })
    feat: string[];

    @Prop({ required: false , default: '' })
    album: string;

    @Prop({ required: true })
    path: string;

    @Prop({ required: true, default: false })
    favorite: boolean;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }] })
    playlists: Playlist[];
}

export type SongDocument = Song & Document;

export const SongSchema = SchemaFactory.createForClass(Song);
