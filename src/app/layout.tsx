import GlobalProviders from './GlobalProviders';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GlobalProviders>{children}</GlobalProviders>;
}
