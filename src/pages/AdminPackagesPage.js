import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllPackages, deletePackage, updatePackage, addPackage, getAllUsers, allStatuses } from '../firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styled, { createGlobalStyle } from 'styled-components';
import { FaSearch, FaChevronDown, FaRegCopy, FaCheck } from 'react-icons/fa';

// Стилизованный компонент для отображения статуса
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  background-color: ${props => {
    switch (props.$status.toLowerCase()) {
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
      case 'delivered':
        return 'rgba(156, 39, 176, 0.2)';
      case 'возвращено':
      case 'returned':
        return 'rgba(255, 87, 34, 0.2)';
      default:
        return 'rgba(150, 150, 150, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status.toLowerCase()) {
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
      case 'delivered':
        return '#9C27B0';
      case 'возвращено':
      case 'returned':
        return '#ff5722';
      default:
        return '#969696';
    }
  }};
`;

// Модальное окно
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
  opacity: ${props => props.$show ? 1 : 0};
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  padding: 15px;
  overflow: hidden;
`;

const ModalContent = styled.div`
  background: rgba(35, 35, 35, 0.95);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-3);
  max-width: 800px;
  width: 95%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 25px;
  position: relative;
  
  animation: fadeIn 0.4s ease;
  
  @media (max-width: 768px) {
    padding: 20px;
    max-height: 90vh;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
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
  
  .admin-form {
    padding: 0;
    margin-bottom: 0;
    box-shadow: none;
    border: none;
    background: transparent;
  }
  
  .admin-form-group {
    margin-bottom: 22px;
  }
  
  .admin-form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 15px;
  }
  
  .admin-form-group input,
  .admin-form-group select,
  .admin-form-group textarea {
    width: 100%;
    padding: 12px;
    font-size: 15px;
    border-radius: var(--border-radius);
    background-color: rgba(20, 20, 20, 0.5);
    border: 1px solid rgba(142, 36, 170, 0.3);
    color: var(--text-color);
    transition: all 0.3s ease;
  }
  
  .admin-form-group textarea {
    min-height: 90px;
    resize: vertical;
  }
  
  .admin-form-group input:focus,
  .admin-form-group select:focus,
  .admin-form-group textarea:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(142, 36, 170, 0.2);
  }
  
  .admin-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 25px;
  }
  
  .admin-form-actions button {
    padding: 10px 20px;
    font-size: 15px;
  }
  
  @media (max-height: 800px) {
    .admin-form-group {
      margin-bottom: 15px;
    }
    
    .admin-form-group input,
    .admin-form-group select {
      padding: 10px;
    }
    
    .admin-form-group textarea {
      min-height: 70px;
    }
    
    .admin-form-actions {
      margin-top: 15px;
    }
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
  
  @media (max-height: 800px) {
    margin-bottom: 15px;
    
    h2 {
      font-size: 22px;
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

// Стилизованный компонент для админ-панели
const AdminPanelContainer = styled.div`
  max-width: 1600px;
  width: 95%;
  margin: 30px auto;
  padding: 35px;
  background: rgba(35, 35, 35, 0.7);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-2);
  position: relative;
  overflow: visible;
  border: 1px solid rgba(142, 36, 170, 0.2);
  min-height: calc(100vh - 180px);
  @media (max-width: 700px) {
    width: 100vw;
    max-width: 100vw;
    padding: 8px 2vw;
    margin: 0 auto;
    border-radius: 10px;
    overflow-x: visible;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  }
  
  .admin-header {
    margin-bottom: 35px;
  }
  
  .admin-title {
    font-size: 32px;
    margin-bottom: 15px;
  }
  
  .admin-nav {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
  }
  
  .admin-table {
    width: 100%;
    margin-top: 30px;
  }
  
  .admin-table th, .admin-table td {
    @media (max-width: 600px) {
      padding: 8px 6px;
      font-size: 13px;
      min-width: 90px;
      word-break: break-word;
    }
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  background: rgba(20, 20, 20, 0.7);
  border: 1px solid #444;
  border-radius: 10px;
  padding: 8px 14px;
  margin-bottom: 24px;
  width: 320px;
  max-width: 100%;
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-color);
  font-size: 15px;
  width: 100%;
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }
`;

// Стилизованная кнопка для фильтров
const ToggleFiltersButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  margin-right: 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(142,36,170,0.12);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s;
  margin-bottom: 8px;
  min-width: 180px;
  user-select: none;
  &:hover {
    background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
    color: #fff;
    box-shadow: 0 6px 24px rgba(142,36,170,0.18);
    transform: translateY(-2px) scale(1.03);
  }
  svg {
    transition: transform 0.3s;
    font-size: 20px;
    margin-left: 4px;
    transform: rotate(${props => props.open ? '180deg' : '0deg'});
  }
`;

