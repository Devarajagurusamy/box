import mongoose, { Schema, Model } from 'mongoose';

export interface IQuickLink {
  id: string;
  name: string;
  url: string;
  iconName: string;
  category: string;
  description: string;
}

const QuickLinkSchema = new Schema<IQuickLink>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    iconName: { type: String, default: 'Globe' },
    category: { type: String, default: 'Tool' },
    description: { type: String, default: '' },
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
