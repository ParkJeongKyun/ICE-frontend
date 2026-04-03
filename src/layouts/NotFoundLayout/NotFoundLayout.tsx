'use client';

import React from 'react';
import Logo from '@/components/common/Icons/Logo/Logo';
import CoffeeIcon from '@/components/common/Icons/CoffeeIcon';
import IssueIcon from '@/components/common/Icons/IssueIcon';
import HeartIcon from '@/components/common/Icons/HeartIcon';
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
