import MainLayout from '@/layouts/MainLayout/MainLayout';
import JsonLd from './JsonLd';
import { type Locale } from '@/locales/routing';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <>
      <JsonLd locale={locale} />
      <MainLayout />
    </>
  );
}
