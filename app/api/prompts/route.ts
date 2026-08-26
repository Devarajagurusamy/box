import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PromptModel } from '@/lib/models/Prompt';

export async function GET(req: NextRequest) {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'public';
    const { userId } = await auth();

    let query: any = {};

    if (scope === 'personal') {
      if (!userId) {
        return NextResponse.json([]);
      }
      query = {
        $or: [
          { userId },
          { likedBy: userId },
        ],
      };
    } else {
      query = {
        $or: [
          { isPublic: true },
          { isPublic: { $exists: false } },
          { userId: null },
        ],
      };
    }

    const prompts = await PromptModel.find(query).sort({ createdAt: -1 });

    const formattedPrompts = prompts.map((p) => {
      const doc = p.toJSON();
      if (userId) {
        doc.isFavorite = (p.likedBy && p.likedBy.includes(userId)) || (p.userId === userId && p.isFavorite);
      }
      return doc;
    });

    return NextResponse.json(formattedPrompts);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    const body = await req.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const { userId } = await auth();
    let authorName = body.authorName || 'Community';

    if (userId) {
      try {
        const user = await currentUser();
        if (user) {
          authorName = user.fullName || user.username || user.firstName || 'User';
        }
      } catch {}
    }

    const isPublic = body.isPublic !== undefined ? Boolean(body.isPublic) : true;

    if (!isPublic && !userId) {
      return NextResponse.json(
        { error: 'Sign in is required to save to Personal Space.' },
        { status: 401 }
      );
    }

    const promptData = {
      ...body,
      id: body.id || `prompt-${Date.now()}`,
      userId: userId || null,
      isPublic,
      authorName,
      likedBy: body.isFavorite && userId ? [userId] : (body.likedBy || []),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const prompt = await PromptModel.create(promptData);
    return NextResponse.json(prompt, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