// Добавить глобальные стили для datepicker
const DatepickerStyles = createGlobalStyle`
  .react-datepicker__input-container input {
    background: rgba(20,20,20,0.7);
    color: var(--text-color);
    border: 1px solid #444;
    border-radius: 10px;
    padding: 12px;
    font-size: 15px;
    font-family: 'Montserrat', sans-serif;
    outline: none;
    width: 100%;
  }
  .react-datepicker {
    background: #23232e;
    color: #fff;
    border-radius: 14px;
    border: 1px solid #444;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    font-family: 'Montserrat', sans-serif;
    overflow: hidden;
  }
  .react-datepicker__header {
    background: #23232e;
    border-bottom: 1px solid #444;
    border-radius: 14px 14px 0 0;
  }
  .react-datepicker__day, .react-datepicker__day-name {
    color: #fff;
    background: transparent;
    border-radius: 8px;
    transition: background 0.15s;
  }
  .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
    background: var(--primary-color);
    color: #fff;
  }
  .react-datepicker__day:hover {
    background: rgba(142,36,170,0.18);
    color: #fff;
  }
  .react-datepicker__current-month, .react-datepicker__month-read-view--selected-month, .react-datepicker__year-read-view--selected-year {
    color: #fff;
  }
  .react-datepicker__navigation {
    top: 16px;
    line-height: 1.2;
  }
  .react-datepicker__navigation-icon::before {
    border-color: var(--primary-color);
  }
  .react-datepicker__today-button, .react-datepicker__close-icon {
    background: var(--primary-color);
    color: #fff;
    border-radius: 8px;
    font-weight: 600;
    margin: 8px;
    padding: 6px 12px;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
  }
  .react-datepicker__today-button:hover, .react-datepicker__close-icon:hover {
    background: #a020f0;
  }
`;

// Добавить глобальные стили для кастомного select
const CustomSelectStyles = createGlobalStyle`
  select, select:focus {
    background: rgba(20,20,20,0.7) !important;
    color: var(--text-color) !important;
    border: 1px solid #444 !important;
    border-radius: 10px !important;
    padding: 12px !important;
    font-size: 15px !important;
    font-family: 'Montserrat', sans-serif !important;
    outline: none !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10) !important;
    transition: box-shadow 0.2s;
  }
  select option {
    background: #23232e !important;
    color: #fff !important;
  }
  select option:checked, select option:hover {
    background: var(--primary-color) !important;
    color: #fff !important;
  }
`;

// Объект для перевода статусов
const statusTranslations = {
  'created': 'Создана',
  'in_transit': 'В пути',
  'ready': 'Готова к получению',
  'delivered': 'Получена',
  'cancelled': 'Отменена'
};

// Функция для перевода статуса
const getTranslatedStatus = (status) => {
  return statusTranslations[status] || status;
};

// Функция для отправки уведомления через API
const sendStatusNotification = async (packageId, newStatus) => {
  try {
    const response = await fetch('http://localhost:3001/api/notify-status-change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packageId, newStatus }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Ошибка при отправке уведомления');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при отправке уведомления:', error);
    throw error;
  }
};

