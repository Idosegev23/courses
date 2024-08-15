import styled, { keyframes, css } from 'styled-components';
import { Link } from 'react-router-dom';

const wave = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const StyledButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  color: ${props => props.isFlipped ? '#62238C' : 'white'};
  background: ${props => props.isFlipped
    ? 'white'
    : 'linear-gradient(45deg, #000080, #62238C, #9D4EDD, #62238C, #000080)'};
  background-size: 300% 300%;
  border: ${props => props.isFlipped ? '2px solid #62238C' : 'none'};
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    animation: ${props => props.isFlipped ? 'none' : css`${wave} 3s ease infinite`};
    box-shadow: ${props => props.isFlipped
      ? '0 0 15px rgba(255, 255, 255, 0.6)'
      : '0 0 15px rgba(157, 78, 221, 0.6)'};
    background: ${props => props.isFlipped
      ? '#62238C'
      : 'linear-gradient(45deg, #000080, #62238C, #9D4EDD, #62238C, #000080)'};
    color: ${props => props.isFlipped ? 'white' : 'white'};
  }
`;

export default StyledButton;