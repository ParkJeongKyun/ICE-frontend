// src/app/page.tsx
'use client';

import Logo from '@/components/common/Icons/Logo/Logo';
import Spinner from '@/components/common/Spinner/Spinner';

export default function RootPage() {
  // redirect logic is handled in (root)/layout.tsx via an inline <script> in <head>

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        boxSizing: 'border-box',
        background: 'var(--main-bg-color)',
        color: 'var(--main-color)',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          margin: '0 auto',
          textAlign: 'center',
          border: '1px solid var(--main-line-color)',
          background: 'var(--main-bg-color)',
          boxShadow: '0 8px 30px rgba(2,6,23,0.15)',
          borderRadius: 12,
          padding: '2.25rem 2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Logo showText size={28} textSize={20} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Spinner size={20} />
          <div style={{ fontWeight: 600 }}>
            Redirecting to your language... <br />
            해당 언어 페이지로 이동 중입니다...
          </div>
        </div>

        <div style={{ color: 'var(--main-color)', opacity: 0.85 }}>
          <a
            href="/ko"
            style={{
              marginRight: 16,
              textDecoration: 'underline',
              color: 'inherit',
            }}
          >
            한국어
          </a>
          <a
            href="/en"
            style={{ textDecoration: 'underline', color: 'inherit' }}
          >
            English
          </a>
        </div>
      </div>
    </div>
  );
}
