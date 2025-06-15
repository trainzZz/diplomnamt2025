import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import PackageItem from '../components/PackageItem';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingAnimation from '../components/LoadingAnimation';
import { logoutUser, auth, getUserData, updateUserData, changeUserPassword, getUserPackages, addPackage, connectTelegramNotifications, disconnectTelegramNotifications } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import TelegramConnect from '../components/TelegramConnect';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import InputMask from 'react-input-mask';
import { load } from '@2gis/mapgl';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ProfileContainer = styled.div`
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
  max-width: 1200px;
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

const ProfileCard = styled.div`
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

const ProfileInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
`;

const InfoGroup = styled.div`
  margin-bottom: 20px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
  
  svg {
    margin-right: 8px;
    color: var(--primary-light);
  }
`;

const InfoValue = styled.div`
  font-size: 18px;
  color: var(--text-color);
  font-weight: 500;
  padding: 12px 16px;
  background-color: rgba(20, 20, 20, 0.5);
  border-radius: var(--border-radius);
  border: 1px solid rgba(142, 36, 170, 0.2);
  font-family: 'Montserrat', sans-serif;
`;

const EditButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: var(--primary-light);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  
  svg {
    margin-right: 6px;
  }
  
  &:hover {
    background: rgba(142, 36, 170, 0.1);
    transform: translateY(-2px);
  }
`;

const TelegramButton = styled.button`
  background: linear-gradient(135deg, #0088cc 0%, #0063a5 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  box-shadow: var(--elevation-2);
  margin-top: 20px;
  width: 100%;
  min-width: 250px;
  max-width: 350px;
  font-family: 'Montserrat', sans-serif;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--elevation-3);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
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

// Добавляем модальное окно
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
`;

const ModalContent = styled.div`
  background: rgba(35, 35, 35, 0.95);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-3);
  max-width: 800px;
  width: 95%;
  max-height: 600px;
  min-height: 400px;
  overflow-y: auto;
  padding: 36px 36px 30px 36px;
  position: relative;
  animation: ${fadeUp} 0.6s ease-out;
  border: 1px solid rgba(142, 36, 170, 0.3);
  
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
    font-size: 24px;
    color: var(--text-color);
    font-family: 'Montserrat', sans-serif;
    margin: 0;
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

const PasswordButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(142, 36, 170, 0.3);
  margin: 20px auto;
  width: 100%;
  min-width: 250px;
  max-width: 350px;
  font-family: 'Montserrat', sans-serif;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(142, 36, 170, 0.5);
    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 20px;
  background-color: rgba(255, 50, 50, 0.1);
  border-left: 3px solid #ff5555;
  color: #ff5555;
  border-radius: 4px;
  font-size: 14px;
  
  svg {
    margin-right: 8px;
    flex-shrink: 0;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 20px;
  background-color: rgba(0, 200, 83, 0.1);
  border-left: 3px solid #00c853;
  color: #00c853;
  border-radius: 4px;
  font-size: 14px;
  
  svg {
    margin-right: 8px;
    flex-shrink: 0;
  }
`;

// Добавьте эти стили для индикатора загрузки в компонент ProfilePage
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

const PasswordInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  
  &:hover {
    color: var(--primary-light);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

// Стилизованная кнопка для админ-панели
const AdminPanelButton = styled(Link)`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(142, 36, 170, 0.3);
  margin: 20px auto;
  width: 100%;
  max-width: 350px;
  font-family: 'Montserrat', sans-serif;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(142, 36, 170, 0.5);
    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

function ProfilePage({ onLogout, isAdmin }) {
  const [packages, setPackages] = useState([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPackage, setNewPackage] = useState({ trackingNumber: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [filteredPackages, setFilteredPackages] = useState(packages);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    phone: '',
    address: '',
    email: '',
    telegramConnected: false,
    telegramUserId: ''
  });
  
  // Новые состояния
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isProfileSetupRequired, setIsProfileSetupRequired] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [editedData, setEditedData] = useState({...userData});
  const [showMap, setShowMap] = useState(false);
  const [mapAddress, setMapAddress] = useState('');
  const [mapPosition, setMapPosition] = useState([56.326944, 44.005833]); // Нижний Новгород по умолчанию
  const [mapLoading, setMapLoading] = useState(false);
  const DGIS_API_KEY = process.env.REACT_APP_2GIS_API_KEY;
  const mapContainerRef = useRef(null);

  // Массив с координатами точек выдачи
  const pickupPoints = [
    {
      coordinates: [44.005833, 56.326944], // долгота, широта
      address: "г. Нижний Новгород, ул. Большая Покровская, 1",
      name: ""
    },
    {
      coordinates: [43.946116, 56.340561],
      address: "г. Нижний Новгород, ул. Карла Маркса, 45 ",
      name: ""
    },
    {
      coordinates: [43.826883, 56.236503],
      address: "г. Нижний Новгород, ул. Мончегорская, 34 ",
      name: ""
    },
    {
      coordinates: [43.854533, 56.259955],
      address: "г. Нижний Новгород, ул. Плотникова, 4",
      name: ""
    },
    {
      coordinates: [43.927833, 56.283665],
      address: "г. Нижний Новгород, ул. Проспект Ленина, 38 ",
      name: ""
    }
  ];

  useEffect(() => {
    // Загрузка данных пользователя при монтировании компонента
    const loadUserData = async () => {
      setIsLoadingProfile(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const data = await getUserData(user.uid);
          if (data) {
            setUserData({
              ...data,
              email: user.email,
              telegramConnected: data.telegramConnected || false,
              telegramUserId: data.telegramUserId || ''
            });
            setEditedData({
              ...data,
              email: user.email,
              telegramConnected: data.telegramConnected || false,
              telegramUserId: data.telegramUserId || ''
            });
            
            // Проверяем, заполнены ли основные поля профиля
            const isProfileEmpty = !data.fullName || !data.phone || !data.address;
            setIsProfileSetupRequired(isProfileEmpty);
            
            // Если профиль пустой, автоматически включаем режим редактирования
            if (isProfileEmpty) {
              setIsEditing(true);
            }
          }
          
          // Загрузка посылок пользователя
          const userPackages = await getUserPackages(user.uid);
          if (userPackages) {
            setPackages(userPackages);
            setFilteredPackages(userPackages);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    loadUserData();
  }, []);

  useEffect(() => {
    // Фильтрация посылок при изменении searchTerm
    if (searchTerm.trim() === '') {
      setFilteredPackages(packages);
    } else {
      const filtered = packages.filter(pkg => 
        pkg.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPackages(filtered);
    }
  }, [searchTerm, packages]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({...userData});
  };
  
  const handleCancel = () => {
    // Если настройка профиля обязательна, не позволяем отменить редактирование
    if (!isProfileSetupRequired) {
      setIsEditing(false);
    }
  };
  
  const handleSave = async () => {
    // Валидация данных
    if (!editedData.fullName || !editedData.phone || !editedData.address) {
      alert('Пожалуйста, заполните все поля профиля');
      return;
    }
    
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateUserData(user.uid, {
          fullName: editedData.fullName,
          phone: editedData.phone,
          address: editedData.address,
          telegramConnected: editedData.telegramConnected,
          telegramUserId: editedData.telegramUserId
        });
        setUserData({...editedData});
        setIsEditing(false);
        setIsProfileSetupRequired(false);
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
      alert('Произошла ошибка при сохранении данных. Пожалуйста, попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setEditedData({
      ...editedData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
    setPasswordSuccess('');
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Проверка паролей
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Новый пароль и подтверждение не совпадают');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Новый пароль должен содержать минимум 6 символов');
      return;
    }
    
    setPasswordLoading(true);
    try {
      await changeUserPassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordSuccess('Пароль успешно изменен');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      // Закрыть модальное окно через 2 секунды после успешной смены пароля
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Ошибка при смене пароля:', error);
      let errorMessage;
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Текущий пароль указан неверно';
          break;
        case 'auth/weak-password':
          errorMessage = 'Пароль слишком простой. Используйте минимум 6 символов';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Сессия устарела. Пожалуйста, выйдите и войдите снова';
          break;
        default:
          errorMessage = error.message || 'Произошла ошибка при смене пароля';
      }
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleTelegram = () => {
    // Открываем Telegram-бота в новой вкладке
    
    // Здесь должна быть логика получения telegramUserId от бота
    // После получения ID можно будет сохранить данные в Firebase
    
    // Пример диалогового окна для ввода ID (в реальном приложении должен быть более надежный метод)
    setTimeout(() => {
      const telegramId = prompt('Введите ID, который вам дал бот:');
      if (telegramId) {
        const user = auth.currentUser;
        if (user) {
          connectTelegramNotifications(user.uid, telegramId)
            .then(() => {
              // Обновляем локальное состояние
              setUserData({
                ...userData,
                telegramConnected: true,
                telegramUserId: telegramId
              });
              alert('Telegram успешно подключен!');
            })
            .catch(error => {
              console.error('Ошибка при подключении Telegram:', error);
              alert('Не удалось подключить Telegram. Пожалуйста, попробуйте снова.');
            });
        }
      }
    }, 5000); // Даем пользователю время перейти в бота
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

  // Функция для добавления новой посылки
  const handleAddPackage = async () => {
    if (!newPackage.trackingNumber) {
      alert('Пожалуйста, введите номер отслеживания');
      return;
    }
    
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const packageData = {
          trackingNumber: newPackage.trackingNumber,
          description: newPackage.description,
          status: 'Зарегистрирована',
          lastUpdate: new Date().toLocaleDateString('ru-RU')
        };
        
        const packageId = await addPackage(user.uid, packageData);
        const newPackageWithId = { id: packageId, ...packageData };
        
        setPackages([...packages, newPackageWithId]);
        setFilteredPackages([...filteredPackages, newPackageWithId]);
        setNewPackage({ trackingNumber: '', description: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Ошибка при добавлении посылки:', error);
      alert('Произошла ошибка при добавлении посылки. Пожалуйста, попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  // Колбэк для обновления статуса Telegram после успешной привязки
  const handleTelegramSuccess = async () => {
    const user = auth.currentUser;
    if (user) {
      const data = await getUserData(user.uid);
      setUserData({
        ...data,
        email: user.email,
        telegramConnected: true,
        telegramUserId: data.telegramUserId || ''
      });
    }
  };

  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;
    let mapInstance = null;
    let markers = [];
    let destroyed = false;

    // Функция для инициализации карты и маркеров
    const initMap = (centerCoords) => {
      load().then((mapglAPI) => {
        if (destroyed) return;
        mapInstance = new mapglAPI.Map(mapContainerRef.current, {
          center: centerCoords,
          zoom: 12,
          key: DGIS_API_KEY,
        });

        // Добавляем все маркеры точек выдачи
        pickupPoints.forEach((point, index) => {
          const marker = new mapglAPI.Marker(mapInstance, {
            coordinates: point.coordinates,
            label: {
              text: point.name,
              offset: [0, -30]
            }
          });

          // Добавляем обработчик клика по маркеру
          marker.on('click', () => {
            setMapPosition(point.coordinates);
            setMapAddress(point.address);
          });

          markers.push(marker);
        });

        // Отключаем возможность клика по карте
        mapInstance.on('click', (e) => {
          // Проверяем, был ли клик рядом с какой-либо точкой выдачи
          const clickedCoords = e.lngLat;
          const nearestPoint = pickupPoints.find(point => {
            const distance = Math.sqrt(
              Math.pow(point.coordinates[0] - clickedCoords[0], 2) +
              Math.pow(point.coordinates[1] - clickedCoords[1], 2)
            );
            return distance < 0.001; // Примерно 100 метров
          });

          if (nearestPoint) {
            setMapPosition(nearestPoint.coordinates);
            setMapAddress(nearestPoint.address);
          }
        });
      });
    };

    // Попытка получить геолокацию пользователя
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude];
          initMap(coords);
        },
        (error) => {
          // Если пользователь не разрешил или ошибка — центр по умолчанию
          initMap(mapPosition);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      // Если геолокация не поддерживается
      initMap(mapPosition);
    }

    return () => {
      destroyed = true;
      markers.forEach(marker => marker.destroy());
      mapInstance && mapInstance.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap]);

  const handleSelectAddress = () => {
    setEditedData({ ...editedData, address: mapAddress });
    setShowMap(false);
  };

  if (isLoadingProfile) {
    return (
      <ProfileContainer>
        <Header isAuthenticated={true} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LoadingAnimation text="Загрузка профиля" fullHeight={true} />
        </div>
        <Footer />
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Header isAuthenticated={true} onLogout={handleLogout} isAdmin={isAdmin} />
      
      <Content>
        <Title>Личный кабинет</Title>
        
        {isProfileSetupRequired && (
          <div style={{ 
            backgroundColor: 'rgba(255, 193, 7, 0.2)', 
            padding: '15px', 
            borderRadius: 'var(--border-radius)', 
            marginBottom: '20px',
            borderLeft: '4px solid #ffc107'
          }}>
            <p style={{ margin: 0, color: '#ffc107', fontWeight: 'bold' }}>
              Пожалуйста, заполните данные профиля для полноценного использования приложения
            </p>
          </div>
        )}
        
        <ProfileCard>
          {!isEditing ? (
            <>
              <EditButton onClick={handleEdit}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Редактировать
              </EditButton>
              
              <ProfileInfo>
                <div>
                  <InfoGroup>
                    <InfoLabel>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      ФИО
                    </InfoLabel>
                    <InfoValue>{userData.fullName || 'Не указано'}</InfoValue>
                  </InfoGroup>
                  
                  <InfoGroup>
                    <InfoLabel>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.27103 2.12 4.18C2.09501 3.90347 2.12788 3.62476 2.21649 3.36162C2.30511 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.11 2H7.11C7.59524 1.99522 8.06568 2.16708 8.43369 2.48353C8.8017 2.79999 9.04201 3.23945 9.11 3.72C9.23662 4.68007 9.47145 5.62273 9.81 6.53C9.94455 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51355 12.4135 11.5865 14.4865 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9752 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Телефон
                    </InfoLabel>
                    <InfoValue>{userData.phone || 'Не указан'}</InfoValue>
                  </InfoGroup>
                </div>
                
                <div>
                  <InfoGroup>
                    <InfoLabel>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Email
                    </InfoLabel>
                    <InfoValue>{userData.email}</InfoValue>
                  </InfoGroup>
                  
                  <InfoGroup>
                    <InfoLabel>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Адрес
                    </InfoLabel>
                    <InfoValue>{userData.address || 'Не указан'}</InfoValue>
                  </InfoGroup>
                  
                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                    <PasswordButton onClick={() => setShowPasswordModal(true)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="12" cy="16" r="1" fill="currentColor"/>
                      </svg>
                      Сменить пароль
                    </PasswordButton>
                  </div>
                </div>
              </ProfileInfo>
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {userData.telegramConnected ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        padding: '14px 24px',
                        background: 'rgba(20, 20, 20, 0.5)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid rgba(0, 230, 118, 0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(0, 230, 118, 0.2)',
                      }}
                      className="telegram-status"
                      onClick={() => {
                        const user = auth.currentUser;
                        if (user && window.confirm('Вы уверены, что хотите отключить Telegram-уведомления?')) {
                          disconnectTelegramNotifications(user.uid)
                            .then(() => {
                              setUserData({
                                ...userData,
                                telegramConnected: false,
                                telegramUserId: ''
                              });
                              alert('Telegram-уведомления отключены');
                            })
                            .catch(error => {
                              console.error('Ошибка при отключении Telegram:', error);
                              alert('Не удалось отключить Telegram. Пожалуйста, попробуйте снова.');
                            });
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(229, 57, 53, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(229, 57, 53, 0.5)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(229, 57, 53, 0.2)';
                        const textEl = e.currentTarget.querySelector('.telegram-text');
                        const iconEl = e.currentTarget.querySelector('svg path');
                        if (textEl) textEl.textContent = 'Отключить уведомления';
                        if (iconEl) {
                          iconEl.setAttribute('stroke', '#e53935');
                          const iconPathEl = e.currentTarget.querySelectorAll('svg path');
                          iconPathEl.forEach(path => path.setAttribute('stroke', '#e53935'));
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(20, 20, 20, 0.5)';
                        e.currentTarget.style.borderColor = 'rgba(0, 230, 118, 0.3)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 230, 118, 0.2)';
                        const textEl = e.currentTarget.querySelector('.telegram-text');
                        const iconEl = e.currentTarget.querySelector('svg path');
                        if (textEl) textEl.textContent = 'Telegram подключен';
                        if (iconEl) {
                          iconEl.setAttribute('stroke', '#00e676');
                          const iconPathEl = e.currentTarget.querySelectorAll('svg path');
                          iconPathEl.forEach(path => path.setAttribute('stroke', '#00e676'));
                        }
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="telegram-text" style={{ color: 'var(--text-color)' }}>Telegram подключен</span>
                    </div>
                  </div>
                ) : (
                  <TelegramConnect userId={auth.currentUser?.uid} onSuccess={handleTelegramSuccess} />
                )}
              </div>
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <FormGroup>
                <Label htmlFor="fullName">ФИО</Label>
                <Input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  value={editedData.fullName} 
                  onChange={handleChange} 
                  placeholder="Введите ФИО"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="phone">Телефон</Label>
                <InputMask
                  mask="+7(999)999-99-99"
                  value={editedData.phone}
                  onChange={handleChange}
                  maskChar={null}
                >
                  {(inputProps) => (
                    <Input
                      {...inputProps}
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+7(000)000-00-00"
                      required
                    />
                  )}
                </InputMask>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={editedData.email} 
                  readOnly 
                  disabled
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="address">Адрес</Label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Input
                    type="text"
                    id="address"
                    name="address"
                    value={editedData.address}
                    onChange={handleChange}
                    placeholder="Введите ваш адрес или выберите на карте"
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--border-radius)',
                      padding: '0 18px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 15,
                      boxShadow: '0 4px 15px rgba(142, 36, 170, 0.3)'
                    }}
                    onClick={() => setShowMap(true)}
                  >
                    Добавить
                  </button>
                </div>
              </FormGroup>
              
              <FormActions>
                {!isProfileSetupRequired && (
                  <CancelButton type="button" onClick={handleCancel}>
                    Отмена
                  </CancelButton>
                )}
                <SaveButton type="submit" disabled={isLoading}>
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </SaveButton>
              </FormActions>
            </form>
          )}
        </ProfileCard>

        {isAdmin && (
          <AdminPanelButton to="/admin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Перейти в админ-панель
          </AdminPanelButton>
        )}
      </Content>

      {/* Модальное окно смены пароля */}
      {showPasswordModal && (
        <Modal show={showPasswordModal}>
          <ModalContent>
            <ModalHeader>
              <h2>Смена пароля</h2>
              <CloseButton onClick={() => setShowPasswordModal(false)}>×</CloseButton>
            </ModalHeader>
            
            {passwordError && (
              <ErrorMessage>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                </svg>
                {passwordError}
              </ErrorMessage>
            )}
            
            {passwordSuccess && (
              <SuccessMessage>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {passwordSuccess}
              </SuccessMessage>
            )}
            
            <Form onSubmit={handleChangePassword}>
              <FormGroup>
                <Label htmlFor="currentPassword">Текущий пароль</Label>
                <PasswordInputContainer>
                  <Input 
                    type={showPasswords.current ? "text" : "password"} 
                    id="currentPassword" 
                    name="currentPassword" 
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Введите текущий пароль"
                    required 
                  />
                  <PasswordToggleButton 
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.9 4.24C10.5883 4.07888 11.2931 3.99833 12 4C19 4 22 12 22 12C21.5567 12.8742 20.9863 13.7026 20.3 14.47" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.12 16.83C14.1356 17.411 13.0193 17.7347 11.85 17.77C5.00001 17.77 2.00001 12 2.00001 12C2.60178 10.9291 3.35975 9.93768 4.25001 9.05001L15.12 16.83Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12C22 12 19 20 12 20C5 20 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </PasswordToggleButton>
                </PasswordInputContainer>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="newPassword">Новый пароль</Label>
                <PasswordInputContainer>
                  <Input 
                    type={showPasswords.new ? "text" : "password"} 
                    id="newPassword" 
                    name="newPassword" 
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Введите новый пароль"
                    required 
                  />
                  <PasswordToggleButton 
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.9 4.24C10.5883 4.07888 11.2931 3.99833 12 4C19 4 22 12 22 12C21.5567 12.8742 20.9863 13.7026 20.3 14.47" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.12 16.83C14.1356 17.411 13.0193 17.7347 11.85 17.77C5.00001 17.77 2.00001 12 2.00001 12C2.60178 10.9291 3.35975 9.93768 4.25001 9.05001L15.12 16.83Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12C22 12 19 20 12 20C5 20 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </PasswordToggleButton>
                </PasswordInputContainer>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <PasswordInputContainer>
                  <Input 
                    type={showPasswords.confirm ? "text" : "password"} 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Подтвердите новый пароль"
                    required 
                  />
                  <PasswordToggleButton 
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.9 4.24C10.5883 4.07888 11.2931 3.99833 12 4C19 4 22 12 22 12C21.5567 12.8742 20.9863 13.7026 20.3 14.47" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.12 16.83C14.1356 17.411 13.0193 17.7347 11.85 17.77C5.00001 17.77 2.00001 12 2.00001 12C2.60178 10.9291 3.35975 9.93768 4.25001 9.05001L15.12 16.83Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12C22 12 19 20 12 20C5 20 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </PasswordToggleButton>
                </PasswordInputContainer>
              </FormGroup>
              
              <FormActions>
                <CancelButton type="button" onClick={() => setShowPasswordModal(false)}>
                  Отмена
                </CancelButton>
                <SaveButton type="submit" disabled={passwordLoading}>
                  {passwordLoading ? 'Сохранение...' : 'Сменить пароль'}
                </SaveButton>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
      
      {/* Модальное окно выбора адреса через 2ГИС */}
      {showMap && (
        <Modal show={showMap}>
          <ModalContent style={{ maxWidth: 900, minHeight: 600 }}>
            <ModalHeader>
              <h2>Выберите пункт выдачи на карте</h2>
              <CloseButton onClick={() => setShowMap(false)}>×</CloseButton>
            </ModalHeader>
            <div style={{ marginBottom: 18, color: 'var(--text-secondary)' }}>
              На карте отмечены доступные пункты выдачи. Кликните на маркер, чтобы выбрать пункт выдачи.
            </div>
            <div style={{ width: '100%', height: 400, marginBottom: 18 }}>
              <div ref={mapContainerRef} style={{ width: '100%', height: 400, borderRadius: 12, overflow: 'hidden' }} />
            </div>
            <div style={{ marginBottom: 18, fontSize: 18 }}>
              <b>Выбранный пункт выдачи:</b> {mapLoading ? 'Загрузка...' : mapAddress || 'Не выбран'}
            </div>
            <FormActions style={{ justifyContent: 'center' }}>
              <CancelButton type="button" style={{ fontSize: 18, minWidth: 180 }} onClick={() => setShowMap(false)}>
                Отмена
              </CancelButton>
              <SaveButton type="button" style={{ fontSize: 18, minWidth: 220 }} onClick={handleSelectAddress} disabled={!mapAddress || mapLoading}>
                Подтвердить выбор
              </SaveButton>
            </FormActions>
          </ModalContent>
        </Modal>
      )}
      
      <Footer />
    </ProfileContainer>
  );
}

export default ProfilePage; 