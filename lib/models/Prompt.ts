import mongoose, { Schema, Document, Model } from 'mongoose';
import { PromptLink, AIModelType } from '@/app/types';

export interface IPrompt extends Document {
  id: string;
  title: string;
  description: string;
  content: string;
  categoryId: string;
  tags: string[];
  model: AIModelType;
  links: PromptLink[];
  isFavorite: boolean;
  copyCount: number;
  createdAt: string;
  updatedAt: string;
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
      enum: ['ChatGPT', 'Claude', 'Gemini', 'DeepSeek', 'Midjourney', 'Cursor', 'General'],
      default: 'General',
    },
    links: { type: [PromptLinkSchema], default: [] },
    isFavorite: { type: Boolean, default: false },
    copyCount: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const PromptModel: Model<IPrompt> =
  mongoose.models.Prompt || mongoose.model<IPrompt>('Prompt', PromptSchema);
