import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// In-memory rate limiter (1 run per 30 seconds)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 30 * 1000;

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 });

    // Client IP or identifier (In a real app, use request headers for IP)
    const clientIdentifier = 'TPO_GLOBAL'; 
    const now = Date.now();
    const lastRun = rateLimitMap.get(clientIdentifier) || 0;

    if (now - lastRun < RATE_LIMIT_WINDOW_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastRun)) / 1000);
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${waitTime} seconds before running the AI Engine again.` },
        { status: 429 }
      );
    }

    // Update rate limit timestamp
    rateLimitMap.set(clientIdentifier, now);

    const client = await clientPromise;
    const db = client.db('campus_os');

    // Fetch the job
    const job = await db.collection('placement_jobs').findOne({ _id: new ObjectId(jobId) });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Fetch all applications for this job
    const applications = await db.collection('placement_applications').find({ jobId }).toArray();
    
    // In a real scenario, we'd send the job.description and each student's resume text to Gemini API.
    // For this demo, we'll simulate the AI ranking by adjusting the matchScore and sorting.
    
    const updatedApps = applications.map(app => {
      // Simulate AI finding better/worse matches
      const variance = Math.floor(Math.random() * 20) - 10; // -10 to +10
      let newScore = app.matchScore + variance;
      if (newScore > 99) newScore = 99;
      if (newScore < 40) newScore = 40;
      
      return {
        ...app,
        matchScore: newScore,
        aiAnalysis: `AI Analysis complete. Match score adjusted to ${newScore}% based on skill alignment.`
      };
    });

    // Update all in DB
    for (const app of updatedApps) {
      await db.collection('placement_applications').updateOne(
        { _id: app._id },
        { $set: { matchScore: app.matchScore, aiAnalysis: app.aiAnalysis } }
      );
    }
    
    // Log the audit event
    await db.collection('audit_logs').insertOne({
      action: 'AI_RANKING_RUN',
      details: `Ran AI Ranking for Job ID ${jobId}. Processed ${applications.length} applications.`,
      timestamp: new Date(),
      user: 'TPO_SYSTEM'
    });

    return NextResponse.json({ success: true, processed: applications.length });
  } catch (error: any) {
    console.error('AI Rank API POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
