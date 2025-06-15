import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, deleteUser, createUserByAdmin, updateUserData } from '../firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styled from 'styled-components';

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

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    address: '',
    role: 'user'
  });

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
        
        <button 
          className="admin-btn admin-btn-add" 
          onClick={() => setShowAddForm(true)}
        >
          Добавить пользователя
        </button>
        
        {/* Модальное окно добавления пользователя */}
        <Modal show={showAddForm}>
          <ModalContent>
            <ModalHeader>
              <h2>Добавить пользователя</h2>
              <CloseButton onClick={() => setShowAddForm(false)}>×</CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleAddUser} className="admin-form">
              <div className="admin-form-group">
                <label htmlFor="email">Email:</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="fullName">ФИО:</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="phone">Телефон:</label>
                <input 
                  type="text" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="address">Адрес:</label>
                <input 
                  type="text" 
                  id="address" 
                  name="address" 
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="role">Роль:</label>
                <select 
                  id="role" 
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
                <input 
                  type="text" 
                  id="phone-edit" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="address-edit">Адрес:</label>
                <input 
                  type="text" 
                  id="address-edit" 
                  name="address" 
                  value={formData.address}
                  onChange={handleInputChange}
                />
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
        
        {/* Таблица пользователей */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>ФИО</th>
              <th>Телефон</th>
              <th>Адрес</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.fullName || '-'}</td>
                <td>{user.phone || '-'}</td>
                <td>{user.address || '-'}</td>
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
        
        {/* Диалог подтверждения удаления */}
        <Modal show={showConfirmDialog}>
          <ModalContent style={{ maxWidth: '450px' }}>
            <ModalHeader>
              <h2>Подтверждение удаления</h2>
              <CloseButton 
                onClick={() => {
                  setShowConfirmDialog(false);
                  setUserToDelete(null);
                }}
              >
                ×
              </CloseButton>
            </ModalHeader>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Вы действительно хотите удалить пользователя {userToDelete?.email}?
              Это действие невозможно отменить.
            </p>
            
            <div className="admin-form-actions">
              <button 
                className="admin-btn admin-form-cancel" 
                onClick={() => {
                  setShowConfirmDialog(false);
                  setUserToDelete(null);
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

export default AdminUsersPage; 