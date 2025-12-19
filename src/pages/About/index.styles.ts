import styled from 'styled-components';

export const MainContainer = styled.div`
  scroll-snap-type: y mandatory;
  color: var(--main-color);
  background: linear-gradient(180deg, var(--main-bg-color) 0%, var(--main-hover-color) 100%);
`;

export const AppContainer = styled.div`
  font-family: sans-serif;
  text-align: center;
`;

export const Section = styled.section<{ $bgColor?: string }>`
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  scroll-snap-align: center;
  overflow: hidden;
  background: ${(props) => props.$bgColor ? props.$bgColor : `var(--main-bg-color)`};
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  padding: 2rem 0;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const HeroSection = styled.section`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background: linear-gradient(135deg, var(--main-bg-color) 0%, var(--main-hover-color) 100%);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: grid-move 20s linear infinite;
  }

  @keyframes grid-move {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }

  .hero-content {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 800px;
    padding: 2rem;
  }
`;

export const GlassCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  .profile-section {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
  }
`;

export const ProfileImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const BadgeImage = styled.div`
  width: 120px;
  height: 120px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export const GradientText = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin: 1rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const StatCard = styled.div<{ $delay?: number }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  opacity: 0;
  transform: scale(0.8);
  animation: pop-in 0.5s ease-out forwards;
  animation-delay: ${({ $delay }) => $delay || 0}s;

  @keyframes pop-in {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .value {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .label {
    font-size: 0.85rem;
    opacity: 0.7;
    margin-top: 0.5rem;
  }
`;

