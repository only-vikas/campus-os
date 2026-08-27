import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

// POST: Save/update interview session
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db('campus-os');

    const sessionDoc = {
      ...body,
      userId: userId || 'guest',
      updatedAt: new Date(),
    };

    await db.collection('interviews').updateOne(
      { sessionId: body.sessionId },
      { $set: sessionDoc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Interview session save failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: Load latest session for user
export async function GET() {
  try {
    const { userId } = await auth();
    const uid = userId || 'guest';

    const client = await clientPromise;
    const db = client.db('campus-os');

    const session = await db
      .collection('interviews')
      .findOne(
        { userId: uid, status: { $ne: 'completed' } },
        { sort: { updatedAt: -1 } }
      );

    if (session) {
      return NextResponse.json({ session });
    }
    return NextResponse.json({ session: null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
