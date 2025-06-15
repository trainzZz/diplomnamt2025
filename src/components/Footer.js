import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const FooterContainer = styled.footer`
  background-color: rgba(29, 29, 29, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.2);
  padding: 40px 0 20px;
  border-top: 1px solid rgba(142, 36, 170, 0.2);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(142, 36, 170, 0.05), rgba(0, 230, 118, 0.05));
    background-size: 200% 200%;
    animation: ${gradientAnimation} 15s ease infinite;
    pointer-events: none;
  }
`;

const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
  }
`;

const Column = styled.div`
  flex: 1;
  min-width: 200px;
  margin-bottom: 20px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-light);
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  svg {
    margin-right: 10px;
    filter: drop-shadow(0 0 5px rgba(142, 36, 170, 0.5));
  }
`;

const Title = styled.h3`
  color: var(--text-color);
  font-size: 18px;
  margin-bottom: 16px;
  position: relative;
  display: inline-block;
  font-family: 'Montserrat', sans-serif;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(to right, var(--primary-color), var(--primary-light));
    border-radius: 2px;
  }
`;

const Description = styled.p`
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.6;
  max-width: 350px;
  font-family: 'Montserrat', sans-serif;
`;

const FooterLink = styled(Link)`
  display: block;
  color: var(--text-secondary);
  padding: 6px 0;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  
  &:hover {
    color: var(--primary-light);
    transform: translateX(5px);
  }
`;


const Copyright = styled.div`
  text-align: center;
  color: var(--text-secondary);
  border-top: 1px solid rgba(142, 36, 170, 0.15);
  padding-top: 20px;
  margin-top: 20px;
  width: 100%;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
`;



function Footer() {
  return (
    <FooterContainer>
      <FooterContent>
        <Column>
          <Logo to="/">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8H20M4 16H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 4H18L16 20H8L6 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M10 12L14 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            ProTracker
          </Logo>
          <Description>
            Современная система отслеживания посылок и управления доставками. Контролируйте ваши отправления в режиме реального времени.
          </Description>
          
        </Column>
        
        <Column>
          <Title>Навигация</Title>
          <FooterLink to="/">Главная</FooterLink>
          <FooterLink to="/packages">Мои посылки</FooterLink>
          <FooterLink to="/profile">Личный кабинет</FooterLink>
        </Column>
        
        <Copyright>
          © 2025 ProTracker. Все права защищены. Разработано студентом 4 курса, группы 21-13ИСк, Лузином Сергеем
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
}

export default Footer; 