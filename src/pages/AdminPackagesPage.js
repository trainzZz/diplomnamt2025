import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPackages, deletePackage, updatePackage, addPackage } from '../firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styled from 'styled-components';

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
      case 'зарегистрирована':
      case 'pending':
      case 'registered':
        return 'rgba(142, 36, 170, 0.2)';
      case 'готова к получению':
      case 'ready':
      case 'delivered':
        return 'rgba(0, 200, 83, 0.2)';
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
      case 'зарегистрирована':
      case 'pending':
      case 'registered':
        return '#a04ed3';
      case 'готова к получению':
      case 'ready':
      case 'delivered':
        return '#00c853';
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
`;

// Функция для форматирования статуса
const formatStatus = (status) => {
  if (!status) return 'Неизвестно';
  switch (status.toLowerCase()) {
    case 'created':
      return 'Создана';
    case 'in_transit':
      return 'В пути';
    case 'ready':
      return 'Готова к получению';
    case 'cancelled':
      return 'Отменена';
    default:
      return status;
  }
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
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    trackingNumber: '',
    description: '',
    weight: '',
    dimensions: '',
    status: 'pending',
    userId: ''
  });

  // Загрузка данных посылок
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

  useEffect(() => {
    fetchPackages();
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
    try {
      await addPackage(formData.userId, {
        trackingNumber: formData.trackingNumber,
        description: formData.description,
        weight: formData.weight,
        dimensions: formData.dimensions,
        status: formData.status
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
      await fetchPackages(); // Перезагрузка списка посылок
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
    if (!currentPackage) return;

    try {
      // Сохраняем старый статус для сравнения
      const oldStatus = currentPackage.status;
      
      // Обновляем посылку
      await updatePackage(currentPackage.id, {
        trackingNumber: formData.trackingNumber,
        description: formData.description,
        weight: formData.weight,
        dimensions: formData.dimensions,
        status: formData.status,
        userId: formData.userId
      });

      // Если статус изменился, отправляем уведомление через API
      if (oldStatus !== formData.status) {
        try {
          await sendStatusNotification(currentPackage.id, formData.status);
          console.log('Уведомление успешно отправлено');
        } catch (error) {
          console.error('Ошибка при отправке уведомления:', error);
          // Показываем уведомление об ошибке, но не прерываем выполнение
          alert('Посылка обновлена, но возникла ошибка при отправке уведомления');
        }
      }

      setShowEditForm(false);
      setCurrentPackage(null);
      await fetchPackages(); // Перезагрузка списка посылок
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
        
        <button 
          className="admin-btn admin-btn-add" 
          onClick={() => setShowAddForm(true)}
        >
          Добавить посылку
        </button>
        
        {/* Модальное окно добавления посылки */}
        <Modal $show={showAddForm}>
          <ModalContent>
            <ModalHeader>
              <h2>Добавить посылку</h2>
              <CloseButton onClick={() => setShowAddForm(false)}>×</CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleAddPackage} className="admin-form">
              <div className="admin-form-group">
                <label htmlFor="userId">ID пользователя:</label>
                <input 
                  type="text" 
                  id="userId" 
                  name="userId" 
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                />
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
                <label htmlFor="dimensions">Размеры (см):</label>
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
                  onChange={handleInputChange}
                >
                  <option value="created">Создана</option>
                  <option value="in_transit">В пути</option>
                  <option value="ready">Готова к получению</option>
                  <option value="cancelled">Отменена</option>
                </select>
              </div>
              
              <div className="admin-form-actions">
                <button 
                  type="button" 
                  className="admin-btn admin-form-cancel" 
                  onClick={() => setShowAddForm(false)}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-form-submit"
                >
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
                onClick={() => {
                  setShowEditForm(false);
                  setCurrentPackage(null);
                }}
              >
                ×
              </CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleUpdatePackage} className="admin-form">
              <div className="admin-form-group">
                <label htmlFor="userId-edit">ID пользователя:</label>
                <input 
                  type="text" 
                  id="userId-edit" 
                  name="userId" 
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                />
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
                <label htmlFor="dimensions-edit">Размеры (см):</label>
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
                  onChange={handleInputChange}
                >
                  <option value="created">Создана</option>
                  <option value="in_transit">В пути</option>
                  <option value="ready">Готова к получению</option>
                  <option value="cancelled">Отменена</option>
                </select>
              </div>
              
              <div className="admin-form-actions">
                <button 
                  type="button" 
                  className="admin-btn admin-form-cancel" 
                  onClick={() => {
                    setShowEditForm(false);
                    setCurrentPackage(null);
                  }}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="admin-btn admin-form-submit"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>
        
        {/* Таблица посылок */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID пользователя</th>
              <th>Трек-номер</th>
              <th>Описание</th>
              <th>Вес</th>
              <th>Размеры</th>
              <th>Статус</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(packageItem => (
              <tr key={packageItem.id}>
                <td>{packageItem.id}</td>
                <td>{packageItem.userId}</td>
                <td>{packageItem.trackingNumber}</td>
                <td>{packageItem.description || '-'}</td>
                <td>{packageItem.weight || '-'}</td>
                <td>{packageItem.dimensions || '-'}</td>
                <td>
                  <StatusBadge $status={packageItem.status}>
                    {formatStatus(packageItem.status)}
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
    </div>
  );
}

export default AdminPackagesPage; 