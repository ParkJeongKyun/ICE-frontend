import Script from 'next/script';

export default function GoogleScripts() {
  // 개발 환경에서는 로드하지 않음 — 프로덕션 환경에서만 주입
  if (process.env.NODE_ENV === 'development') return null;

  return (
    <>
      {/* Google Analytics (gtag) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-79876PQVY4"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          gtag('js', new Date());
          gtag('config', 'G-79876PQVY4');`}
      </Script>

      {/* Google AdSense (옵션) */}
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9099594574723250"
      />
    </>
  );
}
