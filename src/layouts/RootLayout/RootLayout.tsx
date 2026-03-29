'use client';

import React, { useState, useEffect } from 'react';
import Logo from '@/components/common/Icons/Logo/Logo';
import USFlagIcon from '@/components/common/Icons/USFlagIcon';
import KRFlagIcon from '@/components/common/Icons/KRFlagIcon';
import GitHubFilledIcon from '@/components/common/Icons/GitHubFilledIcon';
import ForensicInterviewCard from '@/layouts/AboutLayout/ForensicInterviewCard/ForensicInterviewCard';
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
  CopyrightWrap,
  Copyright,
  FooterLinks,
  FooterLink,
  FooterDivider,
  FlagIconWrap,
  PreviewImg,
  HeaderLeft,
  HeaderRight,
  HeaderLink,
  GitHubLink,
  SponsorLink,
  ReportLink,
  HeaderDivider,
  HeroSection,
  HeroLogoWrap,
  BadgeRow,
  Badge,
  BtnZone,
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
  const [browserLang, setBrowserLang] = useState<'ko' | 'en' | null>(null);

  useEffect(() => {
    setBrowserLang(navigator.language.startsWith('ko') ? 'ko' : 'en');
  }, []);

  return (
    <PageLayout>
      <PageHeader>
        <HeaderLeft>
          <Logo showText />
          <BtnZone>
            <HeaderLink
              href="/en/docs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Docs"
              title="Docs"
            >
              Docs
            </HeaderLink>
            <HeaderLink
              href="/en/about"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Developer"
              title="Developer"
            >
              Developer
            </HeaderLink>
          </BtnZone>
        </HeaderLeft>
        <HeaderRight>
          <HeaderDivider />
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
          <HeroSection>
            <HeroLogoWrap>
              <Logo showText size={38} textSize={38} />
            </HeroLogoWrap>
            <BadgeRow>
              <Badge>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z" />
                </svg>
                100% Client-Side
              </Badge>
              <Badge>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8.533.133a1.75 1.75 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48V8c0 3.56 2.826 6.307 6.504 7.447.28.086.712.086.992 0C12.174 14.307 15 11.56 15 8V3.48a1.75 1.75 0 0 0-1.217-1.667Zm-.533 1.4a.25.25 0 0 1 .152 0l5.25 1.68a.25.25 0 0 1 .174.238V8c0 2.996-2.266 5.388-5.439 6.396a.316.316 0 0 1-.138 0C4.766 13.388 2.5 10.996 2.5 8V3.48a.25.25 0 0 1 .174-.238ZM11.28 6.28a.75.75 0 0 0-1.06-1.06L7 8.44 5.78 7.22a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0Z" />
                </svg>
                No Data Upload
              </Badge>
              <Badge>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z" />
                </svg>
                Free &amp; Open Source
              </Badge>
            </BadgeRow>
            <Tagline>
              Browser-based digital forensics — no install, no account required.
            </Tagline>
          </HeroSection>

          <SectionLabel>Select language / 언어 선택</SectionLabel>
          <LangRow>
            <LangBtn
              as="a"
              href="/en"
              $recommended={browserLang === 'en'}
              onClick={() => {
                localStorage.setItem('user-locale', 'en');
              }}
            >
              <FlagIconWrap>
                <USFlagIcon width={32} height={21} />
              </FlagIconWrap>
              English
              <LangBtnHint>Start →</LangBtnHint>
            </LangBtn>
            <LangBtn
              as="a"
              href="/ko"
              $recommended={browserLang === 'ko'}
              onClick={() => {
                localStorage.setItem('user-locale', 'ko');
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

          <Divider />

          <SectionLabel>Featured Interview</SectionLabel>
          <ForensicInterviewCard
            title="JeongKyun Park, Information Security Student And Independent Developer, Korea Cyber University"
            date="17th March 2026"
            description="From Navy CERT to building ICE-Forensic, JeongKyun Park shares how a passion for uncovering the truth through system traces is driving his transition into digital forensics."
            imageAlt="Interview with JeongKyun Park"
            readMoreText="Read More"
            sourceLabel="Interviewed at"
            sourceName="Forensic Focus"
            sourceIconAlt="Forensic Focus icon"
          />

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
        <CopyrightWrap>
          <Copyright>
            © 2022 ParkJeong-kyun (dbzoseh84@gmail.com). All rights reserved.
          </Copyright>
        </CopyrightWrap>
        <FooterDivider />
        <FooterLinks>
          <FooterLink
            href="/en/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy (EN)
          </FooterLink>
          <FooterDivider />
          <FooterLink
            href="/ko/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            개인정보 처리방침 (KO)
          </FooterLink>
        </FooterLinks>
      </PageFooter>
    </PageLayout>
  );
};

export default RootLayout;
