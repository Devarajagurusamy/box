import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PromptModel } from '@/lib/models/Prompt';

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    const { id } = await params;
    const prompt = await PromptModel.findOne({ id });
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json(prompt);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
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

    const existing = await PromptModel.findOne({ id });

    // If existing prompt has a private owner, ensure requester is the owner
    if (existing && existing.userId && existing.userId !== userId && !existing.isPublic) {
      return NextResponse.json({ error: 'Unauthorized to modify this personal prompt.' }, { status: 403 });
    }

    const updatePayload: any = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // If incrementing copy count or toggling like
    if (body.copyCount !== undefined && Object.keys(body).length <= 3) {
      const updated = await PromptModel.findOneAndUpdate(
        { id },
        { $set: updatePayload },
        { new: true }
      );
      return NextResponse.json(updated);
    }

    const updated = await PromptModel.findOneAndUpdate(
      { id },
      { $set: updatePayload },
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

    const existing = await PromptModel.findOne({ id });
    if (!existing) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // If it's a personal prompt, verify ownership
    if (existing.userId && existing.userId !== userId && !existing.isPublic) {
      return NextResponse.json({ error: 'Unauthorized to delete this personal prompt.' }, { status: 403 });
    }

    // If a user is deleting a prompt from their personal view that was liked from public, remove user from likedBy
    if (existing.isPublic && userId && existing.likedBy && existing.likedBy.includes(userId)) {
      await PromptModel.findOneAndUpdate(
        { id },
        { $pull: { likedBy: userId } }
      );
      return NextResponse.json({ success: true, id, message: 'Removed from personal favorites' });
    }

    await PromptModel.findOneAndDelete({ id });
    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
