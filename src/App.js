import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import PackagesPage from './pages/PackagesPage';
import AddPackagePage from './pages/AddPackagePage';
import { auth, getUserData } from './firebase';
import AdminPanel from './pages/AdminPanel';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPackagesPage from './pages/AdminPackagesPage';
import HomePage from './pages/HomePage';

function App() {
  // Состояние аутентификации пользователя
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);

  // Слушаем изменения состояния аутентификации Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        
        // Проверяем, является ли пользователь администратором
        try {
          const userData = await getUserData(user.uid);
          setIsAdmin(userData && userData.role === 'admin');
        } catch (error) {
          console.error('Ошибка при получении данных пользователя:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserId(null);
      }
      setLoading(false);
    });
    
    // Отписываемся при размонтировании компонента
    return () => unsubscribe();
  }, []);

  // Функция для обработки входа
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Функция для обработки выхода
  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserId(null);
  };

  // Показываем загрузку, пока проверяем аутентификацию
  if (loading) {
    return (
      <div className="loading-container">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            fill="rgba(142, 36, 170, 0.3)"
          />
          <path
            d="M12 4c-4.41 0-8 3.59-8 8h2c0-3.31 2.69-6 6-6V4z"
            fill="rgba(142, 36, 170, 0.9)"
          >
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/auth"
            element={
              !isAuthenticated ? 
                <AuthPage onLogin={handleLogin} /> : 
                <Navigate to="/profile" replace />
            }
          />
          <Route 
            path="/profile"
            element={
              isAuthenticated ? 
                <ProfilePage onLogout={handleLogout} isAdmin={isAdmin} /> : 
                <Navigate to="/auth" replace />
            }
          />
          <Route 
            path="/packages"
            element={
              isAuthenticated ? 
                <PackagesPage isAdmin={isAdmin} /> : 
                <Navigate to="/auth" replace />
            }
          />
          <Route 
            path="/add-package"
            element={
              isAuthenticated && isAdmin ? 
                <AddPackagePage /> : 
                <Navigate to="/profile" replace />
            }
          />
          {/* Маршруты админ-панели */}
          <Route 
            path="/admin"
            element={
              isAuthenticated && isAdmin ? 
                <AdminPanel /> : 
                <Navigate to="/profile" replace />
            }
          />
          <Route 
            path="/admin/users"
            element={
              isAuthenticated && isAdmin ? 
                <AdminUsersPage /> : 
                <Navigate to="/profile" replace />
            }
          />
          <Route 
            path="/admin/packages"
            element={
              isAuthenticated && isAdmin ? 
                <AdminPackagesPage /> : 
                <Navigate to="/profile" replace />
            }
          />
          <Route 
            path="/"
            element={
              !isAuthenticated ? <HomePage /> : <Navigate to="/profile" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
