import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Demo mode - return mock users
    const demoUsers = [
      {
        _id: 'user1',
        name: 'Demo User',
        email: 'demo@example.com',
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'user2',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
    ];

    return NextResponse.json(demoUsers);
  } catch (error) {
    console.error('Error with demo users:', error);
    return NextResponse.json(
      { error: 'Error generating demo users' },
      { status: 500 }
    );
  }
}
