// admin/app/api/admin/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

async function proxyRequest(req: NextRequest, path: string[]) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const method = req.method;
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    
    if (!allowedMethods.includes(method)) {
      return NextResponse.json({ success: false, message: 'Method not allowed' }, { status: 405 });
    }

    const url = new URL(`${BACKEND_URL}/${path.join('/')}`);
    req.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const body = (method === 'POST' || method === 'PUT') ? await req.json().catch(() => null) : undefined;

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session.user as any).accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Proxy error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, ['admin', ...params.path]);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, ['admin', ...params.path]);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, ['admin', ...params.path]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, ['admin', ...params.path]);
}