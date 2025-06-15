import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: rgba(29, 29, 29, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: var(--elevation-2);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(142, 36, 170, 0.2);
  
  &.scrolled {
    padding: 10px 0;
    background-color: rgba(20, 20, 20, 0.95);
    box-shadow: var(--elevation-3), var(--glow);
  }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Logo = styled(Link)`
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-light);
  display: flex;
  align-items: center;
  position: relative;
  text-shadow: 0 0 10px rgba(142, 36, 170, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    text-shadow: 0 0 15px rgba(142, 36, 170, 0.6);
  }
  
  svg {
    margin-right: 12px;
    filter: drop-shadow(0 0 5px rgba(142, 36, 170, 0.5));
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
`;

const NavLink = styled(Link)`
  color: var(--text-color);
  font-weight: 500;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
    transition: width 0.3s ease, left 0.3s ease;
    transform: translateX(-50%);
  }
  
  &:hover, &.active {
    color: var(--primary-light);
    background-color: rgba(142, 36, 170, 0.1);
  }
  
  &:hover::before, &.active::before {
    width: 80%;
  }
  
  &.active {
    font-weight: 600;
    box-shadow: 0 0 10px rgba(142, 36, 170, 0.2);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(142, 36, 170, 0.3);
  font-family: 'Montserrat', sans-serif;
  
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

const AdminDropdown = styled.div`
  position: relative;
  list-style: none;
`;

const AdminLink = styled.div`
  cursor: pointer;
  color: var(--text-color);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: rgba(45, 45, 45, 0.5);
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  border: 1px solid rgba(142, 36, 170, 0.1);
  
  &:hover {
    background: rgba(142, 36, 170, 0.1);
    color: var(--primary-light);
    transform: translateY(-2px);
    border-color: rgba(142, 36, 170, 0.3);
  }
`;

const AdminDropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(35, 35, 35, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(142, 36, 170, 0.2);
  border-radius: var(--border-radius);
  box-shadow: var(--elevation-2);
  min-width: 180px;
  z-index: 100;
  display: none;
  margin-top: 8px;
  overflow: hidden;
  padding: 5px 0;
  list-style: none;
  
  ${AdminDropdown}:hover & {
    display: block;
  }
  
  li {
    padding: 0;
    list-style: none;
    
    &:hover {
      background-color: rgba(142, 36, 170, 0.1);
    }
  }
  
  a {
    color: var(--text-color);
    text-decoration: none;
    display: block;
    padding: 12px 15px;
    font-family: 'Montserrat', sans-serif;
    transition: all 0.3s ease;
    
    &.active {
      color: var(--primary-light);
      background-color: rgba(142, 36, 170, 0.1);
      font-weight: 600;
    }
    
    &:hover {
      color: var(--primary-light);
    }
  }
`;

function Header({ isAuthenticated, onLogout, isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  // Обработка скролла для изменения стиля хедера
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = () => {
    // Выполняем выход и перенаправляем на страницу аутентификации
    if (onLogout) {
      onLogout();
    }
    navigate('/auth');
  };
  
  return (
    <HeaderContainer className={scrolled ? 'scrolled' : ''}>
      <Nav>
        <Logo to="/" className={scrolled ? 'scrolled' : ''}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8H20M4 16H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 4H18L16 20H8L6 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M10 12L14 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          ProTracker
        </Logo>
        
        <NavLinks>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                Личный кабинет
              </NavLink>
              <NavLink to="/packages" className={location.pathname === '/packages' ? 'active' : ''}>
                Мои посылки
              </NavLink>
              <Button onClick={handleLogout}>Выйти</Button>
            </>
          ) : (
            <NavLink to="/auth" className={location.pathname === '/auth' ? 'active' : ''}>
              Войти
            </NavLink>
          )}
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
}

export default Header; 