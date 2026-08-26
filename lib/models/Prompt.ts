import mongoose, { Schema, Model } from 'mongoose';
import { PromptLink, AIModelType } from '@/app/types';

export interface IPrompt {
  id: string;
  title: string;
  description: string;
  content: string;
  categoryId: string;
  tags: string[];
  model?: AIModelType;
  links: PromptLink[];
  isFavorite: boolean;
  copyCount: number;
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
  isPublic: boolean;
  authorName: string;
  likedBy: string[];
  originalPromptId?: string;
}

const PromptLinkSchema = new Schema<PromptLink>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const PromptSchema = new Schema<IPrompt>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    content: { type: String, required: true },
    categoryId: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    model: {
      type: String,
      default: 'General',
    },
    links: { type: [PromptLinkSchema], default: [] },
    isFavorite: { type: Boolean, default: false },
    copyCount: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
    userId: { type: String, default: null, index: true },
    isPublic: { type: Boolean, default: true, index: true },
    authorName: { type: String, default: 'Community' },
    likedBy: { type: [String], default: [] },
    originalPromptId: { type: String, default: null },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const PromptModel: Model<IPrompt> =
  mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema);
