const CRITICAL_CSS = `
  html, body, #root {
    height: 100dvh;
    max-width: 100vw;
    min-height: 100dvh;
    margin: 0;
    padding: 0;
    text-align: center;
    font-size: 1rem;
    line-height: 1.5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    overscroll-behavior: none;
    background-color: #121820;

    --main-bg-color: #121820;
    --main-bg-color-primary: #81d4fe;
    --main-bg-color-reverse: #e8f4ff;
    --main-hover-color: #243240;
    --main-hover-color-primary: #0a1218;
    --main-hover-line-color: #7aa8c8;
    --main-color: #d8e8f0;
    --main-color-reverse: #a0c0d8;
    --main-line-color: #345167;
    --main-disabled-color: #3a4754;

    --scrollbar-color: rgba(52, 81, 103, 0.5);
    --scrollbar-color-hover: rgba(52, 81, 103, 0.9);

    --ice-main-color: #60c8ff;
    --ice-main-color-error: #e05858;
    --ice-main-color-success: #40e0a0;
    --ice-main-color-warning: #e0c040;
    --ice-main-color-primary: #d8f0ff;
    --ice-main-color-reverse: #5a9cb5;
    --ice-main-color-love: #ff6b8a;
  }

  ::-webkit-scrollbar {
    display: none;
  }
`;

export default function CriticalCss() {
  return <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />;
}
