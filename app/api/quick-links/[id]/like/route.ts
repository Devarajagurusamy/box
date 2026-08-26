import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { QuickLinkModel } from '@/lib/models/QuickLink';

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Context) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Please sign in to save this link to your personal space.' },
        { status: 401 }
      );
    }

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    const { id } = await params;
    const link = await QuickLinkModel.findOne({ id });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const likedBy = link.likedBy || [];
    const isCurrentlyLiked = likedBy.includes(userId);

    let updatedLink;
    let isFavoriteNow: boolean;

    if (isCurrentlyLiked) {
      // Unlike
      updatedLink = await QuickLinkModel.findOneAndUpdate(
        { id },
        { $pull: { likedBy: userId } },
        { new: true }
      );
      isFavoriteNow = false;
    } else {
      // Like & save to personal space
      updatedLink = await QuickLinkModel.findOneAndUpdate(
        { id },
        { $addToSet: { likedBy: userId } },
        { new: true }
      );
      isFavoriteNow = true;
    }

    return NextResponse.json({
      success: true,
      id,
      isFavorite: isFavoriteNow,
      likesCount: updatedLink?.likedBy?.length || 0,
      link: updatedLink,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
