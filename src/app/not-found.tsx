import NotFoundLayout from '@/layouts/NotFoundLayout/NotFoundLayout';
import { CRITICAL_CSS } from '@/components/common/CriticalCss';
import GoogleScripts from './GoogleScripts';

export default function NotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        {/* React가 렌더링되기 전, 브라우저가 HTML을 읽자마자 즉시 실행되는 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var config = JSON.parse(localStorage.getItem('ice_user_config'));
                  var theme = config ? config.theme : 'system';
                  var isDark = false;

                  if (theme === 'dark') {
                    isDark = true;
                  } else if (theme === 'light') {
                    isDark = false;
                  } else {
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }

                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }

                  var currentPath = window.location.pathname;
                  // 끝에 슬래시가 있으면 즉시 잘라내고 이동
                  if (currentPath.endsWith('/') && currentPath.length > 1) {
                    var newPath = currentPath.slice(0, -1) + window.location.search + window.location.hash;
                    window.location.replace(newPath);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <NotFoundLayout />
        <GoogleScripts />
      </body>
    </html>
  );
}
