export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });
  const rules = await prisma.personalRule.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ rules });
}

export async function POST(req: Request) {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });
  const data = await req.json();
  const rule = await prisma.personalRule.create({ data: { userId: user.id, ruleType: data.ruleType, description: data.description, isActive: true } });
  return NextResponse.json({ rule });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.personalRule.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  const data = await req.json();
  const rule = await prisma.personalRule.findUnique({ where: { id: data.id } });
  if (rule) {
    const updated = await prisma.personalRule.update({ where: { id: data.id }, data: { isActive: !rule.isActive } });
    return NextResponse.json({ rule: updated });
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
