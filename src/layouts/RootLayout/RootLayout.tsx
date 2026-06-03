'use client';

import React, { useState, useEffect } from 'react';
import Logo from '@/components/common/Icons/Logo/Logo';
import USFlagIcon from '@/components/common/Icons/USFlagIcon';
import KRFlagIcon from '@/components/common/Icons/KRFlagIcon';
import HeartIcon from '@/components/common/Icons/HeartIcon';
import CoffeeIcon from '@/components/common/Icons/CoffeeIcon';
import IssueIcon from '@/components/common/Icons/IssueIcon';
import PlayCircleIcon from '@/components/common/Icons/PlayCircleIcon';
import ShieldCheckIcon from '@/components/common/Icons/ShieldCheckIcon';
import ClockIcon from '@/components/common/Icons/ClockIcon';
import InfoCircleIcon from '@/components/common/Icons/InfoCircleIcon';
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
  SponsorLink,
  ReportLink,
  HeaderDivider,
  HeroSection,
  HeroLogoWrap,
  BadgeRow,
  Badge,
  BtnZone,
  LinkLabelText,
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
            <LinkLabelText>Sponsor</LinkLabelText>
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
            <LinkLabelText>Ko-fi</LinkLabelText>
          </SponsorLink>
          <HeaderDivider />
          <ReportLink
            href={process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Report issue"
          >
            <IssueIcon width={13} height={13} color="var(--ice-main-color)" />
            <LinkLabelText>Report</LinkLabelText>
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
                <PlayCircleIcon width={11} height={11} />
                100% Client-Side
              </Badge>
              <Badge>
                <ShieldCheckIcon width={11} height={11} />
                No Data Upload
              </Badge>
              <Badge>
                <ClockIcon width={11} height={11} />
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
              <InfoCircleIcon width={14} height={14} />
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
