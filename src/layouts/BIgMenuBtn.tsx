import styled from 'styled-components';

interface Props {
  onClick: () => void;
  text: string;
}

const BigMenuBtn: React.FC<Props> = ({ onClick, text }) => {
  return <BtnDiv onClick={onClick}>{text}</BtnDiv>;
};

const BtnDiv = styled.div`
  margin: 2px 1px 2px 1px;
  padding: 2px 4px 2px 4px;
  font-weight: 600;
  &:hover {
    cursor: pointer;
    color: var(--ice-main-color);
    background-color: var(--main-hover-color);
    border-radius: 5px;
  }
`;

export default BigMenuBtn;
