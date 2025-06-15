import React, { useState } from 'react';
import styled from 'styled-components';
import { updatePackageTelegramSettings } from '../firebase';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #23232e;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  color: #fff;
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  color: #fff;
  font-size: 18px;
`;

const Checkbox = styled.input`
  width: 22px;
  height: 22px;
  cursor: pointer;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 16px;

  &:hover {
    background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
    transform: translateY(-2px);
  }

  &:disabled {
    background: #444;
    cursor: not-allowed;
    transform: none;
  }
`;

const TelegramNotificationSettings = ({ isOpen, onClose, packageId, currentSettings = {} }) => {
  const [enabled, setEnabled] = useState(!!currentSettings.enabled);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updatePackageTelegramSettings(packageId, {
        enabled
      });
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Title>Уведомления Telegram</Title>
        <CheckboxLabel>
          <Checkbox
            type="checkbox"
            checked={enabled}
            onChange={() => setEnabled(v => !v)}
          />
          Включить уведомления для этой посылки
        </CheckboxLabel>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </ModalContent>
    </Modal>
  );
};

export default TelegramNotificationSettings; 