'use client';

import React from 'react';
import Logo from '@/components/common/Icons/Logo/Logo';
import USFlagIcon from '@/components/common/Icons/USFlagIcon';
import KRFlagIcon from '@/components/common/Icons/KRFlagIcon';
import {
  PageLayout,
  PageHeader,
  PageContent,
  PageInner,
  Tagline,
  SectionLabel,
  LangRow,
  LangBtn,
  Divider,
  FeatureList,
  FeatureItem,
  FeatureDot,
  FeatureLabel,
  FeatureDesc,
  AboutText,
  PageFooter,
  Copyright,
  FlagIconWrap,
} from './RootLayout.styles';

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

const RootLayout: React.FC = () => {
  return (
    <PageLayout>
      <PageHeader>
        <Logo showText />
      </PageHeader>

      <PageContent>
        <PageInner>
          <Tagline>
            Browser-based digital forensics — no install, no account required.
          </Tagline>

          <SectionLabel>Select language / 언어 선택</SectionLabel>
          <LangRow>
            <LangBtn
              onClick={() => {
                localStorage.setItem('user-locale', 'en');
                window.location.href = '/en';
              }}
            >
              <FlagIconWrap>
                <USFlagIcon width={36} height={24} />
              </FlagIconWrap>
              English
            </LangBtn>
            <LangBtn
              onClick={() => {
                localStorage.setItem('user-locale', 'ko');
                window.location.href = '/ko';
              }}
            >
              <FlagIconWrap>
                <KRFlagIcon width={36} height={24} />
              </FlagIconWrap>
              한국어
            </LangBtn>
          </LangRow>

          <Divider />

          <SectionLabel>Tools</SectionLabel>
          <FeatureList>
            {FEATURES.map((f) => (
              <FeatureItem key={f.label}>
                <FeatureDot>▸</FeatureDot>
                <div>
                  <FeatureLabel>{f.label}</FeatureLabel>
                  <FeatureDesc>{f.desc}</FeatureDesc>
                </div>
              </FeatureItem>
            ))}
          </FeatureList>

          <Divider />

          <AboutText>
            ICE Forensic is a fully client-side toolkit — all processing happens
            in your browser. Your files are never uploaded to any server.
          </AboutText>
          <AboutText style={{ marginBottom: 0 }}>
            Built for security researchers, forensics analysts, and developers
            who need quick, reliable file inspection without installing
            heavyweight software.
          </AboutText>
        </PageInner>
      </PageContent>

      <PageFooter>
        <Copyright>
          © 2022 ParkJeong-kyun (dbzoseh84@gmail.com). All rights reserved.
        </Copyright>
      </PageFooter>

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
    </PageLayout>
  );
};

export default RootLayout;
