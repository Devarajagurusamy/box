import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { QuickLinkModel } from '@/lib/models/QuickLink';

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

    const links = await QuickLinkModel.find(query);
    return NextResponse.json(links);
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
    if (!body.name || !body.url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }

    const { userId } = await auth();
    const isPublic = body.isPublic !== undefined ? Boolean(body.isPublic) : true;

    if (!isPublic && !userId) {
      return NextResponse.json(
        { error: 'Sign in is required to save links to Personal Space.' },
        { status: 401 }
      );
    }

    let authorName = body.authorName || 'Community';
    if (userId) {
      try {
        const user = await currentUser();
        if (user) {
          authorName = user.fullName || user.username || user.firstName || 'User';
        }
      } catch {}
    }

    const linkData = {
      ...body,
      id: body.id || `tool-${Date.now()}`,
      userId: userId || null,
      isPublic,
      authorName,
      likedBy: body.likedBy || [],
    };

    const link = await QuickLinkModel.create(linkData);
    return NextResponse.json(link, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
