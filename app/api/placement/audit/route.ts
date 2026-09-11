import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('campus_os');

    const logs = await db.collection('audit_logs').find({}).sort({ timestamp: -1 }).limit(50).toArray();
    
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Audit API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
