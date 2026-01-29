// hooks/useIsMobile.ts (또는 MainLayout 상단)
import { useState, useEffect } from 'react';
import { isMobile as deviceIsMobile } from 'react-device-detect';

export const useIsMobile = () => {
  const [isMobileView, setIsMobileView] = useState(false); // 초기값은 서버와 동일하게 false

  useEffect(() => {
    // 브라우저에 마운트 된 직후에만 실제 기기 정보를 읽어옵니다.
    setIsMobileView(deviceIsMobile);
  }, []);

  return isMobileView;
};
