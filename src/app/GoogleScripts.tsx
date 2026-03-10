import Script from 'next/script';

export default function GoogleScripts() {
  if (process.env.NODE_ENV === 'development') return null;

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-79876PQVY4"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-79876PQVY4', {
            page_path: window.location.pathname,
            cookie_flags: 'SameSite=None;Secure',
            allow_ad_personalization_signals: false,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
