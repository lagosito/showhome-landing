import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {type NextRequest} from 'next/server';
import {updateSession} from '@/lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith('/api');

  // API routes: only refresh Supabase session, skip i18n routing
  if (isApi) {
    const {response} = await updateSession(request);
    return response;
  }

  // Non-API routes: run next-intl locale routing first
  const i18nResponse = handleI18nRouting(request);
  if (i18nResponse.status === 307 || i18nResponse.status === 308) {
    return i18nResponse;
  }

  // Then run Supabase session management
  const {user, response} = await updateSession(request);

  // Protect /create/* and /account routes
  if (request.nextUrl.pathname.match(/^\/(de|en)\/(create|account)/)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/signin';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return Response.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)'
  ]
};
