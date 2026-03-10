import styled from 'styled-components';

export const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--main-bg-color);
  color: var(--main-color);
  overflow: hidden;
`;

export const PageHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  padding: 0 8px;
  border-bottom: 1.5px solid var(--main-line-color);
  flex-shrink: 0;
  user-select: none;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const GitHubLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--main-color);
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: var(--ice-main-color);
  }
`;

export const SponsorLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ice-main-color-love);
  text-decoration: none;
  transition: filter 0.15s;

  &:hover {
    filter: brightness(1.15);
  }
`;

export const ReportLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--ice-main-color);
  text-decoration: none;
  transition: filter 0.15s;

  &:hover {
    filter: brightness(1.15);
  }
`;

export const HeaderDivider = styled.div`
  width: 1px;
  height: 12px;
  background: var(--main-line-color);
`;

export const PageContent = styled.main`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

export const PageInner = styled.div`
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

export const PageFooter = styled.footer`
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-top: 1px solid var(--main-line-color);
  flex-shrink: 0;
  overflow: hidden;
  user-select: none;
`;

export const CopyrightWrap = styled.div`
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  text-align: left;
  padding-right: 8px;
`;

export const Copyright = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  opacity: 0.75;
  white-space: nowrap;
`;

export const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding-left: 8px;
`;

export const FooterLink = styled.a`
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--main-color);
  opacity: 0.55;
  text-decoration: none;
  white-space: nowrap;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
`;

export const FooterDivider = styled.div`
  width: 1px;
  height: 10px;
  background: var(--main-line-color);
`;

export const HeroSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const BadgeRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 0.75rem;
`;

export const Badge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 100px;
  border: 1px solid color-mix(in srgb, var(--ice-main-color) 40%, transparent);
  background: color-mix(in srgb, var(--ice-main-color) 8%, transparent);
  color: var(--ice-main-color);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  user-select: none;
`;

export const ErrorCode = styled.div`
  font-size: 6rem;
  font-weight: 800;
  color: var(--ice-main-color);
  line-height: 1;
  margin-bottom: 0.5rem;
  letter-spacing: -0.05em;
`;

export const ErrorTitle = styled.h1`
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--main-color);
  margin: 0 0 0.5rem;
`;

export const ErrorDesc = styled.p`
  color: var(--main-color-reverse);
  margin: 0 0 1.25rem;
  line-height: 1.6;
  font-size: 0.95rem;
`;

export const ErrorActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

export const BtnPrimary = styled.button`
  appearance: none;
  border: none;
  background: var(--ice-main-color);
  color: var(--main-bg-color);
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: filter 0.15s;

  &:hover {
    filter: brightness(1.12);
  }
`;

export const ReportIssueLink = styled.a`
  display: inline-block;
  margin-top: 4px;
  color: var(--main-color);
  opacity: 0.65;
  font-size: 0.88rem;
  text-decoration: underline;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
`;
