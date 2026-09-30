import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'REGISTERED_USER' } });
    if (!user) return NextResponse.json({ bookmarks: [], savedSearches: [] });

    const [bookmarks, savedSearches] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: user.id },
        include: {
          regulatoryDocument: {
            include: { regulator: true, summary: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.savedSearch.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ bookmarks, savedSearches });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'REGISTERED_USER' } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const body = await request.json();
    const { name, query, filters } = body;

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: name || query || 'Saved Search',
        query: query || '',
        filters: JSON.stringify(filters || {}),
      },
    });

    return NextResponse.json({ success: true, savedSearch });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get('bookmarkId');
    const searchId = searchParams.get('searchId');

    if (bookmarkId) {
      await prisma.bookmark.delete({ where: { id: bookmarkId } });
      return NextResponse.json({ success: true, deleted: 'bookmark' });
    }

    if (searchId) {
      await prisma.savedSearch.delete({ where: { id: searchId } });
      return NextResponse.json({ success: true, deleted: 'search' });
    }

    return NextResponse.json({ error: 'No item specified' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
