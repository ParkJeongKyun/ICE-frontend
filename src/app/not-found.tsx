'use client';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
  background-color: var(--main-bg-color);
  color: var(--main-color);
  box-sizing: border-box;

  h1 {
    font-size: 5rem;
    margin: 0 0 20px 0;
    font-weight: 700;
    background: linear-gradient(
      135deg,
      var(--ice-main-color) 0%,
      var(--ice-main-color_5) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  h2 {
    font-size: 1.8rem;
    margin: 15px 0;
    color: var(--main-color);
    font-weight: 600;
  }

  p {
    font-size: 1.1rem;
    margin: 10px 0;
    color: var(--main-color_1);
    line-height: 1.6;
  }

  button {
    margin-top: 40px;
    padding: 14px 40px;
    font-size: 1rem;
    background-color: var(--ice-main-color);
    color: var(--main-bg-color);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(96, 200, 255, 0.3);

    &:hover {
      background-color: var(--ice-main-color_4);
      box-shadow: 0 6px 20px rgba(96, 200, 255, 0.4);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }
`;

export default function NotFound() {
  const router = useRouter();

  return (
    <NotFoundContainer>
      <h1>404</h1>
      <p>Page not found</p>
      <p>The requested page does not exist</p>
      <button onClick={() => router.push('/')}>Go to home</button>
    </NotFoundContainer>
  );
}
