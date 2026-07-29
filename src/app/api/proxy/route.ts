import { NextRequest, NextResponse } from 'next/server'

// 服务端代理：前端不再直连 TVBox 源站（会被浏览器 CORS 拦截），
// 而是由本站服务端去拉取数据再返回，彻底解决跨域问题。
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'missing url parameter' }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(url)
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 })
  }

  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return NextResponse.json({ error: 'unsupported protocol' }, { status: 400 })
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        Accept: '*/*',
      },
      cache: 'no-store',
    })

    const body = await upstream.text()
    const contentType =
      upstream.headers.get('content-type') || 'application/json; charset=utf-8'

    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || String(e) },
      { status: 502 }
    )
  }
}
