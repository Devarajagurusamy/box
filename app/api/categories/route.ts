import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryModel } from '@/lib/models/Category';

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
    if (scope === 'personal' && userId) {
      query = {
        $or: [
          { isPublic: true },
          { isPublic: { $exists: false } },
          { userId: null },
          { userId },
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

    const categories = await CategoryModel.find(query).lean();
    const formatted = categories.map((c: any) => {
      const { _id, __v, ...rest } = c;
      return rest;
    });
    return NextResponse.json(formatted);
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
    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const { userId } = await auth();
    const isPublic = body.isPublic !== undefined ? Boolean(body.isPublic) : true;

    const categoryData = {
      ...body,
      id: body.id || `cat-${Date.now()}`,
      userId: userId || null,
      isPublic,
    };

    const category = await CategoryModel.create(categoryData);
    return NextResponse.json(category, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
