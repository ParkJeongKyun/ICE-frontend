export const CRITICAL_CSS = `
  :root {
    --main-bg-color: #f9fafb;
    --main-bg-color-primary: #00B0F0;
    --main-bg-color-reverse: #111827;
    --main-hover-color: #e2e8f0;
    --main-hover-color-primary: #e5e7eb;
    --main-hover-line-color: #00B0F0;
    --main-color: #1f2937;
    --main-color-reverse: #6b7280;
    --main-line-color: #94a3b8;
    --main-disabled-color: #64748b;

    --scrollbar-color: rgba(0, 0, 0, 0.08);
    --scrollbar-color-hover: rgba(0, 0, 0, 0.15);

    --ice-bg-overlay: rgba(0, 0, 0, 0.4);
    --ice-bg-overlay-light: rgba(0, 0, 0, 0.05);
    --ice-shadow: rgba(0, 0, 0, 0.05);
    --ice-shadow-deep: rgba(0, 0, 0, 0.08);
    --ice-shadow-heavy: rgba(0, 0, 0, 0.12);
    --ice-shadow-light: rgba(0, 0, 0, 0.03);
    --ice-shadow-extra-light: rgba(0, 0, 0, 0.01);

    --ice-color-danger: #ef4444;
    --ice-bg-danger: rgba(239, 68, 68, 0.08);

    --ice-bg-love: rgba(244, 114, 182, 0.08);
    --ice-border-love: rgba(244, 114, 182, 0.2);

    --ice-bg-primary: rgba(14, 165, 233, 0.08);
    --ice-border-primary: rgba(14, 165, 233, 0.2);

    --ice-icon-color: #1f2937;
    --ice-icon-bg-color: #00B0F0;

    --ice-main-color: #0ea5e9;
    --ice-main-color-error: #ef4444;
    --ice-main-color-success: #10b981;
    --ice-main-color-warning: #f59e0b;
    --ice-main-color-primary: #0369a1;
    --ice-main-color-reverse: #64748b;
    --ice-main-color-love: #f472b6;
  }

  html.dark {
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

    --ice-bg-overlay: rgba(0, 0, 0, 0.5);
    --ice-bg-overlay-light: rgba(0, 0, 0, 0.3);
    --ice-shadow: rgba(0, 0, 0, 0.1);
    --ice-shadow-deep: rgba(0, 0, 0, 0.2);
    --ice-shadow-heavy: rgba(0, 0, 0, 0.15);
    --ice-shadow-light: rgba(0, 0, 0, 0.1);
    --ice-shadow-extra-light: rgba(0, 0, 0, 0.05);

    --ice-color-danger: #dc3545;
    --ice-bg-danger: rgba(220, 53, 69, 0.1);

    --ice-bg-love: rgba(255, 107, 138, 0.1);
    --ice-border-love: rgba(255, 107, 138, 0.3);

    --ice-bg-primary: rgba(96, 200, 255, 0.1);
    --ice-border-primary: rgba(96, 200, 255, 0.3);

    --ice-icon-color: #ffffff;
    --ice-icon-bg-color: #00B0F0;

    --ice-main-color: #60c8ff;
    --ice-main-color-error: #e05858;
    --ice-main-color-success: #40e0a0;
    --ice-main-color-warning: #e0c040;
    --ice-main-color-primary: #d8f0ff;
    --ice-main-color-reverse: #5a9cb5;
    --ice-main-color-love: #ff6b8a;
  }

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
    background-color: var(--main-bg-color);
    color: var(--main-color);
  }

  ::-webkit-scrollbar {
    display: none;
  }
`;
