'use client';

import styled from 'styled-components';
import Logo from '@/components/common/Icons/Logo/Logo';

const NotFoundContainer = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 40px 16px;
  background: var(--main-bg-color);
  color: var(--main-color);
  box-sizing: border-box;

  .card {
    width: 100%;
    max-width: 720px;
    padding: 28px;
    border-radius: 12px;
    background: transparent;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .left {
    min-width: 96px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .code {
    font-size: 3.25rem;
    margin: 0;
    font-weight: 800;
    color: var(--ice-main-color);
  }

  .right {
    flex: 1 1 auto;
    max-width: 520px;
    text-align: left;
  }

  .title {
    font-size: 1.125rem;
    margin: 0 0 8px 0;
    font-weight: 700;
    color: var(--main-color);
  }

  .desc {
    color: var(--main-color-reverse);
    margin: 0 0 16px 0;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .btn-primary {
    appearance: none;
    border: none;
    background: var(--ice-main-color);
    color: var(--main-bg-color);
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
  }

  .report {
    display: inline-block;
    margin-top: 12px;
    margin-left: 4px;
    color: var(--main-color);
    opacity: 0.75;
    font-size: 0.95rem;
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .card {
      flex-direction: column;
      text-align: left;
      gap: 12px;
    }
    .right {
      text-align: left;
      max-width: 100%;
    }
    .desc {
      margin-bottom: 12px;
    }
  }
`;

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <NotFoundContainer>
          <div className="card" role="main" aria-labelledby="nf-title">
            <div className="left">
              <div className="code">404</div>
            </div>

            <div className="right">
              <div
                className="header"
                style={{
                  display: 'flex',
                  justifyContent: 'left',
                  marginBottom: 10,
                }}
              >
                <Logo showText size={24} textSize={24} />
              </div>

              <div id="nf-title" className="title">
                Page not found
              </div>
              <div className="desc">
                We couldn't find the page you were looking for. Try returning to
                the homepage or check our documentation.
              </div>

              <div className="actions">
                <button
                  className="btn-primary"
                  onClick={() => (window.location.href = '/')}
                >
                  Back to home
                </button>
              </div>
              <a
                className="report"
                href="https://github.com/ParkJeongKyun/ICE-frontend/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                Report an issue
              </a>
            </div>
          </div>
        </NotFoundContainer>
      </body>
    </html>
  );
}
