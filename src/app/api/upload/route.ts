import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { parseGedcom, findRootIndividual, getFamilyTreeData } from '@/lib/gedcomParser';
import { setCachedFamilyTree, clearCachedFamilyTree } from '@/lib/familyCache';

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

    // Generate an ID for the uploaded file
    const fileId = uuidv4();

    // Read the uploaded file into text
    const arrayBuffer = await file.arrayBuffer();
    const gedcomText = new TextDecoder().decode(arrayBuffer);

    // Parse GEDCOM using our custom parser
    try {
      const gedcomData = parseGedcom(gedcomText);
      const root = findRootIndividual(gedcomData);
      if (!root) {
        return NextResponse.json(
          { error: 'Unable to determine root individual in GEDCOM file' },
          { status: 400 }
        );
      }
      // Build nested tree (depth unlimited)
      const tree = getFamilyTreeData(gedcomData, root.id, Number.MAX_SAFE_INTEGER);

      // Flat list of every individual in the GEDCOM file for easy lookup in UI
      const individuals = Object.values(gedcomData.individuals).map(ind => ({
        id: ind.id,
        name: ind.name,
        givenName: ind.givenName,
        surname: ind.surname,
        sex: ind.sex,
        gender: ind.sex,
        birthDate: ind.birthDate,
        deathDate: ind.deathDate,
      }));

      const cached = {
        tree,
        individuals,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
      };
      setCachedFamilyTree(cached);

      return NextResponse.json({ 
        success: true, 
        fileId,
        filename: file.name,
        individuals,
        message: 'GEDCOM file uploaded and parsed successfully'
      });
    } catch (parseErr: any) {
      return NextResponse.json(
        { error: 'Failed to parse GEDCOM file', details: parseErr.message || 'Unknown parse error' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      fileId,
      filename: file.name,
      message: 'GEDCOM file uploaded and parsed successfully'
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
    // In a real app with a database, we'd fetch files from the DB
    // For the demo, we'll return a success message
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

export async function DELETE(request: NextRequest) {
  try {
    // Get the file ID from the URL or search params
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json({ error: 'No fileId provided' }, { status: 400 });
    }

    // In a real app, we would delete from a database or storage
    // In demo mode, we'll just return success and clear the cached family tree
    clearCachedFamilyTree();
    
    return NextResponse.json({
      success: true,
      fileId,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file', details: (error as Error).message },
      { status: 500 }
    );
  }
}
