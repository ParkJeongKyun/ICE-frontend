import styled from 'styled-components';
import Tooltip from '@/components/common/Tooltip';

interface Props {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  disabledTxt?: string;
}

const Btn: React.FC<Props> = ({
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
  margin: 2px 1px 2px 1px;
  padding: 2px 4px 2px 4px;
  border-radius: 2.5px;

  font-size: 12px;
  font-weight: 600;

  border: 1px solid var(--main-line-color);
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

export default Btn;
