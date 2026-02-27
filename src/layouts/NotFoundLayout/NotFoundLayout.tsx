'use client';

import React from 'react';
import Logo from '@/components/common/Icons/Logo/Logo';
import { NotFoundContainer } from './NotFoundLayout.styles';

const NotFoundLayout: React.FC = () => {
  return (
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
            We couldn't find the page you were looking for. Try returning to the
            homepage or check our documentation.
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
  );
};

export default NotFoundLayout;
