import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers, getAllPackages } from '../firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AdminPanel() {
  const [usersCount, setUsersCount] = useState(0);
  const [packagesCount, setPackagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getAllUsers();
        const packages = await getAllPackages();
        
        setUsersCount(users.length);
        setPackagesCount(packages.length);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <Header isAuthenticated={true} isAdmin={true} />
        <div className="admin-panel">
          <div className="loading-container">
            <p>Загрузка данных...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header isAuthenticated={true} isAdmin={true} />
      <div className="admin-panel">
        <div className="admin-header">
          <h1 className="admin-title">Админ-панель</h1>
        </div>
        
        <div className="admin-nav">
          <Link to="/admin" className="active">Главная</Link>
          <Link to="/admin/users">Пользователи</Link>
          <Link to="/admin/packages">Посылки</Link>
        </div>
        
        <div className="admin-dashboard">
          <div className="admin-card">
            <div className="admin-card-title">Пользователи</div>
            <div className="admin-card-value">{usersCount}</div>
            <div className="admin-card-description">Всего зарегистрированных пользователей</div>
            <Link to="/admin/users" className="admin-btn admin-btn-edit" style={{ display: 'inline-block', marginTop: '15px' }}>
              Управление пользователями
            </Link>
          </div>
          
          <div className="admin-card">
            <div className="admin-card-title">Посылки</div>
            <div className="admin-card-value">{packagesCount}</div>
            <div className="admin-card-description">Всего посылок в системе</div>
            <Link to="/admin/packages" className="admin-btn admin-btn-edit" style={{ display: 'inline-block', marginTop: '15px' }}>
              Управление посылками
            </Link>
          </div>
        </div>
        
        <div className="admin-instructions">
          <h2>Инструкции для администратора</h2>
          <p>Добро пожаловать в админ-панель! Здесь вы можете управлять пользователями и посылками системы:</p>
          <ul>
            <li><strong>Пользователи</strong> - управление аккаунтами пользователей (просмотр, редактирование, удаление, создание)</li>
            <li><strong>Посылки</strong> - управление посылками пользователей (просмотр, редактирование, удаление, создание)</li>
          </ul>
          <p>Для начала работы выберите соответствующий раздел из меню выше.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AdminPanel; 