import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CardWrapper = styled.div`
  perspective: 1000px;
  width: 100%;
  max-width: 320px;
  height: 420px;
  margin: 0 auto;
  animation: ${css`${fadeIn} 0.5s ease-out`};
  cursor: pointer;
`;

const Card = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform-origin: center;
  
  ${({ isFlipped }) => isFlipped && `
    transform: rotateY(180deg);
  `}
`;

const CardSide = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-radius: 20px;
  padding: 20px;
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CardFront = styled(CardSide)`
  background: #ffffff; /* צד קדמי סגול */
  color: #ffffff;
  ${({ isFlipped }) => isFlipped && `
    visibility: hidden;
  `}
`;

const CardBack = styled(CardSide)`
  background: #62238C; /* צד אחורי לבן */
  color: #62238C;
  transform: rotateY(180deg);
  ${({ isFlipped }) => !isFlipped && `
    visibility: hidden;
  `}
`;

const GeometricShape = styled.div`
  position: absolute;
  background: ${props => props.color || '#f0f0f0'};
  opacity: 0.5;
  border-radius: 50%;
`;

const TopLeftCircle = styled(GeometricShape)`
  width: 80px;
  height: 80px;
  top: -40px;
  left: -40px;
`;

const BottomRightCircle = styled(GeometricShape)`
  width: 120px;
  height: 120px;
  bottom: -60px;
  right: -60px;
`;

const CourseImage = styled.img`
  width: 80%;
  max-width: 200px;
  height: auto;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const CourseTitle = styled.h2`
  font-weight: 900;
  font-size: 1.2rem;
  @media (min-width: 600px) {
    font-size: 1.5rem;
  }
  color: ${props => props.isFlipped ? '#62238C' : '#ffffff'};
  text-align: center;
  margin-bottom: 10px;
  z-index: 1;
`;

const CourseDescription = styled.p`
  font-size: 0.9rem;
  @media (min-width: 600px) {
    font-size: 1rem;
  }
  color: #62238C;
  text-align: center;
  z-index: 1;
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 15px;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 1;
  `;

const FlipCard = ({ title, imageSrc, description, courseId, isEnrolled, children }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = (e) => {
    // Prevent flipping when clicking on the button
    if (!e.target.closest('a')) {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <CardWrapper onClick={handleClick}>
      <Card isFlipped={isFlipped}>
        <CardFront isFlipped={isFlipped}>
          <TopLeftCircle color="#4a1b6d" />
          <BottomRightCircle color="#9D4EDD" />
          <CourseImage src={imageSrc} alt={title} />
          <CourseTitle isFlipped={isFlipped}>{title}</CourseTitle>
          <ButtonWrapper>
            {React.Children.map(children, child =>
              React.cloneElement(child, { isFlipped: isFlipped })
            )}
          </ButtonWrapper>
        </CardFront>
        <CardBack isFlipped={isFlipped}>
          <TopLeftCircle color="#f0f0f0" />
          <BottomRightCircle color="#9D4EDD" />
          <CourseTitle isFlipped={isFlipped}>{title}</CourseTitle>
          <CourseDescription>{description}</CourseDescription>
          <ButtonWrapper>
            {React.Children.map(children, child =>
              React.cloneElement(child, { isFlipped: isFlipped })
            )}
          </ButtonWrapper>
        </CardBack>
      </Card>
    </CardWrapper>
  );
};

export default FlipCard;
