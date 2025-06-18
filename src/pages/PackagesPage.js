import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingAnimation from '../components/LoadingAnimation';
import TelegramNotificationSettings from '../components/TelegramNotificationSettings';
import { logoutUser, auth, getUserPackages, archivePackage, updatePackageTelegramSettings } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background-color) 0%, #1a1a2e 100%);
  background-size: 200% 200%;
  animation: ${gradientAnimation} 15s ease infinite;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100vw;
  overflow-x: hidden;
  @media (max-width: 600px) {
    width: 100vw;
    min-width: 0;
    padding: 0;
  }
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
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
  animation: ${fadeUp} 0.6s ease-out;
  flex: 1;
  width: 100%;
  @media (max-width: 600px) {
    padding: 24px 2vw 0 2vw;
    max-width: 100vw;
  }
`;

const PageContent = styled.div`
  animation: ${({ isLoading }) => (!isLoading ? 'fadeBrightIn 0.5s ease-out' : 'none')};
`;

const Title = styled.h1`
  color: var(--text-color);
  font-size: 36px;
  margin-bottom: 16px;
  position: relative;
  display: inline-block;
  font-family: 'Montserrat', sans-serif;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100px;
    height: 3px;
    background: linear-gradient(to right, var(--primary-color), var(--primary-light));
    border-radius: 3px;
  }
`;

const TopControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const SearchContainer = styled.div`
  width: 100%;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 16px;
  width: 100%;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px;
  background-color: rgba(45, 45, 45, 0.7);
  border: 1px solid rgba(142, 36, 170, 0.3);
  border-radius: var(--border-radius);
  font-size: 16px;
  color: var(--text-color);
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
  
  &::placeholder {
    color: var(--text-secondary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(142, 36, 170, 0.2);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  padding: 0 24px;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(142, 36, 170, 0.3);
  font-family: 'Montserrat', sans-serif;
  white-space: nowrap;
  
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
  
  &:hover {
    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(142, 36, 170, 0.5);
  }
  
  &:hover::after {
    animation: ripple 1s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    100% {
      transform: scale(30, 30);
      opacity: 0;
    }
  }
`;

const AddButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  height: 48px;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const FloatingAddButton = styled(Button)`
  margin-top: 30px;
  max-width: 300px;
  width: 100%;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-left: auto;
  margin-right: auto;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ViewOptions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: rgba(45, 45, 45, 0.7);
  border-radius: var(--border-radius);
  padding: 6px;
  border: 1px solid rgba(142, 36, 170, 0.15);
`;

const ViewOption = styled.button`
  background: ${props => props.active ? 'rgba(142, 36, 170, 0.3)' : 'transparent'};
  border: none;
  border-radius: var(--border-radius);
  padding: 8px 12px;
  color: ${props => props.active ? 'var(--primary-light)' : 'var(--text-secondary)'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Montserrat', sans-serif;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    color: var(--primary-light);
    background-color: rgba(142, 36, 170, 0.15);
  }
`;

const PackagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
  animation: ${fadeUp} 0.6s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
  align-items: center;
`;

const PackagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 30px;
  animation: ${fadeUp} 0.6s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const PackageCard = styled.div`
  background: rgba(35, 35, 46, 0.7);
  border-radius: 16px;
  padding: 36px 32px 32px 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1.5px solid rgba(142, 36, 170, 0.18);
  transition: all 0.3s ease;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: auto;
  margin-right: auto;
  @media (max-width: 600px) {
    max-width: 98vw;
    padding: 18px 8px 18px 8px;
    margin-bottom: 18px;
    border-radius: 12px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
    border-color: rgba(142, 36, 170, 0.28);
  }
`;

const PackageCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TrackingNumber = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  font-family: 'Montserrat', sans-serif;
`;

const Status = styled.div`
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status.toLowerCase()) {
      case 'в пути':
      case 'in_transit':
        return 'rgba(0, 150, 255, 0.2)';
      case 'создана':
      case 'created':
        return 'rgba(255, 215, 0, 0.2)';
      case 'зарегистрирована':
      case 'pending':
      case 'registered':
        return 'rgba(142, 36, 170, 0.2)';
      case 'готова к получению':
      case 'ready':
        return 'rgba(0, 200, 83, 0.2)';
      case 'получена':
      case 'доставлена':
      case 'delivered':
        return 'rgba(156, 39, 176, 0.2)';
      case 'возвращено':
      case 'returned':
        return 'rgba(255, 87, 34, 0.2)';
      case 'отменена':
      case 'cancelled':
        return 'rgba(150, 150, 150, 0.2)';
      default:
        return 'rgba(150, 150, 150, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.status.toLowerCase()) {
      case 'в пути':
      case 'in_transit':
        return '#0096ff';
      case 'создана':
      case 'created':
        return '#ffd700';
      case 'зарегистрирована':
      case 'pending':
      case 'registered':
        return '#a04ed3';
      case 'готова к получению':
      case 'ready':
        return '#00c853';
      case 'получена':
      case 'доставлена':
      case 'delivered':
        return '#9C27B0';
      case 'возвращено':
      case 'returned':
        return '#ff5722';
      case 'отменена':
      case 'cancelled':
        return '#969696';
      default:
        return '#969696';
    }
  }};
  font-family: 'Montserrat', sans-serif;
  /* text-transform: capitalize; */
