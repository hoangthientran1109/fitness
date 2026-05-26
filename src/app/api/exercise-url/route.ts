export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getExerciseImage, REPO_URL } from '@/lib/exercise-images';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const name = url.searchParams.get('name') || '';
  const imgUrl = getExerciseImage(name);

  return NextResponse.json({
    name,
    hasImage: !!imgUrl,
    imageUrl: imgUrl,
    repoUrl: REPO_URL,
    repoSearchUrl: `https://github.com/yuhonas/free-exercise-db/tree/main/exercises`,
  });
}
