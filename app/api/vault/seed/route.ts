import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PromptModel } from '@/lib/models/Prompt';
import { CategoryModel } from '@/lib/models/Category';
import { QuickLinkModel } from '@/lib/models/QuickLink';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    // Clear all records in MongoDB
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
