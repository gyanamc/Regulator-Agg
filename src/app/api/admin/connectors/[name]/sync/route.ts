import { NextRequest, NextResponse } from 'next/server';
import { connectorRegistry } from '@/lib/connectors/registry';
import prisma from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params;
    const connector = connectorRegistry.getConnector(name);

    if (!connector) {
      return NextResponse.json({ error: `Connector for regulator '${name}' not found` }, { status: 404 });
    }

    const result = await connector.runIngestionCycle(true);

    await prisma.auditLog.create({
      data: {
        action: 'TRIGGER_CONNECTOR_SYNC',
        resourceType: 'SourceConnector',
        resourceId: result.connectorId,
        details: JSON.stringify(result),
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
