import mongoose, { Schema, Model } from 'mongoose';

export interface IQuickLink {
  id: string;
  name: string;
  url: string;
  iconName: string;
  category: string;
  description: string;
  userId?: string | null;
  isPublic: boolean;
  authorName: string;
  likedBy: string[];
  isFavorite?: boolean;
}

const QuickLinkSchema = new Schema<IQuickLink>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    iconName: { type: String, default: 'Globe' },
    category: { type: String, default: 'Tool' },
    description: { type: String, default: '' },
    userId: { type: String, default: null, index: true },
    isPublic: { type: Boolean, default: true, index: true },
    authorName: { type: String, default: 'Community' },
    likedBy: { type: [String], default: [] },
    isFavorite: { type: Boolean, default: false },
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

export const QuickLinkModel: Model<IQuickLink> =
  mongoose.models.QuickLink || mongoose.model<IQuickLink>('QuickLink', QuickLinkSchema);
