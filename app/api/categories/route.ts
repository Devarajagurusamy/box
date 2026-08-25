import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { CategoryModel } from '@/lib/models/Category';

export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json({ error: 'Database connection unavailable' }, { status: 503 });
    }

    const categories = await CategoryModel.find();
    return NextResponse.json(categories);
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

    const categoryData = {
      ...body,
      id: body.id || `cat-${Date.now()}`,
    };

    const category = await CategoryModel.create(categoryData);
    return NextResponse.json(category, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
