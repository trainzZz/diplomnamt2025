import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const MainContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, var(--background-color) 0%, #1a1a2e 100%);
  background-size: 200% 200%;
  animation: ${gradientAnimation} 15s ease infinite;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 80% 10%, rgba(142, 36, 170, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 20% 80%, rgba(0, 230, 118, 0.07) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px 0 20px;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 44px;
  font-family: 'Montserrat', sans-serif;
  margin-bottom: 18px;
  text-align: center;
  letter-spacing: 2px;
  font-weight: 700;
`;

const Subtitle = styled.h2`
  color: var(--primary-light);
  font-size: 26px;
  font-weight: 400;
  margin-bottom: 38px;
  text-align: center;
`;

const featureCardGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const featuresGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Features = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  margin-bottom: 48px;
  padding: 36px 0;
  border-radius: 32px;
  backdrop-filter: blur(8px);
`;

const cardGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const FeatureCard = styled.div`
  background: linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(160,132,232,0.22) 50%, rgba(142,36,170,0.13) 100%);
  background-size: 250% 250%;
  animation: ${cardGradient} 8s ease-in-out infinite;
  border-radius: 22px;
  box-shadow: 0 4px 24px 0 rgba(80, 60, 120, 0.10), 0 1.5px 8px rgba(0,0,0,0.10);
  padding: 32px 28px;
  min-width: 260px;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: box-shadow 0.25s, transform 0.25s, background 0.25s;
  color: #fff;
  text-shadow: 0 1px 8px rgba(30,30,40,0.10);
  & > * {
    color: #fff;
  }
  &:hover {
    background: linear-gradient(120deg, rgba(160,132,232,0.28) 0%, rgba(255,255,255,0.22) 60%, rgba(142,36,170,0.18) 100%);
    box-shadow: 0 12px 36px 0 rgba(142,36,170,0.13), 0 0 0 2px #a084e8;
    transform: translateY(-8px) scale(1.03);
  }
`;

const FeatureIcon = styled.div`
  font-size: 38px;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.div`
  color: #fff;
  font-size: 21px;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
  letter-spacing: 0.5px;
`;

const FeatureDesc = styled.div`
  color: #e0d7f7;
  font-size: 15px;
  text-align: center;
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 30px;
  justify-content: center;
`;

const MainButton = styled(Link)`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: #fff;
  font-size: 22px;
  font-weight: 500;
  padding: 20px 60px;
  border-radius: var(--border-radius);
  text-decoration: none;
  box-shadow: 0 4px 18px rgba(142,36,170,0.18);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  border: none;
  outline: none;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  margin-top: 10px;
  margin: 30px auto;
  &:hover {
    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 8px 32px rgba(142,36,170,0.28);
    color: #fff;
  }
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.3);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%, -50%);
    transform-origin: 50% 50%;
  }
`;

const InfoText = styled.p`
  color: var(--text-secondary);
  font-size: 17px;
  margin-top: 48px;
  text-align: center;
  max-width: 700px;
`;

export default function HomePage() {
  return (
    <MainContainer>
      <Header isAuthenticated={false} />
      <Content>
        <Title>ProTracker</Title>
        <Subtitle>Современный сервис для отслеживания и управления вашими посылками</Subtitle>
        <Features>
          <FeatureCard>
            <FeatureIcon>📦</FeatureIcon>
            <FeatureTitle>Удобное отслеживание</FeatureTitle>
            <FeatureDesc>Следите за статусом ваших посылок в реальном времени, получайте уведомления и подробную информацию о каждом отправлении.</FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🔔</FeatureIcon>
            <FeatureTitle>Уведомления Telegram</FeatureTitle>
            <FeatureDesc>Получайте мгновенные уведомления о смене статуса ваших посылок прямо в Telegram.</FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🗂️</FeatureIcon>
            <FeatureTitle>Архив и история</FeatureTitle>
            <FeatureDesc>Храните историю всех ваших доставок, архивируйте завершённые заказы и быстро находите нужную информацию.</FeatureDesc>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🛡️</FeatureIcon>
            <FeatureTitle>Безопасность и приватность</FeatureTitle>
            <FeatureDesc>Ваши данные защищены и доступны только вам. Мы заботимся о вашей конфиденциальности.</FeatureDesc>
          </FeatureCard>
        </Features>
        <Actions>
          <MainButton to="/auth">Войти</MainButton>
        </Actions>
      </Content>
      <Footer />
    </MainContainer>
  );
} 