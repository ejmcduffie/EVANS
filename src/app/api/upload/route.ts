import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Demo user ID for file ownership
const DEMO_USER_ID = 'demo-user-123';

export async function POST(request: NextRequest) {
  try {
    // Check if request is multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content type must be multipart/form-data' }, { status: 400 });
    }

    const formData = await request.formData();
    const isDemo = formData.get('demo') === 'true';
    const userId = formData.get('userId') as string || DEMO_USER_ID;
    const file = formData.get('file') as File | null;
    const fileCategory = formData.get('fileCategory') as string || 'Other';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // In demo mode, we'll be more permissive with file types
    const blockedExtensions = ['.exe', '.bat', '.sh', '.js', '.php'];
    const fileExt = file.name.toLowerCase().split('.').pop();
    
    if (blockedExtensions.includes('.' + fileExt)) {
      return NextResponse.json(
        { error: 'File type not allowed for security reasons' }, 
        { status: 400 }
      );
    }
    
    // Basic file size check (10MB max for demo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Generate a demo file ID
    const fileId = uuidv4();
    
    return NextResponse.json({ 
      success: true, 
      fileId: fileId,
      filename: file.name,
      isDemo: isDemo,
      message: 'File uploaded successfully in demo mode. No processing occurs.'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process upload', 
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      files: [],
      message: 'File listing not implemented in demo mode'
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files', details: (error as Error).message },
      { status: 500 }
    );
  }
}
