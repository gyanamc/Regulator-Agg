import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    // Default test user: analyst@bank.in
    const user = await prisma.user.findFirst({ where: { role: 'REGISTERED_USER' } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_regulatoryDocumentId: {
          userId: user.id,
          regulatoryDocumentId: id,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          regulatoryDocumentId: id,
        },
      });
      return NextResponse.json({ bookmarked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
