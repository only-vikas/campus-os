import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { usn, semester, subjects } = data;
    
    if (!usn || !semester || !subjects) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('campus_os');

    // Simple mock registration - in a real system we'd validate rules
    await db.collection('registrations').updateOne(
      { usn: usn.toUpperCase(), semester },
      { $set: { subjects, status: 'pending', date: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Registration submitted successfully' });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usn = searchParams.get('usn');
    const semester = searchParams.get('semester');

    if (!usn) return NextResponse.json({ error: 'USN required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('campus_os');

    const query: any = { usn: usn.toUpperCase() };
    if (semester) query.semester = parseInt(semester);

    const registration = await db.collection('registrations').findOne(query);
    
    return NextResponse.json(registration || { status: 'none' });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
