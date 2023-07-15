import mongoose, { Document, Model } from 'mongoose';
import { Schema } from 'mongoose';

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'w',
  N = 'N',
}

export interface Beach {
  _id?: string;
  name: string;
  position: BeachPosition;
  lat: number;
  lng: number;
  user?: string;
}

export interface BeachModel extends Omit<Beach, '_id'>, Document {}

const schema = new mongoose.Schema<BeachModel>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const Beach: Model<BeachModel> = mongoose.model('Beach', schema);
