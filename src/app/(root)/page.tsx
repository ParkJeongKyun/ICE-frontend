// src/app/(root)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/common/Icons/Logo/Logo';
import USFlagIcon from '@/components/common/Icons/USFlagIcon';
import KRFlagIcon from '@/components/common/Icons/KRFlagIcon';

const FEATURES: { label: string; desc: string }[] = [
  {
    label: 'Hex Viewer',
    desc: 'Visualize any file as hex + ASCII side-by-side. Jump to any offset, select ranges, and inspect raw bytes without installing anything.',
  },
  {
    label: 'EXIF Analyzer',
    desc: 'Extract embedded metadata from JPEG, PNG, TIFF, and HEIC images — GPS coordinates, camera model, shutter speed, and more.',
  },
  {
    label: 'Hash Calculator',
    desc: 'Compute MD5, SHA-1, SHA-256, and SHA-512 digests to verify file integrity or detect tampering.',
  },
  {
    label: 'File Header Analysis',
    desc: 'Identify the true file type by inspecting magic bytes — catches files whose extensions have been spoofed.',
  },
];

export default function RootPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem('user-locale');
    if (savedLang === 'ko' || savedLang === 'en') {
      router.replace(`/${savedLang}`);
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) return null;

  return (
    <div style={layoutStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <Logo showText />
      </header>

      {/* Content */}
      <main style={contentStyle}>
        <div style={innerStyle}>
          {/* Tagline */}
          <p style={taglineStyle}>
            Browser-based digital forensics — no install, no account required.
          </p>

          {/* Language picker */}
          <div style={sectionLabelStyle}>Select language / 언어 선택</div>
          <div style={langRowStyle}>
            <LangButton
              label="English"
              icon={<USFlagIcon width={36} height={24} />}
              onClick={() => {
                localStorage.setItem('user-locale', 'en');
                window.location.href = '/en';
              }}
            />
            <LangButton
              label="한국어"
              icon={<KRFlagIcon width={36} height={24} />}
              onClick={() => {
                localStorage.setItem('user-locale', 'ko');
                window.location.href = '/ko';
              }}
            />
          </div>

          <div style={dividerStyle} />

          {/* Features */}
          <div style={sectionLabelStyle}>Tools</div>
          <div style={featureListStyle}>
            {FEATURES.map((f) => (
              <div key={f.label} style={featureItemStyle}>
                <span style={dotStyle}>▸</span>
                <div>
                  <div style={featureLabelStyle}>{f.label}</div>
                  <div style={featureDescStyle}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={dividerStyle} />

          {/* About */}
          <p style={aboutStyle}>
            ICE Forensic is a fully client-side toolkit — all processing happens
            in your browser. Your files are never uploaded to any server.
          </p>
          <p style={{ ...aboutStyle, marginBottom: 0 }}>
            Built for security researchers, forensics analysts, and developers
            who need quick, reliable file inspection without installing
            heavyweight software.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={footerStyle}>
        <span style={copyrightStyle}>
          © 2022 ParkJeong-kyun (dbzoseh84@gmail.com). All rights reserved.
        </span>
      </footer>

      <div style={{ display: 'none' }}>
        <h1>ICE Forensic — Online Digital Forensics Tools</h1>
        <h2>
          Online Hex Viewer, EXIF Metadata Viewer, Hash Calculator, File Header
          Analysis
        </h2>
        <p>
          ICE Forensic is a free, web-based digital forensics toolkit. No
          download or installation required.
        </p>
      </div>
    </div>
  );
}

function LangButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flex: 1,
        height: 80,
        background: hovered ? 'var(--ice-main-color)' : 'transparent',
        border: `1.5px solid ${hovered ? 'var(--ice-main-color)' : 'var(--main-line-color)'}`,
        borderRadius: 6,
        padding: '10px 16px',
        fontSize: '1.15rem',
        fontWeight: 700,
        color: hovered ? 'var(--main-bg-color)' : 'var(--main-color)',
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        userSelect: 'none',
      }}
    >
      <span style={{ lineHeight: 0 }}>{icon}</span>
      {label}
    </button>
  );
}

/* ── Styles ── */
const layoutStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  background: 'var(--main-bg-color)',
  color: 'var(--main-color)',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 26,
  padding: '0 8px',
  borderBottom: '1.5px solid var(--main-line-color)',
  flexShrink: 0,
  userSelect: 'none',
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '6vh 2rem 2rem',
};

const innerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 560,
  textAlign: 'left',
};

const taglineStyle: React.CSSProperties = {
  margin: '0 0 1.75rem',
  fontSize: '1.05rem',
  opacity: 0.85,
  lineHeight: 1.65,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 700,
  opacity: 0.6,
  textTransform: 'uppercase',
  letterSpacing: '0.09em',
  marginBottom: '0.75rem',
  userSelect: 'none',
};

const langRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  width: '100%',
};

const dividerStyle: React.CSSProperties = {
  borderTop: '1px solid var(--main-line-color)',
  margin: '1.25rem 0',
};

const featureListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const featureItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 7,
};

const dotStyle: React.CSSProperties = {
  color: 'var(--ice-main-color)',
  fontSize: '0.85rem',
  marginTop: 3,
  flexShrink: 0,
};

const featureLabelStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  marginBottom: 3,
};

const featureDescStyle: React.CSSProperties = {
  fontSize: '0.92rem',
  opacity: 0.8,
  lineHeight: 1.6,
};

const aboutStyle: React.CSSProperties = {
  margin: '0 0 0.75rem',
  fontSize: '0.95rem',
  opacity: 0.85,
  lineHeight: 1.65,
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 24,
  padding: '0 8px',
  borderTop: '1px solid var(--main-line-color)',
  flexShrink: 0,
  userSelect: 'none',
};

const copyrightStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 500,
  opacity: 0.75,
};
