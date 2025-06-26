import { NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Sample family tree data for demo purposes
const exampleFamilyTree = {
  id: 'root',
  name: 'John Smith',
  givenName: 'John',
  surname: 'Smith',
  birthDate: '1955-06-15',
  gender: 'M',
  children: [
    {
      id: 'child1',
      name: 'James Smith',
      givenName: 'James',
      surname: 'Smith',
      birthDate: '1980-03-22',
      gender: 'M',
      children: []
    },
    {
      id: 'child2',
      name: 'Sarah Johnson',
      givenName: 'Sarah',
      surname: 'Johnson',
      birthDate: '1982-11-05',
      gender: 'F',
      children: [
        {
          id: 'grandchild1',
          name: 'Emma Johnson',
          givenName: 'Emma',
          surname: 'Johnson',
          birthDate: '2010-07-30',
          gender: 'F',
          children: []
        }
      ]
    }
  ],
  partners: [
    {
      id: 'partner1',
      name: 'Mary Smith',
      givenName: 'Mary',
      surname: 'Williams',
      birthDate: '1958-09-20',
      gender: 'F',
      children: []
    }
  ]
};

export async function GET() {
  // Return example family tree data for demo mode
  return NextResponse.json({ 
    status: 'success',
    data: exampleFamilyTree
  });
}

export async function POST() {
  // In demo mode, always return example data
  return NextResponse.json({ 
    status: 'success',
    data: exampleFamilyTree,
    message: 'Demo mode: Using example family tree data'
  });
}
