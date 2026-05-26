export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const exercises = await prisma.exercise.findMany({ orderBy: { category: 'asc' } });
  return NextResponse.json({ exercises });
}
