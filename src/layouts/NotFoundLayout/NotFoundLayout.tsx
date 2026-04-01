'use client';

import React from 'react';
import Logo from '@/components/common/Icons/Logo/Logo';
import GitHubFilledIcon from '@/components/common/Icons/GitHubFilledIcon';
import {
  PageLayout,
  PageHeader,
  PageContent,
  PageInner,
  PageFooter,
  CopyrightWrap,
  Copyright,
  FooterLinks,
  FooterLink,
  FooterDivider,
  HeaderRight,
  GitHubLink,
  HeaderDivider,
  SponsorLink,
  ReportLink,
  HeroSection,
  BadgeRow,
  Badge,
  ErrorCode,
  ErrorTitle,
  ErrorDesc,
  ErrorActions,
  BtnPrimary,
  ReportIssueLink,
} from './NotFoundLayout.styles';

const NotFoundLayout: React.FC = () => {
  return (
    <PageLayout>
      <PageHeader>
        <Logo showText />
        <HeaderRight>
          <GitHubFilledIcon width={13} height={13} />
          <HeaderDivider />
          <SponsorLink
            href={process.env.NEXT_PUBLIC_GITHUB_SPONSORS_URL}
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
            href={process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL}
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
            <ErrorCode>404</ErrorCode>
            <BadgeRow>
              <Badge>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
                </svg>
                Page Not Found
              </Badge>
            </BadgeRow>
            <ErrorTitle id="nf-title">We couldn't find that page.</ErrorTitle>
            <ErrorDesc>
              The page you're looking for doesn't exist or may have been moved.
              Try returning to the homepage.
            </ErrorDesc>
            <ErrorActions>
              <BtnPrimary onClick={() => (window.location.href = '/')}>
                Back to home
              </BtnPrimary>
            </ErrorActions>
            <ReportIssueLink
              href={process.env.NEXT_PUBLIC_GITHUB_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Report an issue
            </ReportIssueLink>
          </HeroSection>
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

export default NotFoundLayout;