`;

const PackageCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
`;

const PackageInfo = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
  
  span {
    color: var(--text-color);
    margin-left: 8px;
  }
`;

const PackageActions = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 18px;
`;

const ActionButton = styled.button`
  background: rgba(142, 36, 170, 0.1);
  color: var(--primary-light);
  border: 1.5px solid rgba(142, 36, 170, 0.22);
  padding: 0;
  border-radius: 12px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 48px;
  height: 48px;

  &:hover {
    background: rgba(142, 36, 170, 0.18);
    border-color: rgba(142, 36, 170, 0.32);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ActionsButton = styled.button`
  background: transparent;
  border: 1.5px solid rgba(142, 36, 170, 0.32);
  border-radius: 12px;
  color: var(--text-color);
  padding: 0;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 48px;
  height: 48px;
  font-size: 16px;

  svg {
    width: 24px;
    height: 24px;
  }

  &:hover {
    background: rgba(142, 36, 170, 0.12);
    color: var(--primary-light);
  }
`;

const PackagesTable = styled.div`
  width: 100%;
  margin-top: 30px;
  animation: ${fadeUp} 0.6s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'Montserrat', sans-serif;
`;

const TableHeader = styled.thead`
  background-color: rgba(45, 45, 45, 0.7);
  
  th {
    text-align: left;
    padding: 16px;
    color: var(--text-color);
    font-weight: 600;
    border-bottom: 1px solid rgba(142, 36, 170, 0.2);
    
    &:first-child {
      border-top-left-radius: var(--border-radius);
    }
    
    &:last-child {
      border-top-right-radius: var(--border-radius);
    }
  }
