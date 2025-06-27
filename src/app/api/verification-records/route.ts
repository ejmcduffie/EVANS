import { NextResponse } from 'next/server';

// In production, this would use a real database
// For now, we'll use an in-memory store that persists while the server is running
let verificationRecords: Record<string, any[]> = {};

export async function GET(request: Request) {
  try {
    // Get user ID from the query string - in production, use proper auth
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    
    const records = verificationRecords[userId] || [];
    
    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch verification records:', error);
    return NextResponse.json({ error: 'Failed to fetch verification records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId = 'default-user', records } = body;
    
    if (!Array.isArray(records)) {
      return NextResponse.json({ error: 'Records must be an array' }, { status: 400 });
    }
    
    // Store the records for this user
    verificationRecords[userId] = records;
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to save verification records:', error);
    return NextResponse.json({ error: 'Failed to save verification records' }, { status: 500 });
  }
}
