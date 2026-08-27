import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch all completed interviews for user
export async function GET() {
  try {
    const { userId } = await auth();
    const uid = userId || 'guest';

    const client = await clientPromise;
    const db = client.db('campus-os');

    const interviews = await db
      .collection('interviews')
      .find({ userId: uid, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ interviews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
