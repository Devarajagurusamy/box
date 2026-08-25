import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PromptModel } from '@/lib/models/Prompt';
import { CategoryModel } from '@/lib/models/Category';
import { QuickLinkModel } from '@/lib/models/QuickLink';

export async function POST() {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    // Clear all dummy records in MongoDB
    await PromptModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await QuickLinkModel.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'Vault has been cleared in MongoDB.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
