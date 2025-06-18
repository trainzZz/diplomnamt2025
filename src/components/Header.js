import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

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
  ${props => props.$scrolled && `
    background-color: rgba(29, 29, 29, 0.95);
    box-shadow: var(--elevation-3);
  `}
  @media (max-width: 700px) {
    padding: 8px 0;
    width: 100vw;
    left: 0;
  }
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  @media (max-width: 700px) {
    max-width: none;
    margin: 0;
    width: 100vw;
    padding: 0 2vw;
  }
`;

const Burger = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 120;
  @media (max-width: 700px) {
    display: block;
    margin-left: 8px;
  }
  svg {
    width: 32px;
    height: 32px;
    color: var(--primary-light);
  }
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: 700px) {
    display: ${({ open }) => (open ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 105;
    transition: opacity 0.3s ease;
    opacity: ${({ open }) => (open ? 1 : 0)};
    pointer-events: ${({ open }) => (open ? 'auto' : 'none')};
  }
`;

const MobileMenu = styled.div`
  display: none;
  @media (max-width: 700px) {
    display: ${({ open }) => (open ? 'flex' : 'none')};
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100vw;
    max-width: none;
    height: 100vh;
    background: rgba(29, 29, 29, 0.98);
    box-shadow: -2px 0 16px rgba(142,36,170,0.15);
    padding: 32px 24px 24px 24px;
    z-index: 110;
    gap: 24px;
    animation: fadeIn 0.3s;
  }
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
  @media (max-width: 700px) {
    display: none;
  }
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

function Header({ isAuthenticated, onLogout, isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
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
    <div>
      <HeaderContainer $scrolled={scrolled}>
        <Nav>
          <Logo to="/">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L20 6V18L12 22L4 18V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M4 6L12 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 10V22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            ProTracker
          </Logo>

          <Burger onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Burger>
          
          <Overlay open={menuOpen} onClick={() => setMenuOpen(false)} />
          <MobileMenu open={menuOpen}>
            <Logo to="/" onClick={() => setMenuOpen(false)}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 6V18L12 22L4 18V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M4 6L12 10L20 6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 10V22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
              ProTracker
            </Logo>
            {isAuthenticated && (
              <>
                <NavLink 
                  to="/profile" 
                  className={location.pathname === '/profile' ? 'active' : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  Личный кабинет
                </NavLink>
                <NavLink 
                  to="/packages" 
                  className={location.pathname === '/packages' ? 'active' : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  Мои посылки
                </NavLink>
                <Button onClick={() => { setMenuOpen(false); handleLogout(); }} style={{ width: '100%', marginTop: 16 }}>Выйти</Button>
              </>
            )} {!isAuthenticated && (
              <NavLink to="/auth" className={location.pathname === '/auth' ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                Войти
              </NavLink>
            )}
          </MobileMenu>

          <NavLinks>
            {isAuthenticated && (
              <>
                <NavLink to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                  Личный кабинет
                </NavLink>
                <NavLink to="/packages" className={location.pathname === '/packages' ? 'active' : ''}>
                  Мои посылки
                </NavLink>
              </>
            )}
            {isAuthenticated ? (
              <Button onClick={handleLogout}>Выйти</Button>
            ) : (
              <NavLink to="/auth" className={location.pathname === '/auth' ? 'active' : ''}>
                Войти
              </NavLink>
            )}
          </NavLinks>
        </Nav>
      </HeaderContainer>
    </div>
  );
}

export default Header;