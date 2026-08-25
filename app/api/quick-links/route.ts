import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { QuickLinkModel } from '@/lib/models/QuickLink';

export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    const links = await QuickLinkModel.find();
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

    const linkData = {
      ...body,
      id: body.id || `tool-${Date.now()}`,
    };

    const link = await QuickLinkModel.create(linkData);
    return NextResponse.json(link, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
