import NotFoundLayout from '@/layouts/NotFoundLayout/NotFoundLayout';

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        {/* React가 렌더링되기 전, 브라우저가 HTML을 읽자마자 즉시 실행되는 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var currentPath = window.location.pathname;
                // 끝에 슬래시가 있으면 즉시 잘라내고 이동
                if (currentPath.endsWith('/') && currentPath.length > 1) {
                  var newPath = currentPath.slice(0, -1) + window.location.search + window.location.hash;
                  window.location.replace(newPath);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <NotFoundLayout />
      </body>
    </html>
  );
}
