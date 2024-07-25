import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

export const Container = styled.div`
  position: relative;
  width: 90%;
  max-width: 350px;
  border-radius: 20px;
  padding: 30px;
  background: #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Heebo', sans-serif;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 480px) {
    width: 95%;
    padding: 20px;
    border-radius: 15px;
  }
`;

export const GeometricShape = styled.div`
  position: absolute;
  background: ${props => props.color || '#f0f0f0'};
  opacity: 0.5;
  border-radius: 50%;
`;

export const TopLeftCircle = styled(GeometricShape)`
  width: 100px;
  height: 100px;
  top: -50px;
  left: -50px;

  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
    top: -40px;
    left: -40px;
  }
`;

export const BottomRightCircle = styled(GeometricShape)`
  width: 150px;
  height: 150px;
  bottom: -75px;
  right: -75px;

  @media (max-width: 480px) {
    width: 120px;
    height: 120px;
    bottom: -60px;
    right: -60px;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  background: #62238C;
  color: white;
  border: none;
  font-size: 20px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s;

  &:hover {
    background-color: #4a1b6d;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    width: 25px;
    height: 25px;
  }
`;

export const BrandTitle = styled.div`
  margin: 0 0 20px;
  font-weight: 900;
  font-size: 2.5rem;
  color: #62238C;
  letter-spacing: 1px;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);

  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 15px;
  }
`;

export const Inputs = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 280px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.5s ease-out;
  animation-fill-mode: both;
  animation-delay: ${props => props.delay || '0s'};

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

export const Label = styled.label`
  display: block;
  text-align: center;
  margin-bottom: 4px;
  width: 100%;
  font-size: 14px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export const Input = styled.input`
  background: #f5f5f5;
  padding: 10px 15px 10px 40px;
  height: 40px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #ddd;
  width: 100%;
  text-align: center;
  &:focus {
    outline: none;
    border-color: #62238C;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    height: 35px;
    padding: 8px 12px 8px 35px;
  }
`;

export const Icon = styled.i`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #62238C;

  @media (max-width: 480px) {
    font-size: 14px;
    left: 8px;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;

  @media (max-width: 480px) {
    max-width: 100%;
  }
`;

const BaseButton = styled.button`
  display: inline-block;
  margin: 0.5rem 0;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  text-decoration: none;
  color: #fff;
  background: linear-gradient(45deg, #000080, #62238C, #9D4EDD, #62238C, #000080);
  background-size: 300% 300%;
  transition: all 0.3s;
  border: none;
  box-shadow: 0 3px 5px 2px rgba(0, 0, 0, .3);
  cursor: pointer;
  font-weight: 900;
  width: 100%;

  &:hover {
    animation: wave 3s ease infinite;
    box-shadow: 0 0 15px rgba(157, 78, 221, 0.6);
    transform: translateY(-2px);
  }

  @keyframes wave {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @media (max-width: 480px) {
    padding: 0.6rem 1.2rem;
    font-size: 14px;
  }
`;

export const Button = styled(BaseButton)`
  margin-top: 15px;
  font-size: 1.1rem;
  padding: 1rem 2rem;

  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  }
`;

export const GoogleButton = styled(BaseButton)`
  background: #DB4437;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-left: 25px;
  }

  @media (max-width: 480px) {
    svg {
      margin-left: 15px;
    }
  }
`;

export const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
  text-align: center;
  width: 100%;
  max-width: 280px;
  font-size: 14px;

  @media (max-width: 480px) {
    font-size: 12px;
    max-width: 100%;
  }
`;

export const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  z-index: 1;
`;
