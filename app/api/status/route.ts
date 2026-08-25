import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const hasUri = Boolean(process.env.MONGODB_URI);
    if (!hasUri) {
      return NextResponse.json({
        connected: false,
        status: 'unconfigured',
        message: 'MONGODB_URI is not configured in .env.local',
      });
    }

    const mongoose = await connectToDatabase();
    if (mongoose && mongoose.connection.readyState === 1) {
      return NextResponse.json({
        connected: true,
        status: 'connected',
        database: mongoose.connection.name,
        host: mongoose.connection.host,
      });
    } else {
      return NextResponse.json({
        connected: false,
        status: 'disconnected',
        message: 'Could not establish connection to MongoDB',
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      connected: false,
      status: 'error',
      message: errorMsg,
    });
  }
}
