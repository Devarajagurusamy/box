import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PromptModel } from '@/lib/models/Prompt';

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Context) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Please sign in to save this prompt to your personal space.' },
        { status: 401 }
      );
    }

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    const { id } = await params;
    const prompt = await PromptModel.findOne({ id });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const likedBy = prompt.likedBy || [];
    const isCurrentlyLiked = likedBy.includes(userId);

    let updatedPrompt;
    let isFavoriteNow: boolean;

    if (isCurrentlyLiked) {
      // Remove from likes
      updatedPrompt = await PromptModel.findOneAndUpdate(
        { id },
        {
          $pull: { likedBy: userId },
          $set: { updatedAt: new Date().toISOString() },
        },
        { new: true }
      );
      isFavoriteNow = false;
    } else {
      // Add to likes
      updatedPrompt = await PromptModel.findOneAndUpdate(
        { id },
        {
          $addToSet: { likedBy: userId },
          $set: { updatedAt: new Date().toISOString() },
        },
        { new: true }
      );
      isFavoriteNow = true;
    }

    return NextResponse.json({
      success: true,
      id,
      isFavorite: isFavoriteNow,
      likesCount: updatedPrompt?.likedBy?.length || 0,
      prompt: updatedPrompt,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
