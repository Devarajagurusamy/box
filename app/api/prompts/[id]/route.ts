import { NextRequest, NextResponse } from 'next/server';
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

    const updated = await PromptModel.findOneAndUpdate(
      { id },
      { ...body, updatedAt: new Date().toISOString() },
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
    const deleted = await PromptModel.findOneAndDelete({ id });
    if (!deleted) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
