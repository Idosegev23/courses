import React, { useRef, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const HeroContainer = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  overflow: hidden;

  @media (max-width: 768px) {
    height: auto;
    min-height: 100vh;
    padding: 2rem 0;
  }
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  z-index: 1;
  text-align: center;
  padding: 0 20px;
  max-width: 800px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Title = styled.h1`
  font-size: 4.5rem;
  color: #62238C;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 2.2rem;
  color: #333;
  height: 2.5rem;
  margin-bottom: 2rem;
  min-height: 2.5rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    height: 4rem;
    min-height: 4rem;
  }
`;

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

const CTA = styled.button`
  display: inline-block;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  color: white;
  background: linear-gradient(45deg, #000080, #62238C, #9D4EDD, #62238C, #000080);
  background-size: 300% 300%;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    animation: ${wave} 3s ease infinite;
    box-shadow: 0 0 15px rgba(157, 78, 221, 0.6);
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 20px;
  }
`;

const Hero = () => {
  const canvasRef = useRef(null);
  const [typingText, setTypingText] = useState('');
  const phrases = [
    'למידה חדשנית',
    'קורסים מתקדמים',
    'ידע מעשי',
    'מומחיות דיגיטלית',
    'התפתחות אישית'
  ];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    let currentIndex = 0;
    let isDeleting = false;
    let timeoutId;

    const type = () => {
      const currentPhrase = phrases[currentPhraseIndex];
      if (isDeleting) {
        setTypingText(currentPhrase.substring(0, currentIndex - 1));
        currentIndex--;
      } else {
        setTypingText(currentPhrase.substring(0, currentIndex + 1));
        currentIndex++;
      }

      if (!isDeleting && currentIndex === currentPhrase.length) {
        isDeleting = true;
        timeoutId = setTimeout(type, 1500);
      } else if (isDeleting && currentIndex === 0) {
        isDeleting = false;
        setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        timeoutId = setTimeout(type, 500);
      } else {
        timeoutId = setTimeout(type, isDeleting ? 50 : 100);
      }
    };

    timeoutId = setTimeout(type, 1000);

    return () => clearTimeout(timeoutId);
  }, [currentPhraseIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = [];
    const properties = {
      bgColor: 'rgba(255, 255, 255, 1)',
      particleColor: 'rgba(98, 35, 140, 0.1)',
      particleRadius: 3,
      particleCount: 60,
      particleMaxVelocity: 0.5,
      lineLength: 150,
      particleLife: 6,
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.velocityX = Math.random() * (properties.particleMaxVelocity * 2) - properties.particleMaxVelocity;
        this.velocityY = Math.random() * (properties.particleMaxVelocity * 2) - properties.particleMaxVelocity;
        this.life = Math.random() * properties.particleLife * 60;
      }

      position() {
        if ((this.x + this.velocityX > canvas.width && this.velocityX > 0) || 
            (this.x + this.velocityX < 0 && this.velocityX < 0)) {
          this.velocityX *= -1;
        }
        if ((this.y + this.velocityY > canvas.height && this.velocityY > 0) || 
            (this.y + this.velocityY < 0 && this.velocityY < 0)) {
          this.velocityY *= -1;
        }
        this.x += this.velocityX;
        this.y += this.velocityY;
      }

      reDraw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, properties.particleRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = properties.particleColor;
        ctx.fill();
      }

      reCalculateLife() {
        if (this.life < 1) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.velocityX = Math.random() * (properties.particleMaxVelocity * 2) - properties.particleMaxVelocity;
          this.velocityY = Math.random() * (properties.particleMaxVelocity * 2) - properties.particleMaxVelocity;
          this.life = Math.random() * properties.particleLife * 60;
        }
        this.life--;
      }
    }

    const reDrawBackground = () => {
      ctx.fillStyle = properties.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawLines = () => {
      let x1, y1, x2, y2, length, opacity;
      for (let i in particles) {
        for (let j in particles) {
          x1 = particles[i].x;
          y1 = particles[i].y;
          x2 = particles[j].x;
          y2 = particles[j].y;
          length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
          if (length < properties.lineLength) {
            opacity = 1 - length / properties.lineLength;
            ctx.lineWidth = '0.5';
            ctx.strokeStyle = `rgba(98, 35, 140, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
    };

    const reDrawParticles = () => {
      for (let i in particles) {
        particles[i].reCalculateLife();
        particles[i].position();
        particles[i].reDraw();
      }
    };

    const loop = () => {
      reDrawBackground();
      reDrawParticles();
      drawLines();
      animationFrameId = requestAnimationFrame(loop);
    };

    const init = () => {
      for (let i = 0; i < properties.particleCount; i++) {
        particles.push(new Particle());
      }
      loop();
    };

    init();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scrollToCourses = () => {
    const coursesElement = document.getElementById('course-content');
    if (coursesElement) {
      coursesElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <HeroContainer>
      <Canvas ref={canvasRef} />
      <Content>
        <Title>ברוכים הבאים לעולם הלמידה המתקדם</Title>
        <Subtitle>{typingText}</Subtitle>
        <CTA onClick={scrollToCourses}>גלו את הקורסים שלנו</CTA>
      </Content>
    </HeroContainer>
  );
};

export default Hero;