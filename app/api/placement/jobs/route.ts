import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // e.g., 'active'

    const client = await clientPromise;
    const db = client.db('campus_os');

    const query: any = {};
    if (status) query.status = status;

    const jobs = await db.collection('placement_jobs').find(query).sort({ deadline: 1 }).toArray();
    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error('Placement Jobs API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const job = await request.json();
    const client = await clientPromise;
    const db = client.db('campus_os');

    // Make sure deadline is a date object
    if (job.deadline) job.deadline = new Date(job.deadline);
    
    job.createdAt = new Date();
    job.status = job.status || 'active';
    job.applied = 0;

    const result = await db.collection('placement_jobs').insertOne(job);
    return NextResponse.json({ ...job, _id: result.insertedId });
  } catch (error: any) {
    console.error('Placement Jobs API POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
