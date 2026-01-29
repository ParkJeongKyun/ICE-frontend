import styled from 'styled-components';
import Tooltip from '@/components/common/Tooltip';

interface Props {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  disabledTxt?: string;
}

const MenuBtn: React.FC<Props> = ({
  onClick,
  text,
  disabled = false,
  disabledTxt,
}) => {
  const button = (
    <BtnDiv onClick={!disabled ? onClick : undefined} disabled={disabled}>
      {text}
    </BtnDiv>
  );

  return disabled && disabledTxt ? (
    <Tooltip text={disabledTxt}>{button}</Tooltip>
  ) : (
    button
  );
};

const BtnDiv = styled.div<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 5px;
  border-radius: 4px;

  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;

  color: var(
    ${({ disabled }) => (disabled ? '--main-disabled-color' : '--main-color')}
  );
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  transition: all 0.15s ease;

  &:hover {
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    color: ${({ disabled }) => (disabled ? '' : 'var(--ice-main-color)')};
    background-color: ${({ disabled }) =>
      disabled ? '' : 'var(--main-hover-color)'};
  }

  &:active {
    opacity: 0.8;
  }
`;

export default MenuBtn;
