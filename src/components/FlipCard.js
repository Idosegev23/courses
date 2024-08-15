import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const CardWrapper = styled.div`
  perspective: 1000px;
  width: 320px;
  height: 420px;
  animation: ${css`${fadeIn} 0.5s ease-out`};
`;

const Card = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform-origin: center;
  
  ${CardWrapper}:hover & {
    transform: rotateY(180deg);
  }
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
  padding: 30px;
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CardFront = styled(CardSide)`
  background: #fff;
`;

const CardBack = styled(CardSide)`
  background: #62238C;
  color: #ffffff;
  transform: rotateY(180deg);
`;

const GeometricShape = styled.div`
  position: absolute;
  background: ${props => props.color || '#f0f0f0'};
  opacity: 0.5;
  border-radius: 50%;
`;

const TopLeftCircle = styled(GeometricShape)`
  width: 100px;
  height: 100px;
  top: -50px;
  left: -50px;
`;

const BottomRightCircle = styled(GeometricShape)`
  width: 150px;
  height: 150px;
  bottom: -75px;
  right: -75px;
`;

const CourseImage = styled.img`
  width: 80%;
  height: auto;
  border-radius: 10px;
  margin-bottom: 20px;
`;

const CourseTitle = styled.h2`
  font-weight: 900;
  font-size: 1.5rem;
  color: ${props => props.isFlipped ? '#ffffff' : '#62238C'};
  text-align: center;
  margin-bottom: 10px;
  z-index: 1;
`;

const CourseDescription = styled.p`
  font-size: 1rem;
  color: #ffffff;
  text-align: center;
  z-index: 1;
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 1;
`;

const FlipCard = ({ title, imageSrc, description, courseId, isEnrolled, children }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <CardWrapper onMouseEnter={() => setIsFlipped(true)} onMouseLeave={() => setIsFlipped(false)}>
      <Card>
        <CardFront>
          <TopLeftCircle color="#f0f0f0" />
          <BottomRightCircle color="#9D4EDD" />
          <CourseImage src={imageSrc} alt={title} />
          <CourseTitle isFlipped={false}>{title}</CourseTitle>
          <ButtonContainer>
            {React.Children.map(children, child =>
              React.cloneElement(child, { isFlipped: false })
            )}
          </ButtonContainer>
        </CardFront>
        <CardBack>
          <TopLeftCircle color="#4a1b6d" />
          <BottomRightCircle color="#9D4EDD" />
          <CourseTitle isFlipped={true}>{title}</CourseTitle>
          <CourseDescription>{description}</CourseDescription>
          <ButtonContainer>
            {React.Children.map(children, child =>
              React.cloneElement(child, { isFlipped: true })
            )}
          </ButtonContainer>
        </CardBack>
      </Card>
    </CardWrapper>
  );
};

export default FlipCard;