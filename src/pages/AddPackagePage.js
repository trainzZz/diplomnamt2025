import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingAnimation from '../components/LoadingAnimation';
import { addPackage, auth, logoutUser } from '../firebase';
import { useNavigate } from 'react-router-dom';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--background-color) 0%, #1a1a2e 100%);
  background-size: 200% 200%;
  animation: ${gradientAnimation} 15s ease infinite;
  position: relative;
  display: flex;
  flex-direction: column;
  
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
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
  animation: ${fadeUp} 0.6s ease-out;
  flex: 1;
`;

const Title = styled.h1`
  color: var(--text-color);
  font-size: 36px;
  margin-bottom: 30px;
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

const Card = styled.div`
  background: rgba(45, 45, 45, 0.7);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-2);
  padding: 30px;
  margin: 30px 0;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(142, 36, 170, 0.2);
  animation: ${fadeUp} 0.6s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-family: 'Montserrat', sans-serif;
  color: var(--text-color);
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  background-color: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(142, 36, 170, 0.3);
  border-radius: var(--border-radius);
  font-size: 16px;
  color: var(--text-color);
  font-family: 'Montserrat', sans-serif;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(142, 36, 170, 0.25);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px;
  background-color: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(142, 36, 170, 0.3);
  border-radius: var(--border-radius);
  font-size: 16px;
  color: var(--text-color);
  font-family: 'Montserrat', sans-serif;
  max-height: 200px;
  overflow-y: auto;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(142, 36, 170, 0.25);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 14px;
  background-color: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(142, 36, 170, 0.3);
  border-radius: var(--border-radius);
  font-size: 16px;
  color: var(--text-color);
  font-family: 'Montserrat', sans-serif;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(142, 36, 170, 0.25);
  }
`;

const HelpText = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
`;

const CancelButton = styled.button`
  background-color: transparent;
  border: 1px solid rgba(176, 176, 176, 0.3);
  color: var(--text-secondary);
  padding: 12px 20px;
  border-radius: var(--border-radius);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  min-width: 150px;
  
  &:hover {
    background-color: rgba(176, 176, 176, 0.1);
    border-color: rgba(176, 176, 176, 0.5);
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(142, 36, 170, 0.3);
  font-family: 'Montserrat', sans-serif;
  min-width: 150px;
  
  &:hover {
    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(142, 36, 170, 0.5);
  }
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

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 20px;
  background-color: rgba(0, 200, 83, 0.1);
  border-left: 3px solid #00c853;
  color: #00c853;
  border-radius: 4px;
  font-size: 16px;
  
  svg {
    margin-right: 12px;
    flex-shrink: 0;
  }
`;

function AddPackagePage({ onLogout }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    trackingNumber: '',
    description: '',
    carrier: '',
    origin: '',
    destination: 'Россия',
    status: 'registered'
  });
  
  const PACKAGE_STATUSES = {
    created: 'Создана',
    in_transit: 'В пути',
    ready: 'Готова к получению',
    cancelled: 'Отменена'
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Пользователь не аутентифицирован');
      }
      
      const packageData = {
        trackingNumber: formData.trackingNumber,
        description: formData.description || '',
        carrier: formData.carrier || '',
        status: formData.status,
        statusText: PACKAGE_STATUSES[formData.status],
        origin: formData.origin || 'Неизвестно',
        destination: formData.destination || 'Россия',
        lastUpdate: new Date().toLocaleDateString('ru-RU'),
        telegramNotifications: {
          enabled: false,
          notifyOnStatuses: []
        }
      };
      
      await addPackage(user.uid, packageData);
      
      // Сбрасываем форму
      setFormData({
        trackingNumber: '',
        description: '',
        carrier: '',
        origin: '',
        destination: 'Россия',
        status: 'registered'
      });
      
      // Показываем сообщение об успехе
      setShowSuccess(true);
      
      // Через 3 секунды перенаправляем на страницу с посылками
      setTimeout(() => {
        navigate('/packages');
      }, 3000);
    } catch (error) {
      console.error('Ошибка при добавлении посылки:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/packages');
  };
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <PageContainer>
      <Header isAuthenticated={true} onLogout={handleLogout} />
      
      <Content>
        <Title>Добавление посылки</Title>
        
        <Card>
          {isLoading ? (
            <LoadingAnimation text="Сохранение посылки" />
          ) : showSuccess ? (
            <SuccessMessage>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Посылка успешно добавлена! Вы будете перенаправлены на страницу посылок...
            </SuccessMessage>
          ) : (
            <Form onSubmit={handleSubmit} className="page-transition">
              <FormGroup>
                <Label htmlFor="trackingNumber">Трек-номер посылки*</Label>
                <Input 
                  type="text" 
                  id="trackingNumber" 
                  name="trackingNumber"
                  placeholder="Например: RU123456789CN"
                  value={formData.trackingNumber}
                  onChange={handleChange}
                  required
                />
                <HelpText>Введите трек-номер без пробелов и специальных символов</HelpText>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="status">Статус посылки</Label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {Object.entries(PACKAGE_STATUSES).map(([code, text]) => (
                    <option key={code} value={code}>{text}</option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="description">Описание посылки</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Например: Смартфон Samsung Galaxy S21"
                  value={formData.description}
                  onChange={handleChange}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="carrier">Служба доставки</Label>
                <Input 
                  type="text" 
                  id="carrier" 
                  name="carrier"
                  placeholder="Например: CDEK, Почта России, DHL"
                  value={formData.carrier}
                  onChange={handleChange}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="origin">Страна отправления</Label>
                <Input 
                  type="text" 
                  id="origin" 
                  name="origin"
                  placeholder="Например: Китай, США, Германия"
                  value={formData.origin}
                  onChange={handleChange}
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="destination">Страна назначения</Label>
                <Input 
                  type="text" 
                  id="destination" 
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                />
              </FormGroup>
              
              <FormActions>
                <CancelButton type="button" onClick={handleCancel}>
                  Отмена
                </CancelButton>
                <SaveButton type="submit" disabled={isLoading || !formData.trackingNumber}>
                  <ButtonContent>
                    Добавить посылку
                  </ButtonContent>
                </SaveButton>
              </FormActions>
            </Form>
          )}
        </Card>
      </Content>
      
      <Footer />
    </PageContainer>
  );
}

export default AddPackagePage; 