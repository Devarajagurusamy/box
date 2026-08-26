import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryModel } from '@/lib/models/Category';

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    const { id } = await params;
    const body = await req.json();
    const { userId } = await auth();

    const existing = await CategoryModel.findOne({ id });
    if (existing && existing.userId && existing.userId !== userId && !existing.isPublic) {
      return NextResponse.json({ error: 'Unauthorized to edit this category.' }, { status: 401 });
    }

    const updated = await CategoryModel.findOneAndUpdate(
      { id },
      { ...body },
      { new: true, upsert: true }
    );

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    const { id } = await params;
    const { userId } = await auth();

    const existing = await CategoryModel.findOne({ id });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (existing.userId && existing.userId !== userId && !existing.isPublic) {
      return NextResponse.json({ error: 'Unauthorized to delete this category.' }, { status: 401 });
    }

    const deleted = await CategoryModel.findOneAndDelete({ id });
    return NextResponse.json({ success: true, id: deleted?.id });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