`;

const TableBody = styled.tbody`
  tr {
    background-color: rgba(45, 45, 45, 0.5);
    transition: all 0.3s ease;
    
    &:hover {
      background-color: rgba(45, 45, 45, 0.8);
    }
    
    &:last-child td:first-child {
      border-bottom-left-radius: var(--border-radius);
    }
    
    &:last-child td:last-child {
      border-bottom-right-radius: var(--border-radius);
    }
  }
  
  td {
    padding: 16px;
    border-bottom: 1px solid rgba(142, 36, 170, 0.1);
    color: var(--text-secondary);
    
    &:first-child {
      color: var(--text-color);
      font-weight: 500;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: rgba(45, 45, 45, 0.7);
  border-radius: var(--border-radius);
  border: 1px solid rgba(142, 36, 170, 0.2);
  margin-top: 30px;
  animation: ${fadeUp} 0.6s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
  
  svg {
    width: 80px;
    height: 80px;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 24px;
    margin-bottom: 10px;
    color: var(--text-color);
    font-family: 'Montserrat', sans-serif;
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 20px;
    max-width: 500px;
    margin: 0 auto;
    font-family: 'Montserrat', sans-serif;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  padding: 15px;
  overflow: hidden;
`;

const ModalContent = styled.div`
  background: rgba(35, 35, 35, 0.95);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-3);
  max-width: 600px;
  width: 95%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 25px;
  position: relative;
  animation: ${props => props.show ? fadeUp : 'none'} 0.4s ease;
  
  @media (max-width: 768px) {
    padding: 20px;
    max-height: 90vh;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--primary-light));
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    font-size: 22px;
    color: var(--text-color);
    font-family: 'Montserrat', sans-serif;
    margin: 0;
  }
  
  @media (max-height: 800px) {
    margin-bottom: 15px;
    
    h2 {
      font-size: 20px;
    }
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--primary-light);
    transform: rotate(90deg);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  
  @media (max-height: 800px) {
    gap: 15px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: var(--text-color);
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
`;

const Input = styled.input`
  padding: 12px;
  background-color: rgba(20, 20, 20, 0.5);
  border: 1px solid rgba(142, 36, 170, 0.3);
  border-radius: var(--border-radius);
  font-size: 15px;
  color: var(--text-color);
  font-family: 'Montserrat', sans-serif;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(142, 36, 170, 0.2);
  }
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.5;
  }
  
  @media (max-height: 800px) {
    padding: 10px;
  }
