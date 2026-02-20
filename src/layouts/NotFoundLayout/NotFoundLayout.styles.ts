import styled from 'styled-components';

export const NotFoundContainer = styled.main`
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
