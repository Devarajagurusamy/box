import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    icon: { type: String, default: 'Folder' },
    color: { type: String, default: 'bg-blue-600' },
    description: { type: String, default: '' },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CategoryModel: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
