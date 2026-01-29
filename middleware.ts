import createMiddleware from 'next-intl/middleware';
import { routing } from './src/locales/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ko|en)/:path*'],
};
