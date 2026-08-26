import mongoose, { Schema, Model } from 'mongoose';

export interface ICategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  userId?: string | null;
  isPublic: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    icon: { type: String, default: 'Folder' },
    color: { type: String, default: 'bg-blue-600' },
    description: { type: String, default: '' },
    userId: { type: String, default: null, index: true },
    isPublic: { type: Boolean, default: true },
  },
  {
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const CategoryModel: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
