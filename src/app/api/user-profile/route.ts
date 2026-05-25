import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await prisma.userProfile.findFirst({
    include: { goals: true, rules: true, nutritionPlans: { orderBy: { startDate: 'desc' }, take: 1 } },
  });
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });
  const data = await req.json();
  const updated = await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      name: data.name, gender: data.gender, age: data.age,
      height: data.height, weight: data.weight, bodyFat: data.bodyFat,
      activityLevel: data.activityLevel, experienceLevel: data.experienceLevel,
    },
  });
  return NextResponse.json({ user: updated });
}