`;

const Textarea = styled.textarea`
  padding: 12px;
  background-color: rgba(20, 20, 20, 0.5);
  border: 1px solid rgba(142, 36, 170, 0.3);
  border-radius: var(--border-radius);
  font-size: 15px;
  color: var(--text-color);
  min-height: 90px;
  resize: vertical;
  font-family: 'Montserrat', sans-serif;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(142, 36, 170, 0.2);
  }
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.5;
  }
  
  @media (max-height: 800px) {
    min-height: 70px;
    padding: 10px;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
  
  @media (max-height: 800px) {
    margin-top: 15px;
  }
`;

const CancelButton = styled(Button)`
  background: transparent;
  border: 1px solid rgba(142, 36, 170, 0.3);
  box-shadow: none;
  
  &:hover {
    background: rgba(142, 36, 170, 0.1);
    box-shadow: none;
  }
`;

const HelpText = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 8px;
  font-family: 'Montserrat', sans-serif;
`;

const Spinner = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${Spinner} 1s linear infinite;
  margin: 0 auto;
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const PackageListItem = styled.div`
  background: rgba(45, 45, 45, 0.7);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  border: 1px solid rgba(142, 36, 170, 0.2);
  padding: 20px;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--elevation-2), 0 10px 20px rgba(142, 36, 170, 0.15);
  }
`;

const PackageItemLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`;

const PackageItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const PackageItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 5px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const PackageItemDetails = styled.div`
  display: flex;
  gap: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const PackageDetail = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
  font-family: 'Montserrat', sans-serif;
  
  span {
    color: var(--text-color);
    font-weight: 500;
    margin-left: 6px;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-top: 20px;
  border-bottom: 1px solid rgba(142, 36, 170, 0.2);
  margin-bottom: 20px;
`;

const Tab = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.active ? 'var(--primary-light)' : 'var(--text-secondary)'};
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: ${props => props.active ? '600' : '500'};
  padding: 12px 20px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${props => props.active ? 'var(--primary-light)' : 'transparent'};
    transition: all 0.3s ease;
  }
  
  &:hover {
    color: var(--primary-light);
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
`;

const ViewOptionsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const ViewOptionsLabel = styled.div`
  color: var(--text-secondary);
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  margin-right: 10px;
`;

const AddButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const PackagesContent = styled.div`
  margin: 20px 0;
`;

// Добавьте кнопку добавления посылки для админов
const AdminAddButton = styled(Link)`
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
  padding: 12px 20px;
  border-radius: var(--border-radius);
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: var(--transition);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  margin-bottom: 20px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// Стили для отображения уведомления об отсутствии посылок
const NoPackages = styled.div`
  text-align: center;
  padding: 40px;
  background-color: rgba(45, 45, 45, 0.7);
  border-radius: var(--border-radius);
  border: 1px solid rgba(142, 36, 170, 0.2);
  margin-top: 20px;
  
  svg {
    width: 60px;
    height: 60px;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 24px;
    margin-bottom: 10px;
    color: var(--text-color);
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 10px;
  }
`;

const ArchivedTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-family: 'Montserrat', sans-serif;
  
  span {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-color);
    margin-right: 15px;
  }
  
  .line {
    flex-grow: 1;
    height: 1px;
    background: linear-gradient(to right, rgba(142, 36, 170, 0.5), rgba(142, 36, 170, 0.1));
  }
`;

const PACKAGE_STATUSES = {
  in_transit: 'В пути',
  ready: 'Готова к получению',
  cancelled: 'Отменена',
  pending: 'Создана'
};

const formatStatus = (status) => {
  return PACKAGE_STATUSES[status] || status;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'created':
      return '#4CAF50';
    case 'in_transit':
      return '#2196F3';
    case 'ready':
      return '#00c853';
    case 'cancelled':
      return '#F44336';
    default:
      return '#757575';
  }
};

// Объект для перевода статусов
const statusTranslations = {
  'created': 'Создана',
  'in_transit': 'В пути',
  'ready': 'Готова к получению',
  'delivered': 'Доставлена',
  'cancelled': 'Отменена',
  'registered': 'Зарегистрирована',
  'Delivered': 'Доставлена',
  'Created': 'Создана',
  'In Transit': 'В пути',
  'Ready': 'Готова к получению',
  'Cancelled': 'Отменена',
  'Registered': 'Зарегистрирована'
};

// Функция для перевода статуса
const getTranslatedStatus = (status) => {
  return statusTranslations[status] || status;
};

// Функция для форматирования статуса: только первая буква заглавная, остальные строчные
const formatStatusText = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Компонент для отображения одной посылки
const PackageItem = ({ packageData, onDelete, onEdit, onRestore, archived }) => {
  const [notifEnabled, setNotifEnabled] = useState(!!packageData.telegramNotifications?.enabled);
  const [notifLoading, setNotifLoading] = useState(false);

  const handleToggleNotif = async () => {
    setNotifLoading(true);
    const newEnabled = !notifEnabled;
    try {
      await updatePackageTelegramSettings(packageData.id, { enabled: newEnabled });
      setNotifEnabled(newEnabled);
    } catch (e) {
      // Можно добавить уведомление об ошибке
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <PackageCard>
      <PackageCardHeader>
        <TrackingNumber>{packageData.trackingNumber}</TrackingNumber>
        <Status status={packageData.status}>{formatStatusText(getTranslatedStatus(packageData.status))}</Status>
      </PackageCardHeader>
      <PackageCardContent>
        {packageData.description && (
          <PackageInfo>
            Описание: <span>{packageData.description}</span>
          </PackageInfo>
        )}
        {packageData.weight && (
          <PackageInfo>
            Вес: <span>{packageData.weight}</span>
          </PackageInfo>
        )}
        {packageData.dimensions && (
          <PackageInfo>
            Размеры: <span>{packageData.dimensions}</span>
          </PackageInfo>
        )}
        {packageData.createdAt && (
          <PackageInfo>
            Дата создания: <span>{
              packageData.createdAt.seconds
                ? new Date(packageData.createdAt.seconds * 1000).toLocaleDateString('ru-RU')
                : packageData.createdAt
            }</span>
          </PackageInfo>
        )}
      </PackageCardContent>
      <PackageActions>
        {!archived && (
          <>
            <IconNotifButton
              onClick={handleToggleNotif}
              disabled={notifLoading}
              title={notifEnabled ? 'Отключить уведомления Telegram' : 'Включить уведомления Telegram'}
            >
              {notifLoading ? (
                <NotifSpinner />
              ) : notifEnabled ? (
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="#00e676" strokeWidth="3">  
                  <path d="M26 21a2 2 0 0 1-2 2H10l-5 5V7a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2z" stroke="#00e676" strokeWidth="3"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none" stroke="#FF0000" strokeWidth="3">       
                  <path d="M26 21a2 2 0 0 1-2 2H10l-5 5V7a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2z" stroke="#FF0000" strokeWidth="3"/>
                  <line x1="4" y1="4" x2="32" y2="32" stroke="#FF0000" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
            </IconNotifButton>
            <IconNotifButton
              onClick={() => onDelete && onDelete(packageData.id)}
              title="Архивировать"
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="2">
                <rect x="6" y="12" width="20" height="14" rx="2" stroke="#fff" strokeWidth="2"/>
                <path d="M12 16H20" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <rect x="4" y="6" width="24" height="6" rx="2" stroke="#fff" strokeWidth="2"/>
              </svg>
            </IconNotifButton>
          </>
        )}
        {archived && !packageData.permanentlyArchived && packageData.status !== 'delivered' && packageData.status !== 'Delivered' && (
          <IconNotifButton onClick={() => onRestore && onRestore(packageData.id)} title="Восстановить">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M8 20L16 12L24 20" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 12V28" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconNotifButton>
        )}
      </PackageActions>
    </PackageCard>
  );
};

const IconNotifButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(142, 36, 170, 0.12);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(142,36,170,0.08);
  &:hover:not(:disabled) {
    background: rgba(142, 36, 170, 0.22);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NotifSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 4px solid #eee;
  border-top: 4px solid #8e24aa;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ArchivedSection = styled.div`
  margin-top: 30px;
  animation: ${fadeUp} 0.6s ease-out;
`;

function PackagesPage({ isAdmin }) {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('list');
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [tabChangeLoading, setTabChangeLoading] = useState(false);
  const [showArchivedPackages, setShowArchivedPackages] = useState(false);
  const [archivedPackages, setArchivedPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для открытия формы редактирования
  const openEditForm = (packageId) => {
    console.log('Редактирование посылки:', packageId);
    // Реализовать открытие формы редактирования
  };
  
  // Функция для удаления посылки
  const handleDelete = async (packageId) => {
    try {
      await archivePackage(packageId, true);
      
      // Обновляем оба списка
      const user = auth.currentUser;
      if (user) {
        // Обновляем список активных посылок
        const activePackages = await getUserPackages(user.uid, false);
        setPackages(activePackages);
        
        // Обновляем список архивированных посылок
        const archivedPackagesData = await getUserPackages(user.uid, true);
        setArchivedPackages(archivedPackagesData);
      }
    } catch (error) {
      console.error('Ошибка при архивации посылки:', error);
    }
  };
  
  // Функция для восстановления посылки из архива
  const handleRestore = async (packageId) => {
    try {
      await archivePackage(packageId, false);
      
      // Обновляем оба списка
      const user = auth.currentUser;
      if (user) {
        // Обновляем список активных посылок
        const activePackages = await getUserPackages(user.uid, false);
        setPackages(activePackages);
        
        // Обновляем список архивированных посылок
        const archivedPackagesData = await getUserPackages(user.uid, true);
        setArchivedPackages(archivedPackagesData);
      }
    } catch (error) {
      console.error('Ошибка при восстановлении посылки:', error);
    }
  };
  
  // Функция для плавного переключения вкладок с анимацией загрузки
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    setTabChangeLoading(true);
    // Небольшая задержка для отображения анимации загрузки
    setTimeout(() => {
      setActiveTab(tab);
    }, 300);
  };
  
  // Загрузка посылок пользователя при монтировании компонента и при изменении вкладки
  useEffect(() => {
    const loadUserPackages = async () => {
      setIsLoadingPackages(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const isArchived = activeTab === 'history';
          const userPackages = await getUserPackages(user.uid, isArchived);
          setPackages(userPackages);
          
          // Загружаем архивированные посылки, если их нет или если мы в режиме просмотра архива
          if (archivedPackages.length === 0 || showArchivedPackages) {
            const archived = await getUserPackages(user.uid, true);
            setArchivedPackages(archived);
          }
        } else {
          setPackages([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке посылок:', error);
        setPackages([]);
      } finally {
        setIsLoadingPackages(false);
        setTabChangeLoading(false);
      }
    };
    
    loadUserPackages();
  }, [activeTab, showArchivedPackages]);
  
  // Обновление архива при изменении флага showArchivedPackages
  useEffect(() => {
    if (showArchivedPackages) {
      const loadArchivedPackages = async () => {
        try {
          const user = auth.currentUser;
          if (user) {
            const archived = await getUserPackages(user.uid, true);
            setArchivedPackages(archived);
          }
        } catch (error) {
          console.error('Ошибка при загрузке архивированных посылок:', error);
        }
      };
      
      loadArchivedPackages();
    }
  }, [showArchivedPackages]);
  
  const filteredPackages = packages.filter(pkg => {
    // Фильтрация по поисковому запросу
    return searchTerm.trim() === '' || 
      pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleArchivePackage = async (packageId, archived) => {
    try {
      await archivePackage(packageId, archived);
    
      // Обновляем список посылок
      const user = auth.currentUser;
      if (user) {
        const isArchived = activeTab === 'history';
        const userPackages = await getUserPackages(user.uid, isArchived);
        setPackages(userPackages);
        
        // Обновляем список архивированных посылок
        const archivedPackagesData = await getUserPackages(user.uid, true);
        setArchivedPackages(archivedPackagesData);
      }
    } catch (error) {
      console.error('Ошибка при архивации посылки:', error);
    }
  };
  
  const handleAddPackage = () => {
    navigate('/add-package');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const renderPackages = () => {
    if (isLoadingPackages || tabChangeLoading) {
      return <LoadingAnimation text="Загрузка посылок" />;
    }
    
    if (filteredPackages.length === 0) {
      return (
        <EmptyState>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L12 2.27002C11.696 2.09449 11.3511 2.00208 11 2.00208C10.6489 2.00208 10.304 2.09449 10 2.27002L2 6.27002C1.69626 6.44539 1.44398 6.69754 1.26846 7.00119C1.09294 7.30483 1.00036 7.6493 1 8.00002V16C1.00036 16.3508 1.09294 16.6952 1.26846 16.9989C1.44398 17.3025 1.69626 17.5547 2 17.73L10 21.73C10.304 21.9056 10.6489 21.998 11 21.998C11.3511 21.998 11.696 21.9056 12 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1.27002 6.96002L11 12.01L20.73 6.96002" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {activeTab === 'active' ? (
            <>
              <h3>У вас пока нет активных посылок</h3>
              <p>Вы сможете отслеживать свои посылки после их регистрации</p>
            </>
          ) : (
            <>
              <h3>У вас пока нет истории посылок</h3>
              <p>Здесь будут отображаться полученные и архивированные посылки</p>
            </>
          )}
        </EmptyState>
      );
    }

    switch (viewType) {
      case 'grid':
        return (
          <PackagesGrid>
            {filteredPackages.map(pkg => (
              <PackageCard key={pkg.id}>
                <PackageCardHeader>
                  <TrackingNumber>{pkg.trackingNumber}</TrackingNumber>
                  <Status status={pkg.status}>{formatStatusText(getTranslatedStatus(pkg.status))}</Status>
                </PackageCardHeader>
                <PackageCardContent>
                  {pkg.description && (
                    <PackageInfo>
                      Описание: <span>{pkg.description}</span>
                    </PackageInfo>
                  )}
                  {pkg.weight && (
                    <PackageInfo>
                      Вес: <span>{pkg.weight}</span>
                    </PackageInfo>
                  )}
                  {pkg.dimensions && (
                    <PackageInfo>
                      Размеры: <span>{pkg.dimensions}</span>
                    </PackageInfo>
                  )}
                  {pkg.createdAt && (
                    <PackageInfo>
                      Дата создания: <span>{
                        pkg.createdAt.seconds
                          ? new Date(pkg.createdAt.seconds * 1000).toLocaleDateString('ru-RU')
                          : pkg.createdAt
                      }</span>
                    </PackageInfo>
                  )}
                </PackageCardContent>
              </PackageCard>
            ))}
          </PackagesGrid>
        );
      case 'table':
        return (
          <PackagesTable>
            <Table>
              <TableHeader>
                <tr>
                  <th>Трек-номер</th>
                  <th>Статус</th>
                  <th>Откуда</th>
                  <th>Куда</th>
                  <th>Обновлено</th>
                  <th>Действия</th>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredPackages.map(pkg => (
                  <tr key={pkg.id}>
                    <td>{pkg.trackingNumber}</td>
                    <td>
                      <Status status={pkg.status} style={{ display: 'inline-block' }}>
                        {formatStatusText(getTranslatedStatus(pkg.status))}
                      </Status>
                    </td>
                    <td>
                      {activeTab === 'active' ? (
                        <ActionsButton onClick={() => handleArchivePackage(pkg.id, true)}>
                          Архивировать
                        </ActionsButton>
                      ) : (
                        <ActionsButton onClick={() => handleArchivePackage(pkg.id, false)}>
                          Восстановить
                        </ActionsButton>
                      )}
                    </td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </PackagesTable>
        );
      default: // list
        return (
          <PackagesList>
            {filteredPackages.map(pkg => (
              <PackageItem 
                key={pkg.id} 
                packageData={pkg}
                onDelete={handleDelete}
                onEdit={openEditForm}
              />
            ))}
          </PackagesList>
        );
    }
  };

  return (
    <PageContainer>
      <Header isAuthenticated={true} isAdmin={isAdmin} onLogout={handleLogout} />
      
      <Content>
        <Title>Мои посылки</Title>
        
        <SearchContainer>
          <SearchInput 
            type="text" 
            placeholder="Поиск по треку-коду" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <TabsContainer>
          <Tab active={activeTab === 'active'} onClick={() => setActiveTab('active')}>
            Активные
          </Tab>
          <Tab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
            Архив
          </Tab>
        </TabsContainer>

        <PackagesContent>
          {isLoadingPackages ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
              <LoadingAnimation />
            </div>
          ) : (
            <PackagesGrid>
              {(activeTab === 'active' ? filteredPackages : archivedPackages).map(pkg => (
                <PackageItem
                  key={pkg.id}
                  packageData={pkg}
                  onDelete={handleDelete}
                  onEdit={openEditForm}
                  onRestore={handleRestore}
                  archived={activeTab !== 'active'}
                />
              ))}
            </PackagesGrid>
          )}
        </PackagesContent>
        
        {showArchivedPackages && (
          <ArchivedSection>
            <ArchivedTitle>
              <span>Архивированные посылки</span>
              <div className="line"></div>
            </ArchivedTitle>
            
            {archivedPackages.length === 0 ? (
              <NoPackages style={{ padding: '30px 0' }}>
                <p>В архиве нет посылок</p>
              </NoPackages>
            ) : (
              <PackagesList>
                {archivedPackages.map(packageItem => (
                  <PackageItem 
                    key={packageItem.id} 
                    packageData={packageItem}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    archived={true}
                  />
                ))}
              </PackagesList>
            )}
          </ArchivedSection>
        )}
      </Content>
      
      <Footer />
    </PageContainer>
  );
}

export default PackagesPage; 