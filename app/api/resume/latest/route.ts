import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch latest parsed resume for user
export async function GET() {
  try {
    const { userId } = await auth();
    const uid = userId || 'guest';

    const client = await clientPromise;
    const db = client.db('campus-os');

    const resume = await db
      .collection('resumes')
      .findOne({ userId: uid }, { sort: { createdAt: -1 } });

    if (resume) {
      return NextResponse.json({ resume });
    }
    return NextResponse.json({ resume: null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
