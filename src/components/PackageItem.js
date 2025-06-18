import React, { useState } from 'react';
import styled from 'styled-components';
import { updatePackage } from '../firebase';
import { MdNotificationsActive, MdNotificationsOff, MdArchive, MdUnarchive, MdExpandMore } from 'react-icons/md';

const PackageCard = styled.div`
  background: linear-gradient(135deg, var(--card-color) 0%, rgba(35, 35, 35, 1) 100%);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-2);
  padding: 25px;
  margin-bottom: 24px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-left: 4px solid var(--primary-color);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at top right,
      rgba(142, 36, 170, 0.15),
      transparent 70%
    );
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.05),
      transparent
    );
    transform: rotate(30deg);
    transition: transform 1.5s ease;
    pointer-events: none;
  }
  
  &:hover {
    box-shadow: var(--elevation-3), var(--glow);
    transform: translateY(-5px) scale(1.01);
    
    &::after {
      transform: translateX(100%) rotate(30deg);
    }
  }
`;

const PackageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
`;

const TrackingNumber = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-light);
  margin: 0;
  text-shadow: 0 0 8px rgba(142, 36, 170, 0.3);
  letter-spacing: 0.5px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(to right, var(--primary-color), transparent);
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: var(--elevation-1);
  background: ${props => {
    switch (props.status.toLowerCase()) {
      case 'в пути':
      case 'in_transit':
        return 'linear-gradient(to right, var(--warning-color), #ff6d00)';
      case 'создана':
      case 'created':
        return 'linear-gradient(to right, #ffd700, #ffa000)';
      case 'зарегистрирована':
      case 'registered':
        return 'linear-gradient(to right, var(--text-secondary), #757575)';
      case 'готова к получению':
      case 'ready':
        return 'linear-gradient(to right, var(--success-color), #00b248)';
      case 'получена':
      case 'delivered':
        return 'linear-gradient(to right, #9C27B0, #673AB7)';
      default:
        return 'linear-gradient(to right, var(--text-secondary), #757575)';
    }
  }};
  color: white;
  transition: all 0.3s ease;
  transform-origin: center;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px ${props => {
      switch (props.status.toLowerCase()) {
        case 'в пути':
        case 'in_transit':
          return 'rgba(255, 171, 0, 0.5)';
        case 'создана':
        case 'created':
          return 'rgba(255, 215, 0, 0.5)';
        case 'зарегистрирована':
        case 'registered':
          return 'rgba(176, 176, 176, 0.5)';
        case 'готова к получению':
        case 'ready':
          return 'rgba(0, 200, 83, 0.5)';
        case 'получена':
        case 'delivered':
          return 'rgba(156, 39, 176, 0.5)';
        default:
          return 'rgba(176, 176, 176, 0.5)';
      }
    }};
  }
`;

const PackageDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  position: relative;
  background-color: rgba(20, 20, 20, 0.4);
  padding: 15px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 12px;
    color: var(--primary-light);
  }
