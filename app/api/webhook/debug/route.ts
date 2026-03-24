import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de DEBUG para testar webhooks
 * Use: https://seu-dominio.app/api/webhook/debug
 *
 * Retorna exatamente o que foi recebido
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers);

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook recebido com sucesso',
        timestamp: new Date().toISOString(),
        received: {
          body,
          headers: {
            'content-type': headers['content-type'],
            'content-length': headers['content-length'],
            'user-agent': headers['user-agent'],
          },
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}
