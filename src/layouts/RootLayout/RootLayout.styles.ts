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
  height: 26px;
  padding: 0 8px;
  border-bottom: 1.5px solid var(--main-line-color);
  flex-shrink: 0;
  user-select: none;
`;

export const PageContent = styled.main`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6vh 2rem 2rem;
`;

export const PageInner = styled.div`
  width: 100%;
  max-width: 560px;
  text-align: left;
`;

export const Tagline = styled.p`
  margin: 0 0 1.75rem;
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
  gap: 8px;
  flex: 1;
  height: 80px;
  background: transparent;
  border: 1.5px solid var(--main-line-color);
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 1.15rem;
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

export const Divider = styled.div`
  border-top: 1px solid var(--main-line-color);
  margin: 1.25rem 0;
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
