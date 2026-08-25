import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { QuickLinkModel } from '@/lib/models/QuickLink';

interface Context {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    const { id } = await params;
    const deleted = await QuickLinkModel.findOneAndDelete({ id });
    if (!deleted) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
