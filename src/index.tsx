import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/index.scss';
import App from '@/App';

// 모바일 주소창 대응: --vh 변수에 실제 뷰포트 높이 저장
function setVhVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVhVar();
window.addEventListener('resize', setVhVar);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
