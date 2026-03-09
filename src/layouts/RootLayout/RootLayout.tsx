'use client';

import React from 'react';
import Logo from '@/components/common/Icons/Logo/Logo';
import USFlagIcon from '@/components/common/Icons/USFlagIcon';
import KRFlagIcon from '@/components/common/Icons/KRFlagIcon';
import GitHubFilledIcon from '@/components/common/Icons/GitHubFilledIcon';
import {
  PageLayout,
  PageHeader,
  PageContent,
  PageInner,
  Tagline,
  SectionLabel,
  LangRow,
  LangBtn,
  LangBtnHint,
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
  PreviewImg,
  HeaderRight,
  GitHubLink,
  SponsorLink,
  ReportLink,
  HeaderDivider,
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
        <HeaderRight>
          <GitHubLink
            href="https://github.com/ParkJeongKyun/ICE-frontend"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <GitHubFilledIcon width={13} height={13} />
            GitHub
          </GitHubLink>
          <HeaderDivider />
          <SponsorLink
            href="https://github.com/sponsors/ParkJeongKyun"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sponsor"
          >
            <svg
              aria-hidden="true"
              height="13"
              viewBox="0 0 16 16"
              width="13"
              fill="var(--ice-main-color-love)"
            >
              <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z" />
            </svg>
            Sponsor
          </SponsorLink>
          <HeaderDivider />
          <ReportLink
            href="https://github.com/ParkJeongKyun/ICE-frontend/issues"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Report issue"
          >
            <svg
              aria-hidden="true"
              height="13"
              viewBox="0 0 16 16"
              width="13"
              fill="var(--ice-main-color)"
            >
              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
            </svg>
            Report
          </ReportLink>
        </HeaderRight>
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
                <USFlagIcon width={32} height={21} />
              </FlagIconWrap>
              English
              <LangBtnHint>Start →</LangBtnHint>
            </LangBtn>
            <LangBtn
              onClick={() => {
                localStorage.setItem('user-locale', 'ko');
                window.location.href = '/ko';
              }}
            >
              <FlagIconWrap>
                <KRFlagIcon width={32} height={21} />
              </FlagIconWrap>
              한국어
              <LangBtnHint>시작하기 →</LangBtnHint>
            </LangBtn>
          </LangRow>

          <Divider />

          <PreviewImg
            src="/images/sample/sample.webp"
            alt="ICE Forensic Interface Preview"
            width={500}
            height={234}
            fetchPriority="high"
          />

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
