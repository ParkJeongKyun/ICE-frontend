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
  opacity: 0.7;
  transition:
    opacity 0.15s,
    color 0.15s;

  &:hover {
    opacity: 1;
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
  opacity: 0.7;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
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
  opacity: 0.7;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
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
  padding: 4vh 2rem 2rem;
`;

export const PageInner = styled.div`
  width: 100%;
  max-width: 500px;
  text-align: left;
`;

export const Tagline = styled.p`
  margin: 0 0 1.25rem;
  font-size: 1.05rem;
  opacity: 0.85;
  line-height: 1.65;
`;

export const SectionLabel = styled.div`
  font-size: 0.78rem;
  font-weight: 700;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  margin-bottom: 0.75rem;
  user-select: none;
`;

export const LangRow = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

export const LangBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 64px;
  background: transparent;
  border: 1.5px solid var(--main-line-color);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--main-color);
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
  user-select: none;

  &:hover {
    background: var(--ice-main-color);
    border-color: var(--ice-main-color);
    color: var(--main-bg-color);
  }
`;

export const LangBtnHint = styled.span`
  font-size: 0.65rem;
  font-weight: 400;
  opacity: 0.55;
  letter-spacing: 0.03em;

  ${LangBtn}:hover & {
    opacity: 0.85;
  }
`;

export const Divider = styled.div`
  border-top: 1px solid var(--main-line-color);
  margin: 1rem 0;
`;

export const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 7px;
`;

export const FeatureDot = styled.span`
  color: var(--ice-main-color);
  font-size: 0.85rem;
  margin-top: 3px;
  flex-shrink: 0;
`;

export const FeatureLabel = styled.div`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 3px;
`;

export const FeatureDesc = styled.div`
  font-size: 0.92rem;
  opacity: 0.8;
  line-height: 1.6;
`;

export const AboutText = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  opacity: 0.85;
  line-height: 1.65;
`;

export const PageFooter = styled.footer`
  display: flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-top: 1px solid var(--main-line-color);
  flex-shrink: 0;
  user-select: none;
`;

export const Copyright = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  opacity: 0.75;
`;

export const FlagIconWrap = styled.span`
  line-height: 0;
`;

export const PreviewImg = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid var(--main-line-color);
  margin-bottom: 1.75rem;
  display: block;
`;
