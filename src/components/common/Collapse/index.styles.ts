import styled from 'styled-components';

export const CollapseContainer = styled.div`
  border-radius: 5px;
  margin-bottom: 10px;
`;

export const CollapseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid var(--main-line-color);
`;

export const Title = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

export const CollapseContent = styled.div`
  padding: 10px;
  border-bottom: 1px solid var(--main-line-color);
`;
