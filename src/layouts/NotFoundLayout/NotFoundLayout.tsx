'use client';

// 1. useEffect를 추가로 import 합니다.
import React, { useEffect } from 'react';
import Logo from '@/components/common/Icons/Logo/Logo';
import { NotFoundContainer } from './NotFoundLayout.styles';

const NotFoundLayout: React.FC = () => {
  // 2. 컴포넌트가 렌더링되자마자 주소를 검사하는 로직을 추가합니다.
  useEffect(() => {
    const currentPath = window.location.pathname;

    // 만약 현재 주소가 '/'로 끝나고, 루트 주소('/') 자체가 아니라면
    if (currentPath.endsWith('/') && currentPath.length > 1) {
      // 마지막 슬래시를 제거하고, 뒤에 붙은 파라미터나 해시값을 그대로 살려서 이동
      const newPath =
        currentPath.slice(0, -1) +
        window.location.search +
        window.location.hash;

      // replace를 사용하여 뒤로가기 히스토리에 404 페이지가 남지 않도록 합니다.
      window.location.replace(newPath);
    }
  }, []);

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
