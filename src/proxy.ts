import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {type NextRequest} from 'next/server';
import {updateSession} from '@/lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

// v3 (internal): login gate removed — preview deployments rely on
// Vercel Deployment Protection (ssoProtection: all_except_custom_domains).
export async function proxy(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith('/api');

  // API routes: skip i18n routing
  if (isApi) {
    const {response} = await updateSession(request);
    return response;
  }

  // Non-API routes: run next-intl locale routing first
  const i18nResponse = handleI18nRouting(request);
  if (i18nResponse.status === 307 || i18nResponse.status === 308) {
    return i18nResponse;
  }

  // Then run Supabase session management (no route protection in v3)
  const {response} = await updateSession(request);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)'
  ]
};
