export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const data = await req.json();
  const user = await prisma.userProfile.findFirst();
  if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Lấy body metric gần nhất cách đây 7 ngày
  const prevMetric = await prisma.bodyMetric.findFirst({
    where: { userId: user.id, date: { gte: sevenDaysAgo, lt: today } },
    orderBy: { date: 'asc' },
  });

  const metric = await prisma.bodyMetric.create({ data: { userId: user.id, ...data } });

  const warnings: { type: 'danger' | 'warning' | 'info'; message: string; action: string }[] = [];

  // Check weight change
  if (data.weight && prevMetric?.weight) {
    const weightChange = data.weight - prevMetric.weight;
    if (weightChange < -1) {
      warnings.push({
        type: 'danger',
        message: `Cân nặng giảm ${Math.abs(weightChange).toFixed(1)}kg trong 7 ngày`,
        action: 'Tốc độ giảm quá nhanh (>1kg/tuần). Tăng calo thêm 200-300 calo/ngày và kiểm tra protein.',
      });
    } else if (weightChange > 0.5) {
      warnings.push({
        type: 'warning',
        message: `Cân nặng tăng ${weightChange.toFixed(1)}kg trong 7 ngày`,
        action: 'Đang dư calo (>0.5kg/tuần). Giảm calo 200-300 calo/ngày hoặc tăng cardio.',
      });
    }
  }

  // Body fat check: weight giảm nhưng body fat tăng → mất cơ
  if (data.bodyFat && prevMetric?.bodyFat && data.weight && prevMetric?.weight) {
    const weightChange = data.weight - prevMetric.weight;
    const bfChange = data.bodyFat - prevMetric.bodyFat;
    if (weightChange < -0.5 && bfChange > 0.3) {
      warnings.push({
        type: 'danger',
        message: `Mất cơ — cân nặng giảm ${Math.abs(weightChange).toFixed(1)}kg nhưng mỡ tăng ${bfChange.toFixed(1)}%`,
        action: 'Đạm chưa đủ hoặc tập thiếu cường độ. Ưu tiên đạm 2g/kg và tập compound nặng.',
      });
    }
  }

  return NextResponse.json({ metric, warnings: warnings.length > 0 ? warnings : null });
}
