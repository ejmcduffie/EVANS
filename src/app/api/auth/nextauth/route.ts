import { NextResponse } from 'next/server';

// Demo mode - always authenticated
const handler = async () => {
  return NextResponse.json({
    user: {
      id: 'demo-user-1',
      name: 'Demo User',
      email: 'demo@example.com',
    },
    status: 'authenticated'
  });
};

export { handler as GET, handler as POST };
