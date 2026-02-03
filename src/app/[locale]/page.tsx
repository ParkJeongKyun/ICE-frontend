import { routing } from '@/locales/routing';
import MainLayout from '@/layouts/MainLayout/MainLayout';
import JsonLd from '@/components/common/JsonLd';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <JsonLd locale={locale} />
      <MainLayout />
    </>
  );
}
