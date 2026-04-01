import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de DEBUG — retorna exatamente o que chegou no webhook
 * Útil para descobrir quais campos a plataforma envia.
 * Use: POST https://seu-dominio.app/api/webhook/debug
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    const rawText = await request.text();

    let parsed: unknown = null;
    let parseError: string | null = null;

    try {
      parsed = JSON.parse(rawText);
    } catch {
      try {
        parsed = Object.fromEntries(new URLSearchParams(rawText));
      } catch {
        parseError = 'Não foi possível parsear o body';
      }
    }

    console.log('[webhook/debug] content-type:', contentType);
    console.log('[webhook/debug] raw body:', rawText);
    console.log('[webhook/debug] parsed:', JSON.stringify(parsed, null, 2));

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        content_type: contentType,
        raw_body: rawText,
        parsed_body: parsed,
        parse_error: parseError,
        headers: {
          'content-type':   request.headers.get('content-type'),
          'content-length': request.headers.get('content-length'),
          'user-agent':     request.headers.get('user-agent'),
          'x-forwarded-for': request.headers.get('x-forwarded-for'),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 400 }
    );
  }
}
