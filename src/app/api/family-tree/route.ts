import { NextResponse } from 'next/server';
import { getCachedFamilyTree } from '@/lib/familyCache';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET family tree data parsed from last uploaded GEDCOM file
export async function GET() {
  const cached = getCachedFamilyTree();

  if (!cached) {
    return NextResponse.json(
      { code: 'NO_GEDCOM_FILES', error: 'No GEDCOM file parsed yet' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    status: 'success',
    ...cached,
    data: cached.tree,
  });
}




// POST behaves the same as GET
export const POST = GET;
