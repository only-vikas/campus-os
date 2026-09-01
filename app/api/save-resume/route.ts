import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  const { userId } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const data = await request.json()
  const client = await clientPromise
  const db = client.db('campus_os')
  
  await db.collection('resumes').insertOne({
    userId,
    ...data,
    createdAt: new Date()
  })
  
  return NextResponse.json({ success: true })
}