`;

const DetailText = styled.span`
  color: var(--text-color);
  font-size: 15px;
  letter-spacing: 0.3px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 12px;
  position: relative;
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--accent-color);
  background: rgba(134, 69, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 8px;
  padding: 0;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 12px rgba(134, 69, 255, 0.2)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: var(--text-secondary);
    background: rgba(150, 150, 150, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
    fill: ${props => props.disabled ? 'var(--text-secondary)' : 'var(--accent-color)'};
    transition: fill 0.3s ease;
  }
`;

const ExpandButton = styled.button`
  position: absolute;
  right: 0;
  top: 0;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  
  &:hover {
    color: var(--primary-light);
    transform: rotate(180deg);
  }
`;

const ExpandedContent = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(142, 36, 170, 0.2);
  animation: fadeIn 0.3s ease-out;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: rgba(20, 20, 20, 0.4);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .history-icon {
    margin-right: 15px;
    color: var(--primary-light);
  }
  
  .history-content {
    flex-grow: 1;
    
    .history-date {
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    
    .history-status {
      font-size: 14px;
      color: var(--text-color);
    }
  }
`;

// Добавляем объект для перевода статусов
const statusTranslations = {
  'created': 'Создана',
  'in_transit': 'В пути',
  'ready': 'Готова к получению',
  'delivered': 'Получена',
  'cancelled': 'Отменена',
  'registered': 'Зарегистрирована',
  'Delivered': 'Получена',
  'Created': 'Создана',
  'In Transit': 'В пути',
  'Ready': 'Готова к получению',
  'Cancelled': 'Отменена',
  'Registered': 'Зарегистрирована'
};

const PackageItem = ({ packageData, onArchiveToggle }) => {
  const { trackingNumber, status, origin = 'Китай', destination = 'Россия', lastUpdate = '20.05.2023' } = packageData;
  const [expanded, setExpanded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Демо-данные для истории посылки
  const packageHistory = [
    { date: '23.05.2023', status: 'Готова к получению', location: 'Москва, сортировочный центр' },
    { date: '19.05.2023', status: 'В пути', location: 'Прошла границу России' },
    { date: '12.05.2023', status: 'Отправлена', location: 'Гуанчжоу, Китай' },
  ];
  
  // Функция для перевода статуса
  const getTranslatedStatus = (status) => {
    return statusTranslations[status] || status;
  };
  
  const handleArchiveToggle = async () => {
    try {
      await updatePackage(packageData.id, {
        ...packageData,
        archived: !packageData.archived
      });
      
      if (onArchiveToggle) {
        onArchiveToggle();
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса архивации:', error);
      alert('Произошла ошибка при изменении статуса архивации');
    }
  };
  
  // Определяем, нужно ли показывать кнопку разархивации
  const showUnarchiveButton = !packageData.permanentlyArchived;

  return (
    <PackageCard>
      <PackageHeader>
        <TrackingNumber>{trackingNumber}</TrackingNumber>
        <StatusBadge status={status}>
          {getTranslatedStatus(status)}
        </StatusBadge>
      </PackageHeader>
      
      <PackageDetails>
        <DetailItem>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <DetailText>Последнее обновление: {lastUpdate}</DetailText>
        </DetailItem>
        
        <DetailItem>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H5M19 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M11 9L13 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 12L7 8M3 12L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12L17 8M21 12L17 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <DetailText>Маршрут: {origin} → {destination}</DetailText>
        </DetailItem>
      </PackageDetails>
      
      {expanded && (
        <ExpandedContent>
          <h4 style={{ marginBottom: '15px', color: 'var(--primary-light)' }}>История отслеживания</h4>
          {packageHistory.map((item, index) => (
            <HistoryItem key={index}>
              <div className="history-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="history-content">
                <div className="history-date">{item.date}</div>
                <div className="history-status">{item.status} - {item.location}</div>
              </div>
            </HistoryItem>
          ))}
        </ExpandedContent>
      )}
      
      <Actions>
        <ActionButton 
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          title={notificationsEnabled ? "Отключить уведомления" : "Включить уведомления"}
        >
          {notificationsEnabled ? (
            <MdNotificationsActive size={22} color="#00e676" />
          ) : (
            <MdNotificationsOff size={22} color="#FF0000" />
          )}
        </ActionButton>

        {(!packageData.permanentlyArchived || !packageData.archived) && (
          <ActionButton
            onClick={handleArchiveToggle}
            title={packageData.archived ? 'Вернуть из архива' : 'Архивировать'}
          >
            {packageData.archived ? (
              <MdUnarchive size={22} color="#00e676" />
            ) : (
              <MdArchive size={22} color="#8e24aa" />
            )}
          </ActionButton>
        )}

        <ExpandButton onClick={() => setExpanded(!expanded)}>
          <MdExpandMore size={20} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
        </ExpandButton>
      </Actions>
    </PackageCard>
  );
};

PackageItem.defaultProps = {
  onArchiveToggle: () => {} // Пустая функция по умолчанию
};

export default PackageItem; 