import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {type NextRequest} from 'next/server';
import {updateSession} from '@/lib/supabase/middleware';

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // First: run next-intl locale routing (may redirect/rewrite)
  const i18nResponse = handleI18nRouting(request);

  // If next-intl returned a redirect or rewrite, respect it
  if (i18nResponse.status === 307 || i18nResponse.status === 308) {
    return i18nResponse;
  }

  // Otherwise: run Supabase session management
  const {user, response} = await updateSession(request);

  // Protect /create/* routes (now under /[locale]/create/*)
  if (request.nextUrl.pathname.match(/^\/(de|en)\/create/)) {
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
    '/((?!api|trpc|_next|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)'
  ]
};