export const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    background: linear-gradient(135deg, var(--ice-main-color_3) 0%, var(--main-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 1.1rem;
    opacity: 0.7;
    margin: 0;
  }
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const MasonryItem = styled.div<{ $delay?: number }>`
  opacity: 0;
  transform: translateY(20px);

  &.visible {
    animation: fadeInUp 0.8s ease-out forwards;
    animation-delay: ${({ $delay }) => $delay || 0}s;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const FeatureCard = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: var(--main-bg-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 2rem;
    z-index: 2;
    opacity: 0.6;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
    border-color: rgba(102, 126, 234, 0.3);

    .icon {
      opacity: 1;
    }
  }
`;

export const ImageContainer = styled.div`
  width: 100%;
  height: 250px;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85) 100%);
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
    opacity: 0;
    transition: opacity 0.4s ease;

    p {
      color: white;
      margin: 0;
      font-size: 0.95rem;
      font-weight: 500;
    }
  }

  &:hover {
    img {
      transform: scale(1.08);
    }

    .overlay {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    height: 200px;
  }
`;

export const AnimatedHeading = styled.h2`
  margin: 0;
  padding: 1.5rem;
  color: var(--ice-main-color_3);
  font-size: 1.75rem;
  font-weight: 700;
  font-family: consolas;
  letter-spacing: -0.5px;
  line-height: 1.2;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    padding: 1rem;
  }
`;

export const SkillGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
`;

export const SkillTag = styled.div<{ $delay?: number }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 24px;
  font-size: 0.95rem;
  font-weight: 500;
  opacity: 0;
  transition: all 0.3s ease;

  &.visible {
    animation: fadeIn 0.6s ease-out forwards;
    animation-delay: ${({ $delay }) => $delay || 0}s;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

export const TimelineContainer = styled.div`
  position: relative;
  padding: 2rem 0;
`;

export const TimelineItem = styled.div`
  position: relative;
  padding-left: 4rem;
  margin-bottom: 3rem;
  opacity: 0;
  transition: all 0.6s ease;

  &.visible {
    animation: slideIn 0.8s ease-out forwards;
  }

  @keyframes slideIn {
    to {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding-left: 2.5rem;
  }
`;

export const TimelineDot = styled.div`
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 0 0 4px var(--main-bg-color), 0 0 0 6px rgba(102, 126, 234, 0.3);
  z-index: 2;
`;

export const TimelineLine = styled.div`
  position: absolute;
  left: 9px;
  top: 30px;
  bottom: -3rem;
  width: 2px;
  background: linear-gradient(180deg, rgba(102, 126, 234, 0.5) 0%, transparent 100%);
`;

export const TimelineContent = styled.div`
  position: relative;
`;

export const FloatingCard = styled.div<{ $delay?: number }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  animation: slide-in-right 0.6s ease-out forwards;
  animation-delay: ${({ $delay }) => $delay || 0}s;
  opacity: 0;
  text-align: center;

  @keyframes slide-in-right {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .icon {
    display: inline-block;
  }

  .period {
    font-size: 0.85rem;
    color: var(--ice-main-color_3);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .position {
    font-size: 1rem;
    opacity: 0.8;
    margin-bottom: 0.75rem;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
    opacity: 0.7;
    line-height: 1.6;
  }

  .duration {
    font-size: 0.85rem;
    opacity: 0.6;
    margin-top: 0.75rem;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    border-color: rgba(102, 126, 234, 0.5);
  }
`;

export const TabletContainer = styled.div`
  background-color: #000;
  border: 4px solid #707070;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 12px;
  width: 90vw;
  max-width: 800px;
  max-height: 85vh;
  position: relative;
  margin: 20px;
  overflow: hidden;
  opacity: 0;
  transform: translateY(50px);
  animation: slideInUp 0.8s ease-out 0.3s forwards;

  @keyframes slideInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const TabletWrapper = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  overflow-y: auto;
  padding: 2rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
  }
`;

export const Container = styled.div<{ $rotateX: number; $rotateY: number }>`
  width: 150px;
  height: 150px;
  transition: all 0.1s;
  position: relative;
  transform: ${({ $rotateX, $rotateY }) =>
    `perspective(350px) rotateX(${$rotateX}deg) rotateY(${$rotateY}deg)`};
`;

export const Overlay = styled.div<{
  $opacity: number;
  $backgroundPosition: number;
}>`
  position: absolute;
  width: 150px;
  height: 150px;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 219, 112, 0.8) 45%,
    rgba(132, 50, 255, 0.6) 50%,
    transparent 54%
  );
  filter: ${({ $opacity }) => `brightness(1.2) opacity(${$opacity})`};
  mix-blend-mode: color-dodge;
  background-size: 150% 150%;
  background-position: ${({ $backgroundPosition }) =>
    `${$backgroundPosition}%`};
  transition: all 0.1s;
`;

export const Card = styled.div<{ $imgUrl: string }>`
  width: 150px;
  height: 150px;
  background-image: ${({ $imgUrl }) => `url(${$imgUrl});`};
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const InfoCard = styled.div<{ $delay?: number }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0;
  transition: all 0.3s ease;

  &.visible {
    animation: fadeInUp 0.7s ease-out forwards;
    animation-delay: ${({ $delay }) => $delay || 0}s;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
    text-align: left;
  }

  .label {
    font-size: 0.85rem;
    opacity: 0.7;
    margin-bottom: 0.25rem;
  }

  .value {
    font-size: 1rem;
    font-weight: 600;
  }

  .period {
    font-size: 0.8rem;
    opacity: 0.6;
    margin-top: 0.25rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
  }
`;

export const CertificateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CertificateCard = styled.div<{ $delay?: number }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  opacity: 0;
  transition: all 0.3s ease;

  &.visible {
    animation: fadeIn 0.7s ease-out forwards;
    animation-delay: ${({ $delay }) => $delay || 0}s;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .name {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.4;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
    border-color: rgba(102, 126, 234, 0.3);
  }
`;

export const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const ProjectCard = styled.div<{ $delay?: number }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  opacity: 0;
  transition: all 0.3s ease;

  &.visible {
    animation: fadeInUp 0.7s ease-out forwards;
    animation-delay: ${({ $delay }) => $delay || 0}s;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  h3 {
    font-size: 1.3rem;
    margin: 0 0 1rem 0;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .client {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 0.75rem;
    font-weight: 500;
  }

  .role {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    line-height: 1.6;
  }

  .period {
    font-size: 0.85rem;
    color: var(--ice-main-color_3);
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .tag {
    background: rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.3);
    padding: 0.4rem 0.85rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    border-color: rgba(102, 126, 234, 0.3);

    .tag {
      background: rgba(102, 126, 234, 0.25);
      border-color: rgba(102, 126, 234, 0.5);
    }
  }
`;

export const ScrollIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: absolute;
  bottom: 2rem;
  z-index: 2;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  .text {
    font-weight: 600;
    font-family: consolas;
    font-size: 0.9rem;
  }

  /* Subtle bounce animation */
  animation: gentleBounce 3s ease-in-out infinite;

  @keyframes gentleBounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }
`;
