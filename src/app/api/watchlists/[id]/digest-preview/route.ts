import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const watchlist = await prisma.watchlist.findUnique({
      where: { id },
    });

    if (!watchlist) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 });
    }

    const regFilters: string[] = JSON.parse(watchlist.regulatorFilters || '[]');
    const topicFilters: string[] = JSON.parse(watchlist.topicFilters || '[]');

    const where: any = {};
    if (regFilters.length > 0) {
      where.regulator = { shortName: { in: regFilters } };
    }
    if (topicFilters.length > 0) {
      where.documentTopics = {
        some: { topic: { name: { in: topicFilters } } },
      };
    }

    const matchedDocs = await prisma.regulatoryDocument.findMany({
      where,
      include: {
        regulator: true,
        summary: true,
        documentTopics: { include: { topic: true } },
      },
      take: 6,
      orderBy: { publicationDate: 'desc' },
    });

    const digestHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0A1E3F; color: #ffffff; padding: 24px; text-align: left;">
          <h2 style="margin: 0; font-size: 20px;">Regulatory Intelligence Hub India</h2>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">${watchlist.frequency} Compliance Digest • ${watchlist.name}</p>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 14px; margin-top: 0;">Here is your curated regulatory update matching regulators: <strong>${regFilters.join(', ') || 'All'}</strong> and topics: <strong>${topicFilters.join(', ') || 'All'}</strong>.</p>
          
          <div style="margin-top: 16px;">
            ${matchedDocs.map(d => `
              <div style="border-bottom: 1px solid #e2e8f0; padding: 14px 0;">
                <span style="font-size: 11px; font-weight: bold; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px;">${d.regulator.shortName}</span>
                <span style="font-size: 11px; color: #64748b; margin-left: 8px;">${d.publicationDate.toISOString().split('T')[0]}</span>
                <h4 style="margin: 8px 0 4px 0; font-size: 15px; color: #0f172a;">${d.title}</h4>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;">${d.summary ? d.summary.shortHeadline : 'Recent regulatory publication indexed and verified.'}</p>
                <a href="${d.officialSourceUrl}" target="_blank" style="font-size: 12px; color: #2563eb; text-decoration: none;">View Official Circular &rarr;</a>
              </div>
            `).join('')}
          </div>

          <div style="margin-top: 24px; padding: 12px; background: #f8fafc; border-radius: 6px; font-size: 11px; color: #64748b;">
            <strong>Regulatory Research Notice:</strong> This email is a platform-generated research digest. It does not constitute formal legal advice or regulatory certification.
          </div>
        </div>
      </div>
    `;

    return NextResponse.json({
      watchlist,
      matchedCount: matchedDocs.length,
      digestHtml,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
