import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, deleteUser, createUserByAdmin, updateUserData } from '../firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styled from 'styled-components';
import { FaSearch, FaRegCopy, FaCheck } from 'react-icons/fa';
import InputMask from 'react-input-mask';
import { load } from '@2gis/mapgl';

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
  .admin-form-group select {
    width: 100%;
    padding: 12px;
    font-size: 15px;
    border-radius: var(--border-radius);
    background-color: rgba(20, 20, 20, 0.5);
    border: 1px solid rgba(142, 36, 170, 0.3);
    color: var(--text-color);
    transition: all 0.3s ease;
  }
  
  .admin-form-group input:focus,
  .admin-form-group select:focus {
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

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [mapAddress, setMapAddress] = useState('');
  const [mapPosition, setMapPosition] = useState([56.326944, 44.005833]);
  const [mapLoading, setMapLoading] = useState(false);
  const mapContainerRef = useRef(null);
  const DGIS_API_KEY = process.env.REACT_APP_2GIS_API_KEY;
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    address: '',
    role: 'user'
  });

  // Состояния для сортировки
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Добавь массив пунктов выдачи
  const pickupPoints = [
    {
      coordinates: [44.005833, 56.326944],
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

  // Загрузка данных пользователей
  const fetchUsers = async () => {
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // Обработчик добавления пользователя
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await createUserByAdmin(formData);
      setFormData({
        email: '',
        fullName: '',
        phone: '',
        address: '',
        role: 'user'
      });
      setShowAddForm(false);
      await fetchUsers(); // Перезагрузка списка пользователей
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      alert(`Ошибка при создании пользователя: ${error.message}`);
    }
  };

  // Обработчик редактирования пользователя
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      email: user.email || '',
      fullName: user.fullName || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'user'
    });
    setShowEditForm(true);
  };

  // Обработчик сохранения изменений пользователя
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await updateUserData(currentUser.id, formData);
      setShowEditForm(false);
      setCurrentUser(null);
      await fetchUsers(); // Перезагрузка списка пользователей
    } catch (error) {
      console.error('Ошибка при обновлении пользователя:', error);
      alert(`Ошибка при обновлении пользователя: ${error.message}`);
    }
  };

  // Обработчик удаления пользователя
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      setShowConfirmDialog(false);
      setUserToDelete(null);
      await fetchUsers(); // Перезагрузка списка пользователей
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      alert(`Ошибка при удалении пользователя: ${error.message}`);
    }
  };

  // Фильтрация пользователей по ФИО
  const filteredUsers = users.filter(user =>
    searchTerm.trim() === '' ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Функция сортировки
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortField) return 0;
    let aValue = a[sortField];
    let bValue = b[sortField];
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

  // Функция для выбора адреса
  const handleSelectAddress = () => {
    setFormData({ ...formData, address: mapAddress });
    setShowMap(false);
  };

  // Добавь useEffect для инициализации карты и маркеров
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;
    let mapInstance = null;
    let markers = [];
    let destroyed = false;

    const initMap = (centerCoords) => {
      load().then((mapglAPI) => {
        if (destroyed) return;
        mapInstance = new mapglAPI.Map(mapContainerRef.current, {
          center: centerCoords,
          zoom: 12,
          key: DGIS_API_KEY,
        });

        pickupPoints.forEach((point) => {
          const marker = new mapglAPI.Marker(mapInstance, {
            coordinates: point.coordinates,
            label: {
              text: point.name,
              offset: [0, -30]
            }
          });
          marker.on('click', () => {
            setMapPosition(point.coordinates);
            setMapAddress(point.address);
          });
          markers.push(marker);
        });

        mapInstance.on('click', (e) => {
          const clickedCoords = e.lngLat;
          const nearestPoint = pickupPoints.find(point => {
            const distance = Math.sqrt(
              Math.pow(point.coordinates[0] - clickedCoords[0], 2) +
              Math.pow(point.coordinates[1] - clickedCoords[1], 2)
            );
            return distance < 0.001;
          });
          if (nearestPoint) {
            setMapPosition(nearestPoint.coordinates);
            setMapAddress(nearestPoint.address);
          }
        });
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude];
          initMap(coords);
        },
        (error) => {
          initMap(mapPosition);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      initMap(mapPosition);
    }

    return () => {
      destroyed = true;
      markers.forEach(marker => marker.destroy());
      mapInstance && mapInstance.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap]);

  const [copiedId, setCopiedId] = useState(null);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (loading) {
    return (
      <div>
        <Header isAuthenticated={true} isAdmin={true} />
        <AdminPanelContainer>
          <div className="loading-container">
            <p>Загрузка пользователей...</p>
          </div>
        </AdminPanelContainer>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header isAuthenticated={true} isAdmin={true} />
      <AdminPanelContainer>
        <div className="admin-header">
          <h1 className="admin-title">Управление пользователями</h1>
        </div>
        
        <div className="admin-nav">
          <Link to="/admin">Главная</Link>
          <Link to="/admin/users" className="active">Пользователи</Link>
          <Link to="/admin/packages">Посылки</Link>
        </div>
        
        <SearchWrapper>
          <FaSearch style={{ color: 'var(--text-secondary)', marginRight: 8, fontSize: 16 }} />
          <SearchInput
            type="text"
            placeholder="Поиск по ФИО..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </SearchWrapper>
        
        {/* Модальное окно редактирования пользователя */}
        <Modal show={showEditForm}>
          <ModalContent>
            <ModalHeader>
              <h2>Редактировать пользователя</h2>
              <CloseButton 
                onClick={() => {
                  setShowEditForm(false);
                  setCurrentUser(null);
                }}
              >
                ×
              </CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleUpdateUser} className="admin-form">
              <div className="admin-form-group">
                <label htmlFor="email-edit">Email:</label>
                <input 
                  type="email" 
                  id="email-edit" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="fullName-edit">ФИО:</label>
                <input 
                  type="text" 
                  id="fullName-edit" 
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="phone-edit">Телефон:</label>
                <InputMask
                  mask="+7(999)999-99-99"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maskChar={null}
                >
                  {(inputProps) => (
                    <input
                      {...inputProps}
                      type="tel"
                      id="phone-edit"
                      name="phone"
                      placeholder="+7(000)000-00-00"
                      required
                    />
                  )}
                </InputMask>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="address-edit">Адрес:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="text"
                    id="address-edit"
                    name="address"
                    value={formData.address}
                    readOnly
                    disabled
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'background-color 0.2s',
                      color: 'var(--primary-color)'
                    }}
                    title="Изменить адрес"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="role-edit">Роль:</label>
                <select 
                  id="role-edit" 
                  name="role" 
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              
              <div className="admin-form-actions">
                <button 
                  type="button" 
                  className="admin-btn admin-form-cancel" 
                  onClick={() => {
                    setShowEditForm(false);
                    setCurrentUser(null);
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
              <div className="admin-form-actions" style={{ justifyContent: 'center' }}>
                <button type="button" className="admin-btn admin-form-cancel" style={{ fontSize: 18, minWidth: 180 }} onClick={() => setShowMap(false)}>
                  Отмена
                </button>
                <button type="button" className="admin-btn admin-form-submit" style={{ fontSize: 18, minWidth: 220 }} onClick={handleSelectAddress} disabled={!mapAddress || mapLoading}>
                  Подтвердить выбор
                </button>
              </div>
            </ModalContent>
          </Modal>
        )}
        
        {/* Таблица пользователей */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="admin-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', minWidth: 90 }}>
                  ID {sortField === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                  Email {sortField === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('telegramUserId')} style={{ cursor: 'pointer' }}>
                  ID Telegram {sortField === 'telegramUserId' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('fullName')} style={{ cursor: 'pointer', minWidth: 240 }}>
                  ФИО {sortField === 'fullName' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('phone')} style={{ cursor: 'pointer', minWidth: 180 }}>
                  Телефон {sortField === 'phone' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('address')} style={{ cursor: 'pointer' }}>
                  Адрес {sortField === 'address' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                  Роль {sortField === 'role' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(user => (
                <tr key={user.id}>
                  <td style={{whiteSpace: 'nowrap', minWidth: 90}}>
                    <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{user.id.slice(0, 8)}...</span>
                    <button
                      onClick={() => handleCopyId(user.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-light)',
                        cursor: 'pointer',
                        marginLeft: 6,
                        fontSize: 16,
                        verticalAlign: 'middle',
                        padding: 0
                      }}
                      title="Скопировать ID"
                    >
                      {copiedId === user.id ? <FaCheck color="#4caf50" /> : <FaRegCopy />}
                    </button>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {user.telegramUserId
                      ? <a href={`https://t.me/${user.telegramUserId}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>{user.telegramUserId}</a>
                      : '-'}
                  </td>
                  <td style={{ minWidth: 240 }}>{user.fullName || '-'}</td>
                  <td style={{ minWidth: 180 }}>{user.phone || '-'}</td>
                  <td style={{ minWidth: 220 }}>
                    {user.address
                      ? <a href={`https://2gis.ru/search/${encodeURIComponent(user.address)}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>{user.address}</a>
                      : '-'}
                  </td>
                  <td>{user.role === 'admin' ? 'Администратор' : 'Пользователь'}</td>
                  <td className="admin-actions">
                    <button 
                      className="admin-btn admin-btn-edit" 
                      onClick={() => handleEditUser(user)}
                    >
                      Редактировать
                    </button>
                    <button 
                      className="admin-btn admin-btn-delete" 
                      onClick={() => handleDeleteClick(user)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanelContainer>
      <Footer />
    </div>
  );
}

export default AdminUsersPage;