import styled from 'styled-components';

interface Props {
  onClick: () => void;
  text: string;
  disabled?: boolean;
}

const MenuBtn: React.FC<Props> = ({ onClick, text, disabled = false }) => {
  return (
    <BtnDiv onClick={!disabled ? onClick : undefined} disabled={disabled}>
      {text}
    </BtnDiv>
  );
};

const BtnDiv = styled.div<{ disabled: boolean }>`
  margin: 2px 1px 2px 1px;
  padding: 2px 4px 2px 4px;
  border-radius: 5px;
  font-weight: 600;
  font-size: 12px;
  color: var(
    ${({ disabled }) => (disabled ? '--main-disabled-color' : '--main-color')}
  );
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
  &:hover {
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    color: ${({ disabled }) => (disabled ? '' : 'var(--ice-main-color)')};
    background-color: ${({ disabled }) =>
      disabled ? '' : 'var(--main-hover-color)'};
  }
`;

export default MenuBtn;
