'use client';

import React, { useState, useEffect } from 'react';
import Logo from '@/components/common/Icons/Logo/Logo';
import USFlagIcon from '@/components/common/Icons/USFlagIcon';
import KRFlagIcon from '@/components/common/Icons/KRFlagIcon';
import HeartIcon from '@/components/common/Icons/HeartIcon';
import CoffeeIcon from '@/components/common/Icons/CoffeeIcon';
import IssueIcon from '@/components/common/Icons/IssueIcon';
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
  LangFeedbackHint,
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
          <SponsorLink
            href={process.env.NEXT_PUBLIC_GITHUB_SPONSORS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sponsor"
          >
            <HeartIcon
              width={13}
              height={13}
              color="var(--ice-main-color-love)"
            />
            Sponsor
          </SponsorLink>
          <HeaderDivider />
          <SponsorLink
            href={process.env.NEXT_PUBLIC_KOFI_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buy me a coffee"
          >
            <CoffeeIcon
              width={13}
              height={13}
              color="var(--ice-main-color-love)"
            />
            Ko-fi
          </SponsorLink>
          <HeaderDivider />
          <ReportLink
            href={process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Report issue"
          >
            <IssueIcon width={13} height={13} color="var(--ice-main-color)" />
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

          <Divider />

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
          <LangFeedbackHint>
            <a
              href={`${process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM9 5H7v4h2V5Zm0 6H7v2h2v-2Z" />
              </svg>
              Don't see your language? Let us know
            </a>
          </LangFeedbackHint>

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