function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Новые состояния для фильтров
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userInputRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedUserId, setCopiedUserId] = useState(null);
  const [trackError, setTrackError] = useState('');
  // Состояния для сортировки
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const [formData, setFormData] = useState({
    trackingNumber: '',
    description: '',
    weight: '',
    dimensions: '',
    status: 'pending',
    userId: ''
  });

  // Статусы для фильтрации
  const statusFilters = [
    { value: 'all', label: 'Все статусы' },
    { value: 'created', label: 'Создана' },
    { value: 'in_transit', label: 'В пути' },
    { value: 'ready', label: 'Готова к получению' },
    { value: 'delivered', label: 'Получена' },
    { value: 'cancelled', label: 'Отменена' }
  ];

  // Статусы для форм редактирования/добавления
  const statusOptions = [
    { value: 'created', label: 'Создана' },
    { value: 'in_transit', label: 'В пути' },
    { value: 'ready', label: 'Готова к получению' },
    { value: 'delivered', label: 'Получена' },
    { value: 'cancelled', label: 'Отменена' }
  ];

  // Для автокомплита пользователя в формах
  const [userInputAdd, setUserInputAdd] = useState('');
  const [userDropdownOpenAdd, setUserDropdownOpenAdd] = useState(false);
  const [userInputEdit, setUserInputEdit] = useState('');
  const [userDropdownOpenEdit, setUserDropdownOpenEdit] = useState(false);
  const userInputAddRef = useRef(null);
  const userInputEditRef = useRef(null);

  // Загрузка данных посылок и пользователей
  const fetchPackages = async () => {
    try {
      const packagesData = await getAllPackages();
      setPackages(packagesData);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке посылок:', error);
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
    }
  };
  useEffect(() => {
    fetchPackages();
    fetchUsers();
  }, []);

  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Обработчик добавления посылки
  const handleAddPackage = async (e) => {
    e.preventDefault();
    setTrackError('');
    // Проверка уникальности трек-номера
    if (packages.some(pkg => pkg.trackingNumber === formData.trackingNumber)) {
      setTrackError('Посылка с таким трек-номером уже существует!');
      return;
    }
    try {
      await addPackage(formData.userId, {
        trackingNumber: formData.trackingNumber,
        description: formData.description,
        weight: formData.weight,
        dimensions: formData.dimensions,
        status: formData.status,
        archived: formData.status === 'delivered',
        permanentlyArchived: formData.status === 'delivered'
      });
      setFormData({
        trackingNumber: '',
        description: '',
        weight: '',
        dimensions: '',
        status: 'pending',
        userId: ''
      });
      setShowAddForm(false);
      await fetchPackages();
    } catch (error) {
      console.error('Ошибка при создании посылки:', error);
      alert(`Ошибка при создании посылки: ${error.message}`);
    }
  };

  // Обработчик редактирования посылки
  const handleEditPackage = (packageItem) => {
    setCurrentPackage(packageItem);
    setFormData({
      trackingNumber: packageItem.trackingNumber || '',
      description: packageItem.description || '',
      weight: packageItem.weight || '',
      dimensions: packageItem.dimensions || '',
      status: packageItem.status || 'pending',
      userId: packageItem.userId || ''
    });
    setShowEditForm(true);
  };

  // Обработчик сохранения изменений посылки
  const handleUpdatePackage = async (e) => {
    e.preventDefault();
    setTrackError('');
    if (!currentPackage) return;
    
    // Проверка уникальности трек-номера (разрешить текущей посылке)
    if (packages.some(pkg => pkg.trackingNumber === formData.trackingNumber && pkg.id !== currentPackage.id)) {
      setTrackError('Посылка с таким трек-номером уже существует!');
      return;
    }
    
    try {
      const oldStatus = currentPackage.status;
      const isDelivered = formData.status === 'delivered';
      
      await updatePackage(currentPackage.id, {
        trackingNumber: formData.trackingNumber,
        description: formData.description,
        weight: formData.weight,
        dimensions: formData.dimensions,
        status: formData.status,
        userId: formData.userId,
        archived: isDelivered ? true : formData.archived || false,
        permanentlyArchived: isDelivered
      });
      
      if (oldStatus !== formData.status) {
        try {
          await sendStatusNotification(currentPackage.id, formData.status);
        } catch (error) {
          alert('Посылка обновлена, но возникла ошибка при отправке уведомления');
        }
      }
      
      setShowEditForm(false);
      setCurrentPackage(null);
      await fetchPackages();
    } catch (error) {
      console.error('Ошибка при обновлении посылки:', error);
      alert(`Ошибка при обновлении посылки: ${error.message}`);
    }
  };

  // Обработчик удаления посылки
  const handleDeleteClick = (packageItem) => {
    setPackageToDelete(packageItem);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!packageToDelete) return;

    try {
      await deletePackage(packageToDelete.id);
      setShowConfirmDialog(false);
      setPackageToDelete(null);
      await fetchPackages(); // Перезагрузка списка посылок
    } catch (error) {
      console.error('Ошибка при удалении посылки:', error);
      alert(`Ошибка при удалении посылки: ${error.message}`);
    }
  };

  // Фильтрация посылок по трек-номеру, пользователю, статусу и дате
  const filteredPackages = packages.filter(pkg => {
    // Поиск по трек-номеру
    const matchesSearch = searchTerm.trim() === '' ||
      (pkg.trackingNumber && pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    // Фильтр по пользователю
    const matchesUser = !userFilter || pkg.userId === userFilter;
    // Фильтр по статусу
    const matchesStatus = !statusFilter || (pkg.status && pkg.status === statusFilter);
    // Фильтр по дате
    let matchesDate = true;
    if (dateFrom) {
      const from = new Date(dateFrom);
      const created = pkg.createdAt?.seconds ? new Date(pkg.createdAt.seconds * 1000) : null;
      if (created && created < from) matchesDate = false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      const created = pkg.createdAt?.seconds ? new Date(pkg.createdAt.seconds * 1000) : null;
      if (created && created > to) matchesDate = false;
    }
    return matchesSearch && matchesUser && matchesStatus && matchesDate;
  });

  // Фильтрация пользователей для фильтра
  const filteredUsers = users.filter(u => {
    const val = userInput.trim().toLowerCase();
    if (!val) return true;
    return (
      (u.fullName && u.fullName.toLowerCase().includes(val)) ||
      (u.email && u.email.toLowerCase().includes(val)) ||
      u.id.toLowerCase().includes(val)
    );
  });

  // Фильтрация пользователей для автокомплита
  const filteredUsersAdd = users.filter(u => {
    const val = userInputAdd.trim().toLowerCase();
    if (!val) return true;
    return (
      (u.fullName && u.fullName.toLowerCase().includes(val)) ||
      (u.email && u.email.toLowerCase().includes(val)) ||
      u.id.toLowerCase().includes(val)
    );
  });

  const filteredUsersEdit = users.filter(u => {
    const val = userInputEdit.trim().toLowerCase();
    if (!val) return true;
    return (
      (u.fullName && u.fullName.toLowerCase().includes(val)) ||
      (u.email && u.email.toLowerCase().includes(val)) ||
      u.id.toLowerCase().includes(val)
    );
  });

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };
  const handleCopyUserId = (userId) => {
    navigator.clipboard.writeText(userId);
    setCopiedUserId(userId);
    setTimeout(() => setCopiedUserId(null), 1500);
  };

  // 1. Валидация всех полей (кроме описания)
  const isFormValid = formData.userId && formData.trackingNumber && formData.weight && formData.dimensions && formData.status;

  // 2. Функция очистки формы
  const resetForm = () => {
    setFormData({
      trackingNumber: '',
      description: '',
      weight: '',
      dimensions: '',
      status: 'pending',
      userId: ''
    });
    setTrackError('');
  };

  // 3. Сброс формы при закрытии модалок
  const handleCloseAddForm = () => {
    setShowAddForm(false);
    resetForm();
    setUserInputAdd('');
    setUserDropdownOpenAdd(false);
  };
  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setCurrentPackage(null);
    resetForm();
    setUserInputEdit('');
    setUserDropdownOpenEdit(false);
  };

  // Функция сортировки
  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (!sortField) return 0;
    let aValue = a[sortField];
    let bValue = b[sortField];
    if (sortField === 'fullName') {
      aValue = users.find(u => u.id === a.userId)?.fullName || '';
      bValue = users.find(u => u.id === b.userId)?.fullName || '';
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  // Обработчик клика по заголовку
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div>
        <Header isAuthenticated={true} isAdmin={true} />
        <div className="loading-container">
          <p>Загрузка посылок...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header isAuthenticated={true} isAdmin={true} />
      <AdminPanelContainer>
        <div className="admin-header">
          <h1 className="admin-title">Управление посылками</h1>
        </div>
        
        <div className="admin-nav">
          <Link to="/admin">Главная</Link>
          <Link to="/admin/users">Пользователи</Link>
          <Link to="/admin/packages" className="active">Посылки</Link>
        </div>
        
        <SearchWrapper>
          <FaSearch style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: 16 }} />
          <SearchInput
            type="text"
            placeholder="Поиск по трек-номеру..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </SearchWrapper>
        
        {/* Кнопка скрытия/отображения фильтров */}
        <ToggleFiltersButton open={showFilters} onClick={() => setShowFilters(v => !v)}>
          {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          <FaChevronDown style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </ToggleFiltersButton>
        {/* Фильтры */}
        {showFilters && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
          flexDirection: 'column',
          alignItems: 'stretch',
          width: '100%'
        }}>
          {/* Фильтр по пользователю с автокомплитом */}
          <div style={{ minWidth: 0, width: '100%', position: 'relative' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Пользователь</label>
            <input
              type="text"
              ref={userInputRef}
              value={userFilter ? (users.find(u => u.id === userFilter)?.fullName || users.find(u => u.id === userFilter)?.email || userInput) : userInput}
              onChange={e => {
                setUserInput(e.target.value);
                setUserFilter('');
                setUserDropdownOpen(true);
              }}
              onFocus={() => setUserDropdownOpen(true)}
              onBlur={() => setTimeout(() => setUserDropdownOpen(false), 150)}
              placeholder="Начните вводить ФИО или email..."
              style={{ width: '100%', padding: 8, borderRadius: 8, background: 'rgba(20,20,20,0.7)', color: 'var(--text-color)', border: '1px solid #444', fontSize: 15, outline: userDropdownOpen ? '2px solid var(--primary-color)' : 'none' }}
              autoComplete="off"
            />
            {userDropdownOpen && filteredUsers.length > 0 && (
              <div style={{
                position: 'absolute',
                top: 70,
                left: 0,
                right: 0,
                background: 'rgba(30,30,30,0.98)',
                border: '1px solid #444',
                borderRadius: 8,
                zIndex: 20,
                maxHeight: 220,
                overflowY: 'auto',
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
              }}>
                {filteredUsers.map(u => (
                  <div
                    key={u.id}
                    onMouseDown={() => {
                      setUserFilter(u.id);
                      setUserInput(u.fullName || u.email || u.id);
                      setUserDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      color: 'var(--text-color)',
                      background: userFilter === u.id ? 'rgba(142,36,170,0.08)' : 'transparent',
                      fontWeight: userFilter === u.id ? 600 : 400
                    }}
                  >
                    {(u.fullName ? u.fullName : u.email) || u.id}
                    {u.email && u.fullName && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 8 }}>{u.email}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Кнопка сброса фильтра по пользователю */}
            {userFilter && (
              <button
                type="button"
                onClick={() => { setUserFilter(''); setUserInput(''); }}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: 32,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-light)',
                  fontSize: 18,
                  cursor: 'pointer',
                  zIndex: 21
                }}
                title="Сбросить фильтр"
              >×</button>
            )}
          </div>
          {/* Фильтр по статусу */}
          <div style={{ minWidth: 0, width: '100%' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Статус</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 8, background: 'rgba(20,20,20,0.7)', color: 'var(--text-color)', border: '1px solid #444', fontSize: 15 }}
            >
              <option value="">Выберите статус...</option>
              {statusFilters.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          {/* Фильтр по дате */}
          <div style={{ minWidth: 0, width: '100%' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Дата создания от</label>
            <input
              type='date'
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 8, background: 'rgba(20,20,20,0.7)', color: 'var(--text-color)', border: '1px solid #444', fontSize: 15 }}
            />
          </div>
          <div style={{ minWidth: 0, width: '100%' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Дата создания до</label>
            <input
              type='date'
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 8, background: 'rgba(20,20,20,0.7)', color: 'var(--text-color)', border: '1px solid #444', fontSize: 15 }}
            />
          </div>
        </div>
        )}
        
        <button 
          className="admin-btn admin-btn-add" 
          onClick={() => setShowAddForm(true)}
          style={{ width: '100%', marginTop: 12 }}
        >
          Добавить посылку
        </button>
        
        {/* Модальное окно добавления посылки */}
        <Modal $show={showAddForm}>
          <ModalContent>
            <ModalHeader>
              <h2>Добавить посылку</h2>
              <CloseButton onClick={handleCloseAddForm}>×</CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleAddPackage} className="admin-form">
              <div className="admin-form-group" style={{ position: 'relative' }}>
                <label htmlFor="userId">Пользователь:</label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  ref={userInputAddRef}
                  value={formData.userId ? (users.find(u => u.id === formData.userId)?.fullName || users.find(u => u.id === formData.userId)?.email || userInputAdd) : userInputAdd}
                  onChange={e => {
                    setUserInputAdd(e.target.value);
                    setFormData({ ...formData, userId: '' });
                    setUserDropdownOpenAdd(true);
                  }}
                  onFocus={() => setUserDropdownOpenAdd(true)}
                  onBlur={() => setTimeout(() => setUserDropdownOpenAdd(false), 150)}
                  placeholder="Начните вводить ФИО или email..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(20,20,20,0.7)',
                    color: 'var(--text-color)',
                    border: '1px solid #444',
                    fontSize: '15px',
                    fontFamily: 'Montserrat, sans-serif',
                    outline: userDropdownOpenAdd ? '2px solid var(--primary-color)' : 'none',
                    marginBottom: 0
                  }}
                  autoComplete="off"
                  required
                />
                {userDropdownOpenAdd && filteredUsersAdd.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 80,
                    left: 0,
                    right: 0,
                    background: 'rgba(30,30,30,0.98)',
                    border: '1px solid #444',
                    borderRadius: 8,
                    zIndex: 20,
                    maxHeight: 220,
                    overflowY: 'auto',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
                  }}>
                    {filteredUsersAdd.map(u => (
                      <div
                        key={u.id}
                        onMouseDown={() => {
                          setFormData({ ...formData, userId: u.id });
                          setUserInputAdd(u.fullName || u.email || u.id);
                          setUserDropdownOpenAdd(false);
                        }}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          color: 'var(--text-color)',
                          background: formData.userId === u.id ? 'rgba(142,36,170,0.08)' : 'transparent',
                          fontWeight: formData.userId === u.id ? 600 : 400
                        }}
                      >
                        {(u.fullName ? u.fullName : u.email) || u.id}
                        {u.email && u.fullName && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 8 }}>{u.email}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="trackingNumber">Трек-номер:</label>
                <input 
                  type="text" 
                  id="trackingNumber" 
                  name="trackingNumber" 
                  value={formData.trackingNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="description">Описание:</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="weight">Вес (кг):</label>
                <input 
                  type="text" 
                  id="weight" 
                  name="weight" 
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="dimensions">Размеры (мм):</label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="status">Статус:</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  style={{ background: '#23232e', color: '#fff', border: '1px solid #8645FF' }}
                >
                  <option value="" style={{ background: '#23232e', color: '#bbb' }}>Выберите статус...</option>
                  {Object.entries(statusTranslations).map(([value, label]) => (
                    <option key={value} value={value} style={{ background: '#23232e', color: '#fff' }}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              {trackError && <div style={{ color: '#e53935', marginBottom: 10 }}>{trackError}</div>}
              
              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-form-cancel" onClick={handleCloseAddForm}>
                  Отмена
                </button>
                <button type="submit" className="admin-btn admin-form-submit" disabled={!isFormValid}>
                  Добавить
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>
        
        {/* Модальное окно редактирования посылки */}
        <Modal $show={showEditForm}>
          <ModalContent>
            <ModalHeader>
              <h2>Редактировать посылку</h2>
              <CloseButton 
                onClick={handleCloseEditForm}
              >
                ×
              </CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleUpdatePackage} className="admin-form">
              <div className="admin-form-group" style={{ position: 'relative' }}>
                <label htmlFor="userId-edit">Пользователь:</label>
                <input
                  type="text"
                  id="userId-edit"
                  name="userId"
                  ref={userInputEditRef}
                  value={formData.userId ? (users.find(u => u.id === formData.userId)?.fullName || users.find(u => u.id === formData.userId)?.email || userInputEdit) : userInputEdit}
                  onChange={e => {
                    setUserInputEdit(e.target.value);
                    setFormData({ ...formData, userId: '' });
                    setUserDropdownOpenEdit(true);
                  }}
                  onFocus={() => setUserDropdownOpenEdit(true)}
                  onBlur={() => setTimeout(() => setUserDropdownOpenEdit(false), 150)}
                  placeholder="Начните вводить ФИО или email..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(20,20,20,0.7)',
                    color: 'var(--text-color)',
                    border: '1px solid #444',
                    fontSize: '15px',
                    fontFamily: 'Montserrat, sans-serif',
                    outline: userDropdownOpenEdit ? '2px solid var(--primary-color)' : 'none',
                    marginBottom: 0
                  }}
                  autoComplete="off"
                  required
                />
                {userDropdownOpenEdit && filteredUsersEdit.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 80,
                    left: 0,
                    right: 0,
                    background: 'rgba(30,30,30,0.98)',
                    border: '1px solid #444',
                    borderRadius: 8,
                    zIndex: 20,
                    maxHeight: 220,
                    overflowY: 'auto',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
                  }}>
                    {filteredUsersEdit.map(u => (
                      <div
                        key={u.id}
                        onMouseDown={() => {
                          setFormData({ ...formData, userId: u.id });
                          setUserInputEdit(u.fullName || u.email || u.id);
                          setUserDropdownOpenEdit(false);
                        }}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          color: 'var(--text-color)',
                          background: formData.userId === u.id ? 'rgba(142,36,170,0.08)' : 'transparent',
                          fontWeight: formData.userId === u.id ? 600 : 400
                        }}
                      >
                        {(u.fullName ? u.fullName : u.email) || u.id}
                        {u.email && u.fullName && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 8 }}>{u.email}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="trackingNumber-edit">Трек-номер:</label>
                <input 
                  type="text" 
                  id="trackingNumber-edit" 
                  name="trackingNumber" 
                  value={formData.trackingNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="description-edit">Описание:</label>
                <textarea 
                  id="description-edit" 
                  name="description" 
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="weight-edit">Вес (кг):</label>
                <input 
                  type="text" 
                  id="weight-edit" 
                  name="weight" 
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="dimensions-edit">Размеры (мм):</label>
                <input
                  type="text"
                  id="dimensions-edit"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="status-edit">Статус:</label>
                <select
                  id="status-edit"
                  name="status"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  style={{ background: '#23232e', color: '#fff', border: '1px solid #8645FF' }}
                >
                  <option value="" style={{ background: '#23232e', color: '#bbb' }}>Выберите статус...</option>
                  {Object.entries(statusTranslations).map(([value, label]) => (
                    <option key={value} value={value} style={{ background: '#23232e', color: '#fff' }}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              {trackError && <div style={{ color: '#e53935', marginBottom: 10 }}>{trackError}</div>}
              
              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-form-cancel" onClick={handleCloseEditForm}>
                  Отмена
                </button>
                <button type="submit" className="admin-btn admin-form-submit" disabled={!isFormValid}>
                  Сохранить
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>
        
        {/* Таблица посылок */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: 700 }}>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  ID {sortField === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('fullName')} style={{ cursor: 'pointer' }}>
                  ФИО {sortField === 'fullName' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('trackingNumber')} style={{ cursor: 'pointer' }}>
                  Трек-номер {sortField === 'trackingNumber' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                  Описание {sortField === 'description' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('weight')} style={{ cursor: 'pointer' }}>
                  Вес {sortField === 'weight' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('dimensions')} style={{ cursor: 'pointer' }}>
                  Размеры {sortField === 'dimensions' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                  Статус {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                  Дата создания {sortField === 'createdAt' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedPackages.map(packageItem => (
                <tr key={packageItem.id}>
                  <td style={{whiteSpace: 'nowrap'}}>
                    <span style={{fontSize: 13, fontFamily: 'monospace'}}>{packageItem.id.slice(0, 8)}...</span>
                    <button onClick={() => handleCopyId(packageItem.id)} style={{marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-light)'}} title="Скопировать ID">
                      {copiedId === packageItem.id ? <FaCheck color="#00c853" /> : <FaRegCopy />}
                    </button>
                  </td>
                  <td style={{cursor: 'pointer', color: 'var(--primary-light)', fontWeight: 500}} onClick={() => handleCopyUserId(packageItem.userId)} title="Скопировать ID пользователя">
                    {(() => {
                      const user = users.find(u => u.id === packageItem.userId);
                      return user?.fullName || user?.email || packageItem.userId;
                    })()}
                    {copiedUserId === packageItem.userId && <FaCheck style={{marginLeft: 6}} color="#00c853" />}
                  </td>
                  <td>{packageItem.trackingNumber}</td>
                  <td>{packageItem.description || '-'}</td>
                  <td>{packageItem.weight || '-'}</td>
                  <td>{packageItem.dimensions || '-'}</td>
                  <td>
                    <StatusBadge $status={getTranslatedStatus(packageItem.status)}>
                      {getTranslatedStatus(packageItem.status)}
                    </StatusBadge>
                  </td>
                  <td>{packageItem.createdAt ? new Date(packageItem.createdAt.seconds * 1000).toLocaleDateString() : '-'}</td>
                  <td className="admin-actions">
                    <button 
                      className="admin-btn admin-btn-edit" 
                      onClick={() => handleEditPackage(packageItem)}
                    >
                      Редактировать
                    </button>
                    <button 
                      className="admin-btn admin-btn-delete" 
                      onClick={() => handleDeleteClick(packageItem)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Диалог подтверждения удаления */}
        <Modal $show={showConfirmDialog}>
          <ModalContent style={{ maxWidth: '450px' }}>
            <ModalHeader>
              <h2>Подтверждение удаления</h2>
              <CloseButton 
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPackageToDelete(null);
                }}
              >
                ×
              </CloseButton>
            </ModalHeader>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Вы действительно хотите удалить посылку #{packageToDelete?.trackingNumber}?
              Это действие невозможно отменить.
            </p>
            
            <div className="admin-form-actions">
              <button 
                className="admin-btn admin-form-cancel" 
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPackageToDelete(null);
                }}
              >
                Отмена
              </button>
              <button 
                className="admin-btn admin-btn-delete" 
                onClick={confirmDelete}
              >
                Удалить
              </button>
            </div>
          </ModalContent>
        </Modal>
      </AdminPanelContainer>
      <Footer />
      <DatepickerStyles />
      <CustomSelectStyles />
    </div>
  );
}

export default AdminPackagesPage; 