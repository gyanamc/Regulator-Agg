import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'REGISTERED_USER' } });
    if (!user) return NextResponse.json({ watchlists: [] });

    const watchlists = await prisma.watchlist.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ watchlists });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'REGISTERED_USER' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const body = await request.json();
    const { name, regulatorFilters, topicFilters, entityTypeFilters, frequency } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Watchlist name is required.' }, { status: 400 });
    }

    const watchlist = await prisma.watchlist.create({
      data: {
        userId: user.id,
        name: name.trim(),
        regulatorFilters: JSON.stringify(regulatorFilters || []),
        topicFilters: JSON.stringify(topicFilters || []),
        entityTypeFilters: JSON.stringify(entityTypeFilters || []),
        frequency: frequency || 'DAILY',
        active: true,
      },
    });

    return NextResponse.json({ success: true, watchlist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
