import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// Phase 1: In a real app we'd get the user from auth (e.g. Clerk)
// For now, let's tie transactions to a hardcoded or guest user

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';
    
    const client = await clientPromise;
    const db = client.db('campus_os');
    
    const transactions = await db.collection('transactions')
      .find({ userId })
      .sort({ date: -1 })
      .limit(100)
      .toArray();
      
    // Remove _id from mongo result and convert to string if needed
    const safeTx = transactions.map(tx => ({
      ...tx,
      _id: undefined,
      id: tx.id || tx._id.toString()
    }));
    
    return NextResponse.json({ transactions: safeTx });
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const userId = data.userId || 'guest';
    
    const client = await clientPromise;
    const db = client.db('campus_os');
    
    const transaction = {
      ...data,
      userId,
      createdAt: new Date(),
    };
    
    await db.collection('transactions').insertOne(transaction);
    
    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'guest';
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('campus_os');
    
    await db.collection('transactions').deleteOne({ id, userId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
