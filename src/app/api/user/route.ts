export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await prisma.userProfile.findFirst({ include: { goals: true, rules: true } });
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}
