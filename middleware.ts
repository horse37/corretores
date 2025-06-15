import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Permitir acesso direto aos arquivos de upload sem processamento
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    return NextResponse.next()
  }

  // Para outras rotas, continuar normalmente
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (upload files) - tratados pela API route
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
}