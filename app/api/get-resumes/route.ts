import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const client = await clientPromise
  const db = client.db('campus_os')
  
  const resumes = await db.collection('resumes')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray()
  
  return NextResponse.json(resumes)
}
