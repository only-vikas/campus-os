import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usn = searchParams.get('usn');
    const jobId = searchParams.get('jobId');

    const client = await clientPromise;
    const db = client.db('campus_os');

    const query: any = {};
    if (usn) query.usn = usn.toUpperCase();
    if (jobId) query.jobId = jobId;

    const applications = await db.collection('placement_applications').find(query).sort({ appliedDate: -1 }).toArray();
    return NextResponse.json(applications);
  } catch (error: any) {
    console.error('Placement Applications API GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const app = await request.json();
    const { usn, jobId } = app;
    
    if (!usn || !jobId) return NextResponse.json({ error: 'USN and jobId required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('campus_os');

    // Check if already applied
    const existing = await db.collection('placement_applications').findOne({ usn: usn.toUpperCase(), jobId });
    if (existing) return NextResponse.json({ error: 'Already applied to this job' }, { status: 400 });

    app.appliedDate = new Date();
    app.status = 'Applied';
    app.usn = usn.toUpperCase();
    
    // Simulate an initial AI Match Score between 60 and 95
    app.matchScore = Math.floor(Math.random() * (95 - 60 + 1) + 60);

    const result = await db.collection('placement_applications').insertOne(app);
    
    // Increment applied count in job
    await db.collection('placement_jobs').updateOne(
      { _id: new ObjectId(jobId) },
      { $inc: { applied: 1 } }
    );

    return NextResponse.json({ ...app, _id: result.insertedId });
  } catch (error: any) {
    console.error('Placement Applications API POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: 'ID and status required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('campus_os');

    await db.collection('placement_applications').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, lastUpdated: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Placement Applications API PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
